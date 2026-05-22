import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  UserCheck, 
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';
import AdminLoader from '../../components/admin/AdminLoader';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined') return {};
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  };
  
  const currentUser = getUserFromStorage();
  const isGerente = currentUser.rol === 'gerente';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    if (user.rol?.nombre === 'gerente' && !isGerente) {
      return Swal.fire('Acceso Denegado', 'No tienes permisos para modificar a un Gerente.', 'warning');
    }

    Swal.fire({
      title: 'Editar Usuario',
      html: `
        <div class="swal-edit-form">
          <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${user.nombre}">
          <input id="swal-email" class="swal2-input" placeholder="Email" value="${user.email}">
          <input id="swal-phone" class="swal2-input" placeholder="Teléfono" value="${user.telefono || ''}">
          <input id="swal-location" class="swal2-input" placeholder="Ubicación" value="${user.ubicacion || ''}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#eab308',
      background: '#141414',
      color: '#fff',
      preConfirm: () => {
        return {
          nombre: document.getElementById('swal-name').value,
          email: document.getElementById('swal-email').value,
          telefono: document.getElementById('swal-phone').value,
          ubicacion: document.getElementById('swal-location').value,
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/users/${user.id}`, result.value);
          if (res.status === 200) {
            Swal.fire('Actualizado', 'El usuario ha sido modificado con éxito.', 'success');
            fetchUsers();
          }
        } catch (error) {
          Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
        }
      }
    });
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser.id) {
       return Swal.fire('Acción Prohibida', 'No puedes eliminar tu propia cuenta desde aquí.', 'error');
    }
    
    if (user.rol?.nombre === 'gerente' && currentUser.rol !== 'gerente') {
       return Swal.fire('Acceso Denegado', 'No tienes permisos para eliminar a un Gerente.', 'warning');
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará permanentemente al usuario ${user.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, eliminar',
      background: '#141414',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${user.id}`);
          Swal.fire('Eliminado', 'El usuario ha sido removido.', 'success');
          fetchUsers();
        } catch (error) {
          Swal.fire('Error', 'Ocurrió un fallo al intentar eliminar.', 'error');
        }
      }
    });
  };

  const handleToggleAdmin = async (user) => {
    if (!isGerente) return;
    
    const isPromoting = user.rol?.nombre !== 'admin';
    const newRole = isPromoting ? 'admin' : 'Cliente';
    const newRolId = isPromoting ? 1 : 3;
    
    const title = isPromoting ? '¡Ascenso de Rango!' : 'Cambio de Responsabilidades';
    const text = isPromoting 
      ? `Estás a punto de promover a ${user.nombre} como Administrador. Este nuevo colaborador tendrá acceso total a la gestión de SAVS.`
      : `¿Deseas retirar los permisos de Administrador a ${user.nombre}? Volverá al rango de Cliente.`;

    Swal.fire({
      title: title,
      text: text,
      icon: isPromoting ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#333',
      confirmButtonText: isPromoting ? 'Sí, ¡Promover!' : 'Sí, Quitar Rango',
      background: '#141414',
      color: '#fff',
      backdrop: `rgba(234, 179, 8, 0.1)`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/users/${user.id}`, { rolId: newRolId, rol: newRole });
          Swal.fire({
            title: isPromoting ? '¡Promovido!' : 'Actualizado',
            text: isPromoting ? `${user.nombre} ahora es parte del equipo administrativo.` : 'Permisos actualizados correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#141414',
            color: '#fff'
          });
          fetchUsers();
        } catch (error) {
          Swal.fire('Error', 'No se pudo procesar el cambio de rango.', 'error');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => 
    (u.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || u.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-mgmt-container">
      <header className="mgmt-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra las cuentas y roles del sistema.</p>
        </div>
      </header>

      <div className="mgmt-actions">
        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Ubicación</th>
              <th>Rol / Rango</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5"><AdminLoader message="Obteniendo lista de usuarios..." height="200px" /></td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id}>
                <td data-label="Usuario">
                  <div className="user-cell">
                    <div className="user-avatar-small">
                      {user.image ? <img src={user.image} alt="" /> : user.nombre.charAt(0)}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.nombre}</span>
                      <span className="user-id">ID: {user.id}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Contacto">
                  <div className="contact-cell">
                    <div className="contact-item"><Mail size={14} /> {user.email || user.correo}</div>
                    <div className="contact-item"><Phone size={14} /> {user.telefono || 'Sin tel.'}</div>
                  </div>
                </td>
                <td data-label="Ubicación">
                  <div className="location-cell">
                    <MapPin size={14} /> {user.ubicacion || 'Costa Rica'}
                  </div>
                </td>
                <td data-label="Rol / Rango">
                  <span className={`role-badge ${(user.rol?.nombre || 'cliente').toLowerCase()}`}>
                    {user.rol?.nombre === 'admin' ? <Shield size={14} /> : user.rol?.nombre === 'gerente' ? <ShieldAlert size={14} /> : <UserCheck size={14} />}
                    {user.rol?.nombre || 'Cliente'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="actions-cell">
                    {(isGerente || user.rol?.nombre !== 'gerente') && (
                      <button className="action-btn" onClick={() => handleEditUser(user)} title="Editar"><Edit3 size={18} /></button>
                    )}
                    
                    {isGerente && user.id !== currentUser.id && user.rol?.nombre !== 'gerente' && (
                      <button 
                        className={`action-btn ${user.rol?.nombre === 'admin' ? 'demote' : 'promote-shine'}`} 
                        onClick={() => handleToggleAdmin(user)}
                        title={user.rol?.nombre === 'admin' ? "Quitar Admin" : "Promover a Administrador"}
                      >
                        <UserPlus size={18} />
                      </button>
                    )}

                    {(isGerente || (user.rol?.nombre !== 'gerente' && user.id !== currentUser.id)) && (
                      <button className="action-btn delete" onClick={() => handleDeleteUser(user)} title="Eliminar"><Trash2 size={18} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
