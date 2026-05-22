/**
 * Controlador de Marketing y Difusión
 * Se encarga de:
 *  1. Envío masivo de correos (Resend API)
 *  2. Gestión de Banners/Anuncios promocionales del sitio web
 */
const { Resend } = require('resend');
const { Usuario } = require('../models');
const path = require('path');
const fs   = require('fs');
const { generateBannerCopy } = require('../services/visionService');
const { FACEBOOK_PAGE_URL } = require('../utils/facebookUrl');

// Inicializar Resend (usaremos la API Key del .env de forma opcional)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Envía un correo masivo a todos los usuarios registrados
 */
exports.broadcastEmail = async (req, res) => {
    try {
        const { subject, content, isHtml = true, testEmail = null } = req.body;

        if (!subject || !content) {
            return res.status(400).json({ error: 'Asunto y contenido son requeridos' });
        }

        let emailList = [];

        if (testEmail) {
            // Modo de prueba: solo al correo especificado
            emailList = [testEmail];
        } else {
            // Modo real: todos los usuarios
            const usuarios = await Usuario.findAll({
                attributes: ['email'],
            });
            emailList = usuarios.map(u => u.email).filter(email => email);
        }

        if (emailList.length === 0) {
            return res.status(404).json({ error: 'No hay destinatarios válidos' });
        }

        // 2. Enviar el correo usando Resend
        if (!resend) {
            return res.status(500).json({ error: 'El servicio de envío de correos (Resend) no está configurado (falta RESEND_API_KEY en .env)' });
        }
        const data = await resend.emails.send({
            from: 'SAVS Importadora <onboarding@resend.dev>',
            to: emailList,
            subject: subject,
            html: isHtml ? content : undefined,
            text: !isHtml ? content : undefined,
        });

        res.json({ 
            success: true, 
            message: `Correo enviado exitosamente a ${emailList.length} usuarios`,
            details: data 
        });

    } catch (error) {
        console.error('Error en Broadcast:', error);
        res.status(500).json({ error: 'Error al procesar el envío masivo' });
    }
};

// ─────────────────────────────────────────────────────────────
// BANNERS / ANUNCIOS PROMOCIONALES
// Archivo JSON simple como base de datos de banners
// ─────────────────────────────────────────────────────────────
const BANNERS_FILE = path.join(__dirname, '..', 'uploads', 'banners.json');

/** Lee el archivo JSON de banners (lo crea vacío si no existe) */
const leerBanners = () => {
    if (!fs.existsSync(BANNERS_FILE)) {
        fs.writeFileSync(BANNERS_FILE, JSON.stringify([]), 'utf8');
    }
    return JSON.parse(fs.readFileSync(BANNERS_FILE, 'utf8'));
};

/** Guarda el arreglo de banners en el archivo JSON */
const guardarBanners = (banners) => {
    fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2), 'utf8');
};

/**
 * GET /api/marketing/banners
 * Devuelve todos los banners activos (público, sin autenticación)
 */
exports.getBanners = (req, res) => {
    try {
        const banners = leerBanners().map((b) => ({ ...b, enlace: FACEBOOK_PAGE_URL }));
        res.json({ success: true, banners });
    } catch (error) {
        console.error('Error leyendo banners:', error);
        res.status(500).json({ error: 'No se pudieron cargar los anuncios.' });
    }
};

/**
 * POST /api/marketing/banners
 * Sube un nuevo banner con imagen, título y descripción
 * @access Private (Admin/Gerente)
 */
exports.crearBanner = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debes seleccionar una imagen para el anuncio.' });
        }

        const { titulo, descripcion } = req.body;
        const banners = leerBanners();

        const nuevoBanner = {
            id:          Date.now(),
            titulo:      titulo      || 'Sin título',
            descripcion: descripcion || '',
            enlace:      FACEBOOK_PAGE_URL,
            imagen:      `/uploads/${req.file.filename}`,
            fechaSubida: new Date().toLocaleDateString('es-CR')
        };

        banners.unshift(nuevoBanner); // El más nuevo aparece primero
        guardarBanners(banners);

        res.status(201).json({ success: true, message: '¡Anuncio publicado correctamente!', banner: nuevoBanner });
    } catch (error) {
        console.error('Error creando banner:', error);
        res.status(500).json({ error: 'No se pudo publicar el anuncio.' });
    }
};

/**
 * DELETE /api/marketing/banners/:id
 * Elimina un banner y su imagen del servidor
 * @access Private (Admin/Gerente)
 */
exports.eliminarBanner = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const banners = leerBanners();
        const idx = banners.findIndex(b => b.id === id);

        if (idx === -1) {
            return res.status(404).json({ error: 'Anuncio no encontrado.' });
        }

        // Eliminar el archivo de imagen del disco
        const imgPath = path.join(__dirname, '..', banners[idx].imagen);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

        banners.splice(idx, 1);
        guardarBanners(banners);

        res.json({ success: true, message: 'Anuncio eliminado correctamente.' });
    } catch (error) {
        console.error('Error eliminando banner:', error);
        res.status(500).json({ error: 'No se pudo eliminar el anuncio.' });
    }
};

/**
 * POST /api/marketing/banners/generate-copy
 * Analiza la imagen promocional y genera título y descripción sugeridos con IA.
 * @access Private (Admin/Gerente)
 */
exports.generateBannerCopyIA = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debes seleccionar una imagen para analizar.' });
        }

        const base64Data = fs.readFileSync(req.file.path, 'base64');
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        const copyText = await generateBannerCopy(base64Data, mimeType, originalName);

        // Limpiar el archivo temporal
        fs.unlink(req.file.path, () => {});

        res.json({
            success: true,
            titulo: copyText.titulo,
            descripcion: copyText.descripcion,
            enlace: FACEBOOK_PAGE_URL
        });
    } catch (error) {
        console.error('Error en generateBannerCopyIA:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: error.message || 'No se pudo generar el texto del anuncio.' });
    }
};
