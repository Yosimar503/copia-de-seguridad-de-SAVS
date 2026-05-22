import React from 'react';
import './BorderBeam.css';

export default function BorderBeam({ 
  duration = 8, 
  borderWidth = 1.5,
  size = 90, 
  colorFrom = "rgba(234, 179, 8, 0.3)", 
  colorTo = "rgba(234, 179, 8, 0.8)",
  className = "" 
}) {
  return (
    <div 
      className={`border-beam ${className}`}
      style={{
        '--beam-duration': `${duration}s`,
        '--beam-border': `${borderWidth}px`,
        '--beam-size': `${size}deg`,
        '--beam-color-from': colorFrom,
        '--beam-color-to': colorTo
      }}
    />
  );
}
