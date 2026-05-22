const router = require('express').Router();
const c = require('../../controllers/reportController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/dashboard', verificarToken, esAdminOGerente, c.dashboard);
router.get('/history', verificarToken, esAdminOGerente, c.history);
router.post('/generate', verificarToken, esAdminOGerente, c.generate);

module.exports = router;
