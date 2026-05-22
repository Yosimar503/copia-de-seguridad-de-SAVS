/**
 * Formatea un número como moneda de Costa Rica (Colones)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('CRC', '₡');
};

/**
 * Formatea una fecha ISO a un formato legible local
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('es-CR', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }).format(new Date(dateString));
};
