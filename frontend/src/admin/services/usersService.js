import { adminClient, unwrap } from './client';

export const usersService = {
  getAll: async () => unwrap(await adminClient.get('/users')),

  getById: async (id) => unwrap(await adminClient.get(`/users/${id}`)),

  create: async (payload) => unwrap(await adminClient.post('/users', payload)),

  update: async (id, payload) => unwrap(await adminClient.put(`/users/${id}`, payload)),

  patch: async (id, payload) => unwrap(await adminClient.patch(`/users/${id}`, payload)),

  remove: async (id) => unwrap(await adminClient.delete(`/users/${id}`)),

  /** Clientes con datos de tracking de importación */
  getTrackingList: async () => {
    const data = await usersService.getAll();
    const list = Array.isArray(data) ? data : [];
    return list.filter((u) => u.rol === 'Cliente' || u.tracking);
  },

  updateTracking: async (userId, tracking) =>
    usersService.patch(userId, { tracking }),
};
