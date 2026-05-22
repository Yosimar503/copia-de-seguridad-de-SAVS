import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Star,
  RefreshCw,
  Car,
  MapPin,
  Ship,
  Mail,
  Sparkles
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, closeSidebar }) => {
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined') return {};
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  };
  
  const user = getUserFromStorage();
  const isManager = user.rol === 'gerente';

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          SAVS<span>Admin</span>
        </div>
      </div>

      <nav className="admin-nav">
        <div className="nav-section">
          <label>General</label>
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>
          <NavLink to="/" className="nav-item view-site-link" onClick={closeSidebar}>
            <ExternalLink size={20} />
            <span>Ver Sitio Público</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <label>Gestión</label>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <Users size={20} />
            <span>Usuarios</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>
          
          <NavLink to="/admin/requests" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <ClipboardList size={20} />
            <span>Solicitudes</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/admin/tracking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <Ship size={20} />
            <span>Tracking</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <Star size={20} />
            <span>Reseñas</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/admin/branches" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <MapPin size={20} />
            <span>Sedes</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/admin/create-vehicle" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <Car size={20} />
            <span>Inventario</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/vender-auto" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <RefreshCw size={20} />
            <span>Gestión Trade-in</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>
          
          <NavLink to="/admin/marketing" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
            <Mail size={20} />
            <span>Email Marketing</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="user-avatar">
            {user.nombre?.charAt(0) || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{user.nombre}</span>
            <span className="user-role">{isManager ? 'Gerente' : 'Administrador'}</span>
          </div>
        </div>
        <NavLink to="/" className="logout-link">
          <LogOut size={20} />
          <span>Salir</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
