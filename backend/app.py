import token
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
stemmer = PorterStemmer()

# Download stopwords if needed
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
model = joblib.load('model.pkl')
tfidf_vectorizer = joblib.load('tfidf.pkl')

stop_words = set(stopwords.words('english'))

def preprocess(text):
    # Basic cleaning: lowercase, remove special chars, stopwords
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    tokens = [stemmer.stem(word) for word in tokens] 
    return ' '.join(tokens)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Preprocess
    clean_text = preprocess(text)
    
    # Vectorize
    vectorized_text = tfidf_vectorizer.transform([clean_text])
    
    # Predict
    pred = model.predict(vectorized_text)[0]
    pred_proba = model.predict_proba(vectorized_text)[0]
    
    # Map numeric label to readable label (adjust as per your labels)
    label_map = {0: 'Real', 1: 'Fake'}
    prediction_label = label_map.get(pred, 'Unknown')
    
    confidence = round(max(pred_proba) * 100, 2)  # e.g., 85.23%
    
    return jsonify({
        'prediction': prediction_label,
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(debug=True)
