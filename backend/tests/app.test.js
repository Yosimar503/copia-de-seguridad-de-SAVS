const request = require('supertest');
const app = require('../server'); // Importa tu app de express
const { sequelize } = require('../models');

describe('Pruebas Básicas de la API', () => {
  // Asegurarnos de que la BD se sincronice antes de las pruebas si es necesario
  beforeAll(async () => {
    // Si quisieras limpiar la BD antes de los tests:
    // await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Cerrar la conexión para que Jest pueda terminar limpiamente
    await sequelize.close();
  });

  it('Debería responder al GET en /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });
  
  it('Debería retornar un arreglo vacío o datos al hacer GET /api/vehicles', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
