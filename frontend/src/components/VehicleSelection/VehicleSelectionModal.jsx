import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Car, Truck, Zap, Flame, ChevronLeft, ChevronRight, X, Bus, ArrowLeft } from 'lucide-react';
import './VehicleSelectionModal.css';

const categoriesData = [
  { id: 'Sedán', label: 'Autos', icon: Car },
  { id: 'SUV', label: 'SUV', icon: Car },
  { id: 'Pick Up', label: 'Pick ups', icon: Truck },
  { id: 'Deportivo', label: 'Deportivos', icon: Flame },
  { id: 'Comercial', label: 'Comerciales', icon: Bus },
  { id: 'Eléctrico', label: 'Eléctrico', icon: Zap },
];

const VehicleSelectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fadeState, setFadeState] = useState('fade-in');
  const [models, setModels] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  
  const carouselRef = useRef(null);

  // Fetch all vehicles once when the modal opens
  useEffect(() => {
    if (isOpen) {
      api.get('/vehicles')
        .then(res => {
          // El backend envuelve los resultados en "data" (junto con pagination)
          const vehicleArray = res.data.data || res.data || [];
          setAllVehicles(Array.isArray(vehicleArray) ? vehicleArray : []);
        })
        .catch(err => console.error("Error loading vehicles for selection:", err));
    }
  }, [isOpen]);

  // When category changes, filter models
  useEffect(() => {
    if (selectedCategory && allVehicles.length > 0) {
      const filtered = allVehicles.filter(v => 
        v.type.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      // Fallback to slicing some vehicles if category is empty
      setModels(filtered.length > 0 ? filtered : allVehicles.slice(0, 4));
      setSelectedVehicle(null);
    }
  }, [selectedCategory, allVehicles]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setFadeState('fade-out');
    setTimeout(() => {
      setStep(2);
      setFadeState('fade-in');
    }, 300);
  };

  const handleGoBack = () => {
    setFadeState('fade-out');
    setTimeout(() => {
      setStep(1);
      setFadeState('fade-in');
    }, 300);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setTimeout(() => {
      onClose();
      navigate('/simulate-credit', { state: { selectedVehicle: vehicle } });
    }, 300);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vehicle-selection-overlay">
      <div className="vehicle-selection-modal">
        <button className="vehicle-selection-close" onClick={onClose} aria-label="Cerrar">
          <X size={32} />
        </button>

        <div className={`vehicle-selection-content ${fadeState}`}>
          {step === 1 && (
            <>
              <button className="vehicle-selection-back" onClick={onClose} aria-label="Volver">
                <ArrowLeft size={20} /> Volver
              </button>
              <h2 className="vehicle-selection-title">Seleccioná el tipo de vehículo</h2>
              
              <div className="category-grid">
                {categoriesData.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div 
                      key={cat.id} 
                      className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <div className="category-icon-wrapper">
                        <Icon size={70} strokeWidth={1} />
                      </div>
                      <span className="category-name">{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button className="vehicle-selection-back" onClick={handleGoBack} aria-label="Volver">
                <ArrowLeft size={20} /> Volver
              </button>
              <h2 className="vehicle-selection-title">Seleccioná el vehículo de interés</h2>
              
              <div className="models-carousel-wrapper">
                <button className="carousel-nav-btn" onClick={() => scrollCarousel('left')}>
                  <ChevronLeft size={48} />
                </button>
                
                <div className="models-grid" ref={carouselRef}>
                  {models.map((vehicle) => (
                    <div 
                      key={vehicle.id} 
                      className={`model-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className={`model-radio ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}></div>
                      <div className="model-image-wrapper">
                        <img 
                          src={vehicle.image} 
                          alt={vehicle.name} 
                          className="model-image" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="model-name">
                        {vehicle.name}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="carousel-nav-btn" onClick={() => scrollCarousel('right')}>
                  <ChevronRight size={48} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleSelectionModal;
