const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);
router.post('/', verificarToken, reviewController.create);
router.put('/:id', verificarToken, esAdmin, reviewController.update);
router.patch('/:id', verificarToken, esAdmin, reviewController.update);
router.delete('/:id', verificarToken, esAdmin, reviewController.remove);

module.exports = router;
