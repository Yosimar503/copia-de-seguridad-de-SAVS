import React, { useState, useEffect } from 'react';
import './Admin.css';
import { Mail, Phone, Calendar, CheckCircle, XCircle, Clock, Send, FileText, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { requestsService } from '../../admin/services';
import AdminLoader from '../../components/admin/AdminLoader';

const darkSwal = {
  background: '#141414',
  color: '#fff',
  confirmButtonColor: '#eab308',
  cancelButtonColor: '#333'
};

const ReviewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  // Filtro de estado
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.rol || '');
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const list = await requestsService.getAll();
      const sorted = (Array.isArray(list) ? list : []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setRequests(sorted);
    } catch (error) {
      console.error(error);
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Oops...', text: 'No se pudieron cargar las solicitudes desde MySQL.' });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, newStatus, replyMsg = null) => {
    try {
      const updateData = { status: newStatus };
      if (replyMsg) updateData.reply = replyMsg;

      await requestsService.update(id, updateData);
      
      setRequests(prev => prev.map(req => req.id === id ? { ...req, ...updateData } : req));
      
      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: '¡Actualizado!',
        text: `La solicitud fue marcada como "${newStatus}".`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo actualizar en la base de datos.' });
    }
  };

  const handleAction = (request, action) => {
    if (action === 'accept') {
      Swal.fire({
        ...darkSwal,
        title: '¿Aceptar Solicitud?',
        text: 'Agrega un comentario opcional para el cliente (ej: Horario disponible):',
        input: 'textarea',
        inputPlaceholder: 'Comentario opcional...',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) updateRequestStatus(request.id, 'accepted', result.value);
      });
    } else if (action === 'reject') {
      Swal.fire({
        ...darkSwal,
        title: '¿Rechazar Solicitud?',
        text: 'Debes indicar el motivo del rechazo:',
        input: 'textarea',
        inputPlaceholder: 'Ej: Datos de contacto inválidos o fuera de horario...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) return 'El motivo de rechazo es obligatorio';
        }
      }).then((result) => {
        if (result.isConfirmed) updateRequestStatus(request.id, 'rejected', result.value);
      });
    } else if (action === 'reply') {
      Swal.fire({
        ...darkSwal,
        title: 'Responder al Cliente',
        input: 'textarea',
        inputLabel: `Enviando correo a ${request.user_email}`,
        inputPlaceholder: 'Escribe tu respuesta aquí...',
        showCancelButton: true,
        confirmButtonText: 'Enviar Respuesta',
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
            updateRequestStatus(request.id, 'replied', result.value);
            Swal.fire({
              ...darkSwal,
              icon: 'success',
              title: '¡Respuesta Enviada!',
              text: 'Se simuló el envío del correo electrónico al cliente.',
            });
          }, 1500);
        }
      });
    } else if (action === 'delete') {
      Swal.fire({
        ...darkSwal,
        title: '¿Eliminar Solicitud?',
        text: 'Esta acción es permanente y eliminará el registro de MySQL.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        confirmButtonText: 'Eliminar permanentemente',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) deleteRequest(request.id);
      });
    }
  };

  const deleteRequest = async (id) => {
    try {
      await requestsService.remove(id);
      setRequests(prev => prev.filter(req => req.id !== id));
      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Solicitud borrada exitosamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: 'No se pudo eliminar la solicitud.' });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="admin-status-badge pending"><Clock size={14}/> Pendiente</span>;
      case 'accepted': return <span className="admin-status-badge accepted"><CheckCircle size={14}/> Aceptada</span>;
      case 'rejected': return <span className="admin-status-badge rejected"><XCircle size={14}/> Rechazada</span>;
      case 'replied': return <span className="admin-status-badge replied"><Send size={14}/> Respondida</span>;
      default: return null;
    }
  };

  const formatDate = (isoString) => {
    if(!isoString) return '';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Revisión de Solicitudes</h1>
        <p className="admin-subtitle">Gestiona en tiempo real las consultas y solicitudes enviadas desde la página de contacto.</p>
      </div>
      
      <div className="filter-tabs">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pendientes</button>
        <button className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>Aceptadas</button>
        <button className={`filter-btn ${filter === 'replied' ? 'active' : ''}`} onClick={() => setFilter('replied')}>Respondidas</button>
        <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rechazadas</button>
      </div>

      <div className="requests-wall">
        {loading ? (
          <AdminLoader message="Obteniendo solicitudes de contacto..." />
        ) : filteredRequests.length === 0 ? (
          <div className="admin-placeholder">
            <Clock size={48} className="placeholder-icon" />
            <p>No hay solicitudes en esta categoría.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="request-card">
              <div className="request-card-header">
                <div>
                  <h3 className="req-name">{req.user_name}</h3>
                  <span className="req-subject"><FileText size={14} /> {req.subject}</span>
                </div>
                {getStatusBadge(req.status)}
              </div>
              
              <div className="request-card-meta">
                <span><Mail size={16} /> {req.user_email}</span>
                <span><Phone size={16} /> {req.user_phone}</span>
                <span><Calendar size={16} /> {formatDate(req.date)}</span>
              </div>
              
              <div className="request-card-body">
                <p>"{req.message}"</p>
                {req.reply && (
                  <div className="admin-reply">
                    <strong>Respuesta enviada:</strong>
                    <p>{req.reply}</p>
                  </div>
                )}
              </div>
              
              <div className="request-card-actions">
                {(req.status === 'pending' || req.status === 'replied' || req.status === 'accepted' || req.status === 'rejected') && (
                  <>
                    {req.status !== 'accepted' && (
                      <button className="btn-action check" onClick={() => handleAction(req, 'accept')}><CheckCircle size={18}/> Aceptar</button>
                    )}
                    {req.status !== 'rejected' && (
                      <button className="btn-action close" onClick={() => handleAction(req, 'reject')}><XCircle size={18}/> Rechazada</button>
                    )}
                  </>
                )}
                {(req.status !== 'rejected') && (
                  <button className="btn-action reply" onClick={() => handleAction(req, 'reply')}><Send size={18}/> Responder</button>
                )}
                {(userRole === 'gerente' || userRole === 'admin') && (req.status === 'accepted' || req.status === 'rejected' || req.status === 'replied') && (
                  <button className="btn-action delete" onClick={() => handleAction(req, 'delete')}>
                    <Trash2 size={18}/> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewRequests;
