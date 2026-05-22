import { adminClient, unwrap } from './client';

export const requestsService = {
  getAll: async () => unwrap(await adminClient.get('/requests')),

  getById: async (id) => unwrap(await adminClient.get(`/requests/${id}`)),

  update: async (id, payload) => unwrap(await adminClient.put(`/requests/${id}`, payload)),

  remove: async (id) => unwrap(await adminClient.delete(`/requests/${id}`)),
};
