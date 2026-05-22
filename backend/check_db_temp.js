const { Usuario, Rol } = require('./models');
async function check() {
  try {
    const count = await Usuario.count();
    const users = await Usuario.findAll({ include: [{ model: Rol, as: 'rol' }] });
    console.log('Total users:', count);
    users.forEach(u => {
      console.log(`- ${u.nombre} (ID: ${u.id}, Rol: ${u.rol ? u.rol.nombre : 'NULL'}, RolId: ${u.rolId})`);
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
