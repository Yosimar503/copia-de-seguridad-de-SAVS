'use strict';
module.exports = {
  async up(qi, S) {
    await qi.addColumn('Usuarios', 'tracking', { type: S.JSON, allowNull: true });
  },
  async down(qi) {
    await qi.removeColumn('Usuarios', 'tracking');
  }
};
