import React from 'react';
import VehicleCatalog from '../../components/CatalogoDeVehiculos/VehicleCatalog';
import FacebookPromo from '../../components/FacebookPromo/FacebookPromo';
import './Catalog.css';

const Catalog = () => {
  return (
    <div className="catalog-page">
      <div className="container">
        <VehicleCatalog showFilters={true} />
      </div>
      
      <div className="container" style={{ paddingBottom: '6rem', marginTop: '4rem' }}>
        <FacebookPromo type="banner" className="home-large-ad" reverse={false} />
      </div>
    </div>
  );
};

export default Catalog;
