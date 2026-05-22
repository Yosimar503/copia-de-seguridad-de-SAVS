'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('LoyaltyTransactions', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      loyaltyAccountId: { type: S.INTEGER, references: { model: 'LoyaltyAccounts', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      puntos: { type: S.INTEGER, allowNull: false },
      tipo: { type: S.STRING, allowNull: false },
      descripcion: { type: S.STRING },
      referencia: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('LoyaltyTransactions'); }
};
