import React, { useState, useEffect, useMemo } from 'react';
import './VehicleCarousel.css';
import { ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react';
import ImageLens from '../ImageLens/ImageLens';

// Cargar todas las imágenes de la carpeta img dinámicamente
const allGalleryImages = import.meta.glob('../../img/**/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });
const localCarrosImages = import.meta.glob('../../carros/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });

const VehicleCarousel = ({ vehicle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Mapeamos las imágenes según el vehículo
  const slides = useMemo(() => {
    let selectedImages = [];
    
    if (vehicle?.galleryPath) {
      // Filtrar imágenes que pertenezcan a la carpeta del vehículo
      // La ruta en allGalleryImages será algo como ../../img/Carpeta/imagen.jpg
      const searchPath = `../../img/${vehicle.galleryPath}/`.toLowerCase();
      selectedImages = Object.keys(allGalleryImages)
        .filter(key => key.toLowerCase().startsWith(searchPath))
        .map(key => allGalleryImages[key]);
    }

    // Fallback 1: imágenes de detalle subidas desde el panel admin (base64 o URLs)
    if (selectedImages.length === 0 && vehicle?.detailImages && vehicle.detailImages.length > 0) {
      selectedImages = vehicle.detailImages;
    }

    // Fallback 2: Si no hay galería ni detailImages, usamos la imagen principal
    if (selectedImages.length === 0 && vehicle?.image) {
      const solvedImage = localCarrosImages[vehicle.image] || vehicle.image;
      selectedImages = [solvedImage];
    }

    if (selectedImages.length === 0) return [];

    return selectedImages.map((imgUrl, index) => ({
      image: imgUrl,
      title: vehicle?.name || 'Diseño Excepcional',
      subtitle: index === 0 ? 'DATOS TÉCNICOS' : `VISTA ${index + 1}`,
      text: index === 0 
        ? (vehicle?.summary || 'Explora cada detalle de este increíble vehículo. Rendimiento, confort y tecnología avanzada.')
        : 'Cada ángulo está pensado para brindarte la mejor experiencia de conducción premium.'
    }));
  }, [vehicle]);

  useEffect(() => {
    let interval;
    if (isPlaying && !isHovered && slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPlaying(false);
  };

  if (slides.length === 0) return null;

  return (
    <div 
      className="fc-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background borroso adaptativo al slide activo */}
      <div 
        className="fc-slide-bg-blur" 
        style={{ backgroundImage: `url("${slides[currentSlide].image}")` }} 
      />
      <div className="fc-slide-overlay-dark" />

      {/* Grid de imágenes (Slide Activo, Previo, Siguiente) */}
      <div className="fc-slides-track">
        {slides.map((slide, index) => {
          const diff = (index - currentSlide + slides.length) % slides.length;
          let positionClass = 'fc-slide-hidden';
          
          if (diff === 0) positionClass = 'fc-slide-active';
          else if (diff === 1) positionClass = 'fc-slide-next';
          else if (diff === slides.length - 1) positionClass = 'fc-slide-prev';
          else if (diff === 2) positionClass = 'fc-slide-hidden-right';
          else if (diff === slides.length - 2) positionClass = 'fc-slide-hidden-left';

          return (
            <div 
              key={index} 
              className={`fc-slide-item ${positionClass}`}
              onClick={() => {
                if (diff === 1) nextSlide();
                if (diff === slides.length - 1) prevSlide();
              }}
            >
              <ImageLens 
                src={slide.image} 
                alt={`Vista ${index + 1}`} 
                className="fc-slide-image-contain" 
                isActive={diff === 0} 
              />
            </div>
          );
        })}
      </div>

      <div className="fc-slide-overlay" />
      
      {/* Contenido de texto dinámico renderizado arriba */}
      <div className="fc-slide-content" key={currentSlide}>
        <h4 className="fc-subtitle">{slides[currentSlide].subtitle}</h4>
        <h2 className="fc-title">{slides[currentSlide].title}</h2>
        <p className="fc-text">{slides[currentSlide].text}</p>
      </div>

      <div className="fc-controls">
        <button className="fc-nav-btn fc-nav-prev" onClick={prevSlide} aria-label="Anterior Slide">
          <ChevronLeft className="fc-icon" />
        </button>
        <button className="fc-nav-btn fc-nav-next" onClick={nextSlide} aria-label="Siguiente Slide">
          <ChevronRight className="fc-icon" />
        </button>
      </div>

      <div className="fc-indicators-wrapper">
        <div className="fc-indicators" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '60vw' }}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`fc-dot ${index === currentSlide ? 'fc-dot-active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
        <button 
          className="fc-play-pause-btn" 
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pausar Autoplay' : 'Empezar Autoplay'}
        >
          {isPlaying ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};

export default VehicleCarousel;
