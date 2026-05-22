const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const toExcelBuffer = async (rows, sheetName = 'Reporte') => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  if (!rows.length) {
    ws.addRow(['sin datos']);
    return wb.xlsx.writeBuffer();
  }
  const keys = Object.keys(rows[0]);
  ws.addRow(keys);
  rows.forEach((r) => ws.addRow(keys.map((k) => r[k] ?? '')));
  return wb.xlsx.writeBuffer();
};

const toPdfBuffer = (rows, title) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(16).text(title, { underline: true });
    doc.moveDown();
    if (!rows.length) {
      doc.fontSize(11).text('Sin datos');
    } else {
      const keys = Object.keys(rows[0]);
      rows.slice(0, 100).forEach((r, i) => {
        doc.fontSize(9).text(`${i + 1}. ${keys.map((k) => `${k}: ${r[k]}`).join(' | ')}`);
      });
      if (rows.length > 100) doc.text(`... y ${rows.length - 100} registros más`);
    }
    doc.end();
  });

module.exports = { toExcelBuffer, toPdfBuffer };
