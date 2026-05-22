import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

// Configuración básica de Axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Para enviar cookies si es necesario
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta, es probable que sea un error de red o el servidor esté caído
    if (!error.response) {
      console.error('❌ Error de Red - ¿Está el servidor corriendo?');
      // Modificamos el mensaje para que sea más descriptivo en el frontend
      error.message = 'Error de conexión: El servidor no responde. Asegúrate de que el backend esté encendido (npm run dev).';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio de Vehículos
 */

// Nueva instancia axios sin content-type fijo (para multipart/form-data)
const apiForm = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const vehicleService = {
  // Obtener lista con filtros y paginación
  getAll: async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  // Obtener un vehículo por ID
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Crear nuevo (Soporta FormData para imágenes)
  create: async (data) => {
    const response = await api.post('/vehicles', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // ── Generar anuncio automático desde imagen con IA ──────────────────────
  // Envía una imagen a la API; la IA detecta marca, modelo, año, tipo, color, etc.
  // y devuelve los campos detectados para autocompletar el formulario.
  generateAutoAd: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await apiForm.post('/vehicles/auto-ad', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

/**
 * Servicio de Autenticación
 */
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default api;

/**
 * Servicio del Chatbot
 */
export const chatService = {
  // Mensaje de texto puro
  sendText: async (message) => {
    const response = await api.post('/chatbot', { message });
    return response.data;
  },

  // Mensaje con imagen adjunta (multipart/form-data)
  sendWithImage: async (formData) => {
    const response = await apiForm.post('/chatbot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
