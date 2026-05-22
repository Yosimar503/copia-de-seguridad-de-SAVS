const router = require('express').Router();
const c = require('../../controllers/marketingCampaignController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

router.get('/campaigns', verificarToken, esAdminOGerente, c.list);
router.post('/campaigns', verificarToken, esAdminOGerente, c.create);
router.put('/campaigns/:id', verificarToken, esAdminOGerente, c.update);
router.delete('/campaigns/:id', verificarToken, esAdminOGerente, c.remove);
router.post('/broadcast', verificarToken, esAdminOGerente, c.broadcast);
router.get('/banners', c.getBanners);
router.post('/banners', verificarToken, esAdminOGerente, upload.single('imagen'), c.crearBanner);
router.delete('/banners/:id', verificarToken, esAdminOGerente, c.eliminarBanner);
router.post('/banners/generate-copy', verificarToken, esAdminOGerente, upload.single('imagen'), c.generateBannerCopyIA);

module.exports = router;
