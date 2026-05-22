import React, { useState, useEffect } from 'react';
import {
  Ship,
  Search,
  Edit3,
  Check,
  Clock,
  MapPin,
  User,
  Package,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';
import AdminLoader from '../../components/admin/AdminLoader';

const API_URL = '/users';

const STAGES = [
  { step: 1, label: 'Compra Realizada',    icon: Check,   color: '#10b981', statusText: 'Compra procesada correctamente' },
  { step: 2, label: 'En Tránsito',         icon: Ship,    color: '#3b82f6', statusText: 'Vehículo en tránsito marítimo' },
  { step: 3, label: 'En Aduanas',          icon: Clock,   color: '#eab308', statusText: 'En trámite aduanal' },
  { step: 4, label: 'Entrega Final',       icon: MapPin,  color: '#a855f7', statusText: 'Listo para entrega al cliente' },
];

const stageBadge = (step) => {
  const s = STAGES.find(x => x.step === step);
  if (!s) return null;
  return (
    <span className={`stage-badge stage-${step}`}>
      <s.icon size={13} /> {s.label}
    </span>
  );
};

const TrackingManagement = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [stageFilter, setStageFilter] = useState(0); // 0 = todos

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await api.get(API_URL);
      const data = res.data;
      // Solo clientes que tengan tracking definido
      setUsers(data.filter(u => u.rol === 'Cliente' || u.tracking));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ─── Modal de edición ─── */
  const handleEditTracking = (user) => {
    const t = user.tracking || {};
    Swal.fire({
      title: `Tracking: ${user.nombre}`,
      html: `
        <div style="text-align:left; color:#fff; overflow:hidden;">
          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Nombre del Vehículo</label>
          <input id="t-vehicle" class="swal2-input" value="${t.vehicleName || ''}"
            style="margin-top:0;margin-bottom:14px;width:100%;box-sizing:border-box;">

          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Etapa de Importación</label>
          <select id="t-status" class="swal2-input"
            style="margin-top:0;margin-bottom:14px;width:100%;box-sizing:border-box;background:#222;color:#fff;">
            <option value="1" ${t.importStatus===1?'selected':''}>1. Compra Realizada</option>
            <option value="2" ${t.importStatus===2?'selected':''}>2. En Tránsito</option>
            <option value="3" ${t.importStatus===3?'selected':''}>3. En Aduanas</option>
            <option value="4" ${t.importStatus===4?'selected':''}>4. Entrega Final</option>
          </select>

          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Fecha Estimada de Arribo</label>
          <input id="t-date" class="swal2-input" value="${t.estimatedDate || ''}"
            placeholder="Ej: 25 Abr 2026"
            style="margin-top:0;margin-bottom:14px;width:100%;box-sizing:border-box;">

          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Ubicación Actual</label>
          <input id="t-location" class="swal2-input" value="${t.location || ''}"
            placeholder="Ej: Puerto de Moín, Limón"
            style="margin-top:0;margin-bottom:14px;width:100%;box-sizing:border-box;">

          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Barco / Naviera</label>
          <input id="t-vessel" class="swal2-input" value="${t.vessel || ''}"
            placeholder="Ej: Maersk Line · V0924"
            style="margin-top:0;margin-bottom:14px;width:100%;box-sizing:border-box;">

          <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#9ca3af;">Descripción del Estado</label>
          <select id="t-text" class="swal2-input"
            style="margin-top:0;margin-bottom:4px;width:100%;box-sizing:border-box;background:#222;color:#fff;">
            <option value="Compra procesada correctamente"  ${t.statusText==='Compra procesada correctamente'?'selected':''}>Compra procesada correctamente</option>
            <option value="Vehículo en tránsito marítimo"  ${t.statusText==='Vehículo en tránsito marítimo'?'selected':''}>Vehículo en tránsito marítimo</option>
            <option value="En trámite aduanal"             ${t.statusText==='En trámite aduanal'?'selected':''}>En trámite aduanal</option>
            <option value="Listo para entrega al cliente"  ${t.statusText==='Listo para entrega al cliente'?'selected':''}>Listo para entrega al cliente</option>
          </select>
        </div>
      `,
      showCancelButton:   true,
      confirmButtonText:  'Guardar',
      cancelButtonText:   'Cancelar',
      confirmButtonColor: '#eab308',
      background: '#141414',
      color: '#fff',
      width: '540px',
      preConfirm: () => ({
        vehicleName:  document.getElementById('t-vehicle').value.trim(),
        importStatus: parseInt(document.getElementById('t-status').value),
        estimatedDate: document.getElementById('t-date').value.trim(),
        location:     document.getElementById('t-location').value.trim(),
        vessel:       document.getElementById('t-vessel').value.trim(),
        statusText:   document.getElementById('t-text').value,
      })
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.patch(`${API_URL}/${user.id}`, { tracking: result.value });
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El tracking de ${user.nombre} fue guardado correctamente.`,
          confirmButtonColor: '#eab308',
          background: '#141414',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
        setExpanded(null);
      } catch {
        Swal.fire('Error', 'No se pudo guardar en el servidor.', 'error');
      }
    });
  };

  /* ─── Filtrado ─── */
  const filtered = users.filter(u => {
    const matchSearch = (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
                        (u.email  || '').toLowerCase().includes(search.toLowerCase());
    const matchStage  = stageFilter === 0 || (u.tracking?.importStatus === stageFilter);
    return matchSearch && matchStage;
  });

  const clientsWithTracking    = users.filter(u => u.tracking?.vehicleName).length;
  const clientsWithoutTracking = users.length - clientsWithTracking;

  /* ─── Mini progress bar ─── */
  const MiniProgress = ({ step }) => (
    <div className="mini-progress-container">
      {STAGES.map((s, i) => (
        <React.Fragment key={s.step}>
          <div className={`progress-step-icon ${step >= s.step ? 'active' : ''}`} 
               style={{ '--step-color': s.color }}>
            <s.icon size={13} color={step >= s.step ? '#fff' : '#555'} />
          </div>
          {i < STAGES.length - 1 && (
            <div className={`progress-step-line ${step > s.step ? 'active' : ''}`}
                 style={{ '--step-color': s.color }}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="admin-container tracking-mgmt">

      {/* ── Header ── */}
      <header className="tracking-header">
        <div className="tracking-title-row">
          <div className="tracking-icon-wrapper">
            <Ship size={28} />
          </div>
          <h1 className="admin-title">
            Tracking de <span className="highlight-gold">Importaciones</span>
          </h1>
        </div>
        <p className="admin-subtitle">
          Gestiona y actualiza el estado del proceso de importación de cada cliente.
        </p>
      </header>

      {/* ── KPIs ── */}
      <div className="tracking-kpis-grid">
        {[
          { label: 'Total Clientes',       value: users.length,             icon: User,    color: '#3b82f6' },
          { label: 'Con Tracking Activo',  value: clientsWithTracking,      icon: Ship,    color: '#10b981' },
          { label: 'Sin Tracking Asignado',value: clientsWithoutTracking,   icon: AlertCircle, color: '#ef4444' },
          { label: 'En Aduanas',           value: users.filter(u=>u.tracking?.importStatus===3).length, icon: Clock, color: '#eab308' },
        ].map(k => (
          <div key={k.label} className="tracking-kpi-card">
            <div className="kpi-icon" style={{ '--kpi-color': k.color }}>
              <k.icon size={22} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Búsqueda + filtros ── */}
      <div className="tracking-filters-row">
        <div className="tracking-search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tracking-stage-filters">
          {[{ step: 0, label: 'Todos' }, ...STAGES.map(s => ({ step: s.step, label: s.label }))].map(f => (
            <button key={f.step} onClick={() => setStageFilter(f.step)} className={`stage-filter-btn ${stageFilter === f.step ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
          <button onClick={fetchUsers} className="refresh-btn">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Lista de clientes ── */}
      {loading ? (
        <AdminLoader message="Obteniendo estados de importación..." />
      ) : filtered.length === 0 ? (
        <div className="tracking-placeholder empty">
          <AlertCircle size={40} />
          <p>No se encontraron clientes con esos criterios.</p>
        </div>
      ) : (
        <div className="tracking-list">
          {filtered.map(user => {
            const t        = user.tracking || {};
            const hasTrack = !!t.vehicleName;
            const isOpen   = expanded === user.id;

            return (
              <div key={user.id} className={`tracking-user-card ${isOpen ? 'expanded' : ''}`}>

                {/* ── Fila principal ── */}
                <div
                  onClick={() => setExpanded(isOpen ? null : user.id)}
                  className="tracking-card-header"
                >
                  {/* Avatar */}
                  <div className="tracking-avatar">
                    {user.image
                      ? <img src={user.image} alt="" />
                      : (user.nombre?.charAt(0) || 'U')}
                  </div>

                  {/* Info */}
                  <div className="tracking-user-info">
                    <div className="user-name-text">{user.nombre}</div>
                    <div className="user-email-text">
                      <Mail size={12} /> {user.email}
                    </div>
                  </div>

                  {/* Vehículo */}
                  <div className="tracking-vehicle-summary">
                    {hasTrack ? (
                      <>
                        <div className="vehicle-name-display">
                          <Package size={13} className="icon-gold" />
                          {t.vehicleName}
                        </div>
                        <div className="badge-wrapper">{stageBadge(t.importStatus)}</div>
                      </>
                    ) : (
                      <span className="no-tracking-text">Sin tracking</span>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="tracking-chevron">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* ── Panel expandido ── */}
                {isOpen && (
                  <div className="tracking-expanded-panel">
                    {hasTrack ? (
                      <>
                        {/* Progress */}
                        <div className="tracking-progress-section">
                          <div className="progress-label">
                            Progreso de importación
                          </div>
                          <MiniProgress step={t.importStatus || 0} />
                        </div>

                        {/* Detalles en grid */}
                        <div className="tracking-details-grid">
                          {[
                            { label: 'Fecha Estimada',  value: t.estimatedDate || 'N/A' },
                            { label: 'Ubicación',       value: t.location || 'N/A' },
                            { label: 'Barco / Naviera', value: t.vessel || 'N/A' },
                            { label: 'Estado',          value: t.statusText || 'N/A' },
                          ].map(d => (
                            <div key={d.label} className="detail-item-box">
                              <div className="detail-label">{d.label}</div>
                              <div className="detail-value">{d.value}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-tracking-msg">
                        Este cliente aún no tiene información de importación asignada.
                      </div>
                    )}

                    {/* Botón de editar */}
                    <button
                      onClick={() => handleEditTracking(user)}
                      className="btn-update-tracking"
                    >
                      <Edit3 size={16} />
                      {hasTrack ? 'Actualizar Tracking' : 'Asignar Tracking'}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackingManagement;
