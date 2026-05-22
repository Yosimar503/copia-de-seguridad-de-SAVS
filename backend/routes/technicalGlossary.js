const express = require('express');
const router = express.Router();
const technicalGlossaryController = require('../controllers/technicalGlossaryController');

const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', technicalGlossaryController.getAll);
router.get('/:id', technicalGlossaryController.getById);
router.post('/', verificarToken, esAdmin, technicalGlossaryController.create);
router.put('/:id', verificarToken, esAdmin, technicalGlossaryController.update);
router.patch('/:id', verificarToken, esAdmin, technicalGlossaryController.update);
router.delete('/:id', verificarToken, esAdmin, technicalGlossaryController.remove);

module.exports = router;
