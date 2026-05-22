const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const chatbotController = require('../controllers/chatbotController');
const { analyzeVehicleImage } = require('../services/visionService');

// ── Upload local (solo para esta ruta) ──────────────────────────────────────
// Guarda temporalmente en /tmp y lo borra después de analizarlo.
const chatUpload = multer({
    storage: multer.memoryStorage(), // guardamos en RAM, nunca tocamos disco
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipo de imagen no permitido'), false);
    }
});

// ── POST /api/chatbot ────────────────────────────────────────────────────────
// Acepta:
//   • JSON        { "message": "texto" }
//   • Multipart   FormData con "message" + "image" (archivo adjunto)
// No requiere autenticación: es público, igual que antes.
router.post('/', chatUpload.single('image'), chatbotController.chat);

// ── borrar archivo temporal si se subió uno y algo falla ─────────────────────
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'La imagen excede el tamaño máximo permitido (5 MB).' });
        }
        return res.status(400).json({ error: `Error al procesar la imagen: ${err.message}` });
    }
    if (err.message && err.message.includes('no permitido')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

module.exports = router;

