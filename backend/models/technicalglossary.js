'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TechnicalGlossary extends Model {
    static associate(models) {
      // define association here
    }
  }
  TechnicalGlossary.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    term: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TechnicalGlossary',
  });
  return TechnicalGlossary;
};