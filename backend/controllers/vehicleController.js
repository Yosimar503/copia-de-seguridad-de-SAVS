/**
 * Controlador de Vehículos (Autos)
 * Centraliza la lógica para gestionar el inventario de la empresa, incluyendo 
 * subida de imágenes, paginación, filtros avanzados y búsquedas dinámicas.
 */
const { Auto } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/vehicles
 * Soporta paginación, búsqueda, filtros y ordenamiento vía query params.
 *
 * Query params disponibles:
 *   - page (int)        → Página actual (default: 1)
 *   - limit (int)       → Resultados por página (default: 20, max: 100)
 *   - search (string)   → Búsqueda por nombre, marca, modelo o motor
 *   - type (string)     → Filtro por tipo de vehículo (SUV, Sedán, etc.)
 *   - fuel (string)     → Filtro por combustible
 *   - transmission (string) → Filtro por transmisión
 *   - tag (string)      → Filtro por etiqueta (Disponible, Vendido, etc.)
 *   - color (string)    → Filtro por color
 *   - minPrice (number) → Precio mínimo
 *   - maxPrice (number) → Precio máximo
 *   - minYear (number)  → Año mínimo
 *   - maxYear (number)  → Año máximo
 *   - sort (string)     → Campo por el cual ordenar (price, year, name, createdAt)
 *   - order (string)    → Dirección del orden (ASC o DESC, default: DESC)
 */
exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            type,
            fuel,
            transmission,
            tag,
            color,
            minPrice,
            maxPrice,
            minYear,
            maxYear,
            sort = 'createdAt',
            order = 'DESC'
        } = req.query;

        // Sanitizar paginación
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Construir condiciones WHERE dinámicas
        const where = {};

        // Búsqueda por texto libre (nombre, marca, modelo, motor)
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { marca: { [Op.like]: `%${search}%` } },
                { modelo: { [Op.like]: `%${search}%` } },
                { motor: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filtros exactos
        if (type) where.type = type;
        if (fuel) where.fuel = fuel;
        if (transmission) where.transmission = transmission;
        if (tag) where.tag = tag;
        if (color) where.color = { [Op.like]: `%${color}%` };

        // Filtros de rango de precio
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Filtros de rango de año
        if (minYear || maxYear) {
            where[Op.and] = where[Op.and] || [];
            if (minYear) {
                where[Op.and].push({
                    [Op.or]: [
                        { year: { [Op.gte]: parseInt(minYear) } },
                        { anio: { [Op.gte]: parseInt(minYear) } }
                    ]
                });
            }
            if (maxYear) {
                where[Op.and].push({
                    [Op.or]: [
                        { year: { [Op.lte]: parseInt(maxYear) } },
                        { anio: { [Op.lte]: parseInt(maxYear) } }
                    ]
                });
            }
        }

        // Construir ordenamiento seguro
        const allowedSortFields = ['price', 'precio', 'year', 'anio', 'name', 'createdAt', 'updatedAt', 'marca', 'modelo'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Ejecutar consulta con paginación
        const { count, rows } = await Auto.findAndCountAll({
            where,
            limit: limitNum,
            offset,
            order: [[sortField, sortOrder]]
        });

        // Respuesta con metadatos de paginación
        res.json({
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
                hasNextPage: pageNum < Math.ceil(count / limitNum),
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno al listar los vehículos' });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Auto.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno al obtener el vehículo' });
    }
};

/**
 * POST /api/vehicles
 * Acepta JSON o multipart/form-data (con imagen vía Multer).
 * Si se envía un archivo, se guarda en /uploads y se almacena la ruta en el campo 'image'.
 */
exports.create = async (req, res) => {
    try {
        // Validación de campos requeridos
        const requiredFields = ['name', 'price', 'year'];
        const missing = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);
        if (missing.length > 0) {
            // Si se subió un archivo pero faltan campos, limpiarlo
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            return res.status(400).json({ 
                error: `Campos requeridos faltantes: ${missing.join(', ')}` 
            });
        }

        const vehicleData = { ...req.body };

        // Si se subió una imagen con Multer, guardar la ruta relativa
        if (req.file) {
            vehicleData.image = `/uploads/${req.file.filename}`;
        }

        const data = await Auto.create(vehicleData);
        res.status(201).json(data);
    } catch (error) {
        // Limpiar archivo si la creación falla
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: error.message });
    }
};

/**
 * PUT/PATCH /api/vehicles/:id
 * Acepta JSON o multipart/form-data (con imagen vía Multer).
 * Si se envía una nueva imagen, elimina la anterior del disco.
 */
exports.update = async (req, res) => {
    try {
        const vehicleData = { ...req.body };

        // Si se subió una nueva imagen, actualizar la ruta y eliminar la vieja
        if (req.file) {
            vehicleData.image = `/uploads/${req.file.filename}`;

            // Intentar eliminar la imagen anterior del disco
            const existingVehicle = await Auto.findByPk(req.params.id);
            if (existingVehicle && existingVehicle.image && existingVehicle.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', existingVehicle.image);
                fs.unlink(oldPath, () => {}); // Silenciar error si no existe
            }
        }

        const [updated] = await Auto.update(vehicleData, { where: { id: req.params.id } });
        if (updated) {
            const data = await Auto.findByPk(req.params.id);
            res.json(data);
        } else {
            // Limpiar archivo si el vehículo no existe
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        // Obtener el vehículo antes de eliminarlo para limpiar su imagen
        const vehicle = await Auto.findByPk(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'No encontrado' });
        }

        // Eliminar imagen del disco si es local
        if (vehicle.image && vehicle.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', vehicle.image);
            fs.unlink(imagePath, () => {});
        }

        await vehicle.destroy();
        res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno al eliminar el vehículo' });
    }
};
