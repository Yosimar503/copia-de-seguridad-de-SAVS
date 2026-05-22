const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

jest.mock('../models', () => ({
    Usuario: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findOne: jest.fn(),
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

jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
}));

const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────

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
    rolId: 2,
    rol: { nombre: 'client' },
    // Nota: password intencionalmente omitida (como devuelve la DB con exclude)
};

// Helper: simula admin autenticado
const mockAdminAuth = () => {
    jwt.verify.mockReturnValue({ id: usuarioAdmin.id, email: usuarioAdmin.email });
    Usuario.findByPk.mockResolvedValueOnce(usuarioAdmin); // para el middleware verificarToken
};

// ──────────────────────────────────────────────────────────────────────────
describe('GET /api/users — Solo accesible por admin', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── U1: Sin token → 401 ──────────────────────────────────────────────
    test('U1 🚫 GET /api/users sin token → 401 acceso denegado', async () => {
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. No se proporcionó un token.');
    });

    // ── U2: Admin autenticado → lista de usuarios ─────────────────────────
    test('U2 ✅ GET /api/users con token admin → 200 con array de usuarios', async () => {
        mockAdminAuth();
        // El controlador llama findAll después del middleware
        Usuario.findAll.mockResolvedValue([usuarioCliente]);

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('nombre', 'Cliente Test');
    });

    // ── U3: La respuesta no incluye password ─────────────────────────────
    test('U3 🔒 GET /api/users/:id → respuesta no contiene campo password', async () => {
        mockAdminAuth();
        // findByPk del controlador (el middleware ya consumió el primero con Once)
        Usuario.findByPk.mockResolvedValueOnce(usuarioCliente);

        const res = await request(app)
            .get(`/api/users/${usuarioCliente.id}`)
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).not.toHaveProperty('password');
    });

    // ── U4: Usuario no encontrado → 404 ──────────────────────────────────
    test('U4 ❌ GET /api/users/:id inexistente → 404', async () => {
        mockAdminAuth();
        Usuario.findByPk.mockResolvedValueOnce(null); // el controlador no encuentra al usuario

        const res = await request(app)
            .get('/api/users/uuid-inexistente')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'No encontrado');
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('DELETE /api/users — Eliminar usuarios', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── U5: Eliminar sin token → 401 ─────────────────────────────────────
    test('U5 🚫 DELETE sin token → 401 acceso denegado', async () => {
        const res = await request(app).delete('/api/users/uuid-client-001');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. No se proporcionó un token.');
    });

    // ── U5b: Admin elimina usuario existente → 200 ───────────────────────
    test('U5b ✅ DELETE con token admin → 200 eliminado correctamente', async () => {
        mockAdminAuth();
        Usuario.destroy.mockResolvedValue(1);

        const res = await request(app)
            .delete(`/api/users/${usuarioCliente.id}`)
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Eliminado correctamente');
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/users — Crear usuario (admin)', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── U6: Password se guarda hasheada (no en texto plano) ──────────────
    test('U6 🔒 POST crea usuario con password hasheada → no expone password', async () => {
        mockAdminAuth();

        const nuevoUsuario = {
            id: 'uuid-nuevo-999',
            nombre: 'Nuevo Usuario',
            email: 'nuevo@test.com',
            rolId: 2,
            // Sin campo password en la respuesta del mock (como haría el controlador)
        };

        Usuario.create.mockResolvedValue({
            toJSON: () => nuevoUsuario,
        });

        const res = await request(app)
            .post('/api/users')
            .set('Cookie', 'token=token_valido_admin')
            .send({ nombre: 'Nuevo Usuario', email: 'nuevo@test.com', password: 'Password123', rolId: 2 });

        expect(res.statusCode).toBe(201);
        // La respuesta no debe exponer la contraseña
        expect(res.body).not.toHaveProperty('password');
        expect(res.body).toHaveProperty('nombre', 'Nuevo Usuario');
    });

    // ── U6b: POST sin token → 401 ────────────────────────────────────────
    test('U6b 🚫 POST sin token → 401 acceso denegado', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ nombre: 'Test', email: 'test@test.com', password: '1234' });

        expect(res.statusCode).toBe(401);
    });

});
