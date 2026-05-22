import { adminClient, unwrap } from './client';

/** Solicitudes trade-in / venta de autos por clientes */
export const saleRequestsService = {
  getAll: async () => unwrap(await adminClient.get('/sale_requests')),

  getById: async (id) => unwrap(await adminClient.get(`/sale_requests/${id}`)),

  update: async (id, payload) => unwrap(await adminClient.put(`/sale_requests/${id}`, payload)),

  patch: async (id, payload) => unwrap(await adminClient.patch(`/sale_requests/${id}`, payload)),

  remove: async (id) => unwrap(await adminClient.delete(`/sale_requests/${id}`)),

  updateStatus: async (id, estado, respuesta_admin = '') =>
    saleRequestsService.patch(id, { estado, respuesta_admin }),
};
