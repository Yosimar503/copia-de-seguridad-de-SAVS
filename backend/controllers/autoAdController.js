/**
 * Controlador — Auto Ad Generator
 * Recibe una imagen subida por Multer, la envia al modelo de vision de Groq
 * y devuelve los datos estructurados del vehiculo detectado.
 *
 * Flujo:
 *  1. Multer guarda el archivo en /uploads y expone req.file
 *  2. El controlador lee el archivo, lo codifica en base64
 *  3. Llama a analyzeVehicleImage(base64, mimeType)
 *  4. Devuelve el objeto con los datos del vehiculo
 *  5. En caso de error en el analisis, borra el archivo subido
 */

const fs = require('fs');
const path = require('path');
const { analyzeVehicleImage } = require('../services/visionService');

/**
 * POST /api/vehicles/auto-ad
 * Body: multipart/form-data con campo "image"
 * Headers: Authorization Bearer token (solo admin)
 *
 * @returns {data: {detectedFields: {…}, imagePath: "/uploads/vehiculo-…"}}
 */
exports.generateAutoAd = async (req, res) => {
    try {
        // ── 1. Validar que Multer entrego el archivo ──────────────────────
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No se recibio ninguna imagen. Sube un archivo con el campo "image".'
            });
        }

        const { mimetype, path: filePath, filename, originalname } = req.file;

        // ── 2. Leer y codificar la imagen en base64 ─────────────────────────
        let base64Data;
        try {
            const buf = fs.readFileSync(filePath);
            base64Data = buf.toString('base64');
        } catch (readErr) {
            return res.status(500).json({
                success: false,
                error: 'No se pudo leer la imagen subida.',
                details: readErr.message
            });
        }

        // ── 3. Llamar a la IA de vision ─────────────────────────────────────
        let detectedFields;
        try {
            detectedFields = await analyzeVehicleImage(base64Data, mimetype, originalname);
        } catch (aiErr) {
            // Borrar archivo si el analisis falla
            fs.unlink(filePath, () => {});
            return res.status(502).json({
                success: false,
                error: 'Error al analizar la imagen con la IA.',
                details: aiErr.message
            });
        }

        // ── 4. Responder con los datos detectados ───────────────────────────
        res.status(200).json({
            success: true,
            data: {
                detectedFields,
                imagePath: `/uploads/${filename}`,
                originalName: originalname
            }
        });

    } catch (error) {
        // Limpieza por si algo falla antes del paso 3
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({
            success: false,
            error: 'Error interno al generar el anuncio.',
            details: error.message
        });
    }
};
