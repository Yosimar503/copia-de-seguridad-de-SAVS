import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Loader } from 'lucide-react';
import api from '../../services/api';
import { handleApiError } from '../../utils/apiError';

const mapEstado = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('aproba')) return { key: 'completado', label: 'Completado', icon: CheckCircle, color: '#10b981' };
  if (e.includes('rechaz')) return { key: 'completado', label: 'Rechazado', icon: CheckCircle, color: '#ef4444' };
  if (e.includes('revis')) return { key: 'proceso', label: 'En proceso', icon: Loader, color: '#3b82f6' };
  return { key: 'pendiente', label: 'Pendiente', icon: Clock, color: '#eab308' };
};

const PerfilSeguimiento = ({ userInfo }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, tradeRes] = await Promise.all([
          api.get('/requests/mine'),
          api.get('/sale_requests/mine')
        ]);
        const contacts = (reqRes.data || []).map((r) => ({
          id: `c-${r.id}`,
          titulo: r.subject || 'Consulta',
          detalle: r.message,
          estado: r.status,
          fecha: r.date || r.createdAt,
          tipo: 'contacto'
        }));
        const trades = (tradeRes.data || []).map((t) => ({
          id: `t-${t.id}`,
          titulo: `Trade-in: ${t.marca} ${t.modelo}`,
          detalle: t.descripcion,
          estado: t.estado,
          fecha: t.createdAt,
          tipo: 'trade-in'
        }));
        setItems([...trades, ...contacts].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      } catch (err) {
        handleApiError('PerfilSeguimiento', err, { toast: false });
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="seguimiento-section">
      <h2>Seguimiento de solicitudes</h2>
      {userInfo?.tracking && (
        <div className="import-tracking-mini">
          <p><strong>Importación:</strong> {userInfo.tracking.vehicleName || '—'} — {userInfo.tracking.statusText}</p>
        </div>
      )}
      {loading ? (
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="empty-seguimiento">No tienes solicitudes activas.</div>
      ) : (
        <div className="seguimiento-list">
          {items.map((item) => {
            const st = mapEstado(item.estado);
            const Icon = st.icon;
            return (
              <div key={item.id} className={`seguimiento-card ${st.key}`}>
                <Icon size={20} color={st.color} />
                <div className="seguimiento-body">
                  <span className="seguimiento-tipo">{item.tipo}</span>
                  <h4>{item.titulo}</h4>
                  <p>{item.detalle}</p>
                  <span className="seguimiento-estado" style={{ color: st.color }}>{st.label}</span>
                </div>
                <time>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '—'}</time>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PerfilSeguimiento;
