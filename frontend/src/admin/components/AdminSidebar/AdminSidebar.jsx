import React from 'react';
import { NavLink } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  ADMIN_NAV_SECTION_ORDER,
  ADMIN_NAV_SECTIONS,
  getNavItemsBySection,
  ADMIN_ROUTES,
} from '../../constants/routes';
import AdminNavSection from './AdminNavSection';
import AdminUserMenu from './AdminUserMenu';
import './AdminSidebar.css';

/**
 * Barra lateral del panel admin — navegación modular, responsive y menú de usuario.
 */
const AdminSidebar = ({ isOpen, closeSidebar }) => {
  const handleNavigate = () => closeSidebar?.();

  let itemIndex = 0;
  const sections = ADMIN_NAV_SECTION_ORDER.map((key) => {
    const items = getNavItemsBySection(key);
    const startIndex = itemIndex;
    itemIndex += items.length;
    return { key, title: ADMIN_NAV_SECTIONS[key], items, startIndex };
  });

  return (
    <aside
      className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}
      aria-label="Navegación del panel administrativo"
    >
      <header className="admin-sidebar__header">
        <NavLink to={ADMIN_ROUTES.dashboard} className="admin-sidebar__logo" onClick={handleNavigate}>
          SAVS<span>Admin</span>
        </NavLink>
      </header>

      <nav className="admin-sidebar__nav">
        {sections.map(({ key, title, items, startIndex }) => (
          <AdminNavSection
            key={key}
            sectionKey={key}
            title={title}
            items={items}
            onNavigate={handleNavigate}
            startIndex={startIndex}
          />
        ))}
      </nav>

      <footer className="admin-sidebar__footer">
        <NavLink
          to="/"
          className="admin-sidebar__public-link"
          onClick={handleNavigate}
          title="Abrir la web pública en otra vista"
        >
          <ExternalLink size={18} aria-hidden="true" />
          <span>Ver sitio público</span>
        </NavLink>
        <AdminUserMenu onNavigate={handleNavigate} />
      </footer>
    </aside>
  );
};

export default AdminSidebar;
