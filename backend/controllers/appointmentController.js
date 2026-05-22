const { Cita } = require('../models');
const crypto = require('crypto');

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
