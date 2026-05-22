'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('PromotionVehicles', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      promotionId: { type: S.INTEGER, references: { model: 'Promotions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      autoId: { type: S.STRING, references: { model: 'Autos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
    await qi.addIndex('PromotionVehicles', ['promotionId', 'autoId'], { unique: true, name: 'promo_auto_unique' });
  },
  async down(qi) { await qi.dropTable('PromotionVehicles'); }
};
