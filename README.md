# Importadora SAVS - The Destiny Vault 🚗💨

## 📝 Descripción General
**Importadora SAVS (The Destiny Vault)** es una plataforma web full-stack moderna y robusta diseñada para la gestión, exhibición y comercialización de vehículos de importación, principalmente desde Corea del Sur hacia Costa Rica. 

La aplicación fue desarrollada para ofrecer una **experiencia de usuario premium** con una estética elegante (Glassmorphism), mientras provee a los administradores de un **robusto panel de gestión centralizado**. Desde calcular financiamientos y explorar el inventario de manera dinámica, hasta interactuar con un asistente virtual inteligente, SAVS eleva el estándar de las importadoras automotrices.

---

## 🚀 Funcionalidades Clave y Funcionamiento

### 🔍 Catálogo Inteligente y Filtros Dinámicos
El corazón del sistema es un catálogo de vehículos conectado en tiempo real a la base de datos. Permite a los usuarios buscar y filtrar vehículos por **marca, modelo, tipo de combustible, transmisión y rango de precio**. Todo impulsado por una API propia que soporta **paginación desde el servidor** para un rendimiento óptimo.

### 🤖 Asistente Virtual IA Integrado
Para mejorar la conversión de ventas, la plataforma integra un chatbot conversacional potenciado por **Groq Cloud (LLaMA 3.3 70B)**. Este asistente responde preguntas técnicas leyendo el inventario de la base de datos, y cuando detecta intención de compra o no puede resolver una duda compleja, transfiere suavemente la conversación al WhatsApp oficial de ventas.

### 🧮 Simulador de Financiamiento
Los usuarios pueden abrir desde cualquier parte de la página una calculadora flotante interactiva. Tras seleccionar un vehículo (con su imagen y precio importados dinámicamente), el simulador les permite ajustar plazos y enganches para estimar su cuota mensual de inmediato.

### ⚙️ Portal de Administración (Dashboard CRUD)
Un entorno seguro y privado donde los perfiles con rol de `admin` pueden:
- **Gestión de Inventario**: Crear (con subida de imágenes), editar y eliminar vehículos.
- **Gestión de Usuarios**: Administrar cuentas registradas y asignar privilegios.
- **Tracking de Importación**: Actualizar las etapas logísticas (En Tránsito, Aduanas, Entrega) de los clientes que ya compraron.
- **Gestión de Reseñas**: Aprobar y publicar comentarios verificados en la página principal.

---

## 🛠️ Stack Tecnológico Utilizado

El proyecto utiliza un stack de tecnologías líder en la industria, separado en dos grandes pilares orquestados:

### 🎨 Frontend (Interfaz de Usuario)
- **React.js 19 + Vite**: Motor principal para la reactividad y velocidad de carga.
- **React Router Dom 7**: Enrutamiento tipo SPA y protección asíncrona de rutas.
- **Framer Motion**: Animaciones fluidas, modales emergentes y transiciones.
- **Vanilla CSS**: Estilización centralizada usando un patrón de diseño Glassmorphism premium (desenfoques y acentos dorados).
- **SweetAlert2 & React Hot Toast**: Para notificaciones amigables y modales de confirmación.

### 🏗️ Backend (Lógica y Servidor)
- **Node.js + Express.js v5**: Servidor HTTP y enrutador RESTful (`/api/v1`).
- **MySQL 8 + Sequelize ORM**: Base de datos relacional para persistencia de usuarios, roles, inventarios y ajustes.
- **Multer**: Gestión eficiente para la subida de imágenes al sistema de archivos local (`/uploads`).

### 🛡️ Seguridad y Autenticación
- **JWT (JSON Web Tokens)**: Manejo de sesiones de manera inquebrantable a través de **Cookies HttpOnly**, mitigando inyecciones XSS.
- **Bcrypt**: Encriptado fuerte de contraseñas de los usuarios.
- **Express Rate Limit & Helmet**: Protección activa contra ataques de fuerza bruta y configuración segura de cabeceras HTTP.

---

## 📚 Documentación Técnica Detallada

Para mantener este documento limpio, toda la estructura técnica y diagramas de flujo se han documentado de forma independiente. Si eres desarrollador o vas a calificar el código fuente, por favor revisa los siguientes documentos:

1. 🖧 **[Arquitectura del Backend (ARCHITECTURE.md)](./ARCHITECTURE.md)**: Modelos de la base de datos, middlewares, rutas y políticas de seguridad del servidor.
2. 💻 **[Arquitectura del Frontend (FRONTEND_ARCHITECTURE.md)](./FRONTEND_ARCHITECTURE.md)**: Estructura de carpetas en React, custom hooks, lógica de filtrado y flujos asíncronos de peticiones HTTP.
3. 🗺️ **[Estado del Proyecto (ROADMAP_PENDIENTES.txt)](./ROADMAP_PENDIENTES.txt)**: Verificación del progreso (100% de cumplimiento en la entrega).
4. 📋 **[Resumen Ejecutivo para Calificación (RESUMEN_ENTREGA_FINAL.txt)](./RESUMEN_ENTREGA_FINAL.txt)**: Documento oficial para la revisión del profesor con hitos clave.

---

## 🔧 Guía de Arranque Rápido

### Prerrequisitos
- **Node.js** (v18 o superior)
- Servidor de **MySQL** ejecutándose en el puerto 3306.

### Instalación

1. Clona el repositorio e instala las dependencias base y del servidor:
   ```bash
   npm install
   cd backend && npm install
   ```
2. Configura tu `.env` (guíate del `.env.example` proveído).
3. Sincroniza la base de datos (Sequelize CLI):
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all   # (Opcional) para tener data de inicio
   ```

### Ejecución
Usa el comando `dev:full` desde la raíz para levantar paralelamente la base de datos, el cliente Vite y el servidor Node.
```bash
npm run dev:full
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---
**Desarrollado para Importadora SAVS - Calidad y Confianza en cada kilómetro.**
