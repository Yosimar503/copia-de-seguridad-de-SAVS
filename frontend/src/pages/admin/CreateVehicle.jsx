import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { vehicleService } from '../../services/api'; // Tarea 2: Usar servicio centralizado
import { 
  CarFront, 
  Plus, 
  RefreshCcw, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes Modulares
import VehicleList from '../../components/admin/Inventory/VehicleList';
import VehicleForm from '../../components/admin/Inventory/VehicleForm';
import AdminLoader from '../../components/admin/AdminLoader';

import './Admin.css';

const initialFormState = {
  name: '',
  motor: '',
  type: 'SUV',
  year: new Date().getFullYear(),
  mileage: '',
  price: '',
  tag: 'Disponible',
  transmission: 'Automática',
  fuel: 'Gasolina',
  color: '',
  image: null, // Guardaremos el archivo real para Multer
  summary: '',
  doors: '5',
  passengers: '5'
};

const CreateVehicle = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [vehiculos, setVehiculos] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Tarea 2: Obtener datos reales con paginación (traemos los primeros 100 para el admin)
      const response = await vehicleService.getAll({ limit: 100 });
      setVehiculos(response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar los vehículos desde el servidor.',
        background: '#1a1a1a',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentVehicle(initialFormState);
    setView('form');
  };

  const handleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setView('form');
  };

  const handleDelete = async (vehicle) => {
    const result = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: `¿Estás seguro de borrar "${vehicle.marca} ${vehicle.modelo || vehicle.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#141414',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await vehicleService.delete(vehicle.id);
        setVehiculos(prev => prev.filter(v => v.id !== vehicle.id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          background: '#141414',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.error || 'No se pudo completar la operación.',
          background: '#141414',
          color: '#fff'
        });
      }
    }
  };

  // Tarea 2 y 4: Enviar datos reales y validar en servidor
  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const isEditing = !!data.id;
      
      // Creamos un FormData para poder enviar la imagen real (Multer lo requiere)
      const formData = new FormData();
      
      // Agregamos todos los campos al FormData
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });

      // Aseguramos marca y modelo si el nombre viene completo
      if (data.name && !data.marca) {
        const parts = data.name.split(' ');
        formData.append('marca', parts[0]);
        formData.append('modelo', parts.slice(1).join(' '));
      }

      let response;
      if (isEditing) {
        response = await vehicleService.update(data.id, formData);
        Swal.fire({ icon: 'success', title: '¡Actualizado!', background: '#141414', color: '#fff', timer: 1500, showConfirmButton: false });
      } else {
        response = await vehicleService.create(formData);
        Swal.fire({ icon: 'success', title: '¡Publicado!', background: '#141414', color: '#fff', timer: 1500, showConfirmButton: false });
      }

      fetchVehicles(); // Recargar lista
      setView('list');
    } catch (error) {
      console.error("Error saving vehicle:", error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error al guardar', 
        text: error.response?.data?.error || 'Verifica los datos e intenta de nuevo.', 
        background: '#141414', 
        color: '#fff' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-inventory-page">
      <div className="admin-page-header">
        <div className="breadcrumb">
          <span onClick={() => navigate('/admin')} className="crumb-link">Dashboard</span>
          <ChevronRight size={14} />
          <span className="crumb-active">Inventario</span>
        </div>
        
        <div className="header-main-row">
          <div className="header-titles">
            <h1>Gestión de Inventario <CarFront size={28} className="icon-gold" /></h1>
            <p>Añade, edita y supervisa el stock de vehículos disponibles en el catálogo.</p>
          </div>
          
          <div className="header-actions">
            <button onClick={fetchVehicles} className="btn-refresh" title="Sincronizar">
              <RefreshCcw size={18} className={loading ? 'spin' : ''} />
            </button>
            {view === 'list' ? (
              <button onClick={handleAddNew} className="btn-primary-admin">
                <Plus size={18} /> Nuevo Vehículo
              </button>
            ) : (
              <button onClick={() => setView('list')} className="btn-secondary-admin">
                <ArrowLeft size={18} /> Volver a la Lista
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-page-content">
        <AnimatePresence mode="wait">
          {loading && view === 'list' ? (
            <AdminLoader message="Actualizando inventario..." />
          ) : view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VehicleList 
                vehicles={vehiculos} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onAddNew={handleAddNew}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VehicleForm 
                initialData={currentVehicle} 
                onSubmit={handleFormSubmit}
                onCancel={() => setView('list')}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        /* Estilos base del panel de admin */
        .admin-inventory-page { padding: 2rem; max-width: 1400px; margin: 0 auto; min-height: 100vh; }
        .admin-page-header { margin-bottom: 3rem; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; color: #4b5563; font-size: 0.85rem; margin-bottom: 1rem; }
        .crumb-link { cursor: pointer; transition: color 0.2s; }
        .crumb-link:hover { color: #eab308; }
        .crumb-active { color: #9ca3af; }
        .header-main-row { display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .header-titles h1 { font-size: 2.5rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; }
        .header-titles p { color: #6b7280; font-size: 1.1rem; }
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        .btn-refresh { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #9ca3af; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .btn-refresh:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .btn-primary-admin { background: #eab308; color: #000; border: none; padding: 0.8rem 1.8rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(234, 179, 8, 0.2); }
        .btn-primary-admin:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(234, 179, 8, 0.3); }
        .btn-secondary-admin { background: rgba(255, 255, 255, 0.03); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); padding: 0.8rem 1.8rem; border-radius: 12px; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary-admin:hover { background: rgba(255, 255, 255, 0.08); }
        .icon-gold { color: #eab308; }
      `}</style>
    </div>
  );
};

export default CreateVehicle;
