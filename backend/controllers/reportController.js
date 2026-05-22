const { ReportLog, SaleRequest, Appointment, CrmLead, Auto, Usuario, LoyaltyAccount, sequelize } = require('../models');
const { toExcelBuffer, toPdfBuffer } = require('../utils/reportExport');
const { validateGenerate } = require('../utils/validateReport');

const toCsv = (rows) => {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  rows.forEach(r => lines.push(keys.map(k => JSON.stringify(r[k] ?? '')).join(',')));
  return lines.join('\n');
};

exports.dashboard = async (req, res) => {
  const [vehiculos, tradeIns, citas, leads, clientes] = await Promise.all([
    Auto.count(),
    SaleRequest.count(),
    Appointment.count(),
    CrmLead.count(),
    Usuario.count()
  ]);
  const porEstadoTradeIn = await SaleRequest.findAll({
    attributes: ['estado', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
    group: ['estado'],
    raw: true
  });
  res.json({ vehiculos, tradeIns, citas, leads, clientes, tradeInPorEstado: porEstadoTradeIn });
};

exports.generate = async (req, res) => {
  const v = validateGenerate(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { tipo, formato } = v;
  let resultado = [];
  if (tipo === 'inventario') resultado = await Auto.findAll({ raw: true });
  else if (tipo === 'trade-in') resultado = await SaleRequest.findAll({ raw: true });
  else if (tipo === 'citas') resultado = await Appointment.findAll({ raw: true });
  else if (tipo === 'crm') resultado = await CrmLead.findAll({ raw: true });
  else if (tipo === 'fidelizacion') resultado = await LoyaltyAccount.findAll({ raw: true });

  const log = await ReportLog.create({
    tipo,
    parametros: req.body,
    resultado: { count: resultado.length },
    formato,
    generadoPor: req.usuario?.id
  });

  if (formato === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}-report.csv"`);
    return res.send(toCsv(resultado));
  }
  if (formato === 'excel') {
    const buf = await toExcelBuffer(resultado, tipo);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}-report.xlsx"`);
    return res.send(Buffer.from(buf));
  }
  if (formato === 'pdf') {
    const buf = await toPdfBuffer(resultado, `Reporte ${tipo}`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}-report.pdf"`);
    return res.send(buf);
  }
  res.json({ reportId: log.id, count: resultado.length, data: resultado });
};

exports.history = async (req, res) => {
  res.json(await ReportLog.findAll({ order: [['createdAt', 'DESC']], limit: 50 }));
};
