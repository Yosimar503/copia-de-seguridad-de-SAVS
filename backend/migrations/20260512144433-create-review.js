'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: { type: Sequelize.STRING },
      avatar: { type: Sequelize.TEXT('long') },
      comment: { type: Sequelize.TEXT('long') },
      rating: { type: Sequelize.INTEGER },
      category: { type: Sequelize.STRING },
      clientType: { type: Sequelize.STRING },
      date: { type: Sequelize.STRING },
      verified: { type: Sequelize.BOOLEAN },
      userId: { type: Sequelize.STRING },
      productImage: { type: Sequelize.TEXT('long') },
      estado: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('Reviews');
  }
};