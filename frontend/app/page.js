// artgen-frontend/app/page.js
'use client';

import { useState } from 'react';
import StyleSelector from '../components/StyleSelector';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('anime');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const generateAvatar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, style }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate avatar');
      }
      
      setImageUrl(`http://localhost:5000${data.imageUrl}`);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="container">
      <h1>ArtGen - AI Avatar Generator</h1>
      <p>Generate a personalized avatar in your favorite art style</p>
      
      <form onSubmit={generateAvatar} className="generator-form">
        <div className="input-group">
          <label htmlFor="prompt">Describe your avatar:</label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a warrior with a sword, blue eyes, long hair"
            required
          />
        </div>
        
        <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
        
        <button type="submit" disabled={loading || !prompt}>
          {loading ? 'Generating...' : 'Generate Avatar'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {imageUrl && (
        <div className="result-container">
          <h2>Your Generated Avatar</h2>
          <img src={imageUrl} alt="Generated Avatar" className="generated-avatar" />
          <a href={imageUrl} download className="download-button">
            Download Avatar
          </a>
        </div>
      )}
    </main>
  );
}