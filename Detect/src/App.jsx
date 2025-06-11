import React from 'react';
import NewsForm from './components/NewsForm';

function App() {
  return (
    <div className="App" style={{ maxWidth: 'auto', padding: 20 }}>
        <h1 style={{paddingLeft: 20}}>Fake News Detector</h1>
        <NewsForm />
    </div>
  );
}

export default App;
