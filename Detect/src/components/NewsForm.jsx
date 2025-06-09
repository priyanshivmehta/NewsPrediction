import React, { useState } from 'react';
import axios from 'axios';

function NewsForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5000/predict', { text });
      setResult(res.data);
    } catch (err) {
      console.error('Prediction error', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="10"
          cols="80"
          placeholder="Paste news article here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', fontSize: 16 }}
        />
        <br />
        <button type="submit" style={{ marginTop: 10, padding: '8px 16px' }}>Check</button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Prediction: {result.prediction}</h2>
          <p>Confidence: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}

export default NewsForm;
