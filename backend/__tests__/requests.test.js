const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

jest.mock('../models', () => ({
    Request: {
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

const { Request, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────

const solicitudEjemplo = {
    id: 1,
    cliente_id: 'uuid-client-001',
    auto_id: 10,
    mensaje: 'Estoy interesado en este Toyota Corolla',
    estado: 'pendiente',
};

const usuarioAdmin = {
    id: 'uuid-admin-001',
    nombre: 'Admin Test',
    email: 'admin@test.com',
    rol: { nombre: 'admin' },
};

const usuarioCliente = {
    id: 'uuid-client-001',
    nombre: 'Cliente Test',
    email: 'client@test.com',
    rol: { nombre: 'client' },
};

// Helper: simula autenticación
const mockAuth = (user) => {
    jwt.verify.mockReturnValue({ id: user.id, email: user.email });
    Usuario.findByPk.mockResolvedValue(user);
};

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/requests — Crear solicitud', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── R1: Crear solicitud con token de usuario ──────────────────────────
    test('R1 ✅ POST /api/requests → crea solicitud 201 (con token usuario)', async () => {
        mockAuth(usuarioCliente);
        Request.create.mockResolvedValue({ ...solicitudEjemplo, id: 100 });

        const res = await request(app)
            .post('/api/requests')
            .set('Cookie', 'token=token_valido_cliente')
            .send({ auto_id: 10, mensaje: 'Me interesa' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 100);
        expect(res.body).toHaveProperty('mensaje', 'Estoy interesado en este Toyota Corolla');
    });

    // ── R1b: Crear solicitud sin token → 401 ──────────────────────────────
    test('R1b 🚫 POST sin token → 401 acceso denegado', async () => {
        const res = await request(app)
            .post('/api/requests')
            .send({ auto_id: 10 });

        expect(res.statusCode).toBe(401);
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('GET /api/requests — Admin gestiona solicitudes', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── R2: Admin obtiene todas las solicitudes ──────────────────────────
    test('R2 ✅ GET /api/requests con token admin → 200 con lista', async () => {
        mockAuth(usuarioAdmin);
        Request.findAll.mockResolvedValue([solicitudEjemplo]);

        const res = await request(app)
            .get('/api/requests')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('estado', 'pendiente');
    });

    // ── R2b: Cliente intenta listar solicitudes → 403 ─────────────────────
    test('R2b 🚫 GET /api/requests con token cliente → 403', async () => {
        mockAuth(usuarioCliente);

        const res = await request(app)
            .get('/api/requests')
            .set('Cookie', 'token=token_valido_cliente');

        expect(res.statusCode).toBe(403);
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('PUT & DELETE /api/requests — Operaciones de admin', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── R3: Actualizar estado de solicitud ────────────────────────────────
    test('R3 ✅ PUT /api/requests/:id con token admin → 200 actualizado', async () => {
        mockAuth(usuarioAdmin);
        Request.update.mockResolvedValue([1]);
        Request.findByPk.mockResolvedValue({ ...solicitudEjemplo, estado: 'aprobado' });

        const res = await request(app)
            .put('/api/requests/1')
            .set('Cookie', 'token=token_valido_admin')
            .send({ estado: 'aprobado' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('estado', 'aprobado');
    });

    // ── R4: Eliminar solicitud ──────────────────────────────────────────
    test('R4 ✅ DELETE /api/requests/:id con token admin → 200 eliminado', async () => {
        mockAuth(usuarioAdmin);
        Request.destroy.mockResolvedValue(1);

        const res = await request(app)
            .delete('/api/requests/1')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Eliminado correctamente');
    });

    // ── R4b: Eliminar inexistente ───────────────────────────────────────
    test('R4b ❌ DELETE inexistente → 404', async () => {
        mockAuth(usuarioAdmin);
        Request.destroy.mockResolvedValue(0);

        const res = await request(app)
            .delete('/api/requests/999')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(404);
    });

});
