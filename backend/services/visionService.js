/**
 * Vision Service — IA de análisis de imágenes de vehículos
 *
 * Usa la API de OpenAI-compatible de Groq con un modelo multimodal
 * (llama-3.2-90b-vision-preview) para extraer datos estructurados
 * de una foto de vehículo y devolverlos en formato listo para guardar en el modelo Auto.
 * 
 * Cuenta con un analizador de nombres de archivos local inteligente como fallback
 * por si no está configurada la GROQ_API_KEY o si el servicio externo falla.
 */

const axios = require('axios');
const crypto = require('crypto');

const randomPick = (arr) => arr[crypto.randomInt(0, arr.length)];

// Listas de datos para el analizador de metadatos local (Fallback)
const BRANDS = [
    'Toyota', 'Hyundai', 'Kia', 'Nissan', 'Suzuki', 'Honda', 'Mitsubishi', 'Mazda', 
    'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Jeep', 'BYD', 'Lexus', 'Audi', 'Volkswagen',
    'Subaru', 'Isuzu', 'Peugeot', 'Fiat', 'Volvo', 'Land Rover', 'Chery', 'Geely'
];

const MODELS = {
    'toyota': ['Corolla', 'Yaris', 'Hilux', 'Rav4', 'Prado', 'Land Cruiser', 'Fortuner', 'Rush', 'Agya', 'Raize', 'Tacoma', 'Tundra'],
    'hyundai': ['Tucson', 'Accent', 'Elantra', 'Creta', 'Santa Fe', 'Grand I10', 'I10', 'Kona', 'Venue', 'H1'],
    'kia': ['Sportage', 'Sorento', 'Rio', 'Picanto', 'Soluto', 'Cerato', 'Stonic', 'K2700', 'Bongo'],
    'nissan': ['Qashqai', 'Frontier', 'Sentra', 'Kicks', 'X-Trail', 'Versa', 'March', 'Pathfinder', 'Navara'],
    'suzuki': ['Swift', 'Vitara', 'Jimny', 'Grand Vitara', 'S-Cross', 'Alto', 'Baleno', 'Ertiga', 'Dzire'],
    'honda': ['Civic', 'CRV', 'HRV', 'Fit', 'Pilot', 'City'],
    'mitsubishi': ['Montero', 'L200', 'Outlander', 'ASX', 'Eclipse Cross', 'Mirage'],
    'mazda': ['CX-5', 'CX-3', 'CX-30', 'CX-9', 'Mazda 3', 'Mazda 2', 'BT-50'],
    'ford': ['Ranger', 'Explorer', 'F-150', 'Escape', 'EcoSport', 'Everest'],
    'chevrolet': ['Colorado', 'Tracker', 'Captiva', 'Spark', 'Aveo', 'Onix'],
    'jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade'],
    'byd': ['S1', 'Tang', 'Han', 'Yuan Pro', 'Yuan Plus', 'Dolphin', 'Seal'],
    'isuzu': ['D-Max', 'Dmax', 'MU-X']
};

const COLORS = [
    'Rojo', 'Azul', 'Negro', 'Blanco', 'Gris', 'Plata', 'Verde', 'Dorado', 
    'Amarillo', 'Beige', 'Celeste', 'Café', 'Gris Plata', 'Blanco Perla'
];

