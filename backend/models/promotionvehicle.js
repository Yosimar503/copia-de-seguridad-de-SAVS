'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromotionVehicle extends Model {
    static associate(models) {
      PromotionVehicle.belongsTo(models.Promotion, { foreignKey: 'promotionId', as: 'promocion' });
      PromotionVehicle.belongsTo(models.Auto, { foreignKey: 'autoId', as: 'vehiculo' });
    }
  }
  PromotionVehicle.init({
    promotionId: DataTypes.INTEGER,
    autoId: DataTypes.STRING
  }, { sequelize, modelName: 'PromotionVehicle', tableName: 'PromotionVehicles' });
  return PromotionVehicle;
};
