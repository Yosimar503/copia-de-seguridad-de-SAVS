import React from 'react';
import VehicleCard from './VehicleCard';
import Filters from './Filters';
import ShimmerText from '../ShimmerText/ShimmerText';
import './VehicleCatalog.css';

const VehicleCatalog = ({ title, vehicles, showFilters = false }) => {
  return (
    <section className="vehicle-catalog-section">
      <div className="catalog-header">
        <ShimmerText className="section-title" text={title} as="h2" />
        <div className="catalog-actions">
          <p className="results-text">Mostrando {vehicles.length} vehículos</p>
        </div>
      </div>

      <div className="catalog-grid">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {showFilters && <Filters />}
    </section>
  );
};

export default VehicleCatalog;
