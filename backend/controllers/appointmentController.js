const { Appointment, Branch, Auto, Cita } = require('../models');
const { isStaff } = require('../middlewares/roleHelpers');
const crypto = require('crypto');

/* ── Legacy /api/appointments (Cita — frontend Persona 3) ── */
exports.getMine = async (req, res) => {
  try {
    const data = await Cita.findAll({
      where: { userId: req.usuario.id },
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fecha, hora, tipo_servicio, notas } = req.body;
    if (!fecha || !hora || !tipo_servicio) {
      return res.status(400).json({ error: 'fecha, hora y tipo_servicio son requeridos.' });
    }
    const data = await Cita.create({
      id: crypto.randomUUID(),
      userId: req.usuario.id,
      fecha,
      hora,
      tipo_servicio,
      notas: notas || '',
      estado: 'pendiente'
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    if (cita.userId !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    await cita.update({ estado: 'cancelada' });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── API v1 /api/v1/appointments (Appointment) ── */
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

exports.createV1 = async (req, res) => {
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
