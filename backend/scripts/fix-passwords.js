/**
 * Hashea contraseñas en texto plano y asegura credenciales de desarrollo.
 * Uso: node scripts/fix-passwords.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const { Usuario, Rol, sequelize } = require('../models');

const DEV_USERS = [
  { email: 'admin@thedestinyvault.com', password: 'admin', nombre: 'Administrador', rol: 'admin' },
  { email: 'gerente@thedestinyvault.com', password: 'gerente', nombre: 'Gerente General', rol: 'gerente' },
  { email: 'yosimarvv@gmail.com', password: 'yosi12345.', nombre: 'Yosimar', rol: 'Cliente' },
];

async function main() {
  await sequelize.authenticate();
  console.log('✅ Conectado a MySQL');

  const roles = {};
  for (const name of ['admin', 'gerente', 'Cliente']) {
    const [rol] = await Rol.findOrCreate({ where: { nombre: name } });
    roles[name] = rol.id;
  }

  for (const u of DEV_USERS) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(u.password, salt);
    const rolId = roles[u.rol] || roles.Cliente;
    const [user, created] = await Usuario.findOrCreate({
      where: { email: u.email },
      defaults: {
        id: u.email.replace(/[@.]/g, '_'),
        nombre: u.nombre,
        email: u.email,
        correo: u.email,
        password: hashed,
        rolId,
        favorites: [],
      },
    });
    if (!created) {
      await user.update({ password: hashed, rolId });
    }
    console.log(`🔑 ${u.email} → contraseña: ${u.password}`);
  }

  const plainUsers = await Usuario.findAll();
  let fixed = 0;
  for (const user of plainUsers) {
    if (user.password && !String(user.password).startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      await user.update({ password: await bcrypt.hash(user.password, salt) });
      fixed += 1;
    }
  }
  if (fixed) console.log(`✅ ${fixed} contraseña(s) migrada(s) a bcrypt`);

  await sequelize.close();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
