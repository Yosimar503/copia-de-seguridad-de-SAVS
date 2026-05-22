import React from 'react';
import { Heart } from 'lucide-react';
import { useVehicleCardLogica } from './VehicleCardLogica';
import { useNavigate } from 'react-router-dom';
import SlideTextButton from '../SlideTextButton/SlideTextButton';
import BorderBeam from '../BorderBeam/BorderBeam';
import ShimmerText from '../ShimmerText/ShimmerText';
import './VehicleCard.css';

const localImages = import.meta.glob('../../carros/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });

const VehicleCard = ({ vehicle }) => {
  const { isFavorite, getTagClass, toggleFavorite } = useVehicleCardLogica(vehicle.id);
  const navigate = useNavigate();

  return (
    <div className="vehicle-card card-base" style={{ position: 'relative', borderRadius: '1rem' }}>
      <BorderBeam duration={10} size={25} borderWidth={1.2} />
      <div className="card-image-wrapper">
        <img 
          src={localImages[vehicle.image] || vehicle.image} 
          alt={vehicle.name} 
          className="card-image" 
          referrerPolicy="no-referrer"
        />
        <div className={`card-tag ${getTagClass(vehicle.tag)}`}>
          {vehicle.tag}
        </div>
        <button 
          className="favorite-btn" 
          onClick={toggleFavorite}
          aria-label="Agregar a favoritos"
        >
          <Heart 
            size={20} 
            className={isFavorite ? 'heart-icon active' : 'heart-icon'} 
            fill={isFavorite ? '#ef4444' : 'none'}
            color={isFavorite ? '#ef4444' : 'white'}
          />
        </button>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="vehicle-name">{vehicle.type} - {vehicle.name}</h3>
        </div>

        <div className="vehicle-specs-grid">
          <div className="spec-item">
            <span className="spec-label">Motor</span>
            <span className="spec-value">{vehicle.motor}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Kilometraje</span>
            <span className="spec-value">{vehicle.mileage}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Tipo</span>
            <span className="spec-value">{vehicle.type}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Año modelo</span>
            <span className="spec-value">{vehicle.year}</span>
          </div>
        </div>

        <div className="card-footer">
          <ShimmerText className="vehicle-price" text={`₡${Number(vehicle.price || vehicle.precio).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} as="div" shimmerWidth={100} />
          <SlideTextButton
            text="Detalles"
            hoverText="Ver más"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/details/${vehicle.id || 'default'}`, { state: { vehicle } })}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
