const TIPOS = ['inventario', 'trade-in', 'citas', 'crm', 'fidelizacion'];
const FORMATOS = ['json', 'csv', 'excel', 'pdf'];

exports.validateGenerate = (body = {}) => {
  const tipo = body.tipo || 'inventario';
  const formato = body.formato || 'json';
  if (!TIPOS.includes(tipo)) return { ok: false, error: 'tipo de reporte no válido' };
  if (!FORMATOS.includes(formato)) return { ok: false, error: 'formato no válido' };
  return { ok: true, tipo, formato };
};
