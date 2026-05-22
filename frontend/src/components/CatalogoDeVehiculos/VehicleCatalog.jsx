import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Gauge, 
  Settings, 
  Droplet, 
  ChevronDown, 
  ChevronUp, 
  Car, 
  DollarSign, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { useVehicleFavorites } from '../../hooks/useVehicleFavorites';
import { useCatalogoLogica } from './catalogoLogica';
import { useNavigate } from 'react-router-dom';
import ShimmerText from '../ShimmerText/ShimmerText';
import SlideTextButton from '../SlideTextButton/SlideTextButton';
import BorderBeam from '../BorderBeam/BorderBeam';
import { Magnetic } from '../core/Magnetic';
import FacebookPromo from '../FacebookPromo/FacebookPromo';
import PromocionBadge from '../catalog/PromocionBadge';
import { marketingService } from '../../services/api';
import { motion } from 'framer-motion';
import VehiclePDFButton from './VehiclePDFButton';
import './VehicleCatalog.css';

// Glob para imágenes locales (fallback si no hay imagen en el servidor)
const localImages = import.meta.glob('../../img/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });

const FavoriteButton = ({ vehicleId }) => {
  const { isFavorite, toggleFavorite } = useVehicleFavorites(vehicleId);
  return (
    <button 
      className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
      aria-label="Añadir a favoritos"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(e);
      }}
    >
      <Heart 
        size={20} 
        fill={isFavorite ? '#eab308' : 'none'} 
        color={isFavorite ? '#eab308' : 'white'} 
      />
    </button>
  );
};

