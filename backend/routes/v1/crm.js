const router = require('express').Router();
const c = require('../../controllers/crmController');
const { verificarToken, esAdminOGerente } = require('../../middlewares/authMiddleware');

router.get('/stats', verificarToken, esAdminOGerente, c.stats);
router.get('/leads', verificarToken, c.listLeads);
router.post('/leads', verificarToken, c.createLead);
router.put('/leads/:id', verificarToken, esAdminOGerente, c.updateLead);
router.post('/leads/:id/interactions', verificarToken, c.addInteraction);

module.exports = router;
