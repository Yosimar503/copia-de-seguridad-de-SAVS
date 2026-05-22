'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    static associate(models) {
      // define association here
    }
  }
  Request.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    user_name: DataTypes.STRING,
    user_email: DataTypes.STRING,
    user_phone: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    status: DataTypes.STRING,
    date: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Request',
  });
  return Request;
};