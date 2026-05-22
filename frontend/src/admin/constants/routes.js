/**
 * Rutas y configuración de navegación del panel administrativo.
 * Fuente única de verdad para paths y menú lateral.
 */

export const ADMIN_BASE = '/admin';

export const ADMIN_ROUTES = {
  dashboard: ADMIN_BASE,
  users: `${ADMIN_BASE}/users`,
  requests: `${ADMIN_BASE}/requests`,
  tracking: `${ADMIN_BASE}/tracking`,
  reviews: `${ADMIN_BASE}/reviews`,
  branches: `${ADMIN_BASE}/branches`,
  inventory: `${ADMIN_BASE}/create-vehicle`,
  tradeIn: `${ADMIN_BASE}/trade-in`,
  marketing: `${ADMIN_BASE}/marketing`,
};

/** @typedef {'general' | 'management'} AdminNavSection */

/**
 * @typedef {Object} AdminNavItem
 * @property {string} to
 * @property {string} label
 * @property {string} icon - nombre del icono lucide-react
 * @property {AdminNavSection} section
 * @property {string} [description] - texto accesibilidad / tooltip
 * @property {boolean} [end] - NavLink exact match
 * @property {boolean} [external] - enlace fuera del panel
 */

/** Orden de secciones en el sidebar */
export const ADMIN_NAV_SECTION_ORDER = ['general', 'management'];

/** @type {AdminNavItem[]} */
export const ADMIN_NAV_ITEMS = [
  {
    to: ADMIN_ROUTES.dashboard,
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    section: 'general',
    end: true,
    description: 'Resumen y métricas del panel',
  },
  {
    to: ADMIN_ROUTES.users,
    label: 'Usuarios',
    icon: 'Users',
    section: 'management',
    description: 'Cuentas y roles del sistema',
  },
  {
    to: ADMIN_ROUTES.requests,
    label: 'Solicitudes',
    icon: 'ClipboardList',
    section: 'management',
    description: 'Peticiones y revisiones pendientes',
  },
  {
    to: ADMIN_ROUTES.tracking,
    label: 'Tracking',
    icon: 'Ship',
    section: 'management',
    description: 'Seguimiento de importaciones',
  },
  {
    to: ADMIN_ROUTES.reviews,
    label: 'Reseñas',
    icon: 'Star',
    section: 'management',
    description: 'Moderación de comentarios',
  },
  {
    to: ADMIN_ROUTES.branches,
    label: 'Sedes',
    icon: 'MapPin',
    section: 'management',
    description: 'Ubicaciones y sucursales',
  },
  {
    to: ADMIN_ROUTES.inventory,
    label: 'Inventario',
    icon: 'Car',
    section: 'management',
    description: 'Vehículos en catálogo',
  },
  {
    to: ADMIN_ROUTES.tradeIn,
    label: 'Trade-in',
    icon: 'RefreshCw',
    section: 'management',
    description: 'Intercambios y ventas de clientes',
  },
  {
    to: ADMIN_ROUTES.marketing,
    label: 'Marketing',
    icon: 'Mail',
    section: 'management',
    description: 'Campañas y correos masivos',
  },
];

export const ADMIN_NAV_SECTIONS = {
  general: 'General',
  management: 'Gestión',
};

/**
 * @typedef {Object} AdminUserMenuAction
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {string} [to]
 * @property {'logout' | 'link'} type
 */

/** Acciones del menú desplegable del usuario */
export const ADMIN_USER_MENU_ACTIONS = [
  { id: 'profile', label: 'Mi perfil', icon: 'UserCircle', to: '/perfil', type: 'link' },
  { id: 'site', label: 'Ver sitio público', icon: 'ExternalLink', to: '/', type: 'link' },
  { id: 'dashboard', label: 'Ir al dashboard', icon: 'LayoutDashboard', to: ADMIN_ROUTES.dashboard, type: 'link' },
  { id: 'logout', label: 'Cerrar sesión', icon: 'LogOut', type: 'logout' },
];

/** @param {AdminNavSection} section */
export function getNavItemsBySection(section) {
  return ADMIN_NAV_ITEMS.filter((item) => item.section === section);
}
