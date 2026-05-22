/**
 * Controlador de Usuarios (Users)
 * Maneja las operaciones CRUD del panel de administración para la gestión de usuarios, clientes y empleados.
 */
const { Usuario, Rol } = require('../models');
const bcrypt = require('bcrypt');
const { formatUser } = require('../utils/formatUser');

/**
 * Obtiene todos los usuarios registrados en el sistema.
 * Excluye las contraseñas por seguridad.
 * Utilizado por los administradores para listar clientes y personal.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Usuario.findAll({ 
            attributes: { exclude: ['password'] },
            include: [{ model: Rol, as: 'rol' }] 
        });
        res.json(data.map(formatUser));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene un usuario específico por su ID.
 * Excluye la contraseña del resultado.
 */
exports.getById = async (req, res) => {
    try {
        const data = await Usuario.findByPk(req.params.id, { 
            attributes: { exclude: ['password'] },
            include: [{ model: Rol, as: 'rol' }] 
        });
        if (data) res.json(formatUser(data));
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea un nuevo usuario de forma manual (generalmente por un administrador).
 * Si se incluye contraseña, esta es encriptada antes de guardar.
 */
exports.create = async (req, res) => {
    try {
        const userData = { ...req.body };
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const data = await Usuario.create(userData);
        const result = data.toJSON();
        delete result.password;
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza la información de un usuario existente.
 * Si la actualización incluye una nueva contraseña, esta es encriptada.
 */
exports.update = async (req, res) => {
    try {
        const userData = { ...req.body };
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const [updated] = await Usuario.update(userData, { where: { id: req.params.id } });
        if (updated) {
            const data = await Usuario.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }
            });
            res.json(formatUser(data));
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina un usuario de forma definitiva de la base de datos.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await Usuario.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
