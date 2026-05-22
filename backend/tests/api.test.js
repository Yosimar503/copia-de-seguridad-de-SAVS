const request = require('supertest');
const app = require('../server'); // Importamos la aplicación instanciada
const { sequelize } = require('../models');

afterAll(async () => {
    await sequelize.close(); // Cerramos la conexión a la DB tras las pruebas
});

describe('Pruebas de Integración - API de Venta de Autos v1', () => {
    
    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE REQUISITOS ESTRUCTURALES
     * Valida que la aplicación backend ha sido instanciada
     * correctamente y el servidor base responde.
     * ═══════════════════════════════════════════════════════
     */
    test('Debe validar que el servidor base responde correctamente (Requisito Estructural)', async () => {
        // Arrange (Preparar datos)
        const expectedMessage = '🚗 API del Sistema de Venta de Autos en línea';

        // Act (Ejecutar la función)
        const response = await request(app).get('/');

        // Assert (Verificar resultado)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', expectedMessage);
        expect(response.body).toHaveProperty('version', 'v1');
    });

    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE CASO DE ÉXITO (LOGIN)
     * Valida el requisito funcional de inicio de sesión
     * enviando un POST a /api/login con credenciales.
     * ═══════════════════════════════════════════════════════
     */
    test('Debe iniciar sesión exitosamente y generar una cookie con el token (Caso de Éxito)', async () => {
        // Arrange (Preparar datos)
        const credentials = {
            email: 'test@example.com', // Asegúrate de que este usuario exista en tu DB de pruebas
            password: 'password123'
        };

        // Act (Ejecutar la función)
        const response = await request(app)
            .post('/api/login')
            .send(credentials);

        // Assert (Verificar resultado)
        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        // Comprobamos que la cookie contenga el nombre 'token'
        const hasTokenCookie = response.headers['set-cookie'].some(cookie => cookie.startsWith('token='));
        expect(hasTokenCookie).toBe(true);
    });

    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE RESTRICCIÓN 401 (CREAR AUTO)
     * Valida el requisito no funcional de seguridad
     * haciendo un POST a la ruta protegida /api/autos
     * sin enviar autorización.
     * ═══════════════════════════════════════════════════════
     */
    test('Debe bloquear la creación de un auto sin autorización con error 401 (Restricción de Seguridad)', async () => {
        // Arrange (Preparar datos)
        const newAuto = {
            marca: 'Tesla',
            modelo: 'Model 3',
            precio: 45000
        };

        // Act (Ejecutar la función)
        // Intentamos hacer un POST a la ruta protegida sin enviar el token de autorización
        const response = await request(app)
            .post('/api/autos')
            .send(newAuto);

        // Assert (Verificar resultado)
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE VERSIONADO DE API
     * Valida que la ruta versionada /api/v1 responde
     * correctamente igual que /api.
     * ═══════════════════════════════════════════════════════
     */
    test('Debe responder correctamente en la ruta versionada /api/v1/vehicles (Versionado)', async () => {
        // Arrange (Preparar datos)
        // No se requiere preparación adicional

        // Act (Ejecutar la función)
        const response = await request(app).get('/api/v1/vehicles');

        // Assert (Verificar resultado)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination).toHaveProperty('page');
        expect(response.body.pagination).toHaveProperty('totalPages');
    });

    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE PAGINACIÓN
     * Valida que el endpoint de vehículos respeta los
     * parámetros de paginación (page y limit).
     * ═══════════════════════════════════════════════════════
     */
    test('Debe paginar correctamente los resultados de vehículos (Paginación)', async () => {
        // Arrange (Preparar datos)
        const page = 1;
        const limit = 5;

        // Act (Ejecutar la función)
        const response = await request(app)
            .get(`/api/v1/vehicles?page=${page}&limit=${limit}`);

        // Assert (Verificar resultado)
        expect(response.status).toBe(200);
        expect(response.body.pagination.page).toBe(page);
        expect(response.body.pagination.limit).toBe(limit);
        expect(response.body.data.length).toBeLessThanOrEqual(limit);
    });

    /**
     * ═══════════════════════════════════════════════════════
     * PRUEBA DE PROTECCIÓN DE RUTA DE USUARIOS (ADMIN)
     * Valida que la ruta /api/v1/users está protegida
     * y requiere autenticación + rol admin.
     * ═══════════════════════════════════════════════════════
     */
    test('Debe bloquear el acceso a /api/v1/users sin autenticación (Seguridad Admin)', async () => {
        // Arrange (Preparar datos)
        // No se envía cookie ni token

        // Act (Ejecutar la función)
        const response = await request(app).get('/api/v1/users');

        // Assert (Verificar resultado)
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

});
