const { Promotion, PromotionVehicle, Auto } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  const where = { activa: true };
  if (req.query.all === '1') delete where.activa;
  const promos = await Promotion.findAll({
    where,
    include: [{ model: Auto, as: 'vehiculos', through: { attributes: [] } }],
    order: [['createdAt', 'DESC']]
  });
  res.json(promos);
};

exports.create = async (req, res) => {
  if (!req.body.titulo) return res.status(400).json({ error: 'titulo requerido' });
  const promo = await Promotion.create(req.body);
  if (req.body.autoIds?.length) {
    await PromotionVehicle.bulkCreate(req.body.autoIds.map(autoId => ({ promotionId: promo.id, autoId })));
  }
  res.status(201).json(await Promotion.findByPk(promo.id, { include: [{ model: Auto, as: 'vehiculos' }] }));
};

exports.update = async (req, res) => {
  const promo = await Promotion.findByPk(req.params.id);
  if (!promo) return res.status(404).json({ error: 'No encontrado' });
  await promo.update(req.body);
  res.json(promo);
};

exports.remove = async (req, res) => {
  const promo = await Promotion.findByPk(req.params.id);
  if (!promo) return res.status(404).json({ error: 'No encontrado' });
  await promo.destroy();
  res.json({ message: 'Eliminado' });
};

exports.forCatalog = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const promos = await Promotion.findAll({
    where: {
      activa: true,
      [Op.or]: [
        { fecha_inicio: null },
        { fecha_inicio: { [Op.lte]: today } }
      ]
    },
    include: [{ model: Auto, as: 'vehiculos', attributes: ['id', 'marca', 'modelo', 'precio', 'price'], through: { attributes: ['promotionId'] } }]
  });
  const map = {};
  promos.forEach(p => {
    p.vehiculos?.forEach(v => {
      map[v.id] = { promotionId: p.id, titulo: p.titulo, descuento_pct: p.descuento_pct };
    });
  });
  res.json({ promociones: promos, porVehiculo: map });
};
