'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('MarketingCampaigns', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      titulo: { type: S.STRING, allowNull: false },
      asunto: { type: S.STRING },
      cuerpo: { type: S.TEXT('long') },
      estado: { type: S.STRING, defaultValue: 'borrador' },
      destinatarios: { type: S.INTEGER, defaultValue: 0 },
      enviadoEn: { type: S.DATE },
      creadoPor: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('MarketingCampaigns'); }
};
