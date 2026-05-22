const router = require('express').Router();
const c = require('../../controllers/tradeInController');
const { verificarToken, esAdmin, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/', verificarToken, c.list);
router.get('/:id', verificarToken, c.getById);
router.post('/', verificarToken, c.create);
router.put('/:id', verificarToken, c.update);
router.patch('/:id', verificarToken, c.update);
router.delete('/:id', verificarToken, c.remove);

module.exports = router;
