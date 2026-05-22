const router = require('express').Router();
const c = require('../../controllers/appointmentController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/', verificarToken, c.list);
router.post('/', verificarToken, c.createV1);
router.put('/:id', verificarToken, c.update);
router.patch('/:id', verificarToken, c.update);
router.delete('/:id', verificarToken, c.remove);

module.exports = router;