const GENERIC_PROMOS = [
    { titulo: '🔥 ¡El que buscás, llegó!', descripcion: 'Seminuevo premium, financiamiento flexible y entrega express. ¡Cotizá en Facebook!' },
    { titulo: '⚡ Oferta que vuela', descripcion: 'Unidad impecable, precio imbatible. ¡Escribinos por FB y agendá tu prueba!' },
    { titulo: '✨ Tu próximo upgrade', descripcion: 'Importado, garantizado y listo para la ruta. ¡Seguinos en Facebook y llevátelo!' },
    { titulo: '🏆 Solo en SAVS', descripcion: 'Lujo, potencia y confort. La unidad que todos quieren… ¡cotizá ya en nuestra página!' },
    { titulo: '💎 Joya sobre ruedas', descripcion: 'Brilla en la calle, historial claro y trato directo. ¡Más info en Facebook!' },
    { titulo: '🚗 ¿SUV o sedán?', descripcion: 'Tenemos tu match perfecto importado. ¡Entrá a Facebook y pedí tu cotización!' },
    { titulo: '📲 Cotizá en 1 clic', descripcion: 'Respuesta rápida, asesoría real y el mejor precio. ¡Visitanos en Facebook hoy!' },
    { titulo: '🌟 Stock limitado', descripcion: 'Unidades que no duran. ¡Seguinos en FB y asegurá la tuya antes que se vaya!' },
    { titulo: '🔑 Llave en mano', descripcion: 'Trámite ágil, financiamiento a tu medida. ¡Consultá disponibilidad en Facebook!' },
    { titulo: '🇨🇷 Importado para vos', descripcion: 'Calidad USA/Japón con respaldo SAVS. ¡Cotizá por Facebook sin compromiso!' },
    { titulo: '⏰ Cierra hoy', descripcion: 'Precio especial por tiempo limitado. ¡Escribinos en FB y reservá tu unidad!' },
    { titulo: '🛣️ Listo para rodar', descripcion: 'Detalles impecables y entrega express. ¡Mandanos mensaje en Facebook!' }
];

const COPY_STYLE_HINTS = [
    'Tono urgente: escasez, últimas unidades, no te quedés atrás.',
    'Tono aspiracional: estilo de vida, status, tu próximo nivel.',
    'Tono directo: precio, financiamiento, cotización rápida.',
    'Tono emocional: familia, seguridad, confianza en la carretera.',
    'Tono curioso: pregunta retórica que invite a hacer clic.',
    'Tono exclusivo: solo en SAVS, importación premium.',
    'Tono costarricense: vos, llevátelo, cotizá, vení a verlo.',
    'Tono aventura: ruta, potencia, terreno, libertad.'
];

/**
 * Determina si el nombre de archivo limpio es genérico, numérico o carece de información automotriz útil
 * (ej. screenshot, facebook id, whatsapp image, etc.)
 * @param {string} cleanName 
 * @returns {boolean}
 */
function isGenericOrNumericName(cleanName) {
    if (!cleanName) return true;
    
    const lower = cleanName.toLowerCase();
    
    // Si contiene términos genéricos comunes de descargas o capturas
    const genericTerms = ['whatsapp', 'screenshot', 'captura', 'img', 'image', 'photo', 'foto', 'banner', 'promo', 'upload', 'unnamed', 'ad', 'anuncio'];
    for (const term of genericTerms) {
        if (lower.includes(term)) return true;
    }
    
    // Eliminar espacios y contar letras vs números
    const noSpaces = lower.replace(/\s+/g, '');
    const letterCount = (noSpaces.match(/[a-z]/g) || []).length;
    
    // Si tiene muy pocas letras (menos de 4 letras en total, típico de solo números)
    if (letterCount < 4) {
        return true;
    }
    
    // Si tiene un número largo (de más de 6 dígitos) que parece un ID de Facebook/WhatsApp o marca de tiempo
    if (/\d{6,}/.test(cleanName)) {
        return true;
    }
    
    return false;
}

/**
 * Analiza el nombre original del archivo para extraer información útil de vehículos
 * @param {string} originalName 
 */
