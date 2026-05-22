'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Branches', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      schedule: { type: Sequelize.STRING },
      map_embed: { type: Sequelize.TEXT },
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
    await queryInterface.dropTable('Branches');
  }
};