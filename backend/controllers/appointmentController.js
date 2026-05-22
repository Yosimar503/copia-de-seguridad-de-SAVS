const { Appointment, Branch, Auto, Usuario } = require('../models');
const { isStaff } = require('../middlewares/roleHelpers');

exports.list = async (req, res) => {
  const where = isStaff(req.usuario) ? {} : { usuarioId: req.usuario.id };
  if (req.query.estado) where.estado = req.query.estado;
  const data = await Appointment.findAll({
    where,
    include: [{ model: Branch, as: 'sucursal' }, { model: Auto, as: 'vehiculo' }],
    order: [['fecha', 'ASC']]
  });
  res.json(data);
};

exports.create = async (req, res) => {
  if (!req.body.fecha) return res.status(400).json({ error: 'fecha requerida' });
  const cita = await Appointment.create({
    id: req.body.id || `CITA-${Date.now()}`,
    usuarioId: isStaff(req.usuario) ? req.body.usuarioId : req.usuario.id,
    branchId: req.body.branchId,
    autoId: req.body.autoId,
    fecha: req.body.fecha,
    hora: req.body.hora,
    motivo: req.body.motivo,
    estado: 'pendiente',
    notas: req.body.notas
  });
  res.status(201).json(cita);
};

exports.update = async (req, res) => {
  const cita = await Appointment.findByPk(req.params.id);
  if (!cita) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff(req.usuario) && cita.usuarioId !== req.usuario.id) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  await cita.update(req.body);
  res.json(cita);
};

exports.remove = async (req, res) => {
  const cita = await Appointment.findByPk(req.params.id);
  if (!cita) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff(req.usuario) && cita.usuarioId !== req.usuario.id) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  await cita.destroy();
  res.json({ message: 'Cita cancelada' });
};
