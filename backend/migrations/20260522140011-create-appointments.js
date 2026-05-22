'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('Appointments', {
      id: { type: S.STRING, primaryKey: true },
      usuarioId: { type: S.STRING, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      branchId: { type: S.STRING, references: { model: 'Branches', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      autoId: { type: S.STRING, references: { model: 'Autos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      fecha: { type: S.DATEONLY, allowNull: false },
      hora: { type: S.STRING },
      motivo: { type: S.STRING },
      estado: { type: S.STRING, defaultValue: 'pendiente' },
      notas: { type: S.TEXT },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('Appointments'); }
};
