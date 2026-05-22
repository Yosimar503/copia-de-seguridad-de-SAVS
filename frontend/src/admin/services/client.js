/**
 * Cliente HTTP del panel admin (reutiliza la instancia global con cookies JWT).
 */
import api, { apiForm } from '../../services/api';

export const adminClient = api;
export const adminFormClient = apiForm;

/** @param {import('axios').AxiosResponse} response */
export function unwrap(response) {
  return response.data;
}

/** @param {unknown} error */
export function getApiErrorMessage(error, fallback = 'Error en la operación') {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return fallback;
}
