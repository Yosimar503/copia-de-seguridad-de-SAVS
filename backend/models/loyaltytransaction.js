'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoyaltyTransaction extends Model {
    static associate(models) {
      LoyaltyTransaction.belongsTo(models.LoyaltyAccount, { foreignKey: 'loyaltyAccountId', as: 'cuenta' });
    }
  }
  LoyaltyTransaction.init({
    loyaltyAccountId: DataTypes.INTEGER,
    puntos: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    referencia: DataTypes.STRING
  }, { sequelize, modelName: 'LoyaltyTransaction', tableName: 'LoyaltyTransactions' });
  return LoyaltyTransaction;
};
