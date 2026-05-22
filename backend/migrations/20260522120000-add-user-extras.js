'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Usuarios');
    if (!table.tracking) {
      await queryInterface.addColumn('Usuarios', 'tracking', { type: Sequelize.JSON, allowNull: true });
    }
    if (!table.puntos) {
      await queryInterface.addColumn('Usuarios', 'puntos', { type: Sequelize.INTEGER, defaultValue: 0 });
    }
    if (!table.puntos_historial) {
      await queryInterface.addColumn('Usuarios', 'puntos_historial', { type: Sequelize.JSON, allowNull: true });
    }
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Usuarios', 'tracking');
    await queryInterface.removeColumn('Usuarios', 'puntos');
    await queryInterface.removeColumn('Usuarios', 'puntos_historial');
  }
};
