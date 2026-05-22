'use strict';
module.exports = {
  async up(qi) {
    const now = new Date();
    await qi.bulkInsert('PipelineStages', [
      { step: 1, label: 'Compra Realizada', color: '#10b981', statusText: 'Compra procesada correctamente', orden: 1, createdAt: now, updatedAt: now },
      { step: 2, label: 'En Tránsito', color: '#3b82f6', statusText: 'Vehículo en tránsito marítimo', orden: 2, createdAt: now, updatedAt: now },
      { step: 3, label: 'En Aduanas', color: '#eab308', statusText: 'En trámite aduanal', orden: 3, createdAt: now, updatedAt: now },
      { step: 4, label: 'Entrega Final', color: '#a855f7', statusText: 'Listo para entrega al cliente', orden: 4, createdAt: now, updatedAt: now }
    ]);
  },
  async down(qi) {
    await qi.bulkDelete('PipelineStages', null, {});
  }
};
