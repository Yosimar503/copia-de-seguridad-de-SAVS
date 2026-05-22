'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    static associate(models) {
      Promotion.belongsToMany(models.Auto, {
        through: models.PromotionVehicle,
        foreignKey: 'promotionId',
        otherKey: 'autoId',
        as: 'vehiculos'
      });
      Promotion.hasMany(models.PromotionVehicle, { foreignKey: 'promotionId', as: 'enlaces' });
    }
  }
  Promotion.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    descuento_pct: DataTypes.DECIMAL(5, 2),
    fecha_inicio: DataTypes.DATEONLY,
    fecha_fin: DataTypes.DATEONLY,
    activa: DataTypes.BOOLEAN,
    imagen: DataTypes.STRING
  }, { sequelize, modelName: 'Promotion', tableName: 'Promotions' });
  return Promotion;
};
