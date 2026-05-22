# 🎨 Arquitectura del Frontend — Importadora SAVS

## Visión General

El Frontend de **The Destiny Vault (SAVS)** está desarrollado como una SPA (Single Page Application) utilizando **React.js v19** y **Vite** para una carga ultrarrápida. Su diseño se basa en un patrón de componentes modulares y se comunica de manera segura y abstracta con el Backend mediante servicios dedicados.

---

## 📂 Estructura de Directorios

La estructura del código fomenta la escalabilidad y la separación de responsabilidades:

```
src/
├── services/      → (NUEVO) Centralización de la API usando Axios. Exporta `api.js`.
├── assets/        → Recursos estáticos globales (imágenes base, tipografías).
├── components/    → UI Reutilizable (Navbar, Footer, Modales, ShimmerText, Chatbot).
├── hooks/         → Custom Hooks (useNavbar, useVehicleFavorites, useCatalogoLogica).
├── pages/         → Vistas orquestadoras organizadas por feature (Home, Inventory, Admin).
├── routes/        → Configuración de `AppRoutes.jsx` y `ProtectedRoute.jsx`.
└── styles/        → Estilos globales, variables CSS (Glassmorphism) e index.css.
```

---

## 🛡️ Capa de Seguridad (Client-Side)

### Autenticación y Autorización
- El Frontend **no almacena el JWT** en el LocalStorage para prevenir ataques XSS (Cross-Site Scripting).
- El JWT viaja automáticamente de ida y vuelta a través de **Cookies HttpOnly** gestionadas por el backend.
- En la inicialización de Axios (`services/api.js`), la propiedad `withCredentials: true` está habilitada globalmente.

### ProtectedRoute.jsx
Para las rutas administrativas (`/admin/*`), se utiliza el componente `ProtectedRoute`. 
- **Flujo de verificación**: Al montar el componente, se envía una petición silenciosa a `/api/auth/me`. 
- Si el backend responde exitosamente (validando el token de la cookie), el componente renderiza a los hijos.
- Si falla, expulsa al usuario al login y limpia el estado local de interfaz.

---

## 🌐 Capa de Comunicación (API Services)

Se implementó un patrón Singleton para el cliente de peticiones HTTP:

1. **`services/api.js`**: Exporta una instancia global de Axios (`api`).
2. **Servicios Modulares**: En el mismo archivo (o en su propio directorio) se definen objetos como `vehicleService` o `authService` que exponen métodos limpios (`getAll`, `getById`, `create`).
3. **Manejo Dinámico**: El frontend traduce activamente los estados de los filtros en la interfaz en Query Strings (`?fuel=Diésel&page=1`) que son enviados al backend a través de `vehicleService`.

## 📦 Librerías y Dependencias (Frontend)

Para instalar todas las dependencias del cliente de un solo golpe, ejecutar dentro del directorio `frontend/`:
```bash
npm install
```

Si deseas instalarlas individualmente para entender su propósito, se utilizaron las siguientes extensiones y librerías:

1. **Gestión de Rutas y Navegación:**
   - `react-router-dom`: Enrutamiento cliente (SPA).
     > `npm install react-router-dom`
2. **Peticiones HTTP y Comunicación:**
   - `axios`: Cliente asíncrono configurado con baseURL para conectarse a Node.js.
     > `npm install axios`
3. **UI, Estilo y Experiencia Visual:**
   - `lucide-react`: Biblioteca de iconos escalables.
     > `npm install lucide-react`
   - `motion` (Framer Motion): Biblioteca maestra para animaciones declarativas (usada en ShimmerText, catálogos emergentes).
     > `npm install motion`
4. **Interacción y Notificaciones:**
   - `sweetalert2`: Alertas modales atractivas y personalizables.
     > `npm install sweetalert2`
   - `react-hot-toast`: Notificaciones emergentes tipo toast (esquinas).
     > `npm install react-hot-toast`
5. **Utilidades Especiales:**
   - `recharts`: Creación dinámica de gráficas estadísticas en el Dashboard administrativo.
     > `npm install recharts`
   - `@emailjs/browser`: API de cliente para el envío directo de emails en el formulario de contacto.
     > `npm install @emailjs/browser`
6. **Entorno de Desarrollo:**
   - `concurrently`: Utilidad para ejecutar el cliente y el servidor backend en un solo comando (`npm run dev:full`).
     > `npm install -D concurrently`

---

## 💅 Estética y Patrones de Interfaz

### Diseño Premium (Glassmorphism)
Se priorizó un diseño oscuro con acentos dorados (`#eab308`) y efectos de cristal esmerilado:
- `backdrop-filter: blur(10px)`
- `background: rgba(15, 15, 15, 0.6)`
- Bordes con baja opacidad `border: 1px solid rgba(255,255,255,0.05)`.

### Animaciones
Se utiliza intensivamente **Framer Motion** para transiciones de montaje de página, modales emergentes y carga escalonada (stagger) en el catálogo de vehículos.

---

## 🤖 Integración de Inteligencia Artificial
El componente `Chatbot.jsx` está diseñado para interactuar asíncronamente con el endpoint del Backend (`/api/chatbot`), enviando el mensaje del usuario y recibiendo el contexto procesado por Groq Cloud. El chat mantiene su propio estado de mensajes y cuenta con un fallback amigable al WhatsApp de ventas.
