const tradeIn = require('./tradeInController');
const { SaleRequest } = require('../models');

exports.getAll = tradeIn.list;

exports.getMine = async (req, res) => {
  try {
    const data = await SaleRequest.findAll({
      where: { userId: req.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = tradeIn.getById;
exports.create = tradeIn.create;
exports.update = tradeIn.update;
exports.remove = tradeIn.remove;
