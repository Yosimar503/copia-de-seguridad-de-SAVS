'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('TrackingEvents', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      importTrackingId: { type: S.STRING, references: { model: 'ImportTrackings', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      fromStage: { type: S.INTEGER },
      toStage: { type: S.INTEGER },
      nota: { type: S.TEXT },
      createdBy: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('TrackingEvents'); }
};
