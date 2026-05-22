const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const autoAdController = require('../controllers/autoAdController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Rutas públicas (lectura)
router.get('/', vehicleController.getAll);
router.get('/:id', vehicleController.getById);

// ─── RUTA DE ANUNCIO AUTOMATICO ───────────────────────────────────────────
// POST /api/vehicles/auto-ad
// Recibe una imagen, la analiza con IA de vision y devuelve los datos detectados.
// Requiere autenticacion de admin (igual que crear/editar).
router.post('/auto-ad', verificarToken, esAdmin, upload.single('image'), autoAdController.generateAutoAd);

// Rutas protegidas (escritura) — requiere admin + soporte de upload de imagen
router.post('/', verificarToken, esAdmin, upload.single('image'), vehicleController.create);
router.put('/:id', verificarToken, esAdmin, upload.single('image'), vehicleController.update);
router.patch('/:id', verificarToken, esAdmin, upload.single('image'), vehicleController.update);
router.delete('/:id', verificarToken, esAdmin, vehicleController.remove);

module.exports = router;
