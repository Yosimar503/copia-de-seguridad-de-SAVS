const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { verificarToken, esAdminOGerente } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route POST /api/marketing/broadcast
 * @desc Enviar correo masivo a todos los usuarios
 * @access Private (Admin/Gerente)
 */
router.post('/broadcast', verificarToken, esAdminOGerente, marketingController.broadcastEmail);

// ─── Banners / Anuncios Promocionales ───────────────────────────────────────
// Público: cualquiera puede ver los banners activos
router.get('/banners', marketingController.getBanners);
// Privado: solo admin o gerente pueden crear o eliminar banners
router.post('/banners', verificarToken, esAdminOGerente, upload.single('imagen'), marketingController.crearBanner);
router.delete('/banners/:id', verificarToken, esAdminOGerente, marketingController.eliminarBanner);
router.post('/banners/generate-copy', verificarToken, esAdminOGerente, upload.single('imagen'), marketingController.generateBannerCopyIA);

module.exports = router;
