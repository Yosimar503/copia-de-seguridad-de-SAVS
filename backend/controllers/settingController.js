/**
 * Controlador de Configuraciones (Settings)
 * Maneja variables globales o configuraciones dinámicas del sistema (ej: tasas de interés, correos de contacto).
 */
const { Setting } = require('../models');

/**
 * Obtiene todas las configuraciones globales registradas en el sistema.
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Setting.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene una configuración específica mediante su clave (key).
 * Útil para obtener un valor concreto (ej: req.params.key = "TAX_RATE").
 */
exports.getByKey = async (req, res) => {
    try {
        const data = await Setting.findOne({ where: { key: req.params.key } });
        if (data) res.json(data.value);
        else res.status(404).json({ error: 'No encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea o actualiza una configuración global.
 * Si la clave (key) ya existe, actualiza su valor. Si no, crea un nuevo registro.
 */
exports.createOrUpdate = async (req, res) => {
    try {
        const { key, value } = req.body;
        const [setting, created] = await Setting.findOrCreate({
            where: { key },
            defaults: { value }
        });
        
        if (!created) {
            setting.value = value;
            await setting.save();
        }
        
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
