const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

const { verificarToken, esAdmin, esAdminOGerente } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, esAdminOGerente, requestController.getAll);
router.get('/:id', verificarToken, esAdminOGerente, requestController.getById);
router.post('/', verificarToken, requestController.create); 
router.put('/:id', verificarToken, esAdminOGerente, requestController.update);
router.patch('/:id', verificarToken, esAdminOGerente, requestController.update);
router.delete('/:id', verificarToken, esAdmin, requestController.remove);

module.exports = router;
