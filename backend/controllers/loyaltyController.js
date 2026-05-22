const { LoyaltyAccount, LoyaltyTransaction, Usuario } = require('../models');
const { isStaff } = require('../middlewares/roleHelpers');

const getOrCreateAccount = async (usuarioId) => {
  const [acc] = await LoyaltyAccount.findOrCreate({
    where: { usuarioId },
    defaults: { puntos: 0, nivel: 'bronce' }
  });
  return acc;
};

exports.getMe = async (req, res) => {
  const acc = await getOrCreateAccount(req.usuario.id);
  const txs = await LoyaltyTransaction.findAll({
    where: { loyaltyAccountId: acc.id },
    order: [['createdAt', 'DESC']],
    limit: 20
  });
  res.json({ cuenta: acc, transacciones: txs });
};

exports.getByUser = async (req, res) => {
  if (!isStaff(req.usuario) && req.usuario.id !== req.params.userId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const acc = await getOrCreateAccount(req.params.userId);
  const txs = await LoyaltyTransaction.findAll({ where: { loyaltyAccountId: acc.id }, order: [['createdAt', 'DESC']] });
  res.json({ cuenta: acc, transacciones: txs });
};

exports.addPoints = async (req, res) => {
  const uid = req.body.usuarioId || req.params.userId;
  if (!isStaff(req.usuario)) return res.status(403).json({ error: 'Solo staff' });
  const puntos = parseInt(req.body.puntos, 10);
  if (!puntos) return res.status(400).json({ error: 'puntos inválidos' });
  const acc = await getOrCreateAccount(uid);
  await acc.increment('puntos', { by: puntos });
  const tx = await LoyaltyTransaction.create({
    loyaltyAccountId: acc.id,
    puntos,
    tipo: req.body.tipo || 'credito',
    descripcion: req.body.descripcion,
    referencia: req.body.referencia
  });
  res.status(201).json({ cuenta: await acc.reload(), transaccion: tx });
};

exports.redeem = async (req, res) => {
  const puntos = parseInt(req.body.puntos, 10);
  const acc = await getOrCreateAccount(req.usuario.id);
  if (acc.puntos < puntos) return res.status(400).json({ error: 'Puntos insuficientes' });
  await acc.decrement('puntos', { by: puntos });
  const tx = await LoyaltyTransaction.create({
    loyaltyAccountId: acc.id,
    puntos: -puntos,
    tipo: 'debito',
    descripcion: req.body.descripcion || 'Canje'
  });
  res.json({ cuenta: await acc.reload(), transaccion: tx });
};
