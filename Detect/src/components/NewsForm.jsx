import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewsForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/history');
      setHistory(res.data.reverse());
    } catch (err) {
      console.error('Error fetching history', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5000/predict', { text });
      setResult(res.data);
      fetchHistory();  // refresh history on new prediction
    } catch (err) {
      console.error('Prediction error', err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="8"
          placeholder="Paste news article here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            fontSize: 16,
            padding: 10,
            resize: 'vertical',
            boxSizing: 'border-box',
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: 10,
            padding: '10px 20px',
            fontSize: 16,
            cursor: 'pointer',
            borderRadius: 4,
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
          }}
        >
          Check
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Prediction: {result.prediction}</h2>
          <p>Confidence: {result.confidence}%</p>

          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            {result.wordcloud && (
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h3>Word Cloud</h3>
                <img
                  src={`data:image/png;base64,${result.wordcloud}`}
                  alt="Word Cloud"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </div>
            )}
            {result.frequency_chart && (
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h3>Word Frequency Chart</h3>
                <img
                  src={`data:image/png;base64,${result.frequency_chart}`}
                  alt="Word Frequency Chart"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>Prediction History</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: '2px solid #ccc', padding: '8px', width: '50%' }}>Text Snippet</th>
                <th style={{ borderBottom: '2px solid #ccc', padding: '8px', width: '20%' }}>Prediction</th>
                <th style={{ borderBottom: '2px solid #ccc', padding: '8px', width: '20%' }}>Confidence (%)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td
                    style={{
                      padding: '8px',
                      maxWidth: '400px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.text}
                  >
                    {item.text}
                  </td>
                  <td style={{ padding: '8px' }}>{item.prediction}</td>
                  <td style={{ padding: '8px' }}>{item.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NewsForm;
