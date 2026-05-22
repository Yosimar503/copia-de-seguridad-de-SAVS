import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RefreshCw, Car, CheckCircle, XCircle, Clock, FileText, 
  Search, Filter, DollarSign, Download, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import { saleRequestsService } from '../services/saleRequestsService';
import AdminLoader from '../../components/admin/AdminLoader';
import '../../pages/admin/Admin.css';

const darkSwal = { background: '#141414', color: '#fff', confirmButtonColor: '#eab308' };

const STATUS_CONFIG = {
  'pendiente': { label: 'Pendiente', color: '#eab308', icon: Clock, bg: 'rgba(234, 179, 8, 0.1)' },
  'aprobado':  { label: 'Aprobado', color: '#10b981', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' },
  'rechazado': { label: 'Rechazado', color: '#ef4444', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' },
};

const TradeInPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState(null);
  
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await saleRequestsService.getAll();
      setRequests(data);
    } catch (e) {
      console.error(e);
      Swal.fire({ ...darkSwal, title: 'Error', text: 'No se pudieron cargar las solicitudes', icon: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        (req.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
        (req.modelo || '').toLowerCase().includes(search.toLowerCase()) ||
        (req.marca || '').toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || req.estado === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    const { value: respuesta } = await Swal.fire({
      ...darkSwal,
      title: `Marcar como ${newStatus}`,
      input: 'textarea',
      inputLabel: 'Mensaje para el cliente (opcional)',
      inputPlaceholder: 'Escriba un mensaje aquí...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (respuesta !== undefined) {
      try {
        await saleRequestsService.updateStatus(id, newStatus, respuesta);
        Swal.fire({ ...darkSwal, title: 'Actualizado', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchRequests();
        if (selectedReq?.id === id) {
          setSelectedReq(prev => ({ ...prev, estado: newStatus, respuesta_admin: respuesta }));
        }
      } catch (e) {
        Swal.fire({ ...darkSwal, title: 'Error', text: 'No se pudo actualizar', icon: 'error' });
      }
    }
  };

  const handleEstimateValue = () => {
    if (!selectedReq) return;
    const year = parseInt(selectedReq.anio, 10);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const baseValue = 15000; 
    let estimated = baseValue - (age * 1000);
    if (estimated < 2000) estimated = 2000;
    
    Swal.fire({
      ...darkSwal,
      title: 'Valuación Automática',
      html: `
        <p>Basado en el año (${year}) y modelo (${selectedReq.marca} ${selectedReq.modelo}), el valor estimado de mercado es:</p>
        <h2 style="color: #eab308">$${estimated.toLocaleString()}</h2>
        <p style="font-size: 0.85rem; color: #9ca3af">Esta es una estimación aproximada y requiere inspección física.</p>
      `,
      icon: 'info'
    });
  };

  const generateReport = () => {
    let csv = 'ID,Cliente,Email,Telefono,Marca,Modelo,Anio,Precio_Esperado,Estado\n';
    filteredRequests.forEach(r => {
      csv += `${r.id},"${r.nombre}","${r.email}","${r.telefono}","${r.marca}","${r.modelo}",${r.anio},${r.precio_esperado},${r.estado}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_tradein_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="admin-container tradein-mgmt">
      <header className="admin-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="admin-title" style={{ marginBottom: '0.5rem' }}>
              Gestión de <span className="highlight-gold">Trade-in</span>
            </h1>
            <p className="admin-subtitle">
              Evalúa vehículos, aprueba solicitudes y genera valuaciones automáticas.
            </p>
          </div>
          <button onClick={fetchRequests} className="refresh-btn">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper trade-icon"><Car size={24} /></div>
          </div>
          <div className="stat-label">Total Solicitudes</div>
          <div className="stat-number">{requests.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}><Clock size={24} /></div>
          </div>
          <div className="stat-label">Pendientes</div>
          <div className="stat-number">{requests.filter(r => r.estado === 'pendiente').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={24} /></div>
          </div>
          <div className="stat-label">Aprobados</div>
          <div className="stat-number">{requests.filter(r => r.estado === 'aprobado').length}</div>
        </div>
      </div>

      <div className="vender-auto-layout">
        {/* Lista de Solicitudes */}
        <div className="vender-auto-list-section card-base" style={{ flex: '1 1 350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
             <div className="tracking-search-bar" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
               <Search size={16} />
               <input 
                 type="text" 
                 placeholder="Buscar cliente, marca..." 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)} 
               />
             </div>
             <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ background: 'rgba(20,20,20,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 10px' }}
             >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
             </select>
             <button onClick={generateReport} className="btn-filters" title="Exportar CSV">
               <Download size={16} />
             </button>
          </div>

          {loading ? (
            <AdminLoader message="Cargando solicitudes..." />
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
              <Filter size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>No se encontraron solicitudes.</p>
            </div>
          ) : (
            <div className="inventory-list">
              {filteredRequests.map(req => {
                const StatusIcon = STATUS_CONFIG[req.estado]?.icon || Clock;
                return (
                  <div 
                    key={req.id} 
                    className={`inventory-item ${selectedReq?.id === req.id ? 'active' : ''}`}
                    style={{ cursor: 'pointer', border: selectedReq?.id === req.id ? '1px solid #eab308' : '' }}
                    onClick={() => setSelectedReq(req)}
                  >
                    {req.imagenes && req.imagenes.length > 0 ? (
                      <img src={req.imagenes[0]} alt="Auto" className="item-thumbnail" />
                    ) : (
                      <div className="item-thumbnail" style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Car size={24} color="#666" />
                      </div>
                    )}
                    <div className="item-details">
                      <h4 className="item-name">{req.marca} {req.modelo} ({req.anio})</h4>
                      <p className="item-meta" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{req.nombre}</p>
                      <span className="admin-status-badge" style={{ marginTop: '6px', background: STATUS_CONFIG[req.estado]?.bg, color: STATUS_CONFIG[req.estado]?.color, padding: '2px 8px', fontSize: '0.7rem' }}>
                        <StatusIcon size={10} /> {STATUS_CONFIG[req.estado]?.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detalle y Evaluación */}
        <div className="vender-auto-form-section card-base" style={{ flex: '2 1 500px', minHeight: '500px' }}>
          {selectedReq ? (
            <div className="tradein-detail-panel animation-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                    {selectedReq.marca} {selectedReq.modelo} <span style={{ color: '#eab308' }}>{selectedReq.anio}</span>
                  </h2>
                  <p style={{ color: '#9ca3af', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14}/> Solicitud #{selectedReq.id}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span className="admin-status-badge" style={{ background: STATUS_CONFIG[selectedReq.estado]?.bg, color: STATUS_CONFIG[selectedReq.estado]?.color, fontSize: '0.9rem', padding: '6px 14px' }}>
                      {STATUS_CONFIG[selectedReq.estado]?.label}
                   </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                 <div>
                    <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Datos del Cliente</h4>
                    <p style={{ color: '#fff', margin: '0 0 4px 0' }}><strong>Nombre:</strong> {selectedReq.nombre}</p>
                    <p style={{ color: '#fff', margin: '0 0 4px 0' }}><strong>Email:</strong> {selectedReq.email}</p>
                    <p style={{ color: '#fff', margin: '0 0 4px 0' }}><strong>Teléfono:</strong> {selectedReq.telefono}</p>
                 </div>
                 <div>
                    <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Detalles del Vehículo</h4>
                    <p style={{ color: '#fff', margin: '0 0 4px 0' }}><strong>Kilometraje:</strong> {selectedReq.kilometraje} km</p>
                    <p style={{ color: '#fff', margin: '0 0 4px 0' }}><strong>Transmisión:</strong> {selectedReq.transmision}</p>
                    <p style={{ color: '#eab308', margin: '0 0 4px 0', fontWeight: 'bold' }}><strong>Precio Esperado:</strong> ${selectedReq.precio_esperado?.toLocaleString()}</p>
                 </div>
              </div>

              {selectedReq.detalles && (
                <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Observaciones del Cliente</h4>
                  <p style={{ color: '#d1d5db', margin: 0, fontStyle: 'italic', fontSize: '0.95rem' }}>"{selectedReq.detalles}"</p>
                </div>
              )}

              {selectedReq.respuesta_admin && (
                <div style={{ marginBottom: '2rem', background: 'rgba(16,185,129,0.05)', borderLeft: '3px solid #10b981', padding: '1rem', borderRadius: '4px' }}>
                  <h4 style={{ color: '#10b981', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Respuesta Administrativa</h4>
                  <p style={{ color: '#d1d5db', margin: 0, fontSize: '0.95rem' }}>{selectedReq.respuesta_admin}</p>
                </div>
              )}

              {selectedReq.imagenes && selectedReq.imagenes.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Galería de Imágenes</h4>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                     {selectedReq.imagenes.map((img, idx) => (
                       <a key={idx} href={img} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                         <img src={img} alt={`Auto ${idx}`} style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                       </a>
                     ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleEstimateValue}
                  className="btn-action reply"
                  style={{ flex: 1, minWidth: '200px', justifyContent: 'center' }}
                >
                  <DollarSign size={16} /> Valuación Automática
                </button>
                <div style={{ display: 'flex', gap: '1rem', flex: 2, minWidth: '250px' }}>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReq.id, 'aprobado')}
                    className="btn-action check"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={selectedReq.estado === 'aprobado'}
                  >
                    <CheckCircle size={16} /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReq.id, 'rechazado')}
                    className="btn-action close"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={selectedReq.estado === 'rechazado'}
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
               <Car size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
               <p style={{ fontSize: '1.1rem' }}>Selecciona una solicitud para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeInPage;
