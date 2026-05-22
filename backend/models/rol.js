'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, { foreignKey: 'rolId', as: 'usuarios' });
    }
  }
  Rol.init({
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Rol',
  });
  return Rol;
};