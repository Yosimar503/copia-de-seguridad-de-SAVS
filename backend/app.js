const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// --- SEGURIDAD AVANZADA ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Aumentado de 100 a 1000 para evitar bloqueos en auditoría
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
});
app.use('/api/', limiter);

// Limitador de auth (más permisivo para pruebas)
if (process.env.NODE_ENV !== 'test') {
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 50, // Aumentado de 10 a 50
        message: 'Demasiados intentos de acceso, su IP ha sido bloqueada temporalmente por seguridad.'
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
}

// Middlewares estándar
app.use(cors({
    origin: true, // Permitir cualquier origen en desarrollo para evitar errores de red por IP/Port mismatch
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Servir archivos estáticos (imágenes subidas con Multer)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API v1 (módulos nuevos)
app.use('/api/v1', require('./routes/v1'));

// Rutas legacy /api/*
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/sale_requests', require('./routes/saleRequests'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/technical_glossary', require('./routes/technicalGlossary'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/points', require('./routes/points'));

app.get('/', (req, res) => {
    res.json({ message: '🚗 API del Sistema de Venta de Autos en línea', version: 'v1' });
});

// --- MANEJO DE ERRORES DE MULTER ---
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido (5 MB).' });
        }
        return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err.message && err.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// --- MANEJO DE ERRORES CENTRALIZADO ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app;
