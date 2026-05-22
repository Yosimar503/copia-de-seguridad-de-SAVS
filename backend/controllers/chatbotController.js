/**
 * Controlador del Chatbot IA
 * Administra la comunicacion entre el usuario y la API de inteligencia artificial (Groq)
 * incluyendo el contexto del inventario actual y soporte de analisis de imagenes.
 */
const axios = require('axios');
const fs = require('fs');
const { Auto, Setting } = require('../models');
const { analyzeVehicleImage } = require('../services/visionService');

function buildSystemPrompt(inventoryContext, whatsappNumber) {
    return (
"Eres el asistente experto de IMPORTADORA SAVS, Costa Rica, especializado en venta de vehiculos importados.\n\n" +

"## IDENTIDAD Y PROPOSITO\n" +
"Tu nombre es SAVS AI Assistant. Tu funcion es brindar informacion precisa, util y profesional\n" +
"sobre autos disponibles, financiamiento, importacion y tramites de la empresa.\n" +
"Tu comunicacion es amena pero rigurosa.\n\n" +

"---\n\n" +

"## CAPACIDADES DE FORMATO\n\n" +

"El frontend renderiza todo el formato Markdown. Aprovecha estas herramientas en cada respuesta:\n\n" +

"### 1. Tablas Markdown\n" +
"Usa tablas cuando compares vehiculos, precios, caracteristicas, anos o cualquier conjunto\n" +
"de datos con filas y columnas. Sintaxis de ejemplo:\n" +
"| Modelo    | Ano | Precio      |\n" +
"|-----------|-----|-------------|\n" +
"| Kia Rio   | 2023| 12,500,000  |\n\n" +

"### 2. Documentacion estructurada (reportes, fichas, resumenes)\n" +
"Si el usuario pide un reporte, ficha tecnica o resumen:\n" +
"- Inicia con un encabezado ## o ### que describa el contenido.\n" +
"- Organiza la informacion en secciones claras con encabezados.\n" +
"- Usa tablas, negritas, listas con vinetas o numeradas.\n" +
"- Resalta con **negritas** nombres de modelos, precios y datos clave.\n" +
"- Finaliza con una nota de cierre cuando corresponda.\n\n" +

"### 3. Texto enriquecido general\n" +
"- Negritas y cursivas para enfasis.\n" +
"- Listas con vinetas (-) o numeradas (1.) cuando enumeres pasos u opciones.\n" +
"- Encabezados ## para separar temas en respuestas largas.\n" +
"- Emojis moderadamente para dar tono.\n\n" +

"---\n\n" +

"## REGLAS DE NEGOCIO Y ETIQUETAS\n\n" +

"### Analisis de imagenes\n" +
"Si el usuario envia una foto de un vehiculo, tu tarea es describirlo y estimar sus\n" +
"caracteristicas de la forma mas precisa posible basandote en lo que se ve en la imagen.\n" +
"Si puedes identificar marca, modelo, tipo, color o estado, mencionalo.\n" +
"Siempre indica al final: [WHATSAPP] para que el usuario pueda contactar a un asesor\n" +
"y consultar disponibilidad o precio.\n\n" +

"### Inventario\n" +
"- Si el modelo consultado EXISTE en el inventario: menciona nombre, ano y precio.\n" +
"  Incluye [CATALOGO] [WHATSAPP].\n" +
"- Si el modelo NO existe: informa que IMPORTADORA SAVS lo puede importar desde Corea o EE.UU.\n" +
"  Incluye [WHATSAPP].\n\n" +

"### Catalogo y WhatsApp\n" +
"- Si el usuario pregunta que autos hay o pide el catalogo: responde con un mensaje breve\n" +
"  y ameno (sin listas planas). Incluye [CATALOGO] [WHATSAPP].\n" +
"- Si el usuario quiere hablar con un humano, cerrar una venta o requiere asesoria:\n" +
"  incluye [WHATSAPP].\n" +
"- Nunca inventes numeros de telefono ni URLs distintas al WhatsApp de la empresa.\n\n" +

"### Restricciones\n" +
"- NUNCA respondas preguntas ajenas a IMPORTADORA SAVS.\n" +
"  Si te preguntan sobre clima, politica, deportes, cocina, etc. redirige educadamente:\n" +
"  \"Solo puedo ayudarte con informacion sobre autos, inventario, financiamiento e importacion \n" +
"  de IMPORTADORA SAVS.\"\n" +
"- NUNCA des precios falsos o inventario inexistente. Usa solo los datos del contexto.\n\n" +

"---\n\n" +

"## INVENTARIO DISPONIBLE\n" +
"(Contexto interno — usa estos datos para tablas y comparaciones):\n" +
inventoryContext + "\n\n" +
"WhatsApp de la empresa: " + whatsappNumber
    );
}

/**
 * Llama a Groq con un modelo de solo texto (solo message, sin imagen).
 */
async function callTextModel(systemPrompt, userMessage, apiKey) {
    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.3,
            max_tokens: 1024
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content.trim();
}

/**
 * Llama a Groq con un modelo de vision (message + image_url).
 */
