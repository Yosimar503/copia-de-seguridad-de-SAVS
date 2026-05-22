const multer = require('multer');
const path = require('path');

// ─────────────────────────────────────────────
// Configuración de almacenamiento
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        // Formato: vehiculo-<timestamp>-<random>.<ext>
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `vehiculo-${uniqueSuffix}${ext}`);
    }
});

// ─────────────────────────────────────────────
// Filtro de tipos de archivo permitidos
// ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, WebP y GIF.'), false);
    }
};

// ─────────────────────────────────────────────
// Instancia de Multer
// ─────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB máximo
    }
});

module.exports = upload;
