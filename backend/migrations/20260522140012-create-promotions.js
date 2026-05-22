'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('Promotions', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      titulo: { type: S.STRING, allowNull: false },
      descripcion: { type: S.TEXT },
      descuento_pct: { type: S.DECIMAL(5, 2), defaultValue: 0 },
      fecha_inicio: { type: S.DATEONLY },
      fecha_fin: { type: S.DATEONLY },
      activa: { type: S.BOOLEAN, defaultValue: true },
      imagen: { type: S.STRING },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false }
    });
  },
  async down(qi) { await qi.dropTable('Promotions'); }
};
