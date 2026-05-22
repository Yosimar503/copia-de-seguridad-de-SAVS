'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SaleRequests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      marca: { type: Sequelize.STRING },
      modelo: { type: Sequelize.STRING },
      anio: { type: Sequelize.INTEGER },
      precio: { type: Sequelize.DECIMAL(15, 2) },
      kilometraje: { type: Sequelize.INTEGER },
      descripcion: { type: Sequelize.TEXT('long') },
      imagen: { type: Sequelize.TEXT('long') },
      estado: { type: Sequelize.STRING },
      userId: { type: Sequelize.STRING },
      respuesta_admin: { type: Sequelize.TEXT('long') },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SaleRequests');
  }
};