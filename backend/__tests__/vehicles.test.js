const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

jest.mock('../models', () => ({
    Auto: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
    Usuario: {
        findByPk: jest.fn(),
    },
    Rol: {},
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
    },
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('token-de-prueba'),
    verify: jest.fn(),
}));

const { Auto, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────

const autoEjemplo = {
    id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2023,
    precio: 18000,
    disponible: true,
};

const autoEjemplo2 = {
    id: 2,
    marca: 'Honda',
    modelo: 'Civic',
    año: 2022,
    precio: 17000,
    disponible: true,
};

const usuarioAdmin = {
    id: 'uuid-admin-001',
    nombre: 'Admin Test',
    email: 'admin@test.com',
    rol: { nombre: 'admin' },
};

// Helper: configura mocks para simular admin autenticado
const mockAdminAuth = () => {
    jwt.verify.mockReturnValue({ id: usuarioAdmin.id, email: usuarioAdmin.email });
    Usuario.findByPk.mockResolvedValue(usuarioAdmin);
};

// ──────────────────────────────────────────────────────────────────────────
describe('GET /api/vehicles — Rutas públicas', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── V1: Obtener catálogo completo (público) ───────────────────────────
    test('V1 ✅ GET todos los autos → 200 con array (sin autenticación)', async () => {
        Auto.findAll.mockResolvedValue([autoEjemplo, autoEjemplo2]);

        const res = await request(app).get('/api/vehicles');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('marca', 'Toyota');
    });

    // ── V2: Obtener auto por ID (público) ────────────────────────────────
    test('V2 ✅ GET auto por ID existente → 200 con los datos del auto', async () => {
        Auto.findByPk.mockResolvedValue(autoEjemplo);

        const res = await request(app).get('/api/vehicles/1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
        expect(res.body).toHaveProperty('marca', 'Toyota');
        expect(res.body).toHaveProperty('modelo', 'Corolla');
    });

    // ── V3: Auto no encontrado ───────────────────────────────────────────
    test('V3 ❌ GET auto por ID inexistente → 404', async () => {
        Auto.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/vehicles/999');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'No encontrado');
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/vehicles — Rutas protegidas (solo admin)', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── V4: Crear auto sin token → 401 ───────────────────────────────────
    test('V4 🚫 POST sin token de sesión → 401 acceso denegado', async () => {
        // No enviamos cookie
        const res = await request(app)
            .post('/api/vehicles')
            .send({ marca: 'Ford', modelo: 'Mustang', año: 2024, precio: 35000 });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. No se proporcionó un token.');
    });

    // ── V5: Crear auto con token admin → 201 ─────────────────────────────
    test('V5 ✅ POST con token admin → 201 auto creado', async () => {
        mockAdminAuth();
        Auto.create.mockResolvedValue({ id: 3, marca: 'Ford', modelo: 'Mustang', año: 2024, precio: 35000 });

        const res = await request(app)
            .post('/api/vehicles')
            .set('Cookie', 'token=token_valido_admin')
            .send({ marca: 'Ford', modelo: 'Mustang', año: 2024, precio: 35000 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('marca', 'Ford');
        expect(res.body).toHaveProperty('modelo', 'Mustang');
    });

    // ── V6: Eliminar auto sin token → 401 ────────────────────────────────
    test('V6 🚫 DELETE sin token de sesión → 401 acceso denegado', async () => {
        const res = await request(app).delete('/api/vehicles/1');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. No se proporcionó un token.');
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('PUT & DELETE /api/vehicles — Operaciones de admin', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── V7: Actualizar auto existente ────────────────────────────────────
    test('V7 ✅ PUT con token admin → 200 auto actualizado', async () => {
        mockAdminAuth();
        Auto.update.mockResolvedValue([1]); // 1 = número de filas afectadas
        Auto.findByPk.mockResolvedValueOnce(usuarioAdmin) // para el middleware
                     .mockResolvedValueOnce({ ...autoEjemplo, precio: 19000 }); // para el return

        const res = await request(app)
            .put('/api/vehicles/1')
            .set('Cookie', 'token=token_valido_admin')
            .send({ precio: 19000 });

        expect(res.statusCode).toBe(200);
    });

    // ── V8: Eliminar auto existente ──────────────────────────────────────
    test('V8 ✅ DELETE con token admin → 200 eliminado correctamente', async () => {
        mockAdminAuth();
        Auto.destroy.mockResolvedValue(1); // 1 = fila eliminada

        const res = await request(app)
            .delete('/api/vehicles/1')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Eliminado correctamente');
    });

    // ── V9: Eliminar auto inexistente ────────────────────────────────────
    test('V9 ❌ DELETE auto inexistente → 404', async () => {
        mockAdminAuth();
        Auto.destroy.mockResolvedValue(0); // 0 = ninguna fila eliminada

        const res = await request(app)
            .delete('/api/vehicles/999')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'No encontrado');
    });

});
