'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('CrmLeads', {
      id: { type: S.STRING, primaryKey: true },
      nombre: { type: S.STRING, allowNull: false },
      email: { type: S.STRING },
      telefono: { type: S.STRING },
      origen: { type: S.STRING, defaultValue: 'web' },
      estado: { type: S.STRING, defaultValue: 'nuevo' },
      usuarioId: { type: S.STRING, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      notas: { type: S.TEXT('long') },
      asignadoA: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('CrmLeads'); }
};
