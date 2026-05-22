'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'tracking', { type: Sequelize.JSON, allowNull: true });
    await queryInterface.addColumn('Usuarios', 'puntos', { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('Usuarios', 'puntos_historial', { type: Sequelize.JSON, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Usuarios', 'tracking');
    await queryInterface.removeColumn('Usuarios', 'puntos');
    await queryInterface.removeColumn('Usuarios', 'puntos_historial');
  }
};
