/**
 * Utilidades de sesión para el panel admin.
 * Centraliza lectura de usuario desde localStorage (sincronizado por ProtectedRoute).
 */

/** @typedef {import('../types').AdminUser} AdminUser */

/** @returns {AdminUser} */
export function getStoredAdminUser() {
  try {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined') return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/** @param {AdminUser} user */
export function isManager(user) {
  return user?.rol === 'gerente';
}

/** @param {AdminUser} user */
export function isAdmin(user) {
  return user?.rol === 'admin' || isManager(user);
}

/** @param {AdminUser} user */
export function getAdminDisplayRole(user) {
  return isManager(user) ? 'Gerente' : 'Administrador';
}
