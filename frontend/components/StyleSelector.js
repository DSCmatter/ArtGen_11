// artgen-frontend/components/StyleSelector.js
export default function StyleSelector({ selectedStyle, onStyleChange }) {
    const styles = [
      { id: 'anime', name: 'Anime' },
      { id: 'cyberpunk', name: 'Cyberpunk' },
      { id: 'pixel', name: 'Pixel Art' },
      { id: 'realistic', name: 'Realistic' }
    ];
  
    return (
      <div className="style-selector">
        <h3>Select Style</h3>
        <div className="style-options">
          {styles.map(style => (
            <div 
              key={style.id}
              className={`style-option ${selectedStyle === style.id ? 'selected' : ''}`}
              onClick={() => onStyleChange(style.id)}
            >
              {style.name}
            </div>
          ))}
        </div>
      </div>
    );
  }