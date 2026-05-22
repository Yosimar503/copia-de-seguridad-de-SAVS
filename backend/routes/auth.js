const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verificarToken, authController.getMe);
router.post('/check-email', authController.checkEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
