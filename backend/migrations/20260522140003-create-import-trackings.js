'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('ImportTrackings', {
      id: { type: S.STRING, primaryKey: true },
      usuarioId: { type: S.STRING, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      vehicleName: { type: S.STRING },
      pipelineStageId: { type: S.INTEGER, references: { model: 'PipelineStages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      importStatus: { type: S.INTEGER, defaultValue: 1 },
      estimatedDate: { type: S.STRING },
      location: { type: S.STRING },
      vessel: { type: S.STRING },
      statusText: { type: S.STRING },
      activo: { type: S.BOOLEAN, defaultValue: true },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('ImportTrackings'); }
};
