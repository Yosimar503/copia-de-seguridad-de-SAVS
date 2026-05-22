const express = require('express');
const router = express.Router();
const saleRequestController = require('../controllers/saleRequestController');

const { verificarToken, esAdmin, esAdminOGerente } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, esAdminOGerente, saleRequestController.getAll);
router.get('/:id', verificarToken, esAdminOGerente, saleRequestController.getById);
router.post('/', verificarToken, saleRequestController.create); 
router.put('/:id', verificarToken, esAdminOGerente, saleRequestController.update);
router.patch('/:id', verificarToken, esAdminOGerente, saleRequestController.update);
router.delete('/:id', verificarToken, esAdmin, saleRequestController.remove);

module.exports = router;
