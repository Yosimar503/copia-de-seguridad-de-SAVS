const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/mine', verificarToken, appointmentController.getMine);
router.post('/', verificarToken, appointmentController.create);
router.patch('/:id/cancel', verificarToken, appointmentController.cancel);

module.exports = router;
