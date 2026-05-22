'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('CrmInteractions', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      crmLeadId: { type: S.STRING, references: { model: 'CrmLeads', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      tipo: { type: S.STRING, defaultValue: 'nota' },
      contenido: { type: S.TEXT('long') },
      usuarioId: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('CrmInteractions'); }
};
