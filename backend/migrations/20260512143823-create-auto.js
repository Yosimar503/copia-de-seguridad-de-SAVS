'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Autos', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: { type: Sequelize.STRING },
      marca: { type: Sequelize.STRING },
      modelo: { type: Sequelize.STRING },
      motor: { type: Sequelize.STRING },
      engine_size: { type: Sequelize.STRING },
      doors: { type: Sequelize.STRING },
      drive: { type: Sequelize.STRING },
      passengers: { type: Sequelize.STRING },
      steering: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      anio: { type: Sequelize.INTEGER },
      year: { type: Sequelize.INTEGER },
      mileage: { type: Sequelize.STRING },
      price: { type: Sequelize.DECIMAL(15, 2) },
      precio: { type: Sequelize.DECIMAL(15, 2) },
      stock: { type: Sequelize.INTEGER, defaultValue: 1 },
      tag: { type: Sequelize.STRING },
      tagColor: { type: Sequelize.STRING },
      transmission: { type: Sequelize.STRING },
      fuel: { type: Sequelize.STRING },
      color: { type: Sequelize.STRING },
      image: { type: Sequelize.TEXT('long') },
      galleryPath: { type: Sequelize.STRING },
      summary: { type: Sequelize.TEXT('long') },
      heroSubtitle: { type: Sequelize.TEXT('long') },
      performanceData: { type: Sequelize.STRING },
      specDescriptions: { type: Sequelize.JSON },
      features: { type: Sequelize.JSON },
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
    await queryInterface.dropTable('Autos');
  }
};