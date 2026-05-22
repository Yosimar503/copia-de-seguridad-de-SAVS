'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('ReportLogs', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      tipo: { type: S.STRING, allowNull: false },
      parametros: { type: S.JSON },
      resultado: { type: S.JSON },
      formato: { type: S.STRING, defaultValue: 'json' },
      generadoPor: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('ReportLogs'); }
};
