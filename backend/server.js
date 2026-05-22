const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

// ─────────────────────────────────────────────
// Base de Datos
// ─────────────────────────────────────────────
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida con éxito (Sequelize CLI).');
    })
    .catch(err => {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        console.error('   → Revisa backend/.env (DB_USER, DB_PASSWORD, DB_NAME) y que MySQL esté encendido.');
        console.error('   → Luego: npx sequelize-cli db:migrate && node seed.js && node scripts/fix-passwords.js');
    });

// ─────────────────────────────────────────────
// Arrancar servidor (solo si no estamos en entorno de test)
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