function parseFilenameMetadata(originalName) {
    if (!originalName) return { cleanName: '', brand: null, model: null, year: null, color: null };
    
    // Quitar extensión
    const extIdx = originalName.lastIndexOf('.');
    let nameWithoutExt = extIdx !== -1 ? originalName.substring(0, extIdx) : originalName;
    
    // Limpiar caracteres especiales por espacios
    let cleanName = nameWithoutExt.replace(/[_\-\.]/g, ' ').replace(/\s+/g, ' ').trim();
    
    let detectedBrand = null;
    let detectedModel = null;
    let detectedColor = null;
    let detectedYear = null;
    
    // 1. Detectar año (4 dígitos entre 1980 y 2027)
    const yearMatch = cleanName.match(/\b(19\d{2}|20[0-2]\d)\b/);
    if (yearMatch) {
        detectedYear = parseInt(yearMatch[1], 10);
    }
    
    // 2. Detectar marca (case-insensitive)
    for (const b of BRANDS) {
        const regex = new RegExp('\\b' + b + '\\b', 'i');
        if (regex.test(cleanName)) {
            detectedBrand = b;
            break;
        }
    }
    
    // 3. Detectar color (case-insensitive)
    for (const c of COLORS) {
        const regex = new RegExp('\\b' + c + '\\b', 'i');
        if (regex.test(cleanName)) {
            detectedColor = c;
            break;
        }
    }
    
    // 4. Detectar modelo (case-insensitive)
    if (detectedBrand) {
        const brandKey = detectedBrand.toLowerCase();
        const brandModels = MODELS[brandKey] || [];
        for (const m of brandModels) {
            const regex = new RegExp('\\b' + m.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
            if (regex.test(cleanName)) {
                detectedModel = m;
                break;
            }
        }
    } else {
        // Si no se detectó marca, buscar en todos los modelos conocidos
        outerLoop: for (const brandKey of Object.keys(MODELS)) {
            const brandModels = MODELS[brandKey];
            for (const m of brandModels) {
                const regex = new RegExp('\\b' + m.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
                if (regex.test(cleanName)) {
                    detectedModel = m;
                    // Auto-asignar marca correspondiente
                    const brandCapitalized = brandKey.charAt(0).toUpperCase() + brandKey.slice(1);
                    detectedBrand = BRANDS.find(b => b.toLowerCase() === brandKey) || brandCapitalized;
                    break outerLoop;
                }
            }
        }
    }
    
    return {
        cleanName,
        brand: detectedBrand,
        model: detectedModel,
        year: detectedYear,
        color: detectedColor
    };
}

/**
 * Genera copys de fallback basados en el nombre del archivo
 * @param {string} originalName 
 */
function generateFallbackCopy(originalName) {
    const info = parseFilenameMetadata(originalName);
    
    let titulo = '';
    let descripcion = '';
    
    // Si el nombre es genérico o consiste principalmente de IDs numéricos
    if (isGenericOrNumericName(info.cleanName) && (!info.brand || !info.model)) {
        const promo = randomPick(GENERIC_PROMOS);
        titulo = promo.titulo;
        descripcion = promo.descripcion;
    } else if (info.brand && info.model) {
        const yearStr = info.year ? ` ${info.year}` : '';
        const colorStr = info.color ? ` color ${info.color.toLowerCase()}` : '';

        const titles = [
            `🔥 ¡${info.brand} ${info.model}${yearStr} te espera!`,
            `⚡ ${info.brand} ${info.model}${yearStr} — ¡Ya es tuyo!`,
            `✨ El ${info.brand} ${info.model}${yearStr} que todos quieren`,
            `🏆 ${info.brand} ${info.model}${yearStr}: potencia pura`,
            `💎 ${info.brand} ${info.model}${yearStr} en SAVS`,
            `🚗 ¿Buscás ${info.model}? Acá está`,
            `📲 Cotizá tu ${info.brand} ${info.model}${yearStr}`,
            `⏰ ${info.brand} ${info.model}${yearStr} — stock limitado`
        ];
        const descriptions = [
            `Brilla en la calle${colorStr}, impecable y listo. ¡Cotizá en Facebook!`,
            `Diseño que roba miradas${colorStr}. ¡Escribinos por FB antes que se vaya!`,
            `Confort premium${colorStr} y entrega express. ¡Seguinos en Facebook!`,
            `Elegancia y potencia${colorStr} al mejor precio. ¡Mandanos mensaje en FB!`,
            `Importado con respaldo SAVS${colorStr}. ¡Pedí info en nuestra página de Facebook!`,
            `Financiamiento flexible${colorStr}. ¡Agendá por Facebook hoy!`,
            `Unidad verificada${colorStr}, trato directo. ¡Cotizá sin compromiso en FB!`,
            `Tu upgrade empieza acá${colorStr}. ¡Visitá Facebook y reservá!`
        ];
        titulo = randomPick(titles);
        descripcion = randomPick(descriptions);
    } else {
        const nameCleaned = info.cleanName && info.cleanName.length > 3 ? info.cleanName : 'Vehículo Exclusivo';
        const formattedName = nameCleaned.charAt(0).toUpperCase() + nameCleaned.slice(1);
        const genericTitles = [
            `🔥 ¡${formattedName} — oportunidad única!`,
            `⚡ ${formattedName}: ¡no lo dejes pasar!`,
            `✨ Descubrí ${formattedName} en SAVS`
        ];
        const genericDescs = [
            'Impecable, garantizado y financiamiento flexible. ¡Cotizá en Facebook!',
            'Importado con respaldo total. ¡Escribinos por FB y agendá tu visita!',
            'Precio competitivo y entrega ágil. ¡Más detalles en nuestra página de Facebook!'
        ];
        titulo = randomPick(genericTitles);
        descripcion = randomPick(genericDescs);
    }
    
    // Validar límites de longitud para encajar perfecto en el diseño
    if (titulo.length > 50) titulo = titulo.substring(0, 47) + '...';
    if (descripcion.length > 150) descripcion = descripcion.substring(0, 147) + '...';

    return { titulo, descripcion };
}

/**
 * Genera datos estructurados completos de fallback basados en el nombre de archivo
 * @param {string} originalName 
 */
function generateFallbackVehicleData(originalName) {
    const info = parseFilenameMetadata(originalName);
    
    let brand = info.brand;
    let model = info.model;
    let year = info.year || new Date().getFullYear();
    let color = info.color || 'Gris';
    
    // Si el nombre es genérico o numérico, o no pudimos detectar marca/modelo, usar valores por defecto premium
    if (!brand || !model || isGenericOrNumericName(info.cleanName)) {
        brand = 'Hyundai';
        model = 'Tucson';
        year = 2022;
        color = 'Gris';
    }
    
    const name = `${brand} ${model} ${year}`;
    
    return {
        name: name,
        marca: brand,
        modelo: model,
        motor: "Motor de alta eficiencia y excelente rendimiento",
        engine_size: "2000 cc",
        doors: 4,
        drive: "FWD",
        passengers: 5,
        steering: "Asistida Electrónica",
        type: "SUV",
        year: year,
        anio: year,
        mileage: "0 km",
        price: null,
        precio: null,
        stock: 1,
        tag: "Disponible",
        tagColor: "#eab308",
        transmission: "Automática",
        fuel: "Gasolina",
        color: color,
        summary: `¡Llegó el espectacular ${brand} ${model} ${year}! Un vehículo en color ${color.toLowerCase()} en impecables condiciones, listo para entrega inmediata. Equipamiento de lujo, confort inigualable y la máxima seguridad para vos y tu familia.`,
        heroSubtitle: `Importado en excelente estado — Color ${color}`,
        performanceData: "Excelente consumo y suavidad de manejo.",
        specDescriptions: {},
        features: ["Cámara de reversa", "Pantalla táctil multimedia", "Aros de lujo", "Mandos en el volante", "Sistema de seguridad ABS"]
    };
}

// Prompt del sistema para OpenAI / Groq: lo que la IA "sabe" antes de ver la imagen
const SYSTEM_PROMPT = `
Eres un experto tasador y catalogador de vehiculos importados.
Tu unica funcion es analizar una fotografia de un vehiculo y devolver
UNICAMENTE un objeto JSON con los campos del modelo de base de datos.

Reglas estrictas:
- Devuelve SIEMPRE un objeto JSON valido, sin texto antes ni despues.
- Usa null en cualquier campo que no puedas determinar desde la imagen.
- No inventes datos si no los ves en la imagen.
- Los campos de moneda usan el simbolo ₡ (colones costarricenses).
- El campo "year" y "anio" deben ser lo mismo (numero entero).

Estructura JSON esperada:
{
  "name":        "Nombre completo del modelo (ej. Kia Sportage 2023)",
  "marca":       "Marca (ej. Kia, Toyota, Hyundai)",
  "modelo":      "Modelo especifico (ej. Sportage, Rav4, Tucson)",
  "motor":       "Descripcion del motor si es visible",
  "engine_size": "Cilindrada si se ve en el vehiculo",
  "doors":       "Numero de puertas (ej. 4 o 2)",
  "drive":       "Traccion (ej. FWD, AWD, 4x4)",
  "passengers":  "Numero de asientos",
  "steering":    "Volante (ej. Hidraulica, Electrica)",
  "type":        "Tipo de carroceria (SUV, Sedan, Hatchback, Pickup, Coupe, Convertible)",
  "year":        <anio como numero>,
  "anio":        <mismo anio>,
  "mileage":     "Kilometraje visible o '0 km' si es nuevo",
  "price":       <precio en numero decimal, null si no se ve>,
  "precio":      <mismo precio>,
  "stock":       1,
  "tag":         "Disponible",
  "tagColor":    "#eab308",
  "transmission": "Manual o Automatica",
  "fuel":        "Gasolina, Diesel, Hibrido o Electrico",
  "color":       "Color exterior del vehiculo",
  "summary":     "Descripcion comercial breve del vehiculo, maximo 3 oraciones.",
  "heroSubtitle":"Subtitulo corto para el detalle del producto.",
  "performanceData": "Datos de rendimiento si son visibles en la imagen",
  "specDescriptions": {},
  "features":    ["Caracteristica 1", "Caracteristica 2"]
}

IMPORTANTE: Devuelve solo el JSON. Sin explicaciones, sin markdown, sin bloques de codigo.
`;

/**
 * Analiza una imagen de vehiculo y devuelve los datos estructurados.
 * @param {string} base64Data  — Imagen codificada en base64 (sin prefijo data:image/…)
 * @param {string} mimeType    — Tipo MIME de la imagen (image/jpeg, image/png, …)
 * @param {string} originalName — Nombre original del archivo subido
 * @returns {Promise<object>}  — Objeto con los campos del vehiculo
 */
async function analyzeVehicleImage(base64Data, mimeType, originalName = '') {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ GROQ_API_KEY no configurada. Usando fallback inteligente.');
            return generateFallbackVehicleData(originalName);
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            },
                            {
                                type: 'text',
                                text: 'Analiza esta imagen de vehiculo y devuelve el JSON con todos los datos estructurados.'
                            }
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

        const content = response.data.choices[0].message.content.trim();

        // Extraer el JSON de la respuesta (por si la IA agrega texto antes/despues)
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            const firstBrace = content.indexOf('{');
            const lastBrace  = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                parsed = JSON.parse(content.slice(firstBrace, lastBrace + 1));
            } else {
                throw new Error('La IA no devolvió un JSON válido.');
            }
        }

        // Normalizar campos numéricos
        if (parsed.year    != null) parsed.year    = parseInt(parsed.year,    10);
        if (parsed.anio    != null) parsed.anio    = parseInt(parsed.anio,    10);
        if (parsed.price   != null) parsed.price   = parseFloat(parsed.price);
        if (parsed.precio  != null) parsed.precio  = parseFloat(parsed.precio);
        if (parsed.stock   == null) parsed.stock   = 1;

        return parsed;
    } catch (error) {
        console.warn('⚠️ Error en analyzeVehicleImage (Vision API). Usando fallback inteligente:', error.message);
        return generateFallbackVehicleData(originalName);
    }
}

