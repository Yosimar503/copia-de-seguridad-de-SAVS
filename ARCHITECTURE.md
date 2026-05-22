# 🏗️ Arquitectura del Sistema — Importadora SAVS (The Destiny Vault)

## Visión General

Importadora SAVS es una aplicación full-stack que sigue una **arquitectura de capas desacopladas**, separando claramente las responsabilidades entre el Frontend (React + Vite) y el Backend (Node.js + Express + Sequelize + MySQL).

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                       │
│                     React 19 + Vite + React Router              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / HTTPS (Axios)
                             │ Cookies HttpOnly (JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVIDOR (Backend)                        │
│                     Node.js + Express v5                        │
│                                                                 │
│  ┌────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │  Middleware │──▶│    Routes     │──▶│   Controllers      │   │
│  │  (CORS,    │   │  /api/v1/*   │   │  (Lógica de        │   │
│  │  Auth JWT, │   │              │   │   negocio)          │   │
│  │  CookieP.) │   └──────────────┘   └─────────┬──────────┘   │
│  └────────────┘                                 │              │
│                                                 ▼              │
│                                    ┌────────────────────┐      │
│                                    │      Models        │      │
│                                    │   (Sequelize ORM)  │      │
│                                    └─────────┬──────────┘      │
└──────────────────────────────────────────────┼─────────────────┘
                                               │ TCP :3306
                                               ▼
                                   ┌────────────────────┐
                                   │    MySQL Database   │
                                   │      SAVS_DB        │
                                   └────────────────────┘
```

---

## Capas del Backend

### 1. Capa de Entrada (Middlewares)

| Middleware         | Propósito                                                    |
|--------------------|--------------------------------------------------------------|
| `cors`             | Permite solicitudes desde los orígenes del frontend          |
| `express.json()`   | Parsea el body JSON de las peticiones (límite: 50MB)         |
| `cookieParser`     | Parsea cookies HTTP para la autenticación JWT                |
| `verificarToken`   | Middleware custom que valida el JWT en cookies HttpOnly       |
| `esAdmin`          | Middleware custom que verifica el rol de administrador        |

### 2. Capa de Enrutamiento (Routes)

Las rutas siguen el estándar **RESTful** con versionado:

| Recurso               | Ruta Base                        | Métodos                       | Protección    |
|------------------------|----------------------------------|-------------------------------|---------------|
| Autenticación          | `/api/v1/auth`                   | POST (login, register, logout)| Pública       |
| Vehículos              | `/api/v1/vehicles`               | GET, POST, PUT, PATCH, DELETE | POST protegido|
| Usuarios               | `/api/v1/users`                  | GET, POST, PUT, PATCH, DELETE | Admin         |
| Reseñas                | `/api/v1/reviews`                | GET, POST, PUT, PATCH, DELETE | Pública       |
| Solicitudes            | `/api/v1/requests`               | GET, POST, PUT, PATCH, DELETE | Pública       |
| Solicitudes de Venta   | `/api/v1/sale_requests`          | GET, POST, PUT, PATCH, DELETE | Pública       |
| Sucursales             | `/api/v1/branches`               | GET, POST, PUT, PATCH, DELETE | Pública       |
| Glosario Técnico       | `/api/v1/technical_glossary`     | GET (público), CUD (Admin)    | Mixto         |
| Configuración          | `/api/v1/settings`               | GET, POST                     | Pública       |
| Chatbot IA             | `/api/v1/chatbot`                | POST                          | Pública       |

### 3. Capa de Lógica de Negocio (Controllers)

Cada controlador encapsula la lógica CRUD y validaciones específicas:

- **`authController.js`** — Registro, login (bcrypt + JWT), logout (limpieza de cookie), verificación de email, reset de contraseña.
- **`vehicleController.js`** — CRUD completo + paginación, búsqueda por texto libre, filtros por tipo/combustible/transmisión/color/precio/año, y ordenamiento dinámico.
- **`userController.js`** — CRUD de usuarios con inclusión de relación Rol.
- **`chatbotController.js`** — Integración con Groq Cloud (LLaMA 3.3 70B) usando el inventario real de MySQL como contexto.
- **`settingController.js`** — Patrón findOrCreate para configuraciones key-value.

### 4. Capa de Datos (Models — Sequelize ORM)

| Modelo            | Tabla            | Relaciones                              |
|-------------------|------------------|-----------------------------------------|
| `Rol`             | Rols             | 1:N → Usuario                           |
| `Usuario`         | Usuarios         | N:1 → Rol (FK: rolId)                   |
| `Auto`            | Autos            | Independiente                            |
| `Review`          | Reviews          | Independiente                            |
| `Request`         | Requests         | Independiente                            |
| `SaleRequest`     | SaleRequests     | Independiente                            |
| `Branch`          | Branches         | Independiente                            |
| `TechnicalGlossary`| TechnicalGlossaries | Independiente                        |
| `Setting`         | Settings         | Independiente (key-value)                |

---

## Seguridad Implementada

| Medida                          | Implementación                                |
|---------------------------------|-----------------------------------------------|
| Hashing de contraseñas          | bcrypt con salt de 10 rondas                  |
| Tokens de sesión                | JWT con expiración de 24h                     |
| Cookies seguras                 | httpOnly, sameSite: Lax, secure en producción |
| Protección de rutas backend     | Middleware verificarToken + esAdmin            |
| Protección de rutas frontend    | ProtectedRoute.jsx validado contra /auth/me   |
| Prevención Brute Force          | express-rate-limit                            |
| Seguridad de cabeceras HTTP     | Helmet                                        |
| Prevención ataques XSS          | xss-clean y sanitización de base de datos     |
| Prevención contaminación params | hpp (HTTP Parameter Pollution)                |
| CORS restringido                | Solo orígenes localhost permitidos             |

---

## Variables de Entorno

El archivo `.env` del backend requiere:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<tu_contraseña>
DB_NAME=SAVS_DB
JWT_SECRET=<secreto_seguro>
GROQ_API_KEY=<api_key_groq>
```

---

## 📦 Librerías y Dependencias (Backend)

Para instalar el entorno completo del servidor, navega a `/backend` y ejecuta:
```bash
npm install
```

Si deseas explorar qué bibliotecas utilizamos y su propósito individual:

### Framework & Core
- **`express`**: Framework web rápido y minimalista.
  > `npm install express`
- **`dotenv`**: Carga de variables de entorno desde `.env`.
  > `npm install dotenv`
- **`cors`**: Middleware para habilitar solicitudes desde React.
  > `npm install cors`

### Base de Datos y ORM
- **`mysql2`**: Driver nativo para comunicación con el motor MySQL.
  > `npm install mysql2`
- **`sequelize`**: ORM basado en promesas para Node.js (facilita consultas y relaciones).
  > `npm install sequelize`
- **`sequelize-cli`**: Herramienta de consola para migraciones y seeds.
  > `npm install -D sequelize-cli`

### Seguridad y Autenticación
- **`bcrypt`**: Librería robusta de encriptación hash (contraseñas).
  > `npm install bcrypt`
- **`jsonwebtoken`**: Emisión y validación de JSON Web Tokens (JWT).
  > `npm install jsonwebtoken`
- **`cookie-parser`**: Parsea las cookies enviadas por el navegador para el JWT HttpOnly.
  > `npm install cookie-parser`
- **`helmet`**: Configura cabeceras HTTP seguras automáticamente.
  > `npm install helmet`
- **`express-rate-limit`**: Previene ataques DDoS limitando peticiones.
  > `npm install express-rate-limit`
- **`hpp` & `xss-clean`**: Limpian parámetros HTTP repetidos y purifican scripts maliciosos.
  > `npm install hpp xss-clean`

### Manejo de Archivos y Peticiones Web
- **`multer`**: Middleware de `multipart/form-data` usado para subir imágenes de vehículos.
  > `npm install multer`
- **`axios`**: Peticiones internas del servidor (usado para conectarse a Groq/Pollinations IA).
  > `npm install axios`

### Testing
- **`jest` & `supertest`**: Framework de aserciones y librería para pruebas asíncronas de rutas HTTP.
  > `npm install -D jest supertest cross-env`

---

## Convenciones del Proyecto

- **Nomenclatura de rutas**: Sustantivos en plural, snake_case (`/api/v1/sale_requests`).
- **Códigos HTTP**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).
- **Respuestas de lista paginadas**: `{ data: [...], pagination: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }`.
- **Formato de errores**: `{ error: "Mensaje descriptivo" }`.
- **Modelos Sequelize**: PascalCase (`Auto`, `Usuario`, `SaleRequest`).
- **Archivos de controladores**: camelCase con sufijo Controller (`vehicleController.js`).
