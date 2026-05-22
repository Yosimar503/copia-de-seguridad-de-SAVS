const request = require('supertest');
const app = require('../app');

// ─── MOCKS ────────────────────────────────────────────────────────────────

jest.mock('../models', () => ({
    Review: {
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

const { Review, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────

const reviewEjemplo = {
    id: 1,
    cliente_id: 'uuid-client-001',
    auto_id: 10,
    comentario: 'Excelente servicio y el auto está impecable.',
    puntuacion: 5,
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
describe('GET /api/reviews — Rutas públicas', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── RV1: Obtener todas las reseñas ────────────────────────────────────
    test('RV1 ✅ GET /api/reviews → devuelve array de reseñas', async () => {
        Review.findAll.mockResolvedValue([reviewEjemplo]);

        const res = await request(app).get('/api/reviews');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('puntuacion', 5);
    });

    // ── RV1b: Obtener reseña por ID ───────────────────────────────────────
    test('RV1b ✅ GET /api/reviews/:id → devuelve la reseña 200', async () => {
        Review.findByPk.mockResolvedValue(reviewEjemplo);

        const res = await request(app).get('/api/reviews/1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('comentario', 'Excelente servicio y el auto está impecable.');
    });

    // ── RV3: Reseña no encontrada ─────────────────────────────────────────
    test('RV3 ❌ GET /api/reviews/:id inexistente → 404', async () => {
        Review.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/reviews/999');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'No encontrado');
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/reviews — Rutas protegidas (usuario)', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── RV2: Crear reseña con token usuario ──────────────────────────────
    test('RV2 ✅ POST /api/reviews con token usuario → 201 creado', async () => {
        mockAuth(usuarioCliente);
        Review.create.mockResolvedValue({ ...reviewEjemplo, id: 200 });

        const res = await request(app)
            .post('/api/reviews')
            .set('Cookie', 'token=token_valido_cliente')
            .send({ auto_id: 10, comentario: 'Muy bueno', puntuacion: 4 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 200);
    });

    // ── RV2b: Crear reseña sin token → 401 ────────────────────────────────
    test('RV2b 🚫 POST /api/reviews sin token → 401 acceso denegado', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .send({ auto_id: 10, comentario: 'No debería dejarme' });

        expect(res.statusCode).toBe(401);
    });

});

// ──────────────────────────────────────────────────────────────────────────
describe('PUT & DELETE /api/reviews — Operaciones de admin', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── RV4: Admin elimina reseña ─────────────────────────────────────────
    test('RV4 ✅ DELETE /api/reviews/:id con token admin → 200 eliminado', async () => {
        mockAuth(usuarioAdmin);
        Review.destroy.mockResolvedValue(1);

        const res = await request(app)
            .delete('/api/reviews/1')
            .set('Cookie', 'token=token_valido_admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Eliminado correctamente');
    });

    // ── RV4b: Cliente intenta eliminar reseña → 403 ───────────────────────
    test('RV4b 🚫 DELETE /api/reviews/:id con token cliente → 403', async () => {
        mockAuth(usuarioCliente);

        const res = await request(app)
            .delete('/api/reviews/1')
            .set('Cookie', 'token=token_valido_cliente');

        expect(res.statusCode).toBe(403);
    });

});
