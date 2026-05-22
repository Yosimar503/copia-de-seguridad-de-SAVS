const { MarketingCampaign } = require('../models');
const marketingController = require('./marketingController');

exports.list = async (req, res) => {
  res.json(await MarketingCampaign.findAll({ order: [['createdAt', 'DESC']] }));
};

exports.create = async (req, res) => {
  if (!req.body.titulo) return res.status(400).json({ error: 'titulo requerido' });
  const c = await MarketingCampaign.create({
    ...req.body,
    creadoPor: req.usuario?.id,
    estado: req.body.estado || 'borrador'
  });
  res.status(201).json(c);
};

exports.update = async (req, res) => {
  const c = await MarketingCampaign.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  await c.update(req.body);
  res.json(c);
};

exports.remove = async (req, res) => {
  const c = await MarketingCampaign.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  await c.destroy();
  res.json({ message: 'Eliminado' });
};

exports.broadcast = marketingController.broadcastEmail;
exports.getBanners = marketingController.getBanners;
exports.crearBanner = marketingController.crearBanner;
exports.eliminarBanner = marketingController.eliminarBanner;
exports.generateBannerCopyIA = marketingController.generateBannerCopyIA;
