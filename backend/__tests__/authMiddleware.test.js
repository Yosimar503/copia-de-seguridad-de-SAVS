const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

// Mock de modelos
jest.mock('../models', () => ({
    Usuario: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
    Rol: {},
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
    },
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('token-de-prueba'),
    verify: jest.fn(),
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
    rol: { nombre: 'client' },
};

// ──────────────────────────────────────────────────────────────────────────
// Usamos la ruta GET /api/users que requiere: verificarToken + esAdmin
// Así probamos ambos middlewares a través de una ruta real
// ──────────────────────────────────────────────────────────────────────────

describe('Middleware — verificarToken', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── M1: Sin cookie ───────────────────────────────────────────────────
    test('M1 🚫 Sin cookie de sesión → 401 acceso denegado', async () => {
        // No enviamos ninguna cookie
        const res = await request(app)
            .get('/api/users');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. No se proporcionó un token.');
    });

    // ── M2: Token inválido ───────────────────────────────────────────────
    test('M2 🚫 Token inválido o expirado → 401', async () => {
        // jwt.verify lanza error (token manipulado o expirado)
        jwt.verify.mockImplementation(() => {
            throw new Error('Token inválido');
        });

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_manipulado_invalido');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Token no válido.');
    });

    // ── M3: Token válido pero usuario eliminado de DB ────────────────────
    test('M3 🚫 Token válido pero usuario no existe en DB → 401', async () => {
        // El token es válido estructuralmente
        jwt.verify.mockReturnValue({ id: 'uuid-eliminado', email: 'eliminado@test.com' });
        // Pero el usuario ya no existe en la DB (fue eliminado)
        Usuario.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_valido_usuario_borrado');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Token no válido o usuario no encontrado.');
    });

    // ── M4: Token válido + usuario existe → pasa el middleware ───────────
    test('M4 ✅ Token válido + usuario admin existe → pasa verificarToken', async () => {
        // Token válido
        jwt.verify.mockReturnValue({ id: usuarioAdmin.id, email: usuarioAdmin.email });
        // Usuario existe en DB con rol admin
        Usuario.findByPk.mockResolvedValue(usuarioAdmin);
        // La ruta hace findAll también, lo simulamos
        Usuario.findAll.mockResolvedValue([usuarioAdmin]);

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_valido_admin');

        // Pasó verificarToken y esAdmin, llega al controlador
        expect(res.statusCode).toBe(200);
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('Middleware — esAdmin', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── M5: Usuario autenticado pero con rol "client" → 403 ─────────────
    test('M5 🚫 Usuario con rol "client" intenta acceder a ruta de admin → 403', async () => {
        // Token válido
        jwt.verify.mockReturnValue({ id: usuarioCliente.id, email: usuarioCliente.email });
        // Usuario existe pero es CLIENTE, no admin
        Usuario.findByPk.mockResolvedValue(usuarioCliente);

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_valido_cliente');

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. Se requiere rol de administrador.');
    });

    // ── M5b: Usuario admin accede correctamente ──────────────────────────
    test('M5b ✅ Usuario con rol "admin" accede a ruta protegida → 200', async () => {
        jwt.verify.mockReturnValue({ id: usuarioAdmin.id, email: usuarioAdmin.email });
        Usuario.findByPk.mockResolvedValue(usuarioAdmin);
        Usuario.findAll.mockResolvedValue([usuarioAdmin]);

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
    });

});
