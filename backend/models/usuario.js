'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, { foreignKey: 'rolId', as: 'rol' });
    }
  }
  Usuario.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    rolId: DataTypes.INTEGER,
    favorites: DataTypes.JSON,
    telefono: DataTypes.STRING,
    ubicacion: DataTypes.STRING,
    direccion_precisa: DataTypes.STRING,
    correo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};