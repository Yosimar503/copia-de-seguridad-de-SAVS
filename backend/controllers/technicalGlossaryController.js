/**
 * Controlador del Glosario Técnico
 * Maneja los términos y definiciones técnicas relacionadas a vehículos que ayudan a los usuarios.
 */
const { TechnicalGlossary } = require('../models');

/**
 * Obtiene todos los términos técnicos registrados.
 * Utilizado para mostrar un diccionario o listado de ayuda a los clientes.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await TechnicalGlossary.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene un término técnico específico por su ID.
 */
exports.getById = async (req, res) => {
    try {
        const data = await TechnicalGlossary.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea un nuevo término en el glosario.
 * Usado por los administradores para enriquecer la base de conocimientos.
 */
exports.create = async (req, res) => {
    try {
        const data = await TechnicalGlossary.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza la definición o el nombre de un término técnico existente.
 */
exports.update = async (req, res) => {
    try {
        const [updated] = await TechnicalGlossary.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const data = await TechnicalGlossary.findByPk(req.params.id);
            res.json(data);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina un término del glosario.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await TechnicalGlossary.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
