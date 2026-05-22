import { adminClient, unwrap } from './client';

export const reviewsService = {
  getAll: async () => unwrap(await adminClient.get('/reviews')),

  getById: async (id) => unwrap(await adminClient.get(`/reviews/${id}`)),

  update: async (id, payload) => unwrap(await adminClient.put(`/reviews/${id}`, payload)),

  remove: async (id) => unwrap(await adminClient.delete(`/reviews/${id}`)),
};