const FilterSection = ({ id, title, icon: Icon, expandedSection, toggleSection, children }) => (
  <div className={`filter-section ${expandedSection === id ? 'expanded' : ''}`}>
    <Magnetic style={{ width: "100%", display: "block" }}>
      <button className="section-header" onClick={() => toggleSection(id)}>
        <div className="section-title-wrapper">
          <Icon size={18} className="section-icon" />
          <ShimmerText className="section-title" text={title} as="span" />
        </div>
        {expandedSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </Magnetic>
    <div className="section-content">
      {children}
    </div>
  </div>
);

const VehicleCatalog = ({ title, showFilters = false }) => {
  const {
    expandedSection,
    activeFilters,
    loading,
    vehicles,
    pagination,
    toggleSection,
    handleFilterChange,
    handlePageChange,
    resetFilters
  } = useCatalogoLogica();
  const navigate = useNavigate();
  const [promosActivas, setPromosActivas] = useState(false);

  useEffect(() => {
    marketingService.getBanners()
      .then((banners) => setPromosActivas(Array.isArray(banners) && banners.length > 0))
      .catch(() => setPromosActivas(false));
  }, []);

  const isVehiclePromo = (car) => {
    const tag = (car.tag || '').toLowerCase();
    return promosActivas && (tag.includes('oferta') || tag.includes('promo') || tag.includes('descuento'));
  };

  return (
    <section className={`vehicle-catalog ${showFilters ? 'with-sidebar' : 'catalog-section'}`}>
      <div className="catalog-header">
        <div className="title-area">
          <ShimmerText className="catalog-main-title" text={title || "Catálogo Premium"} as="h2" />
          <p className="results-text">
            {loading ? 'Cargando...' : `Mostrando ${pagination.total} vehículos en total`}
          </p>
        </div>
        
        {/* Barra de búsqueda rápida (Tarea 6) */}
        <div className="quick-search card-base">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por marca, modelo..." 
            value={activeFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      <div className="catalog-layout">
        {showFilters && (
          <aside className="catalog-sidebar card-base">
            <div className="filters-header">
              <Filter size={20} />
              <h3>Filtros Especializados</h3>
            </div>

          <FilterSection id="technical" title="Técnicos" icon={Settings} expandedSection={expandedSection} toggleSection={toggleSection}>
            <div className="filter-group">
              <label>Transmisión</label>
              <div className="button-grid">
                {['Manual', 'Automática'].map(t => (
                  <Magnetic key={t}>
                    <button 
                      className={`toggle-btn ${activeFilters.transmission === t ? 'active' : ''}`} 
                      onClick={() => handleFilterChange('transmission', activeFilters.transmission === t ? '' : t)}
                    >
                      {t}
                    </button>
                  </Magnetic>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>Combustible</label>
              <div className="button-grid">
                {['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'].map(f => (
                  <Magnetic key={f}>
                    <button 
                      className={`toggle-btn ${activeFilters.fuel === f ? 'active' : ''}`} 
                      onClick={() => handleFilterChange('fuel', activeFilters.fuel === f ? '' : f)}
                    >
                      {f}
                    </button>
                  </Magnetic>
                ))}
              </div>
            </div>
          </FilterSection>

          <FilterSection id="vehicle" title="Vehículo" icon={Car} expandedSection={expandedSection} toggleSection={toggleSection}>
            <div className="filter-row">
              <div className="filter-group half">
                <label>Marca</label>
                <input type="text" placeholder="Ej: Toyota" value={activeFilters.marca} onChange={(e) => handleFilterChange('marca', e.target.value)} />
              </div>
              <div className="filter-group half">
                <label>Tipo</label>
                <input type="text" placeholder="Ej: SUV" value={activeFilters.type} onChange={(e) => handleFilterChange('type', e.target.value)} />
              </div>
            </div>
          </FilterSection>

          <FilterSection id="purchase" title="Presupuesto" icon={DollarSign} expandedSection={expandedSection} toggleSection={toggleSection}>
            <div className="filter-group">
              <label>Rango de Precio (₡)</label>
              <div className="filter-row">
                <input type="number" placeholder="Mín" value={activeFilters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                <input type="number" placeholder="Máx" value={activeFilters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
              </div>
            </div>
          </FilterSection>

          <Magnetic style={{ width: "100%", display: "block", marginTop: "1rem" }}>
            <button className="btn btn-secondary reset-btn" style={{ marginTop: 0 }} onClick={resetFilters}>Limpiar Filtros</button>
          </Magnetic>
          </aside>
        )}

        <main className={`catalog-main ${!showFilters ? 'full-width' : ''}`}>
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Sincronizando con el inventario...</p>
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className="catalog-grid">
                {vehicles.map((car, index) => {
                  // Resolver imagen (Servidor -> Local -> Placeholder)
                  const imageSrc = car.image?.startsWith('http') 
                    ? car.image 
                    : car.image?.startsWith('/uploads')
                      ? `http://localhost:5000${car.image}`
                      : Object.keys(localImages).find(k => k.includes(car.image))
                        ? localImages[Object.keys(localImages).find(k => k.includes(car.image))]
                        : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop';

                  return (
                    <React.Fragment key={car.id}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index % 12) * 0.05 }}
                        className="card vehicle-card" 
                        style={{ position: 'relative', borderRadius: '20px' }}
                      >
                        <BorderBeam duration={10} size={25} borderWidth={1.2} />
                        <div className="vehicle-image-container">
                          <img src={imageSrc} alt={car.name} className="vehicle-image" />
                          <PromocionBadge tag={car.tag} promoActiva={isVehiclePromo(car)} />
                          <div className="vehicle-tag" style={{ backgroundColor: car.tag === 'Vendido' ? '#ef4444' : '#10b981' }}>
                            {car.tag || 'Disponible'}
                          </div>
                          <FavoriteButton vehicleId={car.id} />
                        </div>
                        <div className="vehicle-info">
                          <h3 className="vehicle-name">{car.marca} {car.modelo || car.name}</h3>
                          <div className="vehicle-meta">
                            <span>{car.year} • {car.fuel} • {car.transmission}</span>
                          </div>
                          <div className="vehicle-specs-grid">
                            <div className="spec-item"><Gauge size={16} className="spec-icon" /><span>{car.mileage || '0'} km</span></div>
                            <div className="spec-item"><Droplet size={16} className="spec-icon" /><span>{car.color || 'N/A'}</span></div>
                          </div>
                          <div className="vehicle-footer">
                            <span className="vehicle-price">
                              ₡{Number(car.price || 0).toLocaleString()}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '120px' }}>
                              <VehiclePDFButton vehicle={car} />
                              <SlideTextButton 
                                text="Detalles" 
                                hoverText="Ver más" 
                                onClick={() => navigate(`/details/${car.id}`, { state: { vehicle: car } })} 
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      {(index + 1) % 6 === 0 && (
                        <FacebookPromo key={`promo-card-${index}`} type="card" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Paginación UI (Tarea 1) */}
              {pagination.totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    disabled={pagination.page === 1} 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="page-btn"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="page-info">Página {pagination.page} de {pagination.totalPages}</span>
                  <button 
                    disabled={pagination.page === pagination.totalPages} 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="page-btn"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results card-base">
              <h3>No se encontraron vehículos</h3>
              <p>Intenta ajustar los filtros para encontrar tu vehículo ideal.</p>
              <button onClick={resetFilters} className="btn-secondary">Limpiar filtros</button>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default VehicleCatalog;
