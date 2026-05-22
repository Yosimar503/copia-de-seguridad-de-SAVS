const router = require('express').Router();
const c = require('../../controllers/loyaltyController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/me', verificarToken, c.getMe);
router.get('/user/:userId', verificarToken, c.getByUser);
router.post('/points', verificarToken, esAdminOGerente, c.addPoints);
router.post('/redeem', verificarToken, c.redeem);

module.exports = router;
