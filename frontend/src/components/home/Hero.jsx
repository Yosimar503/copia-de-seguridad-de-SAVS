import React, { useState, useEffect } from 'react';
import { ArrowRight, Car, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBgImg from '../../img/equipodeSAVSposando.png';
import fbPromoImg from '../../img/fb_promo.png';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleInventoryClick = () => {
    navigate('/inventory');
  };

  const handleSellCarClick = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      navigate('/vender-auto');
    } else {
      navigate('/register');
    }
  };

  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/', '_blank');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000); // Changed to 5 seconds to give more reading time before slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <div 
        className="hero-slider"
        style={{ transform: `translateX(-${currentSlide * 50}%)` }}
      >
        {/* Slide 1 */}
        <div className={`hero-slide ${currentSlide === 0 ? 'active' : ''}`}>
          <img src={heroBgImg} alt="Hero Background 1" className="hero-bg-img" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-text-content">
              <h1 className="hero-title">Tu Próximo Destino Empieza Aquí</h1>
              <p className="hero-subtitle">
                Obtén financiamiento inmediato para los modelos 2024. Calidad garantizada y aprobación en 24 horas.
              </p>
              
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={handleInventoryClick}>
                  Ver Inventario
                  <ArrowRight size={18} />
                </button>
                <button className="btn hero-btn-outline" onClick={handleSellCarClick}>
                  Entrega tu auto
                  <Car size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Golden/Facebook Ad */}
        <div className={`hero-slide ${currentSlide === 1 ? 'active' : ''}`}>
          <img src={fbPromoImg} alt="Hero Background 2" className="hero-bg-img" style={{ objectFit: 'cover', objectPosition: 'center' }} />
          <div className="hero-overlay gold-overlay"></div>
          <div className="hero-content">
            <div className="hero-text-content">
              <h1 className="hero-title" style={{ fontSize: '3.5rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Ofertas Exclusivas<br />
                <span style={{ color: '#eab308' }}>en Facebook</span>
              </h1>
              <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Vehículos seleccionados a precios irrepetibles. Solo en nuestras redes.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-gold" onClick={handleFacebookClick} style={{ padding: '15px 30px', fontSize: '1.2rem' }}>
                  <Facebook size={24} />
                  Ir a Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
