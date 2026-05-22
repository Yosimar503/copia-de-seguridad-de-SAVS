'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      user_name: { type: Sequelize.STRING },
      user_email: { type: Sequelize.STRING },
      user_phone: { type: Sequelize.STRING },
      subject: { type: Sequelize.STRING },
      message: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING },
      date: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('Requests');
  }
};