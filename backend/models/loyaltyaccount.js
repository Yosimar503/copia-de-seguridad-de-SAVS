'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoyaltyAccount extends Model {
    static associate(models) {
      LoyaltyAccount.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      LoyaltyAccount.hasMany(models.LoyaltyTransaction, { foreignKey: 'loyaltyAccountId', as: 'transacciones' });
    }
  }
  LoyaltyAccount.init({
    usuarioId: DataTypes.STRING,
    puntos: DataTypes.INTEGER,
    nivel: DataTypes.STRING
  }, { sequelize, modelName: 'LoyaltyAccount', tableName: 'LoyaltyAccounts' });
  return LoyaltyAccount;
};
