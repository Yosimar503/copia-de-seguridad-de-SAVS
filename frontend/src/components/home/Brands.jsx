import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Brands.css';

const Brands = () => {
  const [brands, setBrands] = React.useState([]);

  React.useEffect(() => {
    api.get('/settings')
      .then(res => setBrands(res.data.brands || []))
      .catch(err => console.error("Error fetching brands:", err));
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="brands-section">
      <div className="brands-container">
        <h2 className="sr-only">Nuestros Aliados</h2>
        <div className="brands-wrapper">
          <ul className="brands-list">
            {brands.map((brand) => (
              <li key={`${brand.id}-1`} className={`brand-item brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={brand.logoUrl} alt={`${brand.name} logo`} className="brand-logo" referrerPolicy="no-referrer" />
              </li>
            ))}
            {/* Double duplicate for truly infinite seamless loop */}
            {brands.map((brand) => (
              <li key={`${brand.id}-2`} className={`brand-item brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={brand.logoUrl} alt={`${brand.name} logo`} className="brand-logo" referrerPolicy="no-referrer" />
              </li>
            ))}
            {/* Triple duplicate for safety */}
            {brands.map((brand) => (
              <li key={`${brand.id}-3`} className={`brand-item brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={brand.logoUrl} alt={`${brand.name} logo`} className="brand-logo" referrerPolicy="no-referrer" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Brands;
