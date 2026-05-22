import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import '../../styles/admin-shared.css';
import './AdminLayout.css';

/** Rutas donde NO se muestran breadcrumbs (ej: dashboard raíz) */
const HIDE_BREADCRUMBS = ['/admin', '/admin/'];

/**
 * Layout shell del panel admin.
 * - Renderiza hijos vía <Outlet /> (rutas anidadas)
 * - Incluye ScrollToTop en cada cambio de ruta
 * - Muestra Breadcrumbs contextuales excepto en el dashboard raíz
 */
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const location = useLocation();
  const showBreadcrumbs = !HIDE_BREADCRUMBS.includes(location.pathname);

  return (
    <>
      {/* Scroll automático al cambiar de ruta */}
      <ScrollToTop />

      <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="mobile-admin-header">
          <div className="admin-logo-mobile">
            SAVS<span>Admin</span>
          </div>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
            role="presentation"
          />
        )}

        <AdminSidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

        <main className="admin-main-content">
          <div className="admin-page-container">
            {/* Breadcrumbs contextuales */}
            {showBreadcrumbs && <Breadcrumbs />}

            {/* Contenido de la ruta activa con animación de transición */}
            <div className="admin-page-transition" key={location.pathname}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLayout;

