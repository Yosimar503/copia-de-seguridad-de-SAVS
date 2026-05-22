import React from 'react';
import './SlideTextButton.css';

export default function SlideTextButton({
  text = "Detalles",
  hoverText = "Ver más",
  onClick,
  className = ""
}) {
  return (
    <div className="slide-btn-wrapper">
      <button 
        className={`slide-text-btn ${className}`}
        onClick={onClick}
      >
        <span className="slide-text-container">
          <span className="slide-text-main">
            <span className="slide-text-font">{text}</span>
          </span>
          <span className="slide-text-hover">
            <span className="slide-text-font">{hoverText}</span>
          </span>
        </span>
      </button>
    </div>
  );
}