// Prompt para generación de banners de publicidad/marketing
const BANNER_PROMPT = `
Eres el mejor copywriter de marketing automotriz de IMPORTADORA SAVS en Costa Rica. Escribes como un creativo de agencia: titulares que detienen el scroll y descripciones que generan deseo inmediato de comprar o cotizar.

Analiza la fotografia del vehiculo y crea un anuncio para banner web que VENDA emocionalmente, no que solo describa.

ESTILO CREATIVO (obligatorio):
- Usa lenguaje vibrante, cercano y costarricense (vos, vení, llevátelo, cotizá).
- Titulo: gancho fuerte — urgencia, exclusividad, beneficio o emoción. Puede incluir emoji al inicio (🔥 ⚡ ✨ 🏆) si suma impacto.
- Descripcion: beneficio concreto + detalle visible del auto (color, brillo, diseño, SUV/sedán, etc.) + llamado a la acción claro.
- Evita frases genéricas o aburridas como "vehículo en buen estado" o "excelente oportunidad" sin personalidad.
- Varía el tono: a veces urgente ("¡Últimas unidades!"), a veces aspiracional ("Tu próximo upgrade"), a veces directo ("¿Buscás potencia? Acá está").

EJEMPLOS DE REFERENCIA (no copies literal, inspírate):
- titulo: "🔥 ¡Tucson 2022 que roba miradas!"
- descripcion: "Gris metalizado impecable, SUV premium y financiamiento flexible. ¡Cotizá hoy en SAVS antes que se vaya!"
- titulo: "⚡ ¿Listo para el upgrade?"
- descripcion: "Sedán reluciente, equipamiento top y entrega express. Tu próximo auto te espera en Importadora SAVS."

REGLAS TÉCNICAS:
- titulo: máximo 40 caracteres, corto y muy llamativo.
- descripcion: máximo 120 caracteres, persuasiva con CTA (cotizá, vení, agendá, llevátelo).
- Menciona al menos un detalle visible real de la imagen (marca, modelo, color, tipo, año si se infiere).
- Respuesta UNICAMENTE JSON valido, sin markdown ni explicaciones.

{
  "titulo": "...",
  "descripcion": "..."
}
`;

