import { adminClient, adminFormClient, unwrap } from './client';

export const marketingService = {
  getBanners: async () => {
    const data = unwrap(await adminClient.get('/marketing/banners'));
    return data?.banners ?? (Array.isArray(data) ? data : []);
  },

  createBanner: async (formData) =>
    unwrap(
      await adminFormClient.post('/marketing/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),

  deleteBanner: async (id) => unwrap(await adminClient.delete(`/marketing/banners/${id}`)),

  generateBannerCopy: async (formData) =>
    unwrap(
      await adminFormClient.post('/marketing/banners/generate-copy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),

  broadcastEmail: async (payload) =>
    unwrap(await adminClient.post('/marketing/broadcast', payload)),

  sendTestEmail: async ({ subject, content, testEmail }) =>
    marketingService.broadcastEmail({
      subject: `[TEST] ${subject}`,
      content,
      testEmail,
    }),
};
