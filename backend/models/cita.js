'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cita extends Model {
    static associate() {}
  }
  Cita.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: DataTypes.STRING,
    fecha: DataTypes.DATEONLY,
    hora: DataTypes.STRING,
    tipo_servicio: DataTypes.STRING,
    notas: DataTypes.TEXT,
    estado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cita',
  });
  return Cita;
};
