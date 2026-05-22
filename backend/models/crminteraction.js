'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CrmInteraction extends Model {
    static associate(models) {
      CrmInteraction.belongsTo(models.CrmLead, { foreignKey: 'crmLeadId', as: 'lead' });
    }
  }
  CrmInteraction.init({
    crmLeadId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    contenido: DataTypes.TEXT('long'),
    usuarioId: DataTypes.STRING
  }, { sequelize, modelName: 'CrmInteraction', tableName: 'CrmInteractions' });
  return CrmInteraction;
};
