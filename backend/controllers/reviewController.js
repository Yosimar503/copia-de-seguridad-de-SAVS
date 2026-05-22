/**
 * Controlador de Reseñas (Reviews)
 * Maneja las operaciones CRUD para los testimonios y reseñas de los clientes.
 */
const { Review } = require('../models');

/**
 * Obtiene todas las reseñas almacenadas en la base de datos.
 * Normalmente usado para mostrar testimonios en la página principal o sección de reseñas.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Review.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene una reseña específica por su ID.
 */
exports.getById = async (req, res) => {
    try {
        const data = await Review.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea una nueva reseña en el sistema.
 * Útil cuando un cliente envía un testimonio desde el frontend.
 */
exports.create = async (req, res) => {
    try {
        const data = await Review.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza una reseña existente.
 * Por ejemplo, si un administrador necesita moderar o corregir un texto.
 */
exports.update = async (req, res) => {
    try {
        const [updated] = await Review.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const data = await Review.findByPk(req.params.id);
            res.json(data);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina una reseña del sistema.
 * Usado por moderadores/administradores para quitar comentarios inapropiados.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await Review.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
