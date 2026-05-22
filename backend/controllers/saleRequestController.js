/**
 * Controlador de Solicitudes de Venta (Sale Requests)
 * Maneja las peticiones de los clientes que desean vender o dar en parte de pago (Trade-in) su vehículo.
 */
const { SaleRequest } = require('../models');

/**
 * Obtiene todas las solicitudes de venta.
 * Usado por los administradores para evaluar los vehículos ofrecidos por los clientes.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await SaleRequest.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene los detalles de una solicitud de venta específica por su ID.
 */
exports.getById = async (req, res) => {
    try {
        const data = await SaleRequest.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea una nueva solicitud de venta.
 * Se ejecuta cuando un cliente envía el formulario de "Trade In" desde la página web.
 */
exports.create = async (req, res) => {
    try {
        const data = await SaleRequest.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza el estado o información de una solicitud de venta.
 * Permite a los gerentes marcar una solicitud como "Aprobada", "Rechazada" o "En revisión".
 */
exports.update = async (req, res) => {
    try {
        const [updated] = await SaleRequest.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const data = await SaleRequest.findByPk(req.params.id);
            res.json(data);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina una solicitud de venta del sistema.
 */
exports.remove = async (req, res) => {
    try {
        const deleted = await SaleRequest.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Eliminado correctamente' });
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
