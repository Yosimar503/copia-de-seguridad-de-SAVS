const fs = require('fs');
const path = require('path');
const { sequelize, Auto, Usuario, Review, SaleRequest } = require('./models');

async function migrate() {
    try {
        console.log('🚀 Iniciando migración masiva de db.json a MySQL...');
        
        const jsonPath = path.join(__dirname, '../frontend/db.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // 1. Migrar Usuarios (importante para FKs)
        console.log('--- Migrando Usuarios ---');
        for (const u of data.users) {
            const userData = {
                id: u.id.toString(),
                nombre: u.nombre,
                email: u.email,
                correo: u.correo || u.email,
                password: u.password,
                rolId: u.rol === 'admin' ? 1 : 2, // Ajuste simple para roles
                favorites: u.favorites,
                telefono: u.telefono,
                ubicacion: u.ubicacion,
                direccion_precisa: u.direccion_precisa
            };
            await Usuario.upsert(userData);
            console.log(`✅ Usuario migrado: ${u.nombre}`);
        }

        // 2. Migrar Vehículos
        console.log('--- Migrando Vehículos ---');
        for (const v of data.vehicles) {
            const vehicleData = {
                id: v.id.toString(),
                name: v.name,
                motor: v.motor,
                engine_size: v.engine_size,
                doors: v.doors,
                drive: v.drive,
                passengers: v.passengers,
                steering: v.steering,
                type: v.type,
                year: v.year,
                mileage: v.mileage,
                price: v.price,
                transmission: v.transmission,
                fuel: v.fuel,
                color: v.color,
                image: v.image,
                summary: v.summary,
                tag: v.tag,
                tagColor: v.tagColor,
                specDescriptions: v.specDescriptions,
                features: v.features
            };
            await Auto.upsert(vehicleData);
            console.log(`✅ Vehículo migrado: ${v.name}`);
        }

        // 3. Migrar Reseñas
        console.log('--- Migrando Reseñas ---');
        for (const r of data.reviews) {
            const reviewData = {
                id: r.id.toString(),
                name: r.name,
                avatar: r.avatar,
                comment: r.comment,
                rating: r.rating,
                category: r.category,
                clientType: r.clientType,
                date: r.date,
                verified: r.verified,
                userId: r.userId,
                productImage: r.productImage,
                estado: r.estado || 'Aprobado'
            };
            await Review.upsert(reviewData);
            console.log(`✅ Reseña migrada de: ${r.name}`);
        }

        // 4. Migrar Solicitudes de Venta
        console.log('--- Migrando Solicitudes de Venta ---');
        if (data.sale_requests) {
            for (const s of data.sale_requests) {
                const saleData = {
                    id: s.id.toString(),
                    marca: s.marca,
                    modelo: s.modelo,
                    anio: s.anio,
                    precio: s.precio,
                    kilometraje: s.kilometraje,
                    descripcion: s.descripcion,
                    imagen: s.imagen,
                    estado: s.estado,
                    userId: s.userId,
                    respuesta_admin: s.respuesta_admin
                };
                await SaleRequest.upsert(saleData);
                console.log(`✅ Solicitud migrada ID: ${s.id}`);
            }
        }

        console.log('✨ Migración completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
