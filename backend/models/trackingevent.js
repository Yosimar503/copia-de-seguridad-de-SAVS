'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrackingEvent extends Model {
    static associate(models) {
      TrackingEvent.belongsTo(models.ImportTracking, { foreignKey: 'importTrackingId', as: 'tracking' });
    }
  }
  TrackingEvent.init({
    importTrackingId: DataTypes.STRING,
    fromStage: DataTypes.INTEGER,
    toStage: DataTypes.INTEGER,
    nota: DataTypes.TEXT,
    createdBy: DataTypes.STRING
  }, { sequelize, modelName: 'TrackingEvent', tableName: 'TrackingEvents' });
  return TrackingEvent;
};
