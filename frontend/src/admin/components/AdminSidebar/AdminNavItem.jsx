import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNavIcon } from '../../constants/navIcons';

/**
 * Enlace de navegación con estados activo / inactivo y animación.
 */
const AdminNavItem = ({ item, onNavigate, index = 0 }) => {
  const Icon = getNavIcon(item.icon);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <NavLink
        to={item.to}
        end={item.end}
        title={item.description || item.label}
        aria-label={item.description ? `${item.label}: ${item.description}` : item.label}
        onClick={onNavigate}
        className={({ isActive }) =>
          ['admin-nav-item', isActive ? 'admin-nav-item--active' : 'admin-nav-item--inactive'].join(' ')
        }
      >
        <span className="admin-nav-item__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>
        <span className="admin-nav-item__content">
          <span className="admin-nav-item__label">{item.label}</span>
          {item.description && (
            <span className="admin-nav-item__desc">{item.description}</span>
          )}
        </span>
        <ChevronRight size={14} className="admin-nav-item__arrow" aria-hidden="true" />
      </NavLink>
    </motion.div>
  );
};

export default AdminNavItem;
