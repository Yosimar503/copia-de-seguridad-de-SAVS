const express = require('express');
const router = express.Router();
const saleRequestController = require('../controllers/saleRequestController');

const { verificarToken, esAdmin, esAdminOGerente } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, saleRequestController.getAll);
router.get('/:id', verificarToken, saleRequestController.getById);
router.post('/', verificarToken, saleRequestController.create);
router.put('/:id', verificarToken, saleRequestController.update);
router.patch('/:id', verificarToken, saleRequestController.update);
router.delete('/:id', verificarToken, saleRequestController.remove);

module.exports = router;
