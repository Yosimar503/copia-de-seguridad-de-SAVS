'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CrmLead extends Model {
    static associate(models) {
      CrmLead.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      CrmLead.hasMany(models.CrmInteraction, { foreignKey: 'crmLeadId', as: 'interacciones' });
    }
  }
  CrmLead.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    telefono: DataTypes.STRING,
    origen: DataTypes.STRING,
    estado: DataTypes.STRING,
    usuarioId: DataTypes.STRING,
    notas: DataTypes.TEXT('long'),
    asignadoA: DataTypes.STRING
  }, { sequelize, modelName: 'CrmLead', tableName: 'CrmLeads' });
  return CrmLead;
};
