import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';
import TradeInForm from '../../components/TradeIn/TradeInForm';
import FacebookPromo from '../../components/FacebookPromo/FacebookPromo';
import { handleApiError } from '../../utils/apiError';
import '../../components/IntercambioDeAutos/IntercambioDeAutos.css';

const VenderAutoPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) {
      Swal.fire({ icon: 'warning', title: 'Acceso denegado', text: 'Inicia sesión para vender tu auto.' })
        .then(() => navigate('/login'));
      return;
    }
    const user = JSON.parse(saved);
    setUserId(user.id);
    loadMine(user.id);
  }, [navigate]);

  const loadMine = async (uid) => {
    setLoading(true);
    try {
      const res = await api.get('/sale_requests/mine');
      setVehiculos(res.data || []);
    } catch (err) {
      handleApiError('VenderAutoPage.load', err, { toast: false });
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (estado) => {
    const map = {
      Pendiente: 'status-pendiente',
      'En revisión': 'status-revision',
      Aprobado: 'status-aprobado',
      Rechazado: 'status-rechazado'
    };
    return map[estado] || 'status-pendiente';
  };

  return (
    <div className="vender-auto-container">
      <div className="vender-auto-header">
        <h1>Vender tu Auto (Trade-in)</h1>
        <p>Registra tu vehículo actual y úsalo como parte de pago en tu próxima compra.</p>
      </div>

      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <FacebookPromo type="banner" reverse={false} />
      </div>

      <div className="vender-auto-layout">
        <div className="vender-auto-form-section">
          <div className="form-card-glow">
            <h2>{isEditing ? 'Editar solicitud' : 'Solicitar evaluación'}</h2>
            {userId && (
              <TradeInForm
                userId={userId}
                isEditing={isEditing}
                editData={editData}
                onCancelEdit={() => { setIsEditing(false); setEditData(null); }}
                onSuccess={() => { setIsEditing(false); setEditData(null); loadMine(userId); }}
              />
            )}
          </div>
        </div>

        <div className="vender-auto-list-section">
          <h2>Mis solicitudes ({vehiculos.length})</h2>
          {loading && vehiculos.length === 0 ? (
            <div className="loading-req">Cargando...</div>
          ) : vehiculos.length === 0 ? (
            <div className="empty-state">
              <p>No tienes solicitudes de trade-in.</p>
            </div>
          ) : (
            <div className="vehiculos-list">
              {vehiculos.map((v) => (
                <div key={v.id} className="vehiculo-card">
                  <div className="vehiculo-card-image">
                    {v.imagen ? <img src={v.imagen} alt={v.marca} /> : <div className="no-image">Sin imagen</div>}
                    <span className={`vende-status-badge ${getStatusClass(v.estado)}`}>{v.estado}</span>
                  </div>
                  <div className="vehiculo-card-content">
                    <h3>{v.marca} {v.modelo} <span>{v.anio}</span></h3>
                    <p className="vehiculo-price">₡{Number(v.precio).toLocaleString()}</p>
                    <p className="vehiculo-desc">{v.descripcion}</p>
                    <button type="button" className="btn-edit" onClick={() => { setIsEditing(true); setEditData(v); }}>Editar</button>
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

export default VenderAutoPage;
