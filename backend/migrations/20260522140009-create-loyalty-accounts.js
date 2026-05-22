'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('LoyaltyAccounts', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      usuarioId: { type: S.STRING, unique: true, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      puntos: { type: S.INTEGER, defaultValue: 0 },
      nivel: { type: S.STRING, defaultValue: 'bronce' },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('LoyaltyAccounts'); }
};
