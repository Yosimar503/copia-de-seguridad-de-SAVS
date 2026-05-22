const { SaleRequest } = require('../models');
const { isStaff } = require('../middlewares/roleHelpers');

const owns = (req, row) => String(row.userId) === String(req.usuario.id);

exports.list = async (req, res) => {
  if (isStaff(req.usuario)) {
    return res.json(await SaleRequest.findAll({ order: [['createdAt', 'DESC']] }));
  }
  res.json(await SaleRequest.findAll({
    where: { userId: req.usuario.id },
    order: [['createdAt', 'DESC']]
  }));
};

exports.getById = async (req, res) => {
  const row = await SaleRequest.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff(req.usuario) && !owns(req, row)) return res.status(403).json({ error: 'Acceso denegado' });
  res.json(row);
};

exports.create = async (req, res) => {
  const body = { ...req.body, userId: isStaff(req.usuario) ? req.body.userId : req.usuario.id };
  if (!body.marca || !body.modelo) return res.status(400).json({ error: 'marca y modelo requeridos' });
  body.id = body.id || `TI-${Date.now()}`;
  body.estado = body.estado || 'Pendiente';
  const data = await SaleRequest.create(body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const row = await SaleRequest.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff(req.usuario) && !owns(req, row)) return res.status(403).json({ error: 'Acceso denegado' });
  if (!isStaff(req.usuario)) delete req.body.estado;
  await row.update(req.body);
  res.json(await row.reload());
};

exports.remove = async (req, res) => {
  const row = await SaleRequest.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff(req.usuario) && !owns(req, row)) return res.status(403).json({ error: 'Acceso denegado' });
  await row.destroy();
  res.json({ message: 'Eliminado' });
};
