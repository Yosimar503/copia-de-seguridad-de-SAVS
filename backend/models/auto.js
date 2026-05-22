'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Auto extends Model {
    static associate(models) {
      Auto.belongsToMany(models.Promotion, {
        through: models.PromotionVehicle,
        foreignKey: 'autoId',
        otherKey: 'promotionId',
        as: 'promociones'
      });
      Auto.hasMany(models.Appointment, { foreignKey: 'autoId', as: 'citas' });
    }
  }
  Auto.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    motor: DataTypes.STRING,
    engine_size: DataTypes.STRING,
    doors: DataTypes.STRING,
    drive: DataTypes.STRING,
    passengers: DataTypes.STRING,
    steering: DataTypes.STRING,
    type: DataTypes.STRING,
    anio: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    mileage: DataTypes.STRING,
    price: DataTypes.DECIMAL(15, 2),
    precio: DataTypes.DECIMAL(15, 2),
    stock: { type: DataTypes.INTEGER, defaultValue: 1 },
    tag: DataTypes.STRING,
    tagColor: DataTypes.STRING,
    transmission: DataTypes.STRING,
    fuel: DataTypes.STRING,
    color: DataTypes.STRING,
    image: DataTypes.STRING,
    galleryPath: DataTypes.STRING,
    summary: DataTypes.TEXT,
    heroSubtitle: DataTypes.TEXT,
    performanceData: DataTypes.STRING,
    specDescriptions: DataTypes.JSON,
    features: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Auto',
  });
  return Auto;
};