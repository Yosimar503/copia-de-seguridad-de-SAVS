import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import AdminLoader from '../../components/admin/AdminLoader';
import { useDashboardStats } from '../../admin/hooks/useDashboardStats';
import { getStoredAdminUser } from '../../admin/utils/auth';
import { 
  ShieldCheck, 
  Car, 
  Users, 
  ClipboardList, 
  Star,
  Activity,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Search,
  PieChart as PieIcon,
  BarChart as BarIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import './Admin.css';

const COLORS = ['#eab308', '#3b82f6', '#10b981', '#ef4444', '#a855f7', '#6366f1'];

const AdminDashboard = () => {
  const user = getStoredAdminUser();
  const {
    stats,
    dataSets,
    tradeInList,
    vehicleList,
    loading,
    refetch,
    deleteVehicle: removeVehicle,
    updateTradeInStatus: patchTradeIn,
  } = useDashboardStats();

  const deleteVehicle = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: `¿Estás seguro de borrar "${name}" de forma permanente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#141414',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await removeVehicle(id);
        Swal.fire({
          title: '¡Eliminado!',
          icon: 'success',
          background: '#141414',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const updateTradeInStatus = async (id, newStatus, message = '') => {
    try {
      await patchTradeIn(id, newStatus, message);
      Swal.fire({
        icon: 'success',
        title: 'Sistema Actualizado',
        text: `La solicitud ha sido marcada como ${newStatus}.`,
        background: '#141414',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading && stats.vehicles === 0) {
    return <AdminLoader message="Sincronizando con el servidor central..." />;
  }

  return (
    <div className="admin-dashboard-overview">
      <div className="admin-header">
        <h1 className="admin-title">Panel de Control <ShieldCheck size={36} className="admin-icon-title" /></h1>
        <p className="admin-subtitle">Bienvenido, {user.nombre}. Gestiona el inventario y usuarios de SAVS.</p>
      </div>
      
      <div className="dashboard-stats-grid">
        
        {/* Card: Vehículos */}
        <div className="stat-card stat-vehicles">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper fuel-icon">
              <Car size={24} />
            </div>
            <ArrowUpRight size={16} className="stat-arrow" />
          </div>
          <h3 className="stat-label">Inventario Total</h3>
          <div className="stat-value-container">
            <span className="stat-number">{loading ? '...' : stats.vehicles}</span>
            <span className="stat-unit">Unidades</span>
          </div>
        </div>

        {/* Card: Usuarios */}
        <div className="stat-card stat-users">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper users-icon">
              <Users size={24} />
            </div>
          </div>
          <h3 className="stat-label">Usuarios Registrados</h3>
          <span className="stat-number">{loading ? '...' : stats.users}</span>
        </div>

        {/* Card: Solicitudes */}
        <div className="stat-card stat-requests">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper req-icon">
              <ClipboardList size={24} />
            </div>
          </div>
          <h3 className="stat-label">Solicitudes Pendientes</h3>
          <span className="stat-number">{loading ? '...' : stats.requests}</span>
        </div>

        {/* Card: Trade-in */}
        <div className="stat-card stat-tradein">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper trade-icon">
              <RefreshCw size={24} />
            </div>
          </div>
          <h3 className="stat-label">Trade-in (Auto Pago)</h3>
          <span className="stat-number">{loading ? '...' : stats.tradeIn}</span>
        </div>
      </div>

      {!loading && (
        <div className="charts-grid">
            
            {/* Gráfico 1: Distribución de Combustible */}
            <div className="chart-card">
              <h3 className="chart-label">
                 <PieIcon size={18} /> Tipos de Combustible
              </h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataSets.fuelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataSets.fuelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#000', border: '1px solid #333', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Solicitudes por Estado */}
            <div className="chart-card">
              <h3 className="chart-label">
                 <BarIcon size={18} /> Gestión de Solicitudes
              </h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataSets.reqData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#000', border: '1px solid #333', color: '#fff' }} />
                    <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                      {dataSets.reqData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Inventario por Año */}
            <div className="chart-card">
              <h3 className="chart-label">
                 <TrendingUp size={18} /> Tendencia de Inventario (Año)
              </h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataSets.yearData}>
                    <defs>
                      <linearGradient id="colorYear" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#000', border: '1px solid #333', color: '#fff' }} />
                    <Area type="monotone" dataKey="cantidad" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorYear)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 4: Transmisión */}
            <div className="chart-card">
              <h3 className="chart-label">
                 <PieIcon size={18} /> Tipos de Transmisión
              </h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataSets.transData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {dataSets.transData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#000', border: '1px solid #333', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 5: Estadísticas Detalladas de Trade-in */}
            <div className="chart-card tradein-full-chart">
              <div className="tradein-chart-header">
                <div>
                  <h3 className="tradein-chart-title">
                    <RefreshCw size={26} className="tradein-icon" /> Estado de Solicitudes Trade-in
                  </h3>
                  <p className="tradein-chart-desc">Análisis de distribución de vehículos de clientes en proceso de canje.</p>
                </div>
                <div className="tradein-stats-badge">
                  <span className="tradein-count">{stats.tradeIn}</span>
                  <span className="tradein-label">Solicitudes Totales</span>
                </div>
              </div>
              
              <div className="tradein-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataSets.tradeInData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {dataSets.tradeInData.map((entry, index) => {
                        const colors = {
                          'Aprobado': '#10b981',
                          'Rechazado': '#ef4444',
                          'En revisión': '#eab308'
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6b7280'} cornerRadius={10} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right" 
                      layout="vertical"
                      iconType="circle"
                      formatter={(value, entry) => (
                        <span style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: '500', marginLeft: '10px' }}>
                          {value}: <span style={{ color: '#fff', fontWeight: '700' }}>{entry.payload.value}</span>
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      {/* Gestión Directa de Trade-ins */}
      <div className="tradein-management-section">
        <h2 className="tradein-section-title">
          <RefreshCw size={24} /> Gestión de Solicitudes Trade-in
        </h2>
        
          <div className="tradein-list">
            {tradeInList.length === 0 ? (
              <p className="empty-text">No hay solicitudes de trade-in pendientes.</p>
            ) : (
              tradeInList.slice(0, 5).map(item => (
                <div key={item.id} className="tradein-item">
                  <div className="tradein-info-content">
                    <img src={item.imagen} alt={item.marca} className="tradein-img" />
                    <div className="tradein-text">
                      <h4 className="tradein-model">{item.marca} {item.modelo} ({item.anio})</h4>
                      <p className="tradein-price">Precio pretendido: <span className="price-value">₡{parseInt(item.precio).toLocaleString()}</span></p>
                      <div className="tradein-status-container">
                        <span className={`tradein-badge status-${item.estado?.toLowerCase().replace(' ', '-') || 'revision'}`}>
                          {item.estado || 'En revisión'}
                        </span>
                        {item.respuesta_admin && (
                          <span className="admin-note">
                            - {item.respuesta_admin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                <div className="tradein-actions">
                  <button 
                    onClick={() => {
                      Swal.fire({
                        title: 'Aprobar Trade-in',
                        text: 'Ingresa un comentario o razón de aprobación:',
                        input: 'textarea',
                        inputPlaceholder: 'Ej: Valoración aceptada según estado físico...',
                        background: '#141414',
                        color: '#fff',
                        confirmButtonColor: '#10b981',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar Aprobación'
                      }).then(res => {
                        if (res.isConfirmed) updateTradeInStatus(item.id, 'Aprobado', res.value);
                      });
                    }}
                    className="btn-tradein approve"
                  >
                    <ShieldCheck size={16} /> Aprobar
                  </button>
                  <button 
                    onClick={() => {
                      Swal.fire({
                        title: 'Poner en Revisión',
                        text: 'Indica qué hace falta para completar la valoración:',
                        input: 'textarea',
                        inputPlaceholder: 'Ej: Pendiente de inspección mecánica...',
                        background: '#141414',
                        color: '#fff',
                        confirmButtonColor: '#eab308',
                        showCancelButton: true,
                        confirmButtonText: 'Guardar'
                      }).then(res => {
                        if (res.isConfirmed) updateTradeInStatus(item.id, 'En revisión', res.value);
                      });
                    }}
                    className="btn-tradein review"
                  >
                    Revisión
                  </button>
                  <button 
                    onClick={() => {
                      Swal.fire({
                        title: 'Rechazar Trade-in',
                        text: '¿Por qué se rechaza este vehículo?',
                        input: 'textarea',
                        inputPlaceholder: 'Ej: Kilometraje excedido o daños estructurales...',
                        background: '#141414',
                        color: '#fff',
                        confirmButtonColor: '#ef4444',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar Rechazo',
                        inputValidator: (value) => {
                          if (!value) return 'Debes indicar un motivo para el rechazo';
                        }
                      }).then(res => {
                        if (res.isConfirmed) updateTradeInStatus(item.id, 'Rechazado', res.value);
                      });
                    }}
                    className="btn-tradein reject"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recuadro de Estado Servidor en Grande al final */}
      <div className="server-status-footer">
        <div className="server-icon-wrapper">
          <Activity size={48} />
        </div>
        <h3 className="server-status-title">{stats.serverStatus?.title || 'ESTADO DEL SERVIDOR'}</h3>
        <div className="server-status-indicator">
          <div className={`status-dot ${stats.serverStatus?.is_online ? 'online' : 'offline'}`}></div>
          <span className={`status-text ${stats.serverStatus?.is_online ? 'online' : 'offline'}`}>
            {stats.serverStatus?.status_text || 'SISTEMA EN LÍNEA'}
          </span>
        </div>
        <p className="server-region-text">{stats.serverStatus?.region_text || 'Todos los servicios están funcionando correctamente.'}</p>
      </div>

    </div>
  );
};

export default AdminDashboard;
