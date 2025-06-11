import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')  
import matplotlib.pyplot as plt
from collections import Counter

# Setup
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# Load model & vectorizer
model = joblib.load('model.pkl')
tfidf_vectorizer = joblib.load('tfidf.pkl')

# Preprocessing tools
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

# History list
prediction_history = []

# Preprocessing function
def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    tokens = [stemmer.stem(word) for word in tokens]
    return ' '.join(tokens)

# Word cloud image (returns base64 image string)
def generate_wordcloud(text):
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
    img_io = io.BytesIO()
    plt.figure(figsize=(8, 4))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(img_io, format='png')
    plt.close()
    img_io.seek(0)
    return base64.b64encode(img_io.getvalue()).decode('utf-8')

# Word frequency bar chart image (returns base64 string)
def generate_freq_chart(text):
    word_counts = Counter(text.split())
    most_common = word_counts.most_common(10)
    words, counts = zip(*most_common)

    plt.figure(figsize=(8, 4))
    plt.bar(words, counts, color='skyblue')
    plt.xlabel('Words')
    plt.ylabel('Frequency')
    plt.title('Top 10 Frequent Words')
    plt.xticks(rotation=45)
    
    img_io = io.BytesIO()
    plt.tight_layout()
    plt.savefig(img_io, format='png')
    plt.close()
    img_io.seek(0)
    return base64.b64encode(img_io.getvalue()).decode('utf-8')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Preprocess
    clean_text = preprocess(text)
    vectorized_text = tfidf_vectorizer.transform([clean_text])

    # Predict
    pred = model.predict(vectorized_text)[0]
    pred_proba = model.predict_proba(vectorized_text)[0]
    label_map = {0: 'Real', 1: 'Fake'}
    prediction_label = label_map.get(pred, 'Unknown')
    confidence = round(max(pred_proba) * 100, 2)

    # Generate visualizations
    wordcloud_img = generate_wordcloud(clean_text)
    freq_chart_img = generate_freq_chart(clean_text)

    # Save to history
    prediction_history.append({
        'text': text,
        'prediction': prediction_label,
        'confidence': confidence
    })

    return jsonify({
        'prediction': prediction_label,
        'confidence': confidence,
        'wordcloud': wordcloud_img,
        'frequency_chart': freq_chart_img
    })

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(prediction_history)

if __name__ == '__main__':
    app.run(debug=True)
