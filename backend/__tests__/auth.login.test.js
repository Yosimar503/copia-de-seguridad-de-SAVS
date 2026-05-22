const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

// Mock de modelos (sin conexión a DB)
jest.mock('../models', () => ({
    Usuario: {
        findOne: jest.fn(),
    },
    Rol: {},
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
    },
}));

// Mock de bcrypt (sin hashear nada real)
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// Mock de jsonwebtoken (token fijo de prueba)
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('token-de-prueba-jest'),
    verify: jest.fn(),
}));

const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────

// Usuario simulado que devuelve la DB
const usuarioEnDB = {
    id: 'uuid-usuario-001',
    nombre: 'Randy Test',
    email: 'randy@test.com',
    password: 'hashed_password_en_db',
    rol: { nombre: 'client' },
};

const credencialesValidas = {
    email: 'randy@test.com',
    password: 'Password123',
};

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login — Tests de Login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── L1: Login exitoso ────────────────────────────────────────────────
    test('L1 ✅ Login exitoso → 200 con datos del usuario', async () => {
        // El usuario SÍ existe en la DB
        Usuario.findOne.mockResolvedValue(usuarioEnDB);
        // La contraseña ES correcta
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send(credencialesValidas);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Inicio de sesión exitoso');
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario).toMatchObject({
            id: usuarioEnDB.id,
            nombre: usuarioEnDB.nombre,
            email: usuarioEnDB.email,
            rol: 'client',
        });
    });

    // ── L2: Usuario no existe ────────────────────────────────────────────
    test('L2 ❌ Usuario no encontrado → 404 con error', async () => {
        // El usuario NO existe en la DB
        Usuario.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/login')
            .send(credencialesValidas);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas.');
    });

    // ── L3: Contraseña incorrecta ────────────────────────────────────────
    test('L3 ❌ Contraseña incorrecta → 401 con error', async () => {
        // El usuario SÍ existe
        Usuario.findOne.mockResolvedValue(usuarioEnDB);
        // Pero la contraseña NO coincide
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'randy@test.com', password: 'contraseña_mal' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas.');
    });

    // ── L4: Se setea la cookie "token" ───────────────────────────────────
    test('L4 🍪 Login exitoso setea cookie httpOnly con token', async () => {
        Usuario.findOne.mockResolvedValue(usuarioEnDB);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send(credencialesValidas);

        expect(res.statusCode).toBe(200);
        // Verificamos que la respuesta incluye el header set-cookie
        expect(res.headers['set-cookie']).toBeDefined();
        // Verificamos que la cookie se llama "token"
        const cookie = res.headers['set-cookie'][0];
        expect(cookie).toMatch(/token=/);
        // Verificamos que es httpOnly
        expect(cookie).toMatch(/HttpOnly/i);
    });

    // ── L5: Respuesta no expone password ─────────────────────────────────
    test('L5 🔒 La respuesta no expone la password del usuario', async () => {
        Usuario.findOne.mockResolvedValue(usuarioEnDB);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send(credencialesValidas);

        expect(res.statusCode).toBe(200);
        // El objeto usuario en la respuesta NO debe tener password
        expect(res.body.usuario).not.toHaveProperty('password');
    });

    // ── L6: Acepta campo "correo" como alternativa a "email" ─────────────
    test('L6 ⚙️ Acepta campo "correo" como alternativa a "email" → 200', async () => {
        Usuario.findOne.mockResolvedValue(usuarioEnDB);
        bcrypt.compare.mockResolvedValue(true);

        // Enviamos "correo" en vez de "email"
        const res = await request(app)
            .post('/api/auth/login')
            .send({ correo: 'randy@test.com', password: 'Password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Inicio de sesión exitoso');
    });

});