/**
 * Analiza una imagen de banner y genera copys publicitarios con IA.
 * @param {string} base64Data
 * @param {string} mimeType
 * @param {string} originalName
 */
async function generateBannerCopy(base64Data, mimeType, originalName = '') {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ GROQ_API_KEY no configurada. Usando fallback inteligente.');
            return generateFallbackCopy(originalName);
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'system',
                        content: BANNER_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            },
                            {
                                type: 'text',
                                text: `Crea un anuncio NUEVO y distinto (no repitas frases típicas) para Importadora SAVS, Costa Rica. Estilo: ${randomPick(COPY_STYLE_HINTS)} Variación #${crypto.randomInt(1000, 99999)}. Titular con gancho fuerte; descripción con CTA hacia Facebook. Solo JSON con titulo y descripcion.`
                            }
                        ]
                    }
                ],
                temperature: 1,
                max_tokens: 300
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content.trim();

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            const firstBrace = content.indexOf('{');
            const lastBrace  = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                parsed = JSON.parse(content.slice(firstBrace, lastBrace + 1));
            } else {
                throw new Error('La IA no devolvió un JSON válido para el banner.');
            }
        }

        return {
            titulo: parsed.titulo || 'Sin título',
            descripcion: parsed.descripcion || ''
        };
    } catch (error) {
        console.warn('⚠️ Error en generateBannerCopy (Vision API). Usando fallback inteligente:', error.message);
        return generateFallbackCopy(originalName);
    }
}

module.exports = { analyzeVehicleImage, generateBannerCopy };
