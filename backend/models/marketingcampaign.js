'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarketingCampaign extends Model {
    static associate() {}
  }
  MarketingCampaign.init({
    titulo: DataTypes.STRING,
    asunto: DataTypes.STRING,
    cuerpo: DataTypes.TEXT('long'),
    estado: DataTypes.STRING,
    destinatarios: DataTypes.INTEGER,
    enviadoEn: DataTypes.DATE,
    creadoPor: DataTypes.STRING
  }, { sequelize, modelName: 'MarketingCampaign', tableName: 'MarketingCampaigns' });
  return MarketingCampaign;
};
