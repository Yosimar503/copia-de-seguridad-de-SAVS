const { Usuario } = require('../models');

const DEFAULT_HISTORY = [
  { id: '1', tipo: 'ganado', cantidad: 500, descripcion: 'Registro de cuenta', fecha: new Date().toISOString() }
];

exports.getMine = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'puntos', 'puntos_historial']
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      saldo: user.puntos ?? 0,
      historial: user.puntos_historial || DEFAULT_HISTORY
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.redeem = async (req, res) => {
  try {
    const { cantidad, descripcion } = req.body;
    const pts = Number(cantidad);
    if (!pts || pts <= 0) return res.status(400).json({ error: 'Cantidad inválida' });

    const user = await Usuario.findByPk(req.usuario.id);
    const saldo = user.puntos ?? 0;
    if (saldo < pts) return res.status(400).json({ error: 'Puntos insuficientes' });

    const historial = [...(user.puntos_historial || DEFAULT_HISTORY), {
      id: String(Date.now()),
      tipo: 'canjeado',
      cantidad: pts,
      descripcion: descripcion || 'Canje de puntos',
      fecha: new Date().toISOString()
    }];

    await user.update({ puntos: saldo - pts, puntos_historial: historial });
    res.json({ saldo: saldo - pts, historial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
