import React from 'react';
import './PublicidadSAVS.css';
import flyer1 from '../../img/image.png';
import flyer2 from '../../img/image copy.png';
import flyer3 from '../../img/image copy 2.png';
import flyer4 from '../../img/image copy 3.png';

const flyers = [
  { img: flyer1, subtitle: "PASO 1", title: "Elegís el carro" },
  { img: flyer2, subtitle: "PASO 2", title: "Lo compramos" },
  { img: flyer3, subtitle: "PASO 3", title: "Lo enviamos a C.R." },
  { img: flyer4, subtitle: "PASO 4", title: "Te lo entregamos" }
];

const PublicidadSAVS = () => {
  return (
    <section className="savs-grid-section">
      <div className="savs-pub-header">
        <div className="savs-pub-badge">SAVS Importadora de Vehículos</div>
        <h2 className="savs-pub-title">¿Buscás tu próximo vehículo?</h2>
        <p className="savs-pub-subtitle">
          Importamos el carro exacto que querés. Seguí nuestros 4 pasos de oro.
        </p>
      </div>

      <div className="savs-cards-container">
        {flyers.map((item, i) => (
          <div className="savs-card-nba" key={i}>
            <div className="savs-card-img-wrapper">
              <img src={item.img} alt={item.title} className="savs-card-img" referrerPolicy="no-referrer" />
            </div>
            <div className="savs-card-info">
              <span className="savs-card-subtitle">{item.subtitle}</span>
              <h3 className="savs-card-title">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PublicidadSAVS;
