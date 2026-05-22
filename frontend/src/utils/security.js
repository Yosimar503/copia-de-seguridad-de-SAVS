import emailjs from '@emailjs/browser';

// CONFIGURACIÓN DE SEGURIDAD (USER: Debes poner tus propias llaves aquí)
const SECURITY_CONFIG = {
  emailjs: {
    serviceId: 'service_z4zi2lc', // Configurado con éxito
    templateId: 'template_7j58c76', // Configurado con éxito
    publicKey: 'XuEEe119_mrnnaSXH' // Configurado con éxito
  },
  twilio: {
    accountSid: 'YOUR_ACCOUNT_SID', // Reemplazar para SMS real
    authToken: 'YOUR_AUTH_TOKEN',
    fromNumber: '+1234567890'
  }
};

/**
 * Simulación de envío de SMS.
 * Para envío real, se recomienda conectar con Twilio o Nexmo.
 */
export const sendSMS = async (phoneNumber, code) => {
  console.log(`[SMS AUTH] Enviando código ${code} al número ${phoneNumber}`);
  // Aquí iría el fetch a la API de Twilio
  return new Promise((resolve) => setTimeout(resolve, 1500));
};

/**
 * Envío de correo real usando EmailJS.
 */
export const sendEmail = async (userEmail, userName, code) => {
  console.log(`[EMAIL AUTH] Enviando código ${code} al correo ${userEmail}`);
  
  // Retornamos una promesa para manejar el loading en la UI
  try {
    // Si no se han configurado las llaves, simulamos éxito en consola para no romper la app
    if (SECURITY_CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
       console.warn("ADVERTENCIA: No se han configurado las llaves de EmailJS en src/utils/security.js. Simulando envío...");
       return new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const now = new Date();
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      auth_code: code,
      app_name: 'Importadora SAVS',
      current_date: now.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' }),
      current_time: now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    return await emailjs.send(
      SECURITY_CONFIG.emailjs.serviceId,
      SECURITY_CONFIG.emailjs.templateId,
      templateParams,
      SECURITY_CONFIG.emailjs.publicKey
    );
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
};

/**
 * Envío de correo para recuperación de contraseña.
 */
export const sendRecoveryEmail = async (userEmail, userName, code) => {
  console.log(`[PASSWORD RECOVERY] Enviando código ${code} al correo ${userEmail}`);
  
  try {
    if (SECURITY_CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
       return new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const now = new Date();
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      recovery_code: code, // Variable específica para recuperación
      app_name: 'Importadora SAVS',
      type: 'RECUPERACIÓN DE CONTRASEÑA',
      current_date: now.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' }),
      current_time: now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    return await emailjs.send(
      SECURITY_CONFIG.emailjs.serviceId,
      SECURITY_CONFIG.emailjs.templateId, // Puedes usar el mismo o crear otro
      templateParams,
      SECURITY_CONFIG.emailjs.publicKey
    );
  } catch (error) {
    console.error("Error enviando recovery email:", error);
    throw error;
  }
};

