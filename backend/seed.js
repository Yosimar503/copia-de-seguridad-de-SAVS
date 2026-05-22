const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { Rol, Usuario, Auto, Review, Request, SaleRequest, Branch, TechnicalGlossary, Setting } = require('./models');

async function hashPasswordIfNeeded(plain) {
  if (!plain) return plain;
  if (typeof plain === 'string' && plain.startsWith('$2')) return plain;
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

const seedData = async () => {
    try {
        console.log('Empezando migración de datos de db.json a MySQL...');

        const rawData = fs.readFileSync(path.join(__dirname, '../frontend/db.json'), 'utf8');
        const data = JSON.parse(rawData);

        // 1. Crear Roles base
        const rolesMap = {};
        const roles = ['admin', 'gerente', 'Cliente'];
        for (const roleName of roles) {
            const [rol] = await Rol.findOrCreate({ where: { nombre: roleName } });
            rolesMap[roleName] = rol.id;
        }

        // 2. Migrar Usuarios
        if (data.users) {
            for (const u of data.users) {
                const email = (u.email || u.correo || '').toLowerCase().trim();
                const hashedPassword = await hashPasswordIfNeeded(u.password);
                const [usuario, created] = await Usuario.findOrCreate({
                    where: { id: u.id.toString() },
                    defaults: {
                        nombre: u.nombre,
                        email,
                        password: hashedPassword,
                        rolId: rolesMap[u.rol] || rolesMap['Cliente'],
                        favorites: u.favorites || [],
                        telefono: u.telefono,
                        ubicacion: u.ubicacion,
                        direccion_precisa: u.direccion_precisa,
                        correo: email
                    }
                });
                if (!created && usuario.password && !String(usuario.password).startsWith('$2')) {
                    await usuario.update({ password: hashedPassword, email, correo: email });
                }
            }
            console.log(`Migrados ${data.users.length} usuarios.`);
        }

        // 3. Migrar Autos (Vehicles)
        if (data.vehicles) {
            for (const v of data.vehicles) {
                await Auto.findOrCreate({
                    where: { id: v.id.toString() },
                    defaults: {
                        ...v,
                        marca: v.name.split(' ')[0],
                        modelo: v.name,
                        anio: v.year,
                        precio: v.price,
                        stock: 1
                    }
                });
            }
            console.log(`Migrados ${data.vehicles.length} autos.`);
        }

        // 4. Otras migraciones
        if (data.reviews) {
            for (const r of data.reviews) {
                await Review.findOrCreate({ where: { id: r.id.toString() }, defaults: r });
            }
            console.log(`Migradas ${data.reviews.length} reseñas.`);
        }

        if (data.requests) {
            for (const r of data.requests) {
                await Request.findOrCreate({ where: { id: r.id.toString() }, defaults: r });
            }
            console.log(`Migradas ${data.requests.length} solicitudes.`);
        }

        if (data.sale_requests) {
            for (const sr of data.sale_requests) {
                await SaleRequest.findOrCreate({ where: { id: sr.id.toString() }, defaults: sr });
            }
            console.log(`Migradas ${data.sale_requests.length} sale_requests.`);
        }

        if (data.branches) {
            for (const b of data.branches) {
                await Branch.findOrCreate({ where: { id: b.id.toString() }, defaults: b });
            }
            console.log(`Migradas ${data.branches.length} branches.`);
        }

        if (data.technical_glossary) {
            for (const tg of data.technical_glossary) {
                await TechnicalGlossary.findOrCreate({ where: { id: tg.id.toString() }, defaults: tg });
            }
            console.log(`Migrados ${data.technical_glossary.length} glosarios.`);
        }

        if (data.settings) {
            for (const key of Object.keys(data.settings)) {
                await Setting.findOrCreate({
                    where: { key },
                    defaults: { value: data.settings[key] }
                });
            }
            console.log(`Migradas configuraciones.`);
        }

        console.log('🎉 ¡Migración completada exitosamente!');
        process.exit();
    } catch (error) {
        console.error('❌ Error migrando datos:', error);
        process.exit(1);
    }
};

seedData();
