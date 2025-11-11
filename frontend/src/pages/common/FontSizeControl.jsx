import React, { useState, useEffect } from 'react';

const FontSizeControl = () => {
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Cargar preferencia guardada
    const savedSize = localStorage.getItem('fontSize') || 'normal';
    setFontSize(savedSize);
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-xlarge');
    document.documentElement.classList.add(`text-${savedSize}`);
  }, []);

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-xlarge');
    document.documentElement.classList.add(`text-${size}`);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-md border border-primary-200">
      <span className="text-xs font-medium text-neutral-700 mr-1">Tamaño:</span>
      <button
        onClick={() => changeFontSize('normal')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          fontSize === 'normal' 
            ? 'bg-accent-700 text-white' 
            : 'bg-white text-neutral-700 hover:bg-primary-100'
        }`}
        aria-label="Tamaño de texto normal"
        aria-pressed={fontSize === 'normal'}
      >
        A
      </button>
      <button
        onClick={() => changeFontSize('large')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          fontSize === 'large' 
            ? 'bg-accent-700 text-white' 
            : 'bg-white text-neutral-700 hover:bg-primary-100'
        }`}
        aria-label="Tamaño de texto grande"
        aria-pressed={fontSize === 'large'}
      >
        A
      </button>
      <button
        onClick={() => changeFontSize('xlarge')}
        className={`px-2 py-1 text-base rounded transition-colors ${
          fontSize === 'xlarge' 
            ? 'bg-accent-700 text-white' 
            : 'bg-white text-neutral-700 hover:bg-primary-100'
        }`}
        aria-label="Tamaño de texto extra grande"
        aria-pressed={fontSize === 'xlarge'}
      >
        A
      </button>
    </div>
  );
};

export default FontSizeControl;