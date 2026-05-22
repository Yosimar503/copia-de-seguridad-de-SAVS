const { toExcelBuffer, toPdfBuffer } = require('../utils/reportExport');

const rows = [
  { id: '1', marca: 'Toyota', modelo: 'Corolla' },
  { id: '2', marca: 'Honda', modelo: 'Civic' }
];

describe('reportExport', () => {
  test('toExcelBuffer genera xlsx', async () => {
    const buf = await toExcelBuffer(rows, 'Inventario');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
  });

  test('toPdfBuffer genera PDF', async () => {
    const buf = await toPdfBuffer(rows, 'Reporte test');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });

  test('vacío no falla', async () => {
    const xlsx = await toExcelBuffer([]);
    const pdf = await toPdfBuffer([], 'Vacío');
    expect(xlsx.length).toBeGreaterThan(0);
    expect(pdf.slice(0, 4).toString()).toBe('%PDF');
  });
});
