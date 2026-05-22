/**
 * Punto de entrada del módulo admin.
 */
export { ADMIN_ROUTES, ADMIN_NAV_ITEMS, getNavItemsBySection } from './constants/routes';
export { getNavIcon, NAV_ICON_MAP } from './constants/navIcons';
export { getStoredAdminUser, isAdmin, isManager } from './utils/auth';
export { default as AdminLayout } from './components/AdminLayout/AdminLayout';
export { default as AdminSidebar } from './components/AdminSidebar/AdminSidebar';
export { default as AdminLoader } from './components/AdminLoader/AdminLoader';
export { AdminRoutes } from './routes/AdminRoutes';
export * from './services';
export { useAdminFetch, useDashboardStats } from './hooks';
