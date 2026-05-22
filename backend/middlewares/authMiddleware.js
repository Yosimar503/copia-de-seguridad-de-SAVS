const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

// Middleware para verificar si el usuario está autenticado (JWT en cookies)
exports.verificarToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_provisional');
        req.usuario = await Usuario.findByPk(decoded.id, {
            include: [{ model: Rol, as: 'rol' }]
        });

        if (!req.usuario) {
            return res.status(401).json({ error: 'Token no válido o usuario no encontrado.' });
        }

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token no válido.' });
    }
};

// Middleware para verificar si el usuario es administrador
exports.esAdmin = (req, res, next) => {
    if (!req.usuario || !req.usuario.rol || req.usuario.rol.nombre !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

// Middleware para verificar si el usuario es administrador o gerente
exports.esAdminOGerente = (req, res, next) => {
    if (!req.usuario || !req.usuario.rol || (req.usuario.rol.nombre !== 'admin' && req.usuario.rol.nombre !== 'gerente')) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrativo.' });
    }
    next();
};
