import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { User, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import FacebookPromo from '../FacebookPromo/FacebookPromo';
import './IntercambioDeAutos.css';

const darkSwal = {
  background: '#141414',
  color: '#fff',
  confirmButtonColor: '#f5b400'
};

const API_URL = '/sale_requests';

const initialFormState = {
  id: null,
  marca: '',
  modelo: '',
  anio: '',
  precio: '',
  kilometraje: '',
  descripcion: '',
  imagen: null,
  estado: 'Pendiente',
  userId: null
};

const IntercambioDeAutos = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [vehiculos, setVehiculos] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminOrManager = userRole === 'admin' || userRole === 'gerente' || userRole === 'manager';

  // Cargar datos del usuario y sus solicitudes
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'Por favor inicia sesión para poder entregar tu auto como parte de pago.',
      }).then(() => {
        navigate('/login');
      });
      return;
    }
    
    
    const user = JSON.parse(savedUser);
    const role = (user.rol || '').toLowerCase();
    setUserId(user.id);
    setUserRole(role);
    
    if (role === 'admin' || role === 'gerente' || role === 'manager') {
      fetchAllVehicles();
      fetchAllUsers();
    } else {
      fetchUserVehicles(user.id);
    }
  }, [navigate]);

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      const users = response.data;
      const map = {};
      users.forEach(u => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_URL);
      setVehiculos(formatVehicles(response.data));
    } catch (error) {
      console.error("Error fetching all vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatVehicles = (data) => {
    return data.map(v => ({
      ...v,
      precio: Number(v.precio),
      kilometraje: Number(v.kilometraje),
      anio: Number(v.anio)
    })).reverse();
  };

  const fetchUserVehicles = async (uid) => {
    setLoading(true);
    try {
      const response = await api.get(`${API_URL}?userId=${uid}`);
      setVehiculos(formatVehicles(response.data));
    } catch (error) {
      console.error("Error fetching user vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Bloqueo total de cualquier signo menos "-" en todos los campos
    const valueWithoutMinuses = value.replace(/-/g, '');

    // 2. Para campos numéricos, forzar solo dígitos positivos
    if (name === 'precio' || name === 'kilometraje' || name === 'anio') {
      const cleanValue = valueWithoutMinuses.replace(/\D/g, '');
      // Evitar ceros a la izquierda innecesarios
      const finalValue = cleanValue === "" ? "" : parseInt(cleanValue, 10).toString();
      setFormData({
        ...formData,
        [name]: finalValue
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: valueWithoutMinuses
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          imagen: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones de espacios en blanco, valores vacíos y signos menos
    const camposTexto = ['marca', 'modelo', 'descripcion'];
    for (const campo of camposTexto) {
      const valor = formData[campo] ? formData[campo].toString() : "";
      if (valor.trim().length === 0) {
        Swal.fire({
          ...darkSwal,
          icon: 'error',
          title: 'Campo inválido',
          text: `El campo ${campo} no puede estar vacío.`
        });
        return;
      }
      if (valor.includes('-')) {
        Swal.fire({
          ...darkSwal,
          icon: 'error',
          title: 'Carácter no permitido',
          text: `El signo menos (-) no está permitido en el campo ${campo}.`
        });
        return;
      }
    }

    // Validaciones de números (no negativos)
    const precioNum = Number(formData.precio);
    const kmNum = Number(formData.kilometraje);
    const anioNum = Number(formData.anio);

    if (precioNum <= 0 || kmNum < 0 || anioNum <= 0) {
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Valores inválidos',
        text: 'Los valores de precio, kilometraje y año deben ser válidos y no negativos.'
      });
      return;
    }

    if (!formData.imagen) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Falta imagen',
        text: 'Por favor, selecciona al menos una imagen de tu vehículo.'
      });
      return;
    }

    // Limpiar datos antes de enviar
    const cleanData = {
      ...formData,
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      descripcion: formData.descripcion.trim(),
      precio: precioNum,
      kilometraje: kmNum,
      anio: anioNum,
      userId: isEditing ? formData.userId : userId // IMPORTANTE: Mantener el dueño original si estamos editando
    };

    setLoading(true);
    try {
      if (isEditing) {
        const response = await api.put(`${API_URL}/${cleanData.id}`, cleanData);
        setVehiculos(vehiculos.map(v => v.id === response.data.id ? response.data : v));
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Tu solicitud ha sido modificada con éxito.',
          background: '#141414',
          color: '#fff',
          confirmButtonColor: '#f5b400'
        });
        setIsEditing(false);
      } else {
        const response = await api.post(API_URL, { ...cleanData, id: String(Date.now()) });
        setVehiculos([response.data, ...vehiculos]);
        
        toast.success('Solicitud enviada correctamente', {
          duration: 4000,
          icon: '📋',
        });

        Swal.fire({
          icon: 'success',
          title: '¡Recibido!',
          text: 'Tu solicitud de intercambio ha sido registrada correctamente.',
          background: '#141414',
          color: '#fff',
          confirmButtonColor: '#f5b400'
        });
      }
      setFormData(initialFormState);
      if(document.getElementById('imagen-upload')) {
          document.getElementById('imagen-upload').value = '';
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.', background: '#141414', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehiculo) => {
    setIsEditing(true);
    setFormData(vehiculo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (vehiculo) => {
    Swal.fire({
      ...darkSwal,
      icon: 'warning',
      title: '¿Estás seguro?',
      text: `Se eliminará la solicitud de intercambio para: ${vehiculo.marca} ${vehiculo.modelo}. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e63946'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(vehiculo.id);
      }
    });
  };

  const updateStatus = async (id, nuevoEstado) => {
    const vehiculo = vehiculos.find(v => v.id === id);
    if (!vehiculo) return;

    const updatedVehiculo = { ...vehiculo, estado: nuevoEstado };
    
    try {
      const response = await api.put(`${API_URL}/${id}`, updatedVehiculo);
      setVehiculos(vehiculos.map(v => v.id === id ? updatedVehiculo : v));
      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: 'Estado actualizado',
        text: `La solicitud ha sido marcada como ${nuevoEstado}.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
    }
  };

  const handleRespond = (vehiculo) => {
    const user = usersMap[vehiculo.userId];
    const phone = user?.telefono || user?.phone;
    if (!phone) {
      Swal.fire({ ...darkSwal, icon: 'info', title: 'Sin teléfono', text: 'El cliente no tiene un teléfono registrado.' });
      return;
    }
    const message = `Hola ${user.nombre}, te contacto de SAVS sobre tu solicitud de avalúo para el ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      setVehiculos(vehiculos.filter(v => v.id !== id));
      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: 'Eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  const handleAction = async (vehiculo, nuevoEstado) => {
    try {
      await api.patch(`${API_URL}/${vehiculo.id}`, { estado: nuevoEstado });
      setVehiculos(vehiculos.map(v => v.id === vehiculo.id ? { ...v, estado: nuevoEstado } : v));
      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: `Vehículo ${nuevoEstado}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
    }
  };

  const handleMessage = (vehiculo) => {
    Swal.fire({
      ...darkSwal,
      title: 'Responder al Cliente',
      input: 'textarea',
      inputLabel: `Enviando correo al cliente`,
      inputPlaceholder: 'Escribe tu respuesta aquí...',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Debes escribir un mensaje';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          ...darkSwal,
          title: 'Enviando correo...',
          didOpen: () => Swal.showLoading()
        });
        setTimeout(() => {
          Swal.fire({
            ...darkSwal,
            icon: 'success',
            title: '¡Mensaje Enviado!',
            text: 'Se simuló el envío del correo electrónico al cliente.',
          });
        }, 1500);
      }
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'status-pendiente';
      case 'En revisión': return 'status-revision';
      case 'Aprobado': return 'status-aprobado';
      case 'Rechazado': return 'status-rechazado';
      default: return 'status-pendiente';
    }
  };

  return (
    <div className="vender-auto-container">
      <div className="vender-auto-header">
        <h1>Intercambio de Vehículo</h1>
        <p>El valor asignado a tu auto tras la revisión administrativa se aplicará como una reducción al precio total del vehículo que deseas comprar.</p>
      </div>

      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <FacebookPromo type="banner" reverse={false} />
      </div>

      <div className="vender-auto-layout">
        {/* Panel Izquierdo: Formulario (Solo para clientes) */}
        {!isAdminOrManager && (
          <div className="vender-auto-form-section">
            <div className="form-card-glow">
              <h2>{isEditing ? 'Editar Solicitud' : 'Solicitar Evaluación de Auto'}</h2>
              <form className="vender-auto-form" onSubmit={handleSubmit}>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <input type="text" name="marca" value={formData.marca} onChange={handleInputChange} required placeholder="Ej. BMW" />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} required placeholder="Ej. M4 Competition" />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Año</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      name="anio" 
                      value={formData.anio} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Ej. 2023" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      name="kilometraje" 
                      value={formData.kilometraje} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Ej. 15000" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Precio esperado (CRC)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    name="precio" 
                    value={formData.precio} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Ej. 15000000" 
                  />
                </div>

                {isAdminOrManager && (
                  <div className="form-group">
                    <label>Estado de la Solicitud</label>
                    <select 
                      name="estado" 
                      value={formData.estado} 
                      onChange={handleInputChange} 
                      className="form-control-admin"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Descripción y Estado del Vehículo</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} required placeholder="Detalla las condiciones generales, historial de servicios..." rows="4"></textarea>
                </div>

                <div className="form-group">
                  <label>Imágenes del vehículo</label>
                  <div className="file-upload-wrapper">
                    <input type="file" id="imagen-upload" accept="image/*" onChange={handleImageChange} className="file-upload-input" />
                    <div className="file-upload-custom">
                      {formData.imagen ? 'Imagen cargada con éxito' : 'Selecciona una imagen'}
                    </div>
                  </div>
                  {formData.imagen && (
                    <div className="image-preview">
                      <img src={formData.imagen} alt="Vista previa" />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  {isEditing && (
                    <button type="button" className="btn-cancel" onClick={() => { setIsEditing(false); setFormData(initialFormState); }}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Enviar para Avalúo')}
                  </button>
                </div>

              </form>
            </div>
          </div>

        )}

        {/* Panel Derecho: Lista de Autos */}
        <div className="vender-auto-list-section">
          <h2>{isAdminOrManager ? 'Gestión de Intercambios' : 'Mis Solicitudes'} ({vehiculos.length})</h2>
          
          {loading && vehiculos.length === 0 ? (
             <div className="loading-req">Cargando solicitudes...</div>
          ) : vehiculos.length === 0 ? (
            <div className="empty-state">
              <p>No tienes vehículos registrados para intercambio.</p>
              <span>Completa el formulario para solicitar la reducción de valor de tu nueva compra mediante Trade-in.</span>
            </div>
          ) : (
            <div className="vehiculos-list">
              {vehiculos.map(vehiculo => (
                <div key={vehiculo.id} className="vehiculo-card">
                  <div className="vehiculo-card-image">
                    {vehiculo.imagen ? (
                      <img src={vehiculo.imagen} alt={`${vehiculo.marca} ${vehiculo.modelo}`} />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}
                    <span className={`vende-status-badge ${getStatusColor(vehiculo.estado)}`}>
                      {vehiculo.estado}
                    </span>
                  </div>
                  
                  <div className="vehiculo-card-content">
                    <h3>{vehiculo.marca} {vehiculo.modelo} <span>{vehiculo.anio}</span></h3>
                    <p className="vehiculo-price">₡{Number(vehiculo.precio).toLocaleString()}</p>
                    
                    <div className="vehiculo-details">
                      <span><strong>KM:</strong> {Number(vehiculo.kilometraje).toLocaleString()}</span>
                    </div>
                    
                    <p className="vehiculo-desc">{vehiculo.descripcion}</p>
                    
                    {isAdminOrManager && usersMap[vehiculo.userId] && (
                      <div className="seller-info">
                        <h4>Datos del Cliente (Trade-in):</h4>
                        <p><User size={14} /> {usersMap[vehiculo.userId].nombre}</p>
                        <p><Mail size={14} /> {usersMap[vehiculo.userId].email || usersMap[vehiculo.userId].correo}</p>
                        <p><Phone size={14} /> {usersMap[vehiculo.userId].telefono || 'Sin teléfono'}</p>
                      </div>
                    )}
                    
                    <div className="vehiculo-actions">
                      {isAdminOrManager ? (
                        <>
                          <button className="btn-approve" onClick={() => updateStatus(vehiculo.id, 'Aprobado')}>Aceptar</button>
                          <button className="btn-reject" onClick={() => updateStatus(vehiculo.id, 'Rechazado')}>Rechazar</button>
                          <button className="btn-respond" onClick={() => handleRespond(vehiculo)}>Responder</button>
                        </>
                      ) : (
                        String(vehiculo.userId) === String(userId) && (
                          <>
                            <button className="btn-edit" onClick={() => handleEdit(vehiculo)}>Editar</button>
                            <button className="btn-delete" onClick={() => confirmDelete(vehiculo)}>Eliminar</button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default IntercambioDeAutos;
