import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerfilUsuarios.css';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api, { vehicleService, authService } from '../../services/api';
import PerfilPuntos from './PerfilPuntos';
import PerfilSeguimiento from './PerfilSeguimiento';

import {
  Bell,
  User,
  LayoutDashboard,
  Heart,
  Search,
  Ship,
  Settings,
  BadgeCheck,
  Check,
  Clock,
  MapPin,
  Mail,
  Phone,
  Plus,
  Edit2,
  LogOut,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';

const darkSwal = {
  background: '#0a0a0a',
  color: '#fff',
  confirmButtonColor: '#eab308',
  cancelButtonColor: '#333'
};

function PerfilUsuarios() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [allVehicles, setAllVehicles] = useState([]); // Versión de catálogo completa

  const [vehicles, setVehicles] = useState([
    {
      id: 6,
      name: 'Hyundai Tucson TGDi',
      image: 'https://importadorasavs.com/wp-content/uploads/2025/03/Hyundai-Tucson-2019-Special-1.png',
      year: '2019',
      specs: '1600cc T Diésel • 50,000 km',
      isFavorite: true,
      importStatus: 3
    },
    {
      id: 9,
      name: 'Chevrolet Trax T',
      image: 'https://importadorasavs.com/wp-content/uploads/2025/03/Chevrolet-Trax-2021-1.png',
      year: '2021',
      specs: '1400cc T Gasolina • 35,000 km',
      isFavorite: false,
      importStatus: 4
    }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [userRequests, setUserRequests] = useState([]);

  const [userInfo, setUserInfo] = useState({
    id: null,
    name: '',
    role: 'Cliente',
    email: '',
    phone: '',
    location: '',
    image: ''
  });

  const handleLogout = () => {
    Swal.fire({
      ...darkSwal,
      icon: 'warning',
      title: '¿Cerrar Sesión?',
      text: 'Tendrás que ingresar tus credenciales de nuevo.',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#141414',
      color: '#fff',
      confirmButtonColor: '#e63946'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await authService.logout();
        } catch (err) {
          console.error('Error al cerrar sesión:', err);
        }
        toast('Sesión cerrada', { icon: '👋' });
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'Por favor inicia sesión primero.',
        background: '#141414',
        color: '#fff',
        confirmButtonColor: '#f5b400'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    const fetchAllUserRequests = async (user) => {
      try {
        if (!user.id && !user.email) return;

        // Buscamos todas las peticiones para filtrar manualmente por email (case-insensitive) y userId
        const [contactRes, tradeInRes] = await Promise.all([
          api.get('/requests/mine'),
          api.get('/sale_requests/mine')
        ]);

        const filteredContacts = contactRes.data || [];
        const tradeInData = tradeInRes.data || [];

        // Normalizar trade-ins
        const normalizedTradeIn = tradeInData.map(item => ({
          id: item.id,
          subject: `Trade-in: ${item.marca} ${item.modelo}`,
          message: item.descripcion || 'Sin descripción',
          status: item.estado || 'pending',
          date: item.date || new Date().toISOString(),
          reply: item.respuesta_admin || null,
          type: 'tradein'
        }));

        // Normalizar contactos
        const normalizedContacts = filteredContacts.map(item => ({
          ...item,
          type: 'contact',
          reply: item.reply || null
        }));

        const combined = [...normalizedContacts, ...normalizedTradeIn]
          .sort((a,b) => new Date(b.date) - new Date(a.date));

        setUserRequests(combined);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    const loadData = async () => {
      const user = JSON.parse(savedUser);
      setUserInfo({
        id: user.id,
        name: user.nombre || 'Usuario',
        role: user.rol || 'Cliente Premium',
        email: user.email || '',
        phone: user.telefono || '+506 0000 0000',
        location: user.ubicacion || 'San José',
        preciseAddress: user.direccion_precisa || 'Sin dirección registrada',
        image: user.image || '',
        favorites: user.favorites || [],
        tracking: user.tracking || {
          vehicleName: 'Hyundai Tucson TGDI',
          importStatus: 3,
          estimatedDate: '25 Abr 2026',
          location: 'Puerto de Moín, Limón',
          vessel: 'Maersk Line • V0924',
          statusText: 'En trámite aduanal'
        }
      });

      try {
        const response = await vehicleService.getAll();
        const allVehiclesFromDb = response.data || [];
        setAllVehicles(allVehiclesFromDb);

        const userFavoriteIds = (user.favorites || []).map(String);
        const filtered = allVehiclesFromDb
          .filter(v => userFavoriteIds.includes(String(v.id)))
          .map(v => ({
            id: v.id,
            name: v.name,
            image: v.image,
            year: v.year.toString(),
            specs: `${v.motor} • ${v.mileage}`,
            isFavorite: true,
            importStatus: 4
          }));
          
        setVehicles(filtered);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }

      // Carga inicial de peticiones
      fetchAllUserRequests(user);
    };

    loadData();

    // Polling cada 30 segundos
    const user = JSON.parse(savedUser);
    const intervalId = setInterval(() => {
      fetchAllUserRequests(user);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleUpdateTracking = () => {
    Swal.fire({
      title: 'Actualizar Seguimiento de Importación',
      html: `
        <div style="text-align: left; color: #fff; overflow: hidden;">
          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Nombre del Vehículo</label>
          <input id="track-vehicle" class="swal2-input" value="${userInfo.tracking.vehicleName}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">
          
          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Etapa de Importación</label>
          <select id="track-status" class="swal2-input" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box; background: #222; color: #fff;">
            <option value="1" ${userInfo.tracking.importStatus === 1 ? 'selected' : ''}>1. Compra Realizada</option>
            <option value="2" ${userInfo.tracking.importStatus === 2 ? 'selected' : ''}>2. En Tránsito</option>
            <option value="3" ${userInfo.tracking.importStatus === 3 ? 'selected' : ''}>3. En Aduanas</option>
            <option value="4" ${userInfo.tracking.importStatus === 4 ? 'selected' : ''}>4. Entrega Final</option>
          </select>

          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Fecha Estimada de Arribo</label>
          <input id="track-date" class="swal2-input" value="${userInfo.tracking.estimatedDate}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">

          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Ubicación Actual</label>
          <input id="track-location" class="swal2-input" value="${userInfo.tracking.location}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">

          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Barco / Naviera</label>
          <input id="track-vessel" class="swal2-input" value="${userInfo.tracking.vessel}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">

          <label style="display:block; margin-bottom: 5px; font-size: 0.8rem; color: #9ca3af;">Descripción del Estado</label>
          <select id="track-text" class="swal2-input" style="margin-top:0; margin-bottom:5px; width: 100%; box-sizing: border-box; background: #222; color: #fff;">
            <option value="Compra procesada correctamente" ${userInfo.tracking.statusText === 'Compra procesada correctamente' ? 'selected' : ''}>Compra procesada correctamente</option>
            <option value="Vehículo en tránsito marítimo" ${userInfo.tracking.statusText === 'Vehículo en tránsito marítimo' ? 'selected' : ''}>Vehículo en tránsito marítimo</option>
            <option value="En trámite aduanal" ${userInfo.tracking.statusText === 'En trámite aduanal' ? 'selected' : ''}>En trámite aduanal</option>
            <option value="Listo para entrega al cliente" ${userInfo.tracking.statusText === 'Listo para entrega al cliente' ? 'selected' : ''}>Listo para entrega al cliente</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#eab308',
      background: '#141414',
      color: '#fff',
      width: '520px',
      preConfirm: () => {
        return {
          vehicleName: document.getElementById('track-vehicle').value,
          importStatus: parseInt(document.getElementById('track-status').value),
          estimatedDate: document.getElementById('track-date').value,
          location: document.getElementById('track-location').value,
          vessel: document.getElementById('track-vessel').value,
          statusText: document.getElementById('track-text').value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.patch(`/users/${userInfo.id}`, { tracking: result.value });

          if (res.status === 200) {
            // Actualizar estado local y localStorage
            setUserInfo(prev => ({ ...prev, tracking: result.value }));
            
            // Actualizar localStorage para que persista al refrescar
            const savedUser = JSON.parse(localStorage.getItem('user'));
            savedUser.tracking = result.value;
            localStorage.setItem('user', JSON.stringify(savedUser));

            Swal.fire({
              title: '¡Actualizado!',
              text: 'La información de seguimiento se ha actualizado correctamente.',
              icon: 'success',
              confirmButtonColor: '#eab308',
              background: '#141414',
              color: '#fff'
            });
          }
        } catch (error) {
          console.error("Error updating tracking:", error);
          Swal.fire('Error', 'No se pudo actualizar la información en el servidor.', 'error');
        }
      }
    });
  };

  const handleEditProfile = () => {
    Swal.fire({
      ...darkSwal,
      title: 'Editar Perfil',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 8px;"><label style="font-size: 14px; color: #a0a0a0;">Nombre Completo</label></div>
          <input id="swal-input-name" class="swal2-input" value="${userInfo.name}" style="margin: 0; width: 90%;">
        </div>
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 8px;"><label style="font-size: 14px; color: #a0a0a0;">Teléfono</label></div>
          <input id="swal-input-phone" type="text" class="swal2-input" value="${userInfo.phone}" placeholder="Ej: +506 72617462" style="margin: 0; width: 90%;">
        </div>
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 8px;"><label style="font-size: 14px; color: #a0a0a0;">Provincia (Costa Rica)</label></div>
          <select id="swal-input-location" class="swal2-input" style="margin: 0; width: 90%; color: #fff; background: #222;">
            <option value="San José" ${userInfo.location === 'San José' ? 'selected' : ''}>San José</option>
            <option value="Alajuela" ${userInfo.location === 'Alajuela' ? 'selected' : ''}>Alajuela</option>
            <option value="Cartago" ${userInfo.location === 'Cartago' ? 'selected' : ''}>Cartago</option>
            <option value="Heredia" ${userInfo.location === 'Heredia' ? 'selected' : ''}>Heredia</option>
            <option value="Guanacaste" ${userInfo.location === 'Guanacaste' ? 'selected' : ''}>Guanacaste</option>
            <option value="Puntarenas" ${userInfo.location === 'Puntarenas' ? 'selected' : ''}>Puntarenas</option>
            <option value="Limón" ${userInfo.location === 'Limón' ? 'selected' : ''}>Limón</option>
          </select>
        </div>
        <div style="text-align: left;">
          <div style="margin-bottom: 8px;"><label style="font-size: 14px; color: #a0a0a0;">Dirección Precisa</label></div>
          <input id="swal-input-address" class="swal2-input" placeholder="Ej: 125m oeste de..." value="${userInfo.preciseAddress === 'Sin dirección registrada' ? '' : userInfo.preciseAddress}" style="margin: 0; width: 90%;">
        </div>
      `,
      background: '#141414',
      color: '#fff',
      confirmButtonColor: '#f5b400',
      confirmButtonText: 'Guardar Cambios',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value.trim();
        const phone = document.getElementById('swal-input-phone').value.trim();
        const location = document.getElementById('swal-input-location').value;
        const preciseAddress = document.getElementById('swal-input-address').value.trim();

        if (!name || !phone || !location) {
          Swal.showValidationMessage('Los campos destacados son obligatorios.');
          return false;
        }

        // Validación de nombre (mínimo 3 caracteres, solo letras y espacios)
        const regexName = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
        if (!regexName.test(name)) {
          Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres y contener solo letras.');
          return false;
        }

        // Validación de teléfono (8 a 20 caracteres, permite +, números y espacios)
        const regexPhone = /^[0-9+\s\-()]{8,20}$/;
        if (!regexPhone.test(phone)) {
          Swal.showValidationMessage('Asegúrate de incluir el código de país con un espacio, ej: +506 72617462.');
          return false;
        }

        return { name, phone, location, preciseAddress };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Operación CRUD (Update) en el servidor usando API centralizada
          await api.patch(`/users/${userInfo.id}`, {
            nombre: result.value.name,
            telefono: result.value.phone,
            ubicacion: result.value.location,
            direccion_precisa: result.value.preciseAddress
          });

          // Actualizamos estado local y sesión
          const updatedUser = { ...userInfo, ...result.value };
          setUserInfo(updatedUser);
          
          const sessionUser = JSON.parse(localStorage.getItem('user'));
          localStorage.setItem('user', JSON.stringify({
            ...sessionUser,
            nombre: result.value.name,
            telefono: result.value.phone,
            ubicacion: result.value.location,
            direccion_precisa: result.value.preciseAddress
          }));

          Swal.fire({
            ...darkSwal,
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Tus datos han sido guardados permanentemente.',
            background: '#141414',
            color: '#fff',
            confirmButtonColor: '#f5b400'
          });
        } catch (err) {
          Swal.fire({ ...darkSwal, icon: 'error', title: 'Oops...', text: err.message });
        }
      }
    });
  };
  
  const handleChangePassword = () => {
    Swal.fire({
      ...darkSwal,
      title: 'Cambiar Contraseña',
      text: 'Ingresa tu nueva contraseña (mínimo 8 caracteres):',
      input: 'password',
      inputPlaceholder: 'Nueva contraseña',
      showCancelButton: true,
      confirmButtonText: 'Actualizar Contraseña',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres.';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.patch(`/users/${userInfo.id}`, { password: result.value });

          if (res.status === 200) {
            Swal.fire({
              ...darkSwal,
              icon: 'success',
              title: '¡Éxito!',
              text: 'Tu contraseña ha sido actualizada correctamente.',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            throw new Error('No se pudo actualizar la contraseña.');
          }
        } catch (error) {
          Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: error.message });
        }
      }
    });
  };

  const handleEditAvatar = () => {
    Swal.fire({
      ...darkSwal,
      title: 'Actualizar foto de perfil',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <span style="font-size: 14px; color: #a0a0a0;">Selecciona una imagen de tus archivos, galería o cámara:</span>
        </div>
        <input type="file" id="avatar-upload" accept="image/*" class="custom-file-upload">
      `,
      showCancelButton: true,
      confirmButtonText: 'Subir Foto',
      cancelButtonText: 'Cancelar',
      background: '#141414',
      color: '#fff',
      confirmButtonColor: '#f5b400',
      preConfirm: () => {
        const file = document.getElementById('avatar-upload').files[0];
        if (!file) {
          Swal.showValidationMessage('Por favor, selecciona una imagen primero (Archivos o Cámara).');
          return false;
        }
        return file;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const newImage = e.target.result;
          setUserInfo({ ...userInfo, image: newImage });

          // Actualizar localStorage para que persista al recargar la página actual
          const sessionUser = JSON.parse(localStorage.getItem('user'));
          localStorage.setItem('user', JSON.stringify({ ...sessionUser, image: newImage }));

          // Actualizar servidor para que persista en futuros inicios de sesión
          try {
            await api.patch(`/users/${userInfo.id}`, { image: newImage });
          } catch (err) {
            console.error('Error guardando imagen en el backend', err);
          }

          Swal.fire({
            ...darkSwal,
            icon: 'success',
            title: '¡Foto Actualizada!',
            timer: 1500,
            showConfirmButton: false
          });
        };
        reader.readAsDataURL(result.value);
      }
    });
  };

  const toggleFavorite = async (vehicleId) => {
    const vidStr = String(vehicleId);
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    const user = JSON.parse(savedUser);
    let updatedFavorites = Array.isArray(user.favorites) ? user.favorites.map(String) : [];

    // Si ya está, lo quitamos. Si no, lo agregamos (aunque en el perfil normalmente solo quitamos)
    if (updatedFavorites.includes(vidStr)) {
      updatedFavorites = updatedFavorites.filter(id => id !== vidStr);
    } else {
      updatedFavorites.push(vidStr);
    }

    try {
      // Sincronizar con el servidor (CRUD - Update)
      await api.patch(`/users/${user.id}`, { favorites: updatedFavorites });

      // Actualizar sesión local
      user.favorites = updatedFavorites;
      localStorage.setItem('user', JSON.stringify(user));

      if (updatedFavorites.includes(vidStr)) {
        toast.success('Añadido a favoritos', { icon: '⭐' });
      } else {
        toast('Eliminado de favoritos');
      }

      // Actualizar estado local para que desaparezca de la vista si estamos en modo "Favoritos"
      setVehicles(vehicles.map(v => 
        String(v.id) === vidStr ? { ...v, isFavorite: !v.isFavorite } : v
      ));

      // Si quitamos el favorito y estamos en la pestaña de favoritos, forzamos refresco ocultándolo
      if (!updatedFavorites.includes(vidStr)) {
         setVehicles(prev => prev.filter(v => String(v.id) !== vidStr));
      }

    } catch (err) {
      console.error(err);
      Swal.fire({ 
        ...darkSwal,
        icon: 'error', 
        title: 'Error', 
        text: 'No se pudo actualizar el favorito.' 
      });
    }
  };

  const handleAddVehicle = () => {
    // Filtrar los vehículos que el usuario ya tiene en la colección para no mostrarlos repitiendo
    const availableVehicles = (allVehicles || []).filter(
      dbCar => !vehicles.some(myCar => String(myCar.id) === String(dbCar.id))
    );

    if (availableVehicles.length === 0) {
      Swal.fire({
        ...darkSwal,
        icon: 'info',
        title: 'Colección Completa',
        text: 'Ya tienes todos los vehículos disponibles en el catálogo.'
      });
      return;
    }

    const inputOptions = {};
    availableVehicles.forEach(car => {
      inputOptions[car.id] = `${car.name} (${car.year}) - ₡${Number(car.price || car.precio).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    });

    Swal.fire({
      ...darkSwal,
      title: 'Agregar Vehículo',
      text: 'Selecciona un vehículo del catálogo:',
      input: 'select',
      inputOptions: inputOptions,
      inputPlaceholder: 'Selecciona un vehículo...',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Seleccionar'
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedId = result.value;
        const selectedCarDb = availableVehicles.find(c => String(c.id) === String(selectedId));

        if (selectedCarDb) {
          // Guardamos en la base de datos para que persista
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            const updatedFavorites = [...(user.favorites || []), String(selectedCarDb.id)];
            
            // Sincronizar servidor
            api.patch(`/users/${user.id}`, { favorites: updatedFavorites }).then(() => {
                // Actualizar sesión local
                user.favorites = updatedFavorites;
                localStorage.setItem('user', JSON.stringify(user));
                
                const newV = {
                  id: selectedCarDb.id,
                  name: selectedCarDb.name,
                  image: selectedCarDb.image,
                  year: selectedCarDb.year.toString(),
                  specs: `${selectedCarDb.motor} • ${selectedCarDb.mileage}`,
                  isFavorite: true,
                  importStatus: 1
                };
                setVehicles([...vehicles, newV]);
                toast.success('Añadido a colección', { icon: '⭐' });

                Swal.fire({
                  ...darkSwal,
                  icon: 'success',
                  title: '¡Añadido!',
                  text: `El ${selectedCarDb.name} ha sido agregado a tu colección.`
                });
            }).catch(err => {
               console.error(err);
               Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo guardar en la base de datos.' });
            });
          }
        }
      }
    });
  };

  const displayedVehicles = activeTab === 'Favoritos' 
    ? vehicles.filter(v => v.isFavorite) 
    : vehicles;

  return (
    <div className="perfil-container">
      {/* 1. Navbar superior */}
      <nav className="perfil-navbar">
        <div className="navbar-logo">
          <span className="logo-text">DESTINY<span className="gold">VAULT</span></span>
        </div>
        <ul className="navbar-links">
          <li onClick={() => navigate('/')}>Inicio</li>
          <li onClick={() => navigate('/inventory')}>Vehículos</li>
          <li onClick={() => navigate('/contact')}>Servicios</li>
          <li className="active-link" onClick={() => setActiveTab('Dashboard')}>Perfil</li>
        </ul>
        <div className="navbar-icons">
          <button className="icon-btn"><Bell size={20} /></button>
          <button className="icon-btn active-icon"><User size={20} /></button>
        </div>
      </nav>

      <div className="perfil-body">
        {/* 2. Sidebar */}
        <aside className="perfil-sidebar">
          <div className="sidebar-profile">
            <div 
              className="profile-img-container" 
              onClick={handleEditAvatar}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
              title="Clic para cambiar foto de perfil"
            >
              {userInfo.image ? (
                <img src={userInfo.image} alt={userInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color="#a0a0a0" />
              )}
            </div>
            <h3>{userInfo.name}</h3>
            <span className="profile-role">{userInfo.role}</span>
          </div>
          <ul className="sidebar-menu">
            <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => setActiveTab('Dashboard')}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </li>
            <li className={activeTab === 'Favoritos' ? 'active' : ''} onClick={() => setActiveTab('Favoritos')}>
              <Heart size={20} fill={activeTab === 'Favoritos' ? '#f5b400' : 'none'} color={activeTab === 'Favoritos' ? '#f5b400' : 'currentColor'} />
              <span>Favoritos</span>
            </li>
            <li className={activeTab === 'Seguimiento' ? 'active' : ''} onClick={() => setActiveTab('Seguimiento')}>
              <Clock size={20} />
              <span>Seguimiento</span>
            </li>
            <li className={activeTab === 'Puntos' ? 'active' : ''} onClick={() => setActiveTab('Puntos')}>
              <BadgeCheck size={20} />
              <span>Puntos</span>
            </li>
            <li className={activeTab === 'Peticiones' ? 'active' : ''} onClick={() => setActiveTab('Peticiones')}>
              <FileText size={20} />
              <span>Estado de Peticiones</span>
            </li>
            <li className={activeTab === 'Estado' ? 'active' : ''} onClick={() => setActiveTab('Estado')}>
              <Ship size={20} />
              <span>Estado de importación</span>
            </li>
            <li className={activeTab === 'Configuración' ? 'active' : ''} onClick={() => setActiveTab('Configuración')}>
              <Settings size={20} />
              <span>Configuración</span>
            </li>
            <li className="logout-menu-item" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </li>
          </ul>
        </aside>

        {/* 3. Sección principal */}
        <main className="perfil-main">
          <header className="main-header">
            <div className="header-info">
              <h1>
                {userInfo.name}
                <BadgeCheck className="verified-badge" size={28} />
              </h1>
              <p className="subtitle">{userInfo.role} • {userInfo.location}</p>
            </div>
          </header>

          <div className="content-grid">
            <div className="left-column">
              {/* 4. Estado / actividad */}
              {(activeTab === 'Dashboard' || activeTab === 'Estado') && (
                <section className="status-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Estado de Importación: {userInfo.tracking?.vehicleName || 'Sin asignar'}</h2>
                    {(userInfo.role === 'admin' || userInfo.role === 'gerente') && (
                      <button 
                        onClick={() => handleUpdateTracking()}
                        style={{ 
                          background: 'rgba(234,179,8,0.1)', 
                          color: '#eab308', 
                          border: '1px solid #eab308', 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        <Edit2 size={16} /> Actualizar Tracking
                      </button>
                    )}
                  </div>

                  <div className="progress-container">
                    <div className={`progress-step ${userInfo.tracking?.importStatus >= 1 ? 'completed' : ''}`}>
                      <div className="step-icon"><Check size={16} /></div>
                      <span>Compra realizada</span>
                    </div>
                    <div className={`progress-line ${userInfo.tracking?.importStatus > 1 ? 'completed' : (userInfo.tracking?.importStatus === 1 ? 'active' : '')}`}></div>
                    
                    <div className={`progress-step ${userInfo.tracking?.importStatus >= 2 ? (userInfo.tracking?.importStatus === 2 ? 'active' : 'completed') : ''}`}>
                      <div className="step-icon"><Check size={16} /></div>
                      <span>En tránsito</span>
                    </div>
                    <div className={`progress-line ${userInfo.tracking?.importStatus > 2 ? 'completed' : (userInfo.tracking?.importStatus === 2 ? 'active' : '')}`}></div>
                    
                    <div className={`progress-step ${userInfo.tracking?.importStatus >= 3 ? (userInfo.tracking?.importStatus === 3 ? 'active' : 'completed') : ''}`}>
                      <div className="step-icon"><Clock size={16} /></div>
                      <span>En aduanas</span>
                    </div>
                    <div className={`progress-line ${userInfo.tracking?.importStatus > 3 ? 'completed' : (userInfo.tracking?.importStatus === 3 ? 'active' : '')}`}></div>
                    
                    <div className={`progress-step ${userInfo.tracking?.importStatus >= 4 ? 'completed active' : ''}`}>
                      <div className="step-icon"><MapPin size={16} /></div>
                      <span>Entrega final</span>
                    </div>
                  </div>

                  <div className="status-details">
                    <div className="detail-item">
                      <span className="detail-label">Fecha Estimada</span>
                      <span className="detail-value">{userInfo.tracking?.estimatedDate || 'TBD'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Ubicación</span>
                      <span className="detail-value">{userInfo.tracking?.location || 'TBD'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Vessel / Naviera</span>
                      <span className="detail-value">{userInfo.tracking?.vessel || 'TBD'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Estado</span>
                      <span className="detail-value">{userInfo.tracking?.statusText || 'Procesando...'}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. Colección de vehículos & 7. Botón adicional */}
              {(activeTab === 'Dashboard' || activeTab === 'Favoritos') && (
                <section className="vehicles-section">
                  <h2>{activeTab === 'Favoritos' ? 'Mis Favoritos' : 'Mi Colección'}</h2>
                  <div className="vehicles-grid">
                    
                    {displayedVehicles.map((vehicle) => (
                      <div className="vehicle-card" key={vehicle.id} onClick={() => setSelectedVehicle(vehicle)} style={{ cursor: 'pointer' }}>
                        <div className="card-image">
                          <img src={vehicle.image} alt={vehicle.name} referrerPolicy="no-referrer" />
                          <button 
                            className="favorite-btn" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleFavorite(vehicle.id); 
                            }}
                          >
                            <Heart size={20} fill={vehicle.isFavorite ? "#f5b400" : "rgba(0,0,0,0.5)"} color={vehicle.isFavorite ? "#f5b400" : "#fff"} />
                          </button>
                        </div>
                        <div className="card-info">
                          <h3>{vehicle.name}</h3>
                          <p className="year">{vehicle.year}</p>
                          <div className="specs">
                            <span>{vehicle.specs}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeTab === 'Dashboard' && (
                      <div className="add-vehicle-card" onClick={handleAddVehicle}>
                        <div className="add-content">
                          <div className="add-icon">
                            <Plus size={36} />
                          </div>
                          <span>Agregar vehículo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'Seguimiento' && (
                <PerfilSeguimiento userInfo={userInfo} />
              )}

              {activeTab === 'Puntos' && (
                <PerfilPuntos />
              )}

              {/* Nuevas Peticiones Tab */}
              {activeTab === 'Peticiones' && (
                <section className="requests-user-section">
                  <h2>Estado de mis Peticiones</h2>
                  {userRequests.length === 0 ? (
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', color: '#9ca3af', textAlign: 'center' }}>
                      No tienes peticiones activas. Ve a la sección de contacto para enviar una.
                    </div>
                  ) : (
                    <div className="user-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {userRequests.map(req => {
                        const isApproved = req.status === 'accepted' || req.status === 'Aprobado';
                        const isRejected = req.status === 'rejected' || req.status === 'Rechazado';
                        const isReplied = req.status === 'replied' || (req.reply && req.status === 'pending');
                        
                        let badgeText = 'Pendiente';
                        let badgeColor = '#eab308';
                        let bgBadge = 'rgba(234,179,8,0.2)';

                        if (isApproved) {
                          badgeText = 'Aprobada';
                          badgeColor = '#10b981';
                          bgBadge = 'rgba(16,185,129,0.2)';
                        } else if (isRejected) {
                          badgeText = 'Rechazada';
                          badgeColor = '#ef4444';
                          bgBadge = 'rgba(239,68,68,0.2)';
                        } else if (isReplied) {
                          badgeText = 'Respondida';
                          badgeColor = '#3b82f6';
                          bgBadge = 'rgba(59,130,246,0.2)';
                        }

                        return (
                          <div key={`${req.type}-${req.id}`} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div>
                                <span style={{ fontSize: '0.65rem', color: '#eab308', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
                                  {req.type === 'tradein' ? 'Venta de Auto (Trade-in)' : 'Consulta General'}
                                </span>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '700' }}>{req.subject}</h3>
                              </div>
                              <span style={{ 
                                padding: '6px 14px', 
                                borderRadius: '12px', 
                                fontSize: '0.75rem', 
                                fontWeight: '700',
                                backgroundColor: bgBadge,
                                color: badgeColor,
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                               }}>
                                 {badgeText}
                              </span>
                            </div>
                            
                            <p style={{ margin: '0 0 1.2rem 0', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: '1.6' }}>
                              "{req.message}"
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                                <Clock size={14} />
                                <span style={{ fontSize: '0.8rem' }}>{new Date(req.date).toLocaleDateString()}</span>
                              </div>

                              {req.reply && (
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Respuesta de Administración',
                                      text: req.reply,
                                      icon: 'info',
                                      confirmButtonText: 'Entendido',
                                      confirmButtonColor: '#eab308',
                                      background: '#141414',
                                      color: '#fff'
                                    });
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#eab308', 
                                    fontSize: '0.85rem', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(234,179,8,0.1)'
                                  }}
                                >
                                  <Send size={14} /> Ver Respuesta
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* 8. Configuración */}
              {activeTab === 'Configuración' && (
                <section className="settings-section">
                  <h2>Ajustes de la Cuenta</h2>
                  <div className="settings-grid">
                    <div className="settings-card">
                      <h3>Seguridad</h3>
                      <button className="btn-settings outline" onClick={() => Swal.fire({ ...darkSwal, title: 'Cambiar Contraseña', input: 'password', inputPlaceholder: 'Nueva contraseña' })}>Cambiar Contraseña</button>
                    </div>
                    <div className="settings-card">
                      <h3>Preferencias</h3>
                      <div className="toggle-group">
                        <label className="toggle-label">
                          <input type="checkbox" defaultChecked className="toggle-checkbox" /> Notificaciones por Email
                        </label>
                        <label className="toggle-label">
                          <input type="checkbox" defaultChecked className="toggle-checkbox" /> Alertas SMS
                        </label>
                      </div>
                      <select className="settings-select" defaultValue="cr">
                        <option value="cr">Moneda: Colones (₡)</option>
                        <option value="us">Moneda: Dólares ($)</option>
                      </select>
                    </div>
                    <div className="settings-card danger-zone">
                      <h3 className="danger-text">Zona de Peligro</h3>
                      <p className="danger-desc">Estas acciones no se pueden deshacer.</p>
                      <button className="btn-danger" onClick={handleLogout}>Cerrar Sesión</button>
                      <button className="btn-danger outline" onClick={() => Swal.fire({ ...darkSwal, icon: 'error', title: '¿Eliminar cuenta?', text: 'Se borrarán de forma permanente todos tus datos, favoritos y autos.', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#e63946' })}>Eliminar Cuenta</button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="right-column">
              {/* 5. Información del usuario */}
              <section className="user-info-section">
                <h2>Información Personal</h2>
                <div className="info-list">
                  <div className="info-item">
                    <div className="icon-wrapper">
                      <Mail className="info-icon" size={20} />
                    </div>
                    <div className="info-text">
                      <label>Email</label>
                      <p>{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="icon-wrapper">
                      <Phone className="info-icon" size={20} />
                    </div>
                    <div className="info-text">
                      <label>Teléfono</label>
                      <p>{userInfo.phone}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="icon-wrapper">
                      <MapPin className="info-icon" size={20} />
                    </div>
                    <div className="info-text">
                      <label>Ubicación</label>
                      <p>{userInfo.location}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="icon-wrapper">
                      <MapPin className="info-icon" size={20} />
                    </div>
                    <div className="info-text">
                      <label>Dirección exacta</label>
                      <p>{userInfo.preciseAddress}</p>
                    </div>
                  </div>
                </div>
                <button className="edit-profile-btn" onClick={handleEditProfile}>
                  <Edit2 size={18} />
                  <span>Editar perfil</span>
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PerfilUsuarios;
