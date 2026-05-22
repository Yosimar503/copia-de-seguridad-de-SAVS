import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Map, 
  Save, 
  X,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import AdminLoader from '../../components/admin/AdminLoader';
import './Admin.css';

const darkSwal = {
  background: '#111',
  color: '#fff',
  confirmButtonColor: '#eab308',
  cancelButtonColor: '#333'
};

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranch, setCurrentBranch] = useState({
    id: '',
    name: '',
    location: '',
    phone: '',
    schedule: '',
    map_embed: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBranch({ ...currentBranch, [name]: value });
  };

  const openModal = (branch = null) => {
    if (branch) {
      setCurrentBranch(branch);
      setIsEditing(true);
    } else {
      setCurrentBranch({
        id: 'branch-' + Date.now(),
        name: '',
        location: '',
        phone: '',
        schedule: '',
        map_embed: ''
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentBranch.name || !currentBranch.location) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'Nombre y ubicación son obligatorios.' });
      return;
    }

    try {
      const url = isEditing 
        ? `/branches/${currentBranch.id}` 
        : '/branches';
      
      const res = isEditing 
        ? await api.put(url, currentBranch)
        : await api.post(url, currentBranch);

      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: isEditing ? 'Sede Actualizada' : 'Sede Creada',
        timer: 1500,
        showConfirmButton: false
      });
      fetchBranches();
      closeModal();
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo guardar la sede.' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      ...darkSwal,
      icon: 'warning',
      title: '¿Eliminar sede?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/branches/${id}`);
        Swal.fire({ ...darkSwal, icon: 'success', title: 'Eliminado', timer: 1000, showConfirmButton: false });
        fetchBranches();
      } catch (error) {
        Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo eliminar la sede.' });
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-title">Gestión de Sedes</h1>
          <p className="admin-subtitle">Administra los puntos de venta, direcciones y mapas de la empresa.</p>
        </div>
        <button className="btn-primary-gold" onClick={() => openModal()}>
          <Plus size={20} />
          <span>Nueva Sede</span>
        </button>
      </div>

      <div className="admin-card branches-mgmt-card">
        {isLoading ? (
          <AdminLoader message="Localizando sedes..." />
        ) : branches.length === 0 ? (
          <div className="empty-state">No hay sedes registradas.</div>
        ) : (
          <div className="branches-admin-grid">
            {branches.map(branch => (
              <div key={branch.id} className="branch-admin-card">
                <div className="branch-header">
                  <div className="branch-icon-label">
                    <MapPin size={18} color="#eab308" />
                    <h3>{branch.name}</h3>
                  </div>
                  <div className="branch-actions">
                    <button className="btn-icon-sm edit" onClick={() => openModal(branch)} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon-sm delete" onClick={() => handleDelete(branch.id)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="branch-body">
                  <p className="branch-loc"><strong>Ubicación:</strong> {branch.location}</p>
                  <p className="branch-info"><Phone size={14} /> {branch.phone}</p>
                  <p className="branch-info"><Clock size={14} /> {branch.schedule}</p>
                  {branch.map_embed && (
                    <div className="map-preview-tag">
                      <Map size={14} /> Mapa configurado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Editar Sede' : 'Nueva Sede'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Nombre de la Sede</label>
                <input 
                  type="text" 
                  name="name" 
                  value={currentBranch.name} 
                  onChange={handleInputChange} 
                  placeholder="Ej. Sede Central San José"
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección Exacta</label>
                <textarea 
                  name="location" 
                  value={currentBranch.location} 
                  onChange={handleInputChange} 
                  placeholder="Provincia, Cantón, señas exactas..."
                  className="admin-textarea"
                  required
                />
              </div>

              <div className="form-row branch-form-row">
                <div className="form-group flex-1">
                  <label>Teléfono</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={currentBranch.phone} 
                    onChange={handleInputChange} 
                    placeholder="+506 ...."
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Horario</label>
                  <input 
                    type="text" 
                    name="schedule" 
                    value={currentBranch.schedule} 
                    onChange={handleInputChange} 
                    placeholder="L-V 8am-5pm"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL del Mapa (Google Maps Embed)</label>
                <input 
                  type="text" 
                  name="map_embed" 
                  value={currentBranch.map_embed} 
                  onChange={handleInputChange} 
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <small className="form-help-text">
                  Copia el enlace del 'src' del iframe de Google Maps.
                </small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary-gold">
                  <Save size={18} />
                  <span>{isEditing ? 'Actualizar' : 'Crear Sede'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
