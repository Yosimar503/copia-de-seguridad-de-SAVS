const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);
router.post('/', verificarToken, esAdmin, branchController.create);
router.put('/:id', verificarToken, esAdmin, branchController.update);
router.patch('/:id', verificarToken, esAdmin, branchController.update);
router.delete('/:id', verificarToken, esAdmin, branchController.remove);

module.exports = router;
