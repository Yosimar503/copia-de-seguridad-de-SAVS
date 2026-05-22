import React from 'react';
import AdminNavItem from './AdminNavItem';

/**
 * Bloque modular de navegación por sección (General, Gestión, etc.).
 */
const AdminNavSection = ({ sectionKey, title, items, onNavigate, startIndex = 0 }) => {
  if (!items?.length) return null;

  return (
    <section className="admin-nav-section" aria-labelledby={`nav-section-${sectionKey}`}>
      <h2 id={`nav-section-${sectionKey}`} className="admin-nav-section__title">
        {title}
      </h2>
      <ul className="admin-nav-section__list">
        {items.map((item, i) => (
          <li key={item.to}>
            <AdminNavItem
              item={item}
              onNavigate={onNavigate}
              index={startIndex + i}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminNavSection;
