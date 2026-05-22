const router = require('express').Router();
const c = require('../../controllers/trackingController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/stages', c.getStages);
router.get('/', verificarToken, c.list);
router.get('/user/:userId', verificarToken, c.getByUser);
router.patch('/user/:userId', verificarToken, c.updateUserTracking);
router.post('/', verificarToken, c.createTracking);

module.exports = router;
