import React, { useState, useEffect } from 'react';
import { Gift, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../services/api';
import { handleApiError } from '../../utils/apiError';
import toast from 'react-hot-toast';

const PerfilPuntos = () => {
  const [saldo, setSaldo] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/points/mine');
        setSaldo(res.data.saldo ?? 0);
        setHistorial(res.data.historial ?? []);
      } catch (err) {
        handleApiError('PerfilPuntos', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const canjearEjemplo = async () => {
    if (saldo < 100) {
      toast.error('Necesitas al menos 100 puntos');
      return;
    }
    try {
      const res = await api.post('/points/redeem', { cantidad: 100, descripcion: 'Descuento en mantenimiento' });
      setSaldo(res.data.saldo);
      setHistorial(res.data.historial);
      toast.success('Canje realizado');
    } catch (err) {
      handleApiError('PerfilPuntos.redeem', err);
    }
  };

  if (loading) return <p style={{ color: '#9ca3af' }}>Cargando puntos...</p>;

  return (
    <section className="puntos-section">
      <div className="puntos-saldo-card">
        <Gift size={32} color="#eab308" />
        <div>
          <span className="puntos-label">Saldo actual</span>
          <h2 className="puntos-saldo">{saldo.toLocaleString()} pts</h2>
        </div>
        <button type="button" className="btn-canjear" onClick={canjearEjemplo}>Canjear 100 pts (demo)</button>
      </div>

      <h3>Historial de movimientos</h3>
      {historial.length === 0 ? (
        <p className="empty-puntos">Sin movimientos aún.</p>
      ) : (
        <ul className="puntos-historial">
          {historial.map((h) => (
            <li key={h.id} className={`puntos-item ${h.tipo}`}>
              {h.tipo === 'ganado' ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" />}
              <div>
                <strong>{h.descripcion}</strong>
                <span>{new Date(h.fecha).toLocaleDateString()}</span>
              </div>
              <span className={`puntos-cantidad ${h.tipo}`}>
                {h.tipo === 'ganado' ? '+' : '-'}{h.cantidad}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PerfilPuntos;
