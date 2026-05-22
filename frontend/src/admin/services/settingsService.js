import { adminClient, unwrap } from './client';

export const settingsService = {
  getAll: async () => {
    try {
      return unwrap(await adminClient.get('/settings'));
    } catch {
      return {};
    }
  },

  getByKey: async (key) => unwrap(await adminClient.get(`/settings/${key}`)),

  upsert: async (payload) => unwrap(await adminClient.post('/settings', payload)),
};
