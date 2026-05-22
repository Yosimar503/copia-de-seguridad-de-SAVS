'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportLog extends Model {
    static associate() {}
  }
  ReportLog.init({
    tipo: DataTypes.STRING,
    parametros: DataTypes.JSON,
    resultado: DataTypes.JSON,
    formato: DataTypes.STRING,
    generadoPor: DataTypes.STRING
  }, { sequelize, modelName: 'ReportLog', tableName: 'ReportLogs' });
  return ReportLog;
};