async function callVisionModel(systemPrompt, userText, base64Data, mimeType, apiKey) {
    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.2-90b-vision-preview",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: { url: `data:${mimeType};base64,${base64Data}` }
                        },
                        { type: "text", text: userText }
                    ]
                }
            ],
            temperature: 0.2,
            max_tokens: 1024
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );
    return response.data.choices[0].message.content.trim();
}

exports.chat = async (req, res) => {
    try {
        // ── Aceptar tanto JSON como multipart ───────────────────────────────
        let message = '';
        let imageFile = null;

        if (req.file) {
            // Viene como multipart/form-data (con imagen)
            message = req.body.message || '';
            imageFile = req.file;
        } else {
            // Viene como application/json (solo texto, comportamiento anterior)
            message = req.body.message || '';
        }

        if (!message && !imageFile) {
            return res.status(400).json({ error: 'El mensaje o la imagen son requeridos' });
        }

        // ── Obtener contexto de la base de datos ─────────────────────────────
        const vehicles = await Auto.findAll();
        const settings = await Setting.findAll();

        const companySettings = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        const whatsappNumber = companySettings.company?.whatsapp || '+506 6476-9091';

        const inventoryContext = vehicles.length > 0
            ? vehicles.map(v => `- ${v.name} (${v.anio}) [ID: ${v.id}]: ₡${parseFloat(v.precio).toLocaleString()}.`).join('\n')
            : "Consultar inventario en la web.";

        const systemPrompt = buildSystemPrompt(inventoryContext, whatsappNumber);
        const apiKey = process.env.GROQ_API_KEY;

        let reply;

        // ── Caso 1: Hay imagen → modelo de vision ───────────────────────────
        if (imageFile) {
            const base64Data = fs.readFileSync(imageFile.path, 'base64');
            const userText = message || 'Describe este vehiculo en detalle.';

            // Paso A: analizar imagen con el modelo de vision para extraer datos estructurados
            let detectedData;
            try {
                detectedData = await analyzeVehicleImage(base64Data, imageFile.mimetype);
            } catch (e) {
                console.warn('Vision analysis failed, continuing with generic prompt:', e.message);
            }

            // Paso B: enriquecer el prompt del usuario con los datos detectados
            let enrichedUserText = userText;
            if (detectedData) {
                const detectedBlock = [
                    detectedData.name        ? `Nombre detectado: ${detectedData.name}`                   : null,
                    detectedData.marca       ? `Marca detectada: ${detectedData.marca}`                    : null,
                    detectedData.modelo      ? `Modelo detectado: ${detectedData.modelo}`                   : null,
                    detectedData.type        ? `Tipo detectado: ${detectedData.type}`                       : null,
                    detectedData.year        ? `Anio detectado: ${detectedData.year}`                       : null,
                    detectedData.color       ? `Color detectado: ${detectedData.color}`                     : null,
                    detectedData.transmission? `Transmision detectada: ${detectedData.transmission}`         : null,
                    detectedData.fuel        ? `Combustible detectado: ${detectedData.fuel}`                 : null,
                    detectedData.mileage     ? `Kilometraje detectado: ${detectedData.mileage}`              : null,
                    detectedData.motor       ? `Motor detectado: ${detectedData.motor}`                      : null,
                ].filter(Boolean).join('\n');

                if (detectedBlock) {
                    enrichedUserText =
`El usuario envia una imagen y tambien un mensaje de texto.

IMPORTANTE: antes de responder, aqui tienes los datos que un modelo de vision
detecto automaticamente de la imagen (NO los inventes, usalos como referencia):
${detectedBlock}

Mensaje del usuario: ${userText}`;
                }
            }

            reply = await callVisionModel(systemPrompt, enrichedUserText, base64Data, imageFile.mimetype, apiKey);
            fs.unlink(imageFile.path, () => {}); // borrar archivo temporal
        }
        // ── Caso 2: Solo texto → modelo de texto ────────────────────────────
        else {
            reply = await callTextModel(systemPrompt, message, apiKey);
        }

        // ── Parsear etiquetas [WHATSAPP] y [CATALOGO] ───────────────────────
        let showWhatsapp = false;
        let showCatalog    = false;

        if (reply.includes('[WHATSAPP]') || reply.toLowerCase().includes('whatsapp') || reply.toLowerCase().includes('asesor')) {
            showWhatsapp = true;
            reply = reply.replace(/\[WHATSAPP\]/gi, '').trim();
        }

        if (
            reply.includes('[CATALOGO]') ||
            reply.toLowerCase().includes('catálogo') ||
            reply.toLowerCase().includes('catalogo') ||
            reply.toLowerCase().includes('inventario') ||
            reply.toLowerCase().includes('selección actual')
        ) {
            showCatalog = true;
            reply = reply.replace(/\[CATALOGO\]/gi, '').trim();
        }

        res.json({
            reply,
            whatsapp: whatsappNumber,
            showWhatsapp,
            showCatalog
        });

    } catch (error) {
        console.error('Error en Chatbot Controller:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al procesar la respuesta de la IA' });
    }
};
