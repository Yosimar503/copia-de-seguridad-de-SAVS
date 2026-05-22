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

// Interceptor: token Bearer opcional + manejo 401
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('[API] Error de red', { url: error.config?.url, message: error.message });
      error.message = 'Error de conexión: El servidor no responde. Asegúrate de que el backend esté encendido.';
    } else {
      console.error('[API]', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login?expired=1';
      }
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

export const tradeInService = {
  getMine: () => api.get('/sale_requests/mine').then((r) => r.data),
  create: (data) => api.post('/sale_requests', data).then((r) => r.data),
  update: (id, data) => api.put(`/sale_requests/${id}`, data).then((r) => r.data),
};

export const appointmentService = {
  getMine: () => api.get('/appointments/mine').then((r) => r.data),
  create: (data) => api.post('/appointments', data).then((r) => r.data),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`).then((r) => r.data),
};

export const pointsService = {
  getMine: () => api.get('/points/mine').then((r) => r.data),
  redeem: (cantidad, descripcion) => api.post('/points/redeem', { cantidad, descripcion }).then((r) => r.data),
};

export const marketingService = {
  getBanners: () => api.get('/marketing/banners').then((r) => r.data),
};

export { apiForm };
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
