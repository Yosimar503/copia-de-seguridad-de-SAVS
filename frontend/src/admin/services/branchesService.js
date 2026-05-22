import { adminClient, unwrap } from './client';

export const branchesService = {
  getAll: async () => unwrap(await adminClient.get('/branches')),

  getById: async (id) => unwrap(await adminClient.get(`/branches/${id}`)),

  create: async (payload) => unwrap(await adminClient.post('/branches', payload)),

  update: async (id, payload) => unwrap(await adminClient.put(`/branches/${id}`, payload)),

  remove: async (id) => unwrap(await adminClient.delete(`/branches/${id}`)),
};
