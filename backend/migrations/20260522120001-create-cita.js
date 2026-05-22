'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Citas', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.STRING },
      userId: { type: Sequelize.STRING, allowNull: false },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      hora: { type: Sequelize.STRING, allowNull: false },
      tipo_servicio: { type: Sequelize.STRING, allowNull: false },
      notas: { type: Sequelize.TEXT },
      estado: { type: Sequelize.STRING, defaultValue: 'pendiente' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Citas');
  }
};
