const { Usuario, Rol } = require('./models');
const { Op } = require('sequelize');

async function fixRoles() {
  try {
    const gerenteRol = await Rol.findOne({ where: { nombre: 'gerente' } });
    const clienteRol = await Rol.findOne({ where: { nombre: 'Cliente' } });
    
    if (!gerenteRol || !clienteRol) {
        console.error('Roles no encontrados');
        process.exit(1);
    }

    // 1. Quitar rol gerente a todos excepto los IDs indicados
    const [updatedCount] = await Usuario.update(
      { rolId: clienteRol.id },
      { 
        where: { 
          id: { [Op.notIn]: ['2', 'gerente_1'] },
          rolId: gerenteRol.id
        } 
      }
    );
    
    // 2. Asegurarse que los dos indicados SEAN gerentes
    await Usuario.update(
        { rolId: gerenteRol.id },
        { where: { id: ['2', 'gerente_1'] } }
    );

    console.log(`Roles actualizados. ${updatedCount} usuarios degradados a Cliente.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
fixRoles();
