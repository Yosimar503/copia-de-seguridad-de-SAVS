import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, ArrowRight } from 'lucide-react';
import './FacebookPromo.css';

// Imágenes de respaldo en caso de que no haya anuncios cargados en el sistema
import imgPromo1 from '../../img/Anuncios/Gemini_Generated_Image_49ys9i49ys9i49ys.png';
import imgPromo2 from '../../img/Anuncios/Gemini_Generated_Image_emr4vhemr4vhemr4.png';
import imgPromo3 from '../../img/Anuncios/Gemini_Generated_Image_wji4fewji4fewji4.png';
import imgPromo4 from '../../img/Anuncios/Gemini_Generated_Image_3u1jhp3u1jhp3u1j.png';
import imgPromo5 from '../../img/Anuncios/Gemini_Generated_Image_a13tgoa13tgoa13t.png';
import imgPromo6 from '../../img/Anuncios/Gemini_Generated_Image_c0m80oc0m80oc0m8.png';
import imgPromo7 from '../../img/Anuncios/Gemini_Generated_Image_c0m80oc0m80oc0m8 (1).png';
import imgPromo8 from '../../img/Anuncios/Gemini_Generated_Image_tyv7hytyv7hytyv7 (1).png';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`;

// Banners dinámicos por defecto con textos y enlaces de redirección exclusivos y premium
const FALLBACK_SLIDES = [
  {
    image: imgPromo1,
    title: '¿Buscás tu Próximo Destino?',
    desc: 'Llevate vehículos seleccionados e importados a precios irrepetibles en Costa Rica.',
    enlace: 'https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/'
  },
  {
    image: imgPromo2,
    title: 'Importación Directa de Confianza',
    desc: 'Traemos el auto que soñás desde EE.UU. con historial certificado y entrega rápida garantizada.',
    enlace: '/inventory'
  },
  {
    image: imgPromo3,
    title: 'Financiamiento a Tu Medida',
    desc: 'Aprobación inmediata en menos de 24 horas con las tasas más competitivas del mercado.',
    enlace: '/simulate-credit'
  },
  {
    image: imgPromo4,
    title: 'Revisión Certificada de 150 Puntos',
    desc: 'Cada vehículo es meticulosamente verificado para asegurar un rendimiento impecable desde el primer día.',
    enlace: '/contact'
  },
  {
    image: imgPromo5,
    title: 'Seguridad y Confort en SUVs',
    desc: 'Explorá una gama de SUVs de lujo diseñadas para proteger y deleitar a toda tu familia.',
    enlace: '/inventory'
  },
  {
    image: imgPromo6,
    title: 'Pick-ups de Fuerza Absoluta',
    desc: 'Potencia sin límites lista para el trabajo pesado y terrenos extremos en todo el país.',
    enlace: '/inventory'
  },
  {
    image: imgPromo7,
    title: 'Movilidad Eléctrica Avanzada',
    desc: 'Unite a la revolución ecológica con vehículos híbridos y eléctricos eficientes y libres de impuestos.',
    enlace: '/inventory'
  },
  {
    image: imgPromo8,
    title: 'Reserva Tu Asesoría Personalizada',
    desc: 'Conversá con nuestros expertos hoy mismo y diseñá el plan de importación ideal para vos.',
    enlace: '/contact'
  }
];

const FacebookPromo = ({
  type        = 'horizontal',
  className   = '',
  images      = [],
  image       = null,
  title       = '¿Buscás el mejor trato?',
  desc        = 'Llevate vehículos seleccionados a precios irrepetibles. Solo en nuestras redes.',
  reverse     = false
}) => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [slides, setSlides]           = useState([]);
  const [loaded, setLoaded]           = useState(false);

  // ── Carga los banners desde el servidor al montar el componente ──────────
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/marketing/banners`);
        const data = await res.json();
        if (data.success && data.banners.length > 0) {
          const loadedSlides = data.banners.map(b => ({
            image: `${BACKEND_URL}${b.imagen}`,
            title: b.titulo,
            desc: b.descripcion,
            enlace: b.enlace || 'https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/'
          }));
          setSlides(loadedSlides);
        }
      } catch (e) {
        console.warn('FacebookPromo: usando imágenes de respaldo.');
      } finally {
        setLoaded(true);
      }
    };
    fetchBanners();
  }, []);

  // ── Decidir qué datos mostrar ────────────────────────────────────────────
  // Prioridad: prop "images" > banners del servidor > prop "image" > imágenes por defecto estructuradas
  const activeSlides = images.length > 0
    ? images.map((img, idx) => ({
        image: img,
        title: Array.isArray(title) ? title[idx] || title[0] : title,
        desc: Array.isArray(desc) ? desc[idx] || desc[0] : desc,
        enlace: 'https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/'
      }))
    : slides.length > 0
      ? slides
      : image
        ? [{ image, title, desc, enlace: 'https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/' }]
        : FALLBACK_SLIDES;

  // ── Auto-avance del carrusel ─────────────────────────────────────────────
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % activeSlides.length);
    }, 5500); // 5.5s para lectura cómoda
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  // Controles de navegación manuales
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === activeSlides.length - 1 ? 0 : prev + 1));
  };

  // Redirección inteligente según el enlace configurado
  const handleSlideClick = (enlaceUrl) => {
    if (!enlaceUrl) return;
    if (enlaceUrl.startsWith('http://') || enlaceUrl.startsWith('https://')) {
      window.open(enlaceUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(enlaceUrl);
    }
  };

  // ── Renderiza el carrusel de imágenes y controles ────────────────────────
  const renderCarousel = (variant = 'horizontal') => (
    <div className={`fb-carousel ${variant}`}>
      {activeSlides.map((slide, idx) => (
        <img
          key={idx}
          src={slide.image}
          alt={`Anuncio ${idx + 1}`}
          className={`fb-carousel-img ${idx === currentIdx ? 'active' : ''}`}
        />
      ))}
      
      {activeSlides.length > 1 && (
        <>
          <button className="fb-carousel-nav fb-prev" onClick={handlePrev} title="Anterior">
            <ChevronLeft size={20} />
          </button>
          <button className="fb-carousel-nav fb-next" onClick={handleNext} title="Siguiente">
            <ChevronRight size={20} />
          </button>
          
          <div className="fb-carousel-indicators">
            {activeSlides.map((_, idx) => (
              <span
                key={idx}
                className={`fb-carousel-dot ${idx === currentIdx ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setCurrentIdx(idx); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (!loaded) return null;

  const currentSlide = activeSlides[currentIdx] || { title, desc, enlace: '' };

  // ── Variante tipo tarjeta (Catalog Card) ─────────────────────────────────
  if (type === 'card') {
    return (
      <div 
        className={`card vehicle-card fb-promo-card ${className}`} 
        onClick={() => handleSlideClick(currentSlide.enlace)}
      >
        <div className="fb-promo-content">
          {renderCarousel('card')}
          <div className="fb-promo-overlay">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="fb-promo-card-text-wrapper"
              >
                <h3 className="fb-promo-title">{currentSlide.title}</h3>
                <p className="fb-promo-desc">{currentSlide.desc}</p>
              </motion.div>
            </AnimatePresence>
            <button className="btn btn-primary fb-promo-btn">
              {currentSlide.enlace?.startsWith('http') ? 'Ir a Facebook' : 'Ver Promoción'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Variante vertical ────────────────────────────────────────────────────
  if (type === 'vertical') {
    return (
      <div 
        className={`fb-promo-vertical ${className}`} 
        onClick={() => handleSlideClick(currentSlide.enlace)}
      >
        <div className="fb-promo-img-top">{renderCarousel('vertical')}</div>
        <div className="fb-promo-text-bottom">
          <span className="fb-badge">🔥 RECOMENDADO</span>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="fb-text-container"
            >
              <h2>{currentSlide.title}</h2>
              <p>{currentSlide.desc}</p>
            </motion.div>
          </AnimatePresence>
          
          <button className="btn btn-primary fb-promo-btn" style={{ backgroundColor: '#eab308', borderColor: '#eab308', color: '#000' }}>
            {currentSlide.enlace?.startsWith('http') ? 'Ver en Facebook →' : 'Me interesa →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Variante horizontal (default) ────────────────────────────────────────
  return (
    <div 
      className={`fb-promo-banner fb-promo-horizontal ${reverse ? 'fb-reverse' : ''} ${className}`} 
      onClick={() => handleSlideClick(currentSlide.enlace)}
    >
      <div className="fb-promo-banner-inner">
        <div className="fb-promo-text">
          <span className="fb-badge">
            <Share2 size={12} style={{ marginRight: '6px' }} /> ANUNCIO EXCLUSIVO
          </span>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: reverse ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reverse ? -20 : 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fb-text-container-inner"
            >
              <h2>{currentSlide.title}</h2>
              <p>{currentSlide.desc}</p>
            </motion.div>
          </AnimatePresence>

          <button 
            className="btn btn-outline fb-promo-btn"
            style={{ backgroundColor: 'transparent' }}
            onClick={(e) => {
              e.stopPropagation();
              handleSlideClick(currentSlide.enlace);
            }}
          >
            <span>
              {currentSlide.enlace?.startsWith('http') || !currentSlide.enlace
                ? 'Ir a Facebook' 
                : 'Ver Detalles'}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="fb-promo-img-wrapper">
          {renderCarousel('horizontal')}
        </div>
      </div>
    </div>
  );
};

export default FacebookPromo;
