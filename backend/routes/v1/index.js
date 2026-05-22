const router = require('express').Router();

router.use('/tracking', require('./tracking'));
router.use('/trade-in', require('./tradeIn'));
router.use('/marketing', require('./marketing'));
router.use('/crm', require('./crm'));
router.use('/loyalty', require('./loyalty'));
router.use('/appointments', require('./appointments'));
router.use('/promotions', require('./promotions'));
router.use('/reports', require('./reports'));

router.get('/health', (req, res) => res.json({ ok: true, version: 'v1' }));

module.exports = router;
