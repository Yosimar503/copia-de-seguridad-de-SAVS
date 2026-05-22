import toast from 'react-hot-toast';

/**
 * Logging estructurado de errores de API para depuración.
 */
export const logApiError = (context, error) => {
  const payload = {
    context,
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
    timestamp: new Date().toISOString()
  };
  console.error('[API Error]', payload);
  return payload;
};

/**
 * Muestra feedback amigable al usuario según el tipo de error.
 */
export const handleApiError = (context, error, options = {}) => {
  logApiError(context, error);
  const status = error?.response?.status;
  let message = error?.response?.data?.error || error?.message || 'Ocurrió un error inesperado';

  if (status === 401) message = 'Sesión expirada. Inicia sesión nuevamente.';
  if (status === 403) message = 'No tienes permiso para esta acción.';
  if (status === 404) message = options.notFound || 'Recurso no encontrado.';
  if (!error?.response) message = 'Error de conexión con el servidor.';

  if (options.toast !== false) {
    toast.error(message);
  }
  return message;
};
