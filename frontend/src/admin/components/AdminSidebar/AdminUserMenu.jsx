import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../../services/api';
import { ADMIN_USER_MENU_ACTIONS } from '../../constants/routes';
import { getStoredAdminUser, getAdminDisplayRole } from '../../utils/auth';
import { getNavIcon } from '../../constants/navIcons';

/**
 * Usuario autenticado con menú desplegable (perfil, sitio, logout).
 */
const AdminUserMenu = ({ onNavigate }) => {
  const navigate = useNavigate();
  const user = getStoredAdminUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      /* cookie puede fallar si el servidor no responde; limpiamos local igual */
    }
    localStorage.removeItem('user');
    toast.success('Sesión cerrada');
    setOpen(false);
    onNavigate?.();
    navigate('/login');
  };

  const handleAction = (action) => {
    if (action.type === 'logout') {
      handleLogout();
      return;
    }
    setOpen(false);
    onNavigate?.();
  };

  const initials = user.nombre?.charAt(0)?.toUpperCase() || 'A';
  const displayRole = getAdminDisplayRole(user);

  return (
    <div className="admin-user-menu" ref={menuRef}>
      <button
        type="button"
        className={`admin-user-menu__trigger ${open ? 'admin-user-menu__trigger--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="admin-user-dropdown"
      >
        <span className="admin-user-menu__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="admin-user-menu__info">
          <span className="admin-user-menu__name">{user.nombre || 'Usuario'}</span>
          <span className="admin-user-menu__role">
            <Shield size={12} aria-hidden="true" />
            {displayRole}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="admin-user-menu__chevron"
          aria-hidden="true"
        >
          <ChevronUp size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="admin-user-dropdown"
            role="menu"
            className="admin-user-menu__dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="admin-user-menu__dropdown-header">
              <p className="admin-user-menu__email">{user.email || 'Sin correo'}</p>
            </div>
            <ul className="admin-user-menu__actions">
              {ADMIN_USER_MENU_ACTIONS.map((action) => {
                const Icon = getNavIcon(action.icon);
                if (action.type === 'logout') {
                  return (
                    <li key={action.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="admin-user-menu__action admin-user-menu__action--danger"
                        onClick={() => handleAction(action)}
                      >
                        <Icon size={18} aria-hidden="true" />
                        {action.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={action.id} role="none">
                    <Link
                      to={action.to}
                      role="menuitem"
                      className="admin-user-menu__action"
                      onClick={() => handleAction(action)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {action.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserMenu;
