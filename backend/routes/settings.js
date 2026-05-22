const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', settingController.getAll);
router.get('/:key', settingController.getByKey);
router.post('/', verificarToken, esAdmin, settingController.createOrUpdate);

module.exports = router;
