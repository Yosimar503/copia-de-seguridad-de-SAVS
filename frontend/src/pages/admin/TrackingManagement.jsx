import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ship, Search, Edit3, Check, Clock, MapPin, User, Package,
  ArrowRight, RefreshCw, ChevronDown, ChevronUp, Mail,
  AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft,
  ChevronRight as ChevronRightIcon, Filter, X, Calendar,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { usersService } from '../../admin/services';
import AdminLoader from '../../components/admin/AdminLoader';
import TrackingTimeline from '../../admin/components/TrackingTimeline/TrackingTimeline';
import './Admin.css';


/* ─── Constantes ─── */
const STAGES = [
  { step: 1, label: 'Compra Realizada', icon: Check,   color: '#10b981' },
  { step: 2, label: 'En Tránsito',      icon: Ship,    color: '#3b82f6' },
  { step: 3, label: 'En Aduanas',       icon: Clock,   color: '#eab308' },
  { step: 4, label: 'Entrega Final',    icon: MapPin,  color: '#a855f7' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/* ─── Utilidades ─── */
const stageBadge = (step) => {
  const s = STAGES.find(x => x.step === step);
  if (!s) return <span className="stage-badge stage-0">Sin asignar</span>;
  return (
    <span className={`stage-badge stage-${step}`}>
      <s.icon size={12} /> {s.label}
    </span>
  );
};

const SortIcon = ({ field, sortKey, dir }) => {
  if (sortKey !== field) return <ArrowUpDown size={14} className="sort-icon-neutral" />;
  return dir === 'asc'
    ? <ArrowUp size={14} className="sort-icon-active" />
    : <ArrowDown size={14} className="sort-icon-active" />;
};

/* ─── Barra de progreso mini ─── */
const MiniProgress = ({ step }) => (
  <div className="mini-progress-container">
    {STAGES.map((s, i) => (
      <React.Fragment key={s.step}>
        <div
          className={`progress-step-icon ${step >= s.step ? 'active' : ''}`}
          style={{ '--step-color': s.color }}
        >
          <s.icon size={13} color={step >= s.step ? '#fff' : '#555'} />
        </div>
        {i < STAGES.length - 1 && (
          <div
            className={`progress-step-line ${step > s.step ? 'active' : ''}`}
            style={{ '--step-color': s.color }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════ */
const TrackingManagement = () => {
  /* ── Estado de datos ── */
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  /* ── Filtros y búsqueda ── */
  const [search,      setSearch]      = useState('');
  const [stageFilter, setStageFilter] = useState(0);       // 0 = todos
  const [hasTracking, setHasTracking] = useState('all');   // all | yes | no
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [showFilters, setShowFilters] = useState(false);

  /* ── Ordenamiento ── */
  const [sortKey, setSortKey] = useState('nombre');
  const [sortDir, setSortDir] = useState('asc');

  /* ── Paginación ── */
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ─── Fetch ─── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.getTrackingList();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ─── Reset de página al cambiar filtros ─── */
  useEffect(() => { setPage(1); }, [search, stageFilter, hasTracking, dateFrom, dateTo, sortKey, sortDir]);

  /* ─── Filtrado y ordenamiento (memoizado) ─── */
  const filtered = useMemo(() => {
    let list = [...users];

    // Búsqueda en tiempo real
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.email  || '').toLowerCase().includes(q) ||
        (u.tracking?.vehicleName || '').toLowerCase().includes(q)
      );
    }

    // Filtro por etapa
    if (stageFilter !== 0) {
      list = list.filter(u => u.tracking?.importStatus === stageFilter);
    }

    // Filtro tiene tracking
    if (hasTracking === 'yes') list = list.filter(u => !!u.tracking?.vehicleName);
    if (hasTracking === 'no')  list = list.filter(u => !u.tracking?.vehicleName);

    // Filtro por fecha estimada (si existe)
    if (dateFrom) {
      list = list.filter(u => {
        const d = u.tracking?.estimatedDate;
        return d && new Date(d) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      list = list.filter(u => {
        const d = u.tracking?.estimatedDate;
        return d && new Date(d) <= new Date(dateTo);
      });
    }

    // Ordenamiento por columna
    list.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case 'nombre':
          va = (a.nombre || '').toLowerCase();
          vb = (b.nombre || '').toLowerCase();
          break;
        case 'email':
          va = (a.email || '').toLowerCase();
          vb = (b.email || '').toLowerCase();
          break;
        case 'vehiculo':
          va = (a.tracking?.vehicleName || '').toLowerCase();
          vb = (b.tracking?.vehicleName || '').toLowerCase();
          break;
        case 'etapa':
          va = a.tracking?.importStatus || 0;
          vb = b.tracking?.importStatus || 0;
          break;
        default:
          va = ''; vb = '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 :  1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

    return list;
  }, [users, search, stageFilter, hasTracking, dateFrom, dateTo, sortKey, sortDir]);

  /* ─── Paginación ─── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  /* ─── KPIs ─── */
  const withTracking    = users.filter(u => u.tracking?.vehicleName).length;
  const withoutTracking = users.length - withTracking;
  const inCustoms       = users.filter(u => u.tracking?.importStatus === 3).length;

  /* ─── Modal de edición (SweetAlert2) ─── */
  const handleEditTracking = (user) => {
    const t = user.tracking || {};
    Swal.fire({
      title: `Tracking: ${user.nombre}`,
      html: `
        <div style="text-align:left;color:#fff;overflow:hidden;">
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
            placeholder="Ej: 2026-06-15"
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
        vehicleName:   document.getElementById('t-vehicle').value.trim(),
        importStatus:  parseInt(document.getElementById('t-status').value),
        estimatedDate: document.getElementById('t-date').value.trim(),
        location:      document.getElementById('t-location').value.trim(),
        vessel:        document.getElementById('t-vessel').value.trim(),
        statusText:    document.getElementById('t-text').value,
      }),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await usersService.updateTracking(user.id, result.value);
        Swal.fire({
          icon: 'success', title: '¡Actualizado!',
          text: `El tracking de ${user.nombre} fue guardado correctamente.`,
          confirmButtonColor: '#eab308', background: '#141414',
          color: '#fff', timer: 2000, showConfirmButton: false,
        });
        fetchUsers();
        setExpanded(null);
      } catch {
        Swal.fire('Error', 'No se pudo guardar en el servidor.', 'error');
      }
    });
  };

  const clearFilters = () => {
    setSearch(''); setStageFilter(0); setHasTracking('all');
    setDateFrom(''); setDateTo(''); setSortKey('nombre'); setSortDir('asc');
  };

  const activeFiltersCount = [
    stageFilter !== 0, hasTracking !== 'all', !!dateFrom, !!dateTo
  ].filter(Boolean).length;

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div className="admin-container tracking-mgmt">

      {/* ── Header ── */}
      <header className="tracking-header">
        <div className="tracking-title-row">
          <div className="tracking-icon-wrapper"><Ship size={28} /></div>
          <div>
            <h1 className="admin-title">
              Tracking de <span className="highlight-gold">Importaciones</span>
            </h1>
            <p className="admin-subtitle">
              Gestiona y actualiza el estado del proceso de importación de cada cliente.
            </p>
          </div>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div className="tracking-kpis-grid">
        {[
          { label: 'Total Clientes',        value: users.length,   icon: User,        color: '#3b82f6' },
          { label: 'Con Tracking Activo',   value: withTracking,   icon: Ship,        color: '#10b981' },
          { label: 'Sin Tracking Asignado', value: withoutTracking, icon: AlertCircle, color: '#ef4444' },
          { label: 'En Aduanas',            value: inCustoms,       icon: Clock,       color: '#eab308' },
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

      {/* ── Barra de búsqueda + controles ── */}
      <div className="tracking-toolbar">
        <div className="tracking-search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o vehículo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tracking-toolbar-right">
          {/* Botón filtros avanzados */}
          <button
            className={`btn-filters ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <Filter size={15} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          {/* Selector tamaño de página */}
          <div className="page-size-selector">
            <span>Mostrar</span>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button onClick={fetchUsers} className="refresh-btn">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Panel de filtros avanzados ── */}
      {showFilters && (
        <div className="tracking-advanced-filters">
          {/* Filtro por etapa */}
          <div className="filter-group">
            <label>Etapa</label>
            <div className="tracking-stage-filters">
              {[{ step: 0, label: 'Todos' }, ...STAGES].map(f => (
                <button
                  key={f.step}
                  onClick={() => setStageFilter(f.step)}
                  className={`stage-filter-btn ${stageFilter === f.step ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro tiene tracking */}
          <div className="filter-group">
            <label>Estado de Tracking</label>
            <div className="tracking-stage-filters">
              {[['all','Todos'],['yes','Con Tracking'],['no','Sin Tracking']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setHasTracking(v)}
                  className={`stage-filter-btn ${hasTracking === v ? 'active' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por rango de fechas */}
          <div className="filter-group filter-dates">
            <label><Calendar size={14} /> Fecha estimada</label>
            <div className="date-range-row">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="date-input"
                placeholder="Desde"
              />
              <span>—</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="date-input"
                placeholder="Hasta"
              />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Resultados info ── */}
      <div className="tracking-results-info">
        <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        {activeFiltersCount > 0 && (
          <span className="filter-active-tag">Filtros activos</span>
        )}
      </div>

      {/* ── Tabla / Lista con cabeceras ordenables ── */}
      {loading ? (
        <AdminLoader message="Obteniendo estados de importación..." />
      ) : filtered.length === 0 ? (
        <div className="tracking-placeholder empty">
          <AlertCircle size={40} />
          <p>No se encontraron clientes con esos criterios.</p>
          <button className="btn-clear-filters" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          {/* Cabeceras de ordenamiento */}
          <div className="tracking-table-header">
            {[
              { key: 'nombre',   label: 'Cliente' },
              { key: 'email',    label: 'Email' },
              { key: 'vehiculo', label: 'Vehículo' },
              { key: 'etapa',    label: 'Etapa' },
            ].map(col => (
              <button
                key={col.key}
                className={`sort-col-btn ${sortKey === col.key ? 'sorted' : ''}`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                <SortIcon field={col.key} sortKey={sortKey} dir={sortDir} />
              </button>
            ))}
            <span className="sort-col-btn actions-col">Acciones</span>
          </div>

          {/* Lista de tarjetas */}
          <div className="tracking-list">
            {paginated.map(user => {
              const t        = user.tracking || {};
              const hasTrack = !!t.vehicleName;
              const isOpen   = expanded === user.id;

              return (
                <div key={user.id} className={`tracking-user-card ${isOpen ? 'expanded' : ''}`}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : user.id)}
                    className="tracking-card-header"
                  >
                    <div className="tracking-chevron">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    <div className="tracking-card-header-top">
                      <div className="tracking-avatar">
                        {user.image
                          ? <img src={user.image} alt="" />
                          : (user.nombre?.charAt(0) || 'U')}
                      </div>
                      <div className="tracking-user-info">
                        <div className="user-name-text">{user.nombre}</div>
                        <div className="user-email-text">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
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
                        <span className="no-tracking-text">Sin tracking asignado</span>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="tracking-expanded-panel">
                      {hasTrack ? (
                        <>
                          <div className="tracking-progress-section">
                            <TrackingTimeline tracking={t} />
                          </div>

                          <div className="tracking-details-grid">
                            {[
                              { label: 'Fecha Estimada',  value: t.estimatedDate || 'N/A' },
                              { label: 'Ubicación',       value: t.location      || 'N/A' },
                              { label: 'Barco / Naviera', value: t.vessel        || 'N/A' },
                              { label: 'Estado',          value: t.statusText    || 'N/A' },
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

          {/* ── Paginación ── */}
          {totalPages > 1 && (
            <div className="tracking-pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === '…'
                    ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                    : (
                      <button
                        key={n}
                        className={`page-btn ${page === n ? 'active' : ''}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    )
                )
              }

              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRightIcon size={16} />
              </button>

              <span className="page-info">
                Página {page} de {totalPages} · {filtered.length} registros
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackingManagement;
