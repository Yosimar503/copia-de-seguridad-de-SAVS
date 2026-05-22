/**
 * Controlador de Sucursales (Branches)
 * Maneja todas las operaciones CRUD para las sucursales físicas de la empresa.
 */
const { Branch } = require('../models');

/**
 * Obtiene todas las sucursales registradas en la base de datos.
 * Útil para mostrar las ubicaciones en el frontend (ej. mapa o lista de sucursales).
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Branch.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene una sucursal específica por su ID.
 * Útil para ver detalles específicos de una ubicación.
 */
exports.getById = async (req, res) => {
    try {
        const data = await Branch.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea una nueva sucursal en el sistema.
 * Debe recibir los datos requeridos por el modelo Branch en el body de la petición.
 */
exports.create = async (req, res) => {
    try {
        const data = await Branch.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza los datos de una sucursal existente.
 * Busca por ID y aplica los cambios enviados en el body.
 */
exports.update = async (req, res) => {
    try {
        const [updated] = await Branch.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const data = await Branch.findByPk(req.params.id);
            res.json(data);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina una sucursal del sistema por completo.
 * Busca por ID y la remueve de la base de datos.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await Branch.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
