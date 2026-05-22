import React from 'react';
import { useFiltersLogica } from './FiltersLogica';
import './Filters.css';

const Filters = () => {
  const { activeYear, setActiveYear, years, mileageRanges } = useFiltersLogica();

  return (
    <div className="filters-container">
      <div className="filters-grid">
        
        {/* Mileage Filters */}
        <div className="filter-group">
          <h4 className="filter-title">Rangos de Kilometraje</h4>
          <div className="mileage-options">
            {mileageRanges.map((range, index) => (
              <label key={index} className="checkbox-label">
                <input type="checkbox" className="custom-checkbox" />
                <span className="checkbox-text">{range.label}</span>
                <span className="count-badge">{range.count}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Year Filters */}
        <div className="filter-group year-group border-left">
          <h4 className="filter-title">Años de Producción</h4>
          <div className="year-options">
            {years.map((year) => (
              <button 
                key={year}
                className={`year-btn ${activeYear === year ? 'active' : ''}`}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Filters;
