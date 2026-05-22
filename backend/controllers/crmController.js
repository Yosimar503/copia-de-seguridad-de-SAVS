const { CrmLead, CrmInteraction, Usuario } = require('../models');
const { isStaff } = require('../middlewares/roleHelpers');

exports.listLeads = async (req, res) => {
  const where = {};
  if (!isStaff(req.usuario)) where.usuarioId = req.usuario.id;
  if (req.query.estado) where.estado = req.query.estado;
  const leads = await CrmLead.findAll({
    where,
    include: [{ model: CrmInteraction, as: 'interacciones' }],
    order: [['createdAt', 'DESC']]
  });
  res.json(leads);
};

exports.createLead = async (req, res) => {
  if (!req.body.nombre) return res.status(400).json({ error: 'nombre requerido' });
  const lead = await CrmLead.create({
    id: req.body.id || `LEAD-${Date.now()}`,
    ...req.body,
    usuarioId: req.body.usuarioId || req.usuario?.id
  });
  res.status(201).json(lead);
};

exports.updateLead = async (req, res) => {
  const lead = await CrmLead.findByPk(req.params.id);
  if (!lead) return res.status(404).json({ error: 'No encontrado' });
  await lead.update(req.body);
  res.json(lead);
};

exports.addInteraction = async (req, res) => {
  if (!req.body.contenido) return res.status(400).json({ error: 'contenido requerido' });
  const i = await CrmInteraction.create({
    crmLeadId: req.params.id,
    tipo: req.body.tipo || 'nota',
    contenido: req.body.contenido,
    usuarioId: req.usuario.id
  });
  res.status(201).json(i);
};

exports.stats = async (req, res) => {
  const rows = await CrmLead.findAll({
    attributes: ['estado', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']],
    group: ['estado'],
    raw: true
  });
  res.json(rows);
};
