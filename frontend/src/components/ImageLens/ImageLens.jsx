import React, { useRef, useState } from 'react';
import './ImageLens.css';

const ImageLens = ({ src, alt, isActive, zoomFactor = 2, lensSize = 150, className = '', ...props }) => {
  const imgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [lensConfig, setLensConfig] = useState(null);

  const handleMouseMove = (e) => {
    if (!isActive) return;
    if (!imgRef.current || !wrapperRef.current) return;
    
    // We base the coordinates rigorously strictly on the image's physical layout bounds
    const rect = imgRef.current.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate cursor position relative to the wrapper (for absolute positioning of the lens div)
    const wrapperX = e.clientX - wrapperRect.left;
    const wrapperY = e.clientY - wrapperRect.top;

    // If cursor is outside the actual img pixels, hide lens
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setLensConfig(null);
      return;
    }

    setLensConfig({
      imgX: x,
      imgY: y,
      wrapperX,
      wrapperY,
      width: rect.width,
      height: rect.height,
      active: true
    });
  };

  const handleMouseEnter = () => {
    if (isActive) {
      setLensConfig((prev) => prev ? { ...prev, active: true } : null);
    }
  };

  const handleMouseLeave = () => {
    setLensConfig(null);
  };

  return (
    <div 
      ref={wrapperRef}
      className={`img-lens-wrapper ${isActive ? 'is-active' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        ref={imgRef}
        src={src} 
        alt={alt} 
        className={className}
        draggable={false}
        {...props} 
      />
      
      {isActive && lensConfig && lensConfig.active && (
        <div 
          className="lens-overlay"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensConfig.wrapperX - lensSize / 2}px`,
            top: `${lensConfig.wrapperY - lensSize / 2}px`,
            backgroundImage: `url("${src}")`,
            backgroundSize: `${lensConfig.width * zoomFactor}px ${lensConfig.height * zoomFactor}px`,
            backgroundPosition: `-${lensConfig.imgX * zoomFactor - lensSize / 2}px -${lensConfig.imgY * zoomFactor - lensSize / 2}px`,
          }}
        />
      )}
    </div>
  );
};

export default ImageLens;
