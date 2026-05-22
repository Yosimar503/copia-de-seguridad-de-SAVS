const request = require('supertest');
const app = require('../app');

// ─── MOCK del módulo models ────────────────────────────────────────────────
// Simulamos Usuario y Rol sin conectarnos a la base de datos real
jest.mock('../models', () => ({
    Usuario: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
    Rol: {},
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
        define: jest.fn(),
    },
}));

const { Usuario } = require('../models');

// ─── DATOS DE PRUEBA ───────────────────────────────────────────────────────
const usuarioValido = {
    nombre: 'Randy Test',
    email: 'randy@test.com',
    password: 'Password123',
    telefono: '12345678',
};

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register — Tests de Registro', () => {

    // Limpiamos los mocks antes de cada test para que no se mezclen
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── T1: Registro exitoso ─────────────────────────────────────────────
    test('T1 ✅ Registro exitoso → 201 con mensaje y usuarioId', async () => {
        // Simulamos que el email NO existe en la DB
        Usuario.findOne.mockResolvedValue(null);

        // Simulamos que la creación del usuario fue exitosa
        Usuario.create.mockResolvedValue({
            id: 'uuid-generado-123',
            nombre: 'Randy Test',
            email: 'randy@test.com',
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send(usuarioValido);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Usuario registrado con éxito');
        expect(res.body).toHaveProperty('usuarioId', 'uuid-generado-123');
    });

    // ── T2: Email ya registrado ──────────────────────────────────────────
    test('T2 ❌ Email duplicado → 400 con error', async () => {
        // Simulamos que el email YA existe en la DB
        Usuario.findOne.mockResolvedValue({
            id: 'existente-456',
            email: 'randy@test.com',
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send(usuarioValido);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'El correo ya está registrado.');
    });

    // ── T3: Campo alternativo "correo" funciona igual que "email" ────────
    test('T3 ⚙️ Acepta campo "correo" como alternativa a "email" → 201', async () => {
        Usuario.findOne.mockResolvedValue(null);
        Usuario.create.mockResolvedValue({
            id: 'uuid-789',
            nombre: 'Randy Test',
            email: 'correo@test.com',
        });

        // Enviamos "correo" en vez de "email"
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Randy Test',
                correo: 'correo@test.com',  // <-- campo alternativo
                password: 'Password123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Usuario registrado con éxito');
    });

    // ── T4: La password NO aparece en la respuesta ───────────────────────
    test('T4 🔒 La respuesta no expone la password del usuario', async () => {
        Usuario.findOne.mockResolvedValue(null);
        Usuario.create.mockResolvedValue({
            id: 'uuid-abc',
            nombre: 'Randy Test',
            email: 'randy@test.com',
            // Nótese: NO incluimos password aquí (como haría la DB al crear)
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send(usuarioValido);

        expect(res.statusCode).toBe(201);
        // El body de la respuesta NO debe tener el campo password
        expect(res.body).not.toHaveProperty('password');
    });

    // ── T5: rolId por defecto = 2 cuando no se envía ─────────────────────
    test('T5 ⚙️ Se asigna rolId=2 por defecto si no se envía rolId', async () => {
        Usuario.findOne.mockResolvedValue(null);
        Usuario.create.mockResolvedValue({
            id: 'uuid-def',
            nombre: 'Randy Test',
            email: 'randy@test.com',
            rolId: 2,
        });

        await request(app)
            .post('/api/auth/register')
            .send(usuarioValido); // Sin rolId en el body

        // Verificamos que Usuario.create fue llamado con rolId: 2
        expect(Usuario.create).toHaveBeenCalledWith(
            expect.objectContaining({ rolId: 2 })
        );
    });

});
