import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { handleApiError } from '../../utils/apiError';
import './AgendarCita.css';

const TIPOS = ['Prueba de manejo', 'Mantenimiento', 'Asesoría de compra', 'Entrega de vehículo'];

const AgendarCita = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fecha: '', hora: '', tipo_servicio: TIPOS[0], notas: '' });
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/login');
      return;
    }
    loadCitas();
  }, [navigate]);

  const loadCitas = async () => {
    try {
      const res = await api.get('/appointments/mine');
      setCitas(res.data || []);
    } catch (err) {
      handleApiError('AgendarCita.load', err, { toast: false });
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    if (!form.hora) e.hora = 'Selecciona una hora';
    if (!form.tipo_servicio) e.tipo_servicio = 'Selecciona un servicio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/appointments', form);
      toast.success('Cita agendada correctamente');
      setForm({ fecha: '', hora: '', tipo_servicio: TIPOS[0], notas: '' });
      loadCitas();
    } catch (err) {
      handleApiError('AgendarCita.submit', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Cita cancelada');
      loadCitas();
    } catch (err) {
      handleApiError('AgendarCita.cancel', err);
    }
  };

  const estadoLabel = (e) => ({ pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada' }[e] || e);

  return (
    <div className="agendar-cita-page">
      <header className="agendar-header">
        <h1>Agendar cita</h1>
        <p>Selecciona fecha, hora y tipo de servicio.</p>
      </header>

      <div className="agendar-grid">
        <form className="agendar-form" onSubmit={handleSubmit}>
          <label>
            Fecha
            <input type="date" value={form.fecha} min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            {errors.fecha && <span className="field-error">{errors.fecha}</span>}
          </label>
          <label>
            Hora
            <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            {errors.hora && <span className="field-error">{errors.hora}</span>}
          </label>
          <label>
            Tipo de servicio
            <select value={form.tipo_servicio} onChange={(e) => setForm({ ...form, tipo_servicio: e.target.value })}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Notas (opcional)
            <textarea value={form.notas} rows={3} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </label>
          <button type="submit" className="btn-agendar" disabled={loading}>
            {loading ? 'Agendando...' : 'Confirmar cita'}
          </button>
        </form>

        <section className="agendar-list">
          <h2>Mis citas</h2>
          {citas.length === 0 ? (
            <p className="empty-citas">No tienes citas programadas.</p>
          ) : (
            citas.map((c) => (
              <div key={c.id} className={`cita-card estado-${c.estado}`}>
                <div>
                  <strong>{c.tipo_servicio}</strong>
                  <p>{c.fecha} — {c.hora}</p>
                  <span className="cita-estado">{estadoLabel(c.estado)}</span>
                </div>
                {c.estado !== 'cancelada' && (
                  <button type="button" onClick={() => cancelar(c.id)}>Cancelar</button>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default AgendarCita;
