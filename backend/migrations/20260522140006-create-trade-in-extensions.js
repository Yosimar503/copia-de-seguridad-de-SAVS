'use strict';
module.exports = {
  async up(qi, S) {
    await qi.addColumn('SaleRequests', 'vin', { type: S.STRING, allowNull: true });
    await qi.addColumn('SaleRequests', 'placa', { type: S.STRING, allowNull: true });
    await qi.addColumn('SaleRequests', 'tipo_vehiculo', { type: S.STRING, allowNull: true });
    await qi.addColumn('SaleRequests', 'valor_estimado', { type: S.DECIMAL(15, 2), allowNull: true });
  },
  async down(qi) {
    await qi.removeColumn('SaleRequests', 'vin');
    await qi.removeColumn('SaleRequests', 'placa');
    await qi.removeColumn('SaleRequests', 'tipo_vehiculo');
    await qi.removeColumn('SaleRequests', 'valor_estimado');
  }
};
