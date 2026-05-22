/**
 * Controlador de Solicitudes (Requests) Generales
 * Maneja las peticiones de contacto o información general enviadas por los usuarios.
 */
const { Request } = require('../models');

/**
 * Obtiene todas las solicitudes generales registradas en el sistema.
 * Utilizado en el panel de administración para ver la bandeja de entrada.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Request.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMine = async (req, res) => {
    try {
        const email = (req.usuario.email || req.usuario.correo || '').toLowerCase();
        const { sequelize } = require('../models');
        const data = await Request.findAll({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('user_email')),
                email
            ),
            order: [['createdAt', 'DESC']]
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene los detalles de una solicitud en específico buscando por su ID.
 */
exports.getById = async (req, res) => {
    try {
        const data = await Request.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea una nueva solicitud de información.
 * Ejecutado cuando un usuario llena el formulario de contacto en la web.
 */
exports.create = async (req, res) => {
    try {
        const data = await Request.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza una solicitud existente.
 * Permite cambiar el estado (ej: de "Pendiente" a "Atendido") desde el dashboard.
 */
exports.update = async (req, res) => {
    try {
        const [updated] = await Request.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const data = await Request.findByPk(req.params.id);
            res.json(data);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina una solicitud del sistema.
 * Usado para limpiar la bandeja de entrada de mensajes descartados o spam.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await Request.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
