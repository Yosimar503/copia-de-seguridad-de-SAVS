/**
 * Sincroniza Usuarios.tracking (JSON) → ImportTrackings
 * Uso: node scripts/migrate-tracking-data.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Usuario, ImportTracking, PipelineStage } = require('../models');

(async () => {
  const stages = await PipelineStage.findAll();
  const byStep = Object.fromEntries(stages.map(s => [s.step, s.id]));
  const users = await Usuario.findAll({ where: {} });
  let n = 0;
  for (const u of users) {
    if (!u.tracking?.vehicleName) continue;
    const t = u.tracking;
    await ImportTracking.findOrCreate({
      where: { usuarioId: u.id, activo: true },
      defaults: {
        id: `TRK-${u.id}`,
        usuarioId: u.id,
        vehicleName: t.vehicleName,
        importStatus: t.importStatus || 1,
        pipelineStageId: byStep[t.importStatus] || null,
        estimatedDate: t.estimatedDate,
        location: t.location,
        vessel: t.vessel,
        statusText: t.statusText,
        activo: true
      }
    });
    n++;
  }
  console.log(`Migrados ${n} trackings.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
