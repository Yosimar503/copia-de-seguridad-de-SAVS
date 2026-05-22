const { Usuario, Rol, ImportTracking, PipelineStage, TrackingEvent } = require('../models');
const { Op } = require('sequelize');
const { formatUser } = require('../utils/formatUser');
const { isStaff } = require('../middlewares/roleHelpers');
const { AppError } = require('../utils/errors');

exports.getStages = async (req, res) => {
  const stages = await PipelineStage.findAll({ order: [['orden', 'ASC']] });
  res.json(stages);
};

exports.list = async (req, res) => {
  if (isStaff(req.usuario)) {
    const users = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'rol' }]
    });
    return res.json(users.map(formatUser).filter(u => u.tracking || u.rol === 'Cliente'));
  }
  const t = await ImportTracking.findAll({
    where: { usuarioId: req.usuario.id, activo: true },
    include: [{ model: PipelineStage, as: 'etapa' }, { model: TrackingEvent, as: 'eventos' }]
  });
  res.json({ tracking: req.usuario.tracking, importTrackings: t });
};

exports.getByUser = async (req, res) => {
  const user = await Usuario.findByPk(req.params.userId, {
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, as: 'rol' }]
  });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!isStaff(req.usuario) && req.usuario.id !== req.params.userId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  res.json(formatUser(user));
};

exports.updateUserTracking = async (req, res) => {
  const { userId } = req.params;
  if (!isStaff(req.usuario) && req.usuario.id !== userId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const user = await Usuario.findByPk(userId);
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  const tracking = req.body.tracking || req.body;
  await user.update({ tracking });
  const stage = await PipelineStage.findOne({ where: { step: tracking.importStatus || 1 } });
  const [record] = await ImportTracking.findOrCreate({
    where: { usuarioId: userId, activo: true },
    defaults: {
      id: `TRK-${userId}-${Date.now()}`,
      usuarioId: userId,
      vehicleName: tracking.vehicleName,
      importStatus: tracking.importStatus || 1,
      pipelineStageId: stage?.id,
      estimatedDate: tracking.estimatedDate,
      location: tracking.location,
      vessel: tracking.vessel,
      statusText: tracking.statusText,
      activo: true
    }
  });
  if (record && tracking.importStatus && record.importStatus !== tracking.importStatus) {
    await TrackingEvent.create({
      importTrackingId: record.id,
      fromStage: record.importStatus,
      toStage: tracking.importStatus,
      nota: 'Actualización manual',
      createdBy: req.usuario.id
    });
    await record.update({
      vehicleName: tracking.vehicleName,
      importStatus: tracking.importStatus,
      pipelineStageId: stage?.id,
      estimatedDate: tracking.estimatedDate,
      location: tracking.location,
      vessel: tracking.vessel,
      statusText: tracking.statusText
    });
  }
  res.json(formatUser(await Usuario.findByPk(userId, { include: [{ model: Rol, as: 'rol' }] })));
};

exports.createTracking = async (req, res) => {
  const uid = isStaff(req.usuario) ? req.body.usuarioId : req.usuario.id;
  if (!uid) throw new AppError('usuarioId requerido', 400);
  const stage = await PipelineStage.findOne({ where: { step: req.body.importStatus || 1 } });
  const data = await ImportTracking.create({
    id: req.body.id || `TRK-${uid}-${Date.now()}`,
    usuarioId: uid,
    vehicleName: req.body.vehicleName,
    importStatus: req.body.importStatus || 1,
    pipelineStageId: stage?.id,
    estimatedDate: req.body.estimatedDate,
    location: req.body.location,
    vessel: req.body.vessel,
    statusText: req.body.statusText,
    activo: true
  });
  if (req.body.syncUsuario !== false) {
    await Usuario.update({ tracking: req.body }, { where: { id: uid } });
  }
  res.status(201).json(data);
};
