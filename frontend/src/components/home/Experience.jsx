import React, { useRef, useState } from 'react';
import { Award, CheckCircle, Star, MapPin, ShieldCheck, Users, History, Target, Eye } from 'lucide-react';
import showroomImg from '../../img/494797711_659190636874640_8507294170366078964_n.jpg';
import './Experience.css';
import '../BentoFeatures/BentoFeatures.css';

const SpotlightWrapper = ({ children, className, isHoveredGlobal, setHoveredGlobal, id }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const TILT_MAX = 7;

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;
    setTilt({ rx: (0.5 - normY) * (TILT_MAX * 2), ry: (normX - 0.5) * (TILT_MAX * 2) });
    setMousePos({ x: normX * 100, y: normY * 100 });
  };

  const handleMouseEnter = () => { setIsHovered(true); setHoveredGlobal(id); };
  const handleMouseLeave = () => { setIsHovered(false); setTilt({ rx: 0, ry: 0 }); setHoveredGlobal(null); };

  const isDimmed = isHoveredGlobal !== null && isHoveredGlobal !== id;
  const scale = isDimmed ? 0.96 : 1;
  const opacity = isDimmed ? 0.5 : 1;

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        transform: `perspective(900px) scale(${scale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        opacity: opacity,
        '--item-color': '#eab308',
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(234, 179, 8, 0.15)'
      }}
    >
      <div className="card-bg-static" style={{ background: `radial-gradient(ellipse at 20% 20%, rgba(234, 179, 8, 0.08), transparent 65%)` }} />
      <div className="card-hover-glow" style={{ opacity: isHovered ? 1 : 0, background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(234, 179, 8, 0.2), transparent 65%)` }} />
      <div className="card-shimmer-sweep" />
      
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      <div className="card-bottom-accent" style={{ background: `linear-gradient(to right, rgba(234, 179, 8, 0.8), transparent)` }} />
    </div>
  );
};

const Experience = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const stats = [
        {
            icon: <Award className="experience-icon" />,
            title: "3+ Años",
            description: "De trayectoria sólida liderando la importación de vehículos premium en Costa Rica."
        },
        {
            icon: <CheckCircle className="experience-icon" />,
            title: "160+ Vehículos",
            description: "Importaciones exitosas garantizando un proceso seguro, eficiente y transparente."
        },
        {
            icon: <Star className="experience-icon" />,
            title: "4.9/5 Calificación",
            description: "La satisfacción de nuestros clientes es nuestro mayor respaldo y garantía."
        },
        {
            icon: <MapPin className="experience-icon" />,
            title: "Presencia Local",
            description: "Oficinas físicas en Heredia y Puntarenas para brindarle seguridad jurídica y cercanía."
        }
    ];

    const trustPoints = [
        {
            icon: <ShieldCheck className="trust-icon" />,
            title: "Seguridad y Transparencia",
            text: "Cada trámite se realiza con total honestidad, asegurando que su inversión esté protegida desde la subasta hasta la entrega."
        },
        {
            icon: <Users className="trust-icon" />,
            title: "Asesoría Personalizada",
            text: "Le acompañamos en cada paso, incluyendo la gestión de financiamiento con las principales entidades bancarias del país."
        }
    ];

    const objectiveCards = [
        {
            icon: <Target className="objective-icon" />,
            title: "Misión",
            text: "Facilitar el acceso a vehículos de alta calidad mediante un proceso de importación transparente, brindando seguridad y respaldo a cada familia costarricense."
        },
        {
            icon: <Eye className="objective-icon" />,
            title: "Visión",
            text: "Ser la importadora líder y más confiable de Costa Rica, reconocida por nuestra innovación en el servicio y el compromiso inquebrantable con la satisfacción total del cliente."
        }
    ];

    return (
        <section className="experience-section">
            <div className="container">
                <div className="experience-header">
                    <span className="experience-badge">Nuestra Esencia</span>
                    <h2 className="section-title text-center">Una Historia de Confianza y Calidad</h2>
                    <p className="experience-subtitle">
                        Importadora SAVS nace de la pasión por los autos y el compromiso con el servicio excepcional. En solo 3 años, nos hemos convertido en el referente de importación premium en Costa Rica, facilitando el sueño de más de 160 familias con transparencia absoluta y el respaldo de nuestras sedes físicas en Heredia y Puntarenas.
                    </p>
                </div>

                <div className="objectives-grid">
                    {objectiveCards.map((obj, i) => (
                        <SpotlightWrapper 
                            key={`obj-${i}`} 
                            id={`obj-${i}`} 
                            isHoveredGlobal={hoveredCard} 
                            setHoveredGlobal={setHoveredCard}
                            className="objective-card-premium"
                        >
                            <div className="objective-icon-wrapper">
                                {React.cloneElement(obj.icon, { size: 36 })}
                            </div>
                            <h3>{obj.title}</h3>
                            <p>{obj.text}</p>
                        </SpotlightWrapper>
                    ))}
                </div>

                <div className="experience-grid">
                    {stats.map((item, index) => (
                        <SpotlightWrapper 
                            key={`stat-${index}`} 
                            id={`stat-${index}`} 
                            isHoveredGlobal={hoveredCard} 
                            setHoveredGlobal={setHoveredCard}
                            className="experience-card"
                        >
                            <div className="icon-wrapper">
                                {item.icon}
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </SpotlightWrapper>
                    ))}
                </div>

                <div className="trust-banner">
                    <div className="trust-content">
                        <div className="experience-header left-align">
                            <span className="experience-badge">Eficiencia Garantizada</span>
                            <h3 className="trust-title">Su aliado estratégico en el camino</h3>
                        </div>
                        <div className="trust-points">
                            {trustPoints.map((point, index) => (
                                <div className="trust-item" key={index}>
                                    <div className="trust-icon-box">
                                        {point.icon}
                                    </div>
                                    <div className="trust-text">
                                        <h4>{point.title}</h4>
                                        <p>{point.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="trust-image-placeholder">
                        <img 
                            src={showroomImg} 
                            alt="Importadora SAVS Showroom" 
                            className="trust-img"
                        />
                        <div className="image-overlay-badge">
                            <span className="badge-number">100%</span>
                            <span className="badge-text">Transparencia</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
