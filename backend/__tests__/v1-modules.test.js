const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

afterAll(async () => { await sequelize.close(); });

describe('API v1 módulos', () => {
  test('GET /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('v1');
  });

  test('GET /api/v1/trade-in sin token → 401', async () => {
    const res = await request(app).get('/api/v1/trade-in');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/tracking/stages', async () => {
    const res = await request(app).get('/api/v1/tracking/stages');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/v1/promotions/catalog', async () => {
    const res = await request(app).get('/api/v1/promotions/catalog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('porVehiculo');
  });

  test('POST /api/v1/reports/generate sin token → 401', async () => {
    const res = await request(app).post('/api/v1/reports/generate').send({ tipo: 'inventario' });
    expect(res.status).toBe(401);
  });

  test('GET / raíz incluye version', async () => {
    const res = await request(app).get('/');
    expect(res.body.version).toBe('v1');
  });
});
