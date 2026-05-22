'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ImportTracking extends Model {
    static associate(models) {
      ImportTracking.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      ImportTracking.belongsTo(models.PipelineStage, { foreignKey: 'pipelineStageId', as: 'etapa' });
      ImportTracking.hasMany(models.TrackingEvent, { foreignKey: 'importTrackingId', as: 'eventos' });
    }
  }
  ImportTracking.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    usuarioId: DataTypes.STRING,
    vehicleName: DataTypes.STRING,
    pipelineStageId: DataTypes.INTEGER,
    importStatus: DataTypes.INTEGER,
    estimatedDate: DataTypes.STRING,
    location: DataTypes.STRING,
    vessel: DataTypes.STRING,
    statusText: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, { sequelize, modelName: 'ImportTracking', tableName: 'ImportTrackings' });
  return ImportTracking;
};
