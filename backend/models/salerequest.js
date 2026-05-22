'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SaleRequest extends Model {
    static associate(models) {
      // define association here
    }
  }
  SaleRequest.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    anio: DataTypes.INTEGER,
    precio: DataTypes.DECIMAL(15, 2),
    kilometraje: DataTypes.INTEGER,
    descripcion: DataTypes.TEXT('long'),
    imagen: DataTypes.TEXT('long'),
    estado: DataTypes.STRING,
    userId: DataTypes.STRING,
    respuesta_admin: DataTypes.TEXT('long')
  }, {
    sequelize,
    modelName: 'SaleRequest',
  });
  return SaleRequest;
};