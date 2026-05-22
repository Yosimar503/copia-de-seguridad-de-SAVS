'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Appointment.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'sucursal' });
      Appointment.belongsTo(models.Auto, { foreignKey: 'autoId', as: 'vehiculo' });
    }
  }
  Appointment.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    usuarioId: DataTypes.STRING,
    branchId: DataTypes.STRING,
    autoId: DataTypes.STRING,
    fecha: DataTypes.DATEONLY,
    hora: DataTypes.STRING,
    motivo: DataTypes.STRING,
    estado: DataTypes.STRING,
    notas: DataTypes.TEXT
  }, { sequelize, modelName: 'Appointment', tableName: 'Appointments' });
  return Appointment;
};
