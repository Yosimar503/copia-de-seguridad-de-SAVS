/**
 * Tipos compartidos del módulo admin (JSDoc).
 * Cuando migremos a TypeScript, este archivo será .ts.
 */

/**
 * @typedef {Object} AdminUser
 * @property {number} [id]
 * @property {string} [nombre]
 * @property {string} [email]
 * @property {'admin' | 'gerente' | 'cliente' | string} [rol]
 */

/**
 * @typedef {Object} AdminStats
 * @property {number} vehicles
 * @property {number} users
 * @property {number} requests
 * @property {number} reviews
 * @property {number} tradeIn
 */

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error'} AsyncStatus
 */

export {};
