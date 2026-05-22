'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // define association here
    }
  }
  Review.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    avatar: DataTypes.TEXT('long'),
    comment: DataTypes.TEXT('long'),
    rating: DataTypes.INTEGER,
    category: DataTypes.STRING,
    clientType: DataTypes.STRING,
    date: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
    userId: DataTypes.STRING,
    productImage: DataTypes.TEXT('long'),
    estado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};