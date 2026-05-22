'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    static associate(models) {
      // define association here
    }
  }
  Branch.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    location: DataTypes.STRING,
    phone: DataTypes.STRING,
    schedule: DataTypes.STRING,
    map_embed: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Branch',
  });
  return Branch;
};