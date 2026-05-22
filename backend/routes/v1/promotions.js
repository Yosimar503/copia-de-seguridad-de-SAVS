const router = require('express').Router();
const c = require('../../controllers/promotionController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/catalog', c.forCatalog);
router.get('/', c.list);
router.post('/', verificarToken, esAdminOGerente, c.create);
router.put('/:id', verificarToken, esAdminOGerente, c.update);
router.delete('/:id', verificarToken, esAdminOGerente, c.remove);

module.exports = router;
