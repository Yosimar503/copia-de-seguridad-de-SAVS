'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PipelineStage extends Model {
    static associate(models) {
      PipelineStage.hasMany(models.ImportTracking, { foreignKey: 'pipelineStageId', as: 'trackings' });
    }
  }
  PipelineStage.init({
    step: DataTypes.INTEGER,
    label: DataTypes.STRING,
    color: DataTypes.STRING,
    statusText: DataTypes.STRING,
    orden: DataTypes.INTEGER
  }, { sequelize, modelName: 'PipelineStage', tableName: 'PipelineStages' });
  return PipelineStage;
};
