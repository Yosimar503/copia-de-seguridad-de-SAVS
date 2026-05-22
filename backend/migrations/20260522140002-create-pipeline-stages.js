'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('PipelineStages', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      step: { type: S.INTEGER, allowNull: false, unique: true },
      label: { type: S.STRING, allowNull: false },
      color: { type: S.STRING },
      statusText: { type: S.STRING },
      orden: { type: S.INTEGER, defaultValue: 0 },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('PipelineStages'); }
};
