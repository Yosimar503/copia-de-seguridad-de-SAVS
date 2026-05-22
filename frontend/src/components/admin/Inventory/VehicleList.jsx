import React, { useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const VehicleList = ({ vehicles, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('Todos');

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = (v.name || v.modelo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTag === 'Todos' || v.tag === filterTag;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="inventory-list-container">
      <div className="list-controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar vehículo por nombre o marca..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-actions">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Vendido">Vendido</option>
              <option value="Reservado">Reservado</option>
            </select>
          </div>
          <button onClick={onAddNew} className="btn-add-primary">
            <Plus size={18} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      <div className="premium-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Año / Comb.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v, idx) => (
                <motion.tr 
                  key={v.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td>
                    <div className="vehicle-cell">
                      <img src={v.image} alt="" className="table-thumb" />
                      <div className="vehicle-info">
                        <span className="v-name">{v.name || v.modelo}</span>
                        <span className="v-id">ID: {v.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-tag tag-${(v.tag || 'Disponible').toLowerCase()}`}>
                      {v.tag || 'Disponible'}
                    </span>
                  </td>
                  <td>
                    <span className="v-price">
                      ₡{Number(v.price || v.precio).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className="v-meta">
                      <span>{v.year || v.anio}</span>
                      <span className="dot"></span>
                      <span>{v.fuel}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => onEdit(v)} title="Editar" className="act-btn edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDelete(v)} title="Eliminar" className="act-btn delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  No se encontraron vehículos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .inventory-list-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .list-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.6rem 1.2rem;
          color: #4b5563;
          transition: border-color 0.2s;
        }

        .search-box:focus-within { border-color: #eab308; color: #eab308; }
        .search-box input {
          background: none;
          border: none;
          color: #fff;
          width: 100%;
          font-family: inherit;
        }
        .search-box input:focus { outline: none; }

        .filter-actions { display: flex; gap: 1rem; align-items: center; }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 1rem;
          border-radius: 12px;
          color: #9ca3af;
        }

        .filter-group select {
          background: #111;
          border: none;
          color: #fff;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          padding: 2px 5px;
        }

        .filter-group select option {
          background-color: #1a1a1a;
          color: #fff;
          padding: 10px;
        }

        .btn-add-primary {
          background: #eab308;
          color: #000;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-add-primary:hover { transform: translateY(-2px); }

        /* Table Styles */
        .premium-table-wrapper {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inventory-table th {
          background: rgba(255, 255, 255, 0.04);
          padding: 1.2rem 1.5rem;
          color: #f1f5f9; /* Blanco brillante */
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
          border-bottom: 2px solid rgba(234, 179, 8, 0.3); /* Línea dorada distintiva */
        }

        .inventory-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .vehicle-cell { display: flex; align-items: center; gap: 1rem; }
        .table-thumb { width: 60px; height: 45px; object-fit: cover; border-radius: 8px; }
        .vehicle-info { display: flex; flex-direction: column; }
        .v-name { color: #fff; font-weight: 600; font-size: 0.95rem; }
        .v-id { color: #4b5563; font-size: 0.75rem; }

        .badge-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tag-disponible { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .tag-vendido { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .tag-reservado { background: rgba(234, 179, 8, 0.1); color: #eab308; }

        .v-price { color: #eab308; font-weight: 700; font-size: 1rem; }

        .v-meta { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-size: 0.85rem; }
        .dot { width: 4px; height: 4px; background: #4b5563; border-radius: 50%; }

        .action-btns { display: flex; gap: 8px; }
        .act-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .act-btn.edit { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .act-btn.edit:hover { background: #3b82f6; color: #fff; }
        
        .act-btn.delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .act-btn.delete:hover { background: #ef4444; color: #fff; }

        .empty-row { text-align: center; color: #6b7280; padding: 4rem !important; font-style: italic; }
      `}</style>
    </div>
  );
};

export default VehicleList;
