const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/mine', verificarToken, pointsController.getMine);
router.post('/redeem', verificarToken, pointsController.redeem);

module.exports = router;
