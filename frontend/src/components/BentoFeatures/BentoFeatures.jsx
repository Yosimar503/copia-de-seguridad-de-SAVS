import React, { useRef, useState } from 'react';
import { Zap, ShieldCheck, Globe, Landmark, FileCheck2, Key } from 'lucide-react';
import './BentoFeatures.css';

const DEALERSHIP_ITEMS = [
  {
    icon: Zap,
    title: "Importación Rápida",
    description: "Procesos logísticos optimizados para entregarte tu vehículo en tiempo récord.",
    color: "#eab308",
  },
  {
    icon: ShieldCheck,
    title: "Transparencia Total",
    description: "Cero costos ocultos. Todas las facturas de subasta y aduanas a la vista.",
    color: "#eab308",
  },
  {
    icon: Globe,
    title: "Acceso Global",
    description: "Compramos en EE.UU. y Corea a través de IAAI, Copart y Autowini.",
    color: "#eab308",
  },
  {
    icon: Landmark,
    title: "Financiamiento",
    description: "Alianzas estratégicas con los principales bancos locales para facilitar tu crédito.",
    color: "#eab308",
  },
  {
    icon: FileCheck2,
    title: "Garantía CARFAX",
    description: "Solo importamos vehículos con historial limpio, millaje real y sin daños graves.",
    color: "#eab308",
  },
  {
    icon: Key,
    title: "Llave en Mano",
    description: "Nos encargamos de todo: subasta, aduanas, RTV y marchamo. Tú solo conduces.",
    color: "#eab308",
  },
];

const TILT_MAX = 9;

function Card({ item, dimmed, onHoverStart, onHoverEnd }) {
  const Icon = item.icon;
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized coordinates (0 to 1)
    const normX = x / rect.width;
    const normY = y / rect.height;
    
    const rx = (0.5 - normY) * (TILT_MAX * 2); 
    const ry = (normX - 0.5) * (TILT_MAX * 2);
    
    setTilt({ rx, ry });
    setMousePos({ x: normX * 100, y: normY * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
    onHoverEnd();
  };

  const scale = dimmed ? 0.96 : 1;
  const opacity = dimmed ? 0.5 : 1;
  const tiltStyle = `perspective(900px) scale(${scale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        transform: tiltStyle,
        opacity: opacity,
        '--item-color': item.color,
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`
      }}
    >
      <div 
        className="card-bg-static"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${item.color}14, transparent 65%)`
        }} 
      />
      
      <div 
        className="card-hover-glow" 
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${item.color}2e, transparent 65%)`
        }} 
      />
      
      <div className="card-shimmer-sweep" />
      
      <div 
        className="card-icon-badge" 
        style={{
          background: `${item.color}18`,
          boxShadow: `inset 0 0 0 1px ${item.color}30`
        }}
      >
        <Icon size={17} strokeWidth={1.9} color={item.color} />
      </div>

      <div className="card-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <div 
        className="card-bottom-accent" 
        style={{
          background: `linear-gradient(to right, ${item.color}80, transparent)`
        }}
      />
    </div>
  );
}

export default function BentoFeatures({ 
  items = DEALERSHIP_ITEMS,
  eyebrow = "Servicios",
  heading = "Tu Comodidad a un Nuevo Nivel"
}) {
  const [hoveredTitle, setHoveredTitle] = useState(null);

  return (
    <div className="spotlight-container">
      <div className="spotlight-header">
        <p className="eyebrow-text">{eyebrow}</p>
        <h2 className="heading-text">{heading}</h2>
      </div>

      <div className="spotlight-grid">
        {items.map((item) => (
          <Card
            key={item.title}
            item={item}
            dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
            onHoverStart={() => setHoveredTitle(item.title)}
            onHoverEnd={() => setHoveredTitle(null)}
          />
        ))}
      </div>
    </div>
  );
}
