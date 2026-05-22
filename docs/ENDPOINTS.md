# API Endpoints — The Destiny Vault / SAVS

Base URL: `http://localhost:5000/api`  
Auth: cookie `token` (HttpOnly) o header `Authorization: Bearer <token>`

---

## Auth `/api/auth`

| Método | Ruta | Auth | Body | Respuesta OK | Errores |
|--------|------|------|------|--------------|---------|
| POST | `/register` | No | nombre, email, password, telefono... | 201 | 400 email duplicado |
| POST | `/login` | No | email, password | 200 + cookie | 401 |
| POST | `/logout` | No | — | 200 | — |
| GET | `/me` | Sí | — | 200 usuario | 401 |
| POST | `/check-email` | No | email | 200 | — |
| POST | `/reset-password` | No | userId, newPassword | 200 | 400 |

---

## Vehicles `/api/vehicles`

| Método | Ruta | Auth | Notas |
|--------|------|------|-------|
| GET | `/` | No | Query: page, limit, search, filters |
| GET | `/:id` | No | Detalle vehículo |
| POST | `/` | Admin | multipart imagen |
| PUT/PATCH | `/:id` | Admin | Actualizar |
| DELETE | `/:id` | Admin | Eliminar |
| POST | `/auto-ad` | Admin | IA desde imagen |

---

## Sale Requests (Trade-in) `/api/sale_requests`

| Método | Ruta | Auth | Body ejemplo |
|--------|------|------|--------------|
| GET | `/mine` | Usuario | — |
| GET | `/` | Admin/Gerente | — |
| GET | `/:id` | Admin/Gerente | — |
| POST | `/` | Usuario | marca, modelo, anio, kilometraje, precio, descripcion, imagen, userId |
| PUT/PATCH | `/:id` | Admin/Gerente | estado, respuesta_admin |
| DELETE | `/:id` | Admin | — |

---

## Requests (Contacto) `/api/requests`

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/mine` | Usuario (por email) |
| GET | `/` | Admin/Gerente |
| POST | `/` | Usuario |
| PUT/PATCH/DELETE | `/:id` | Admin |

---

## Appointments `/api/appointments` *(nuevo)*

| Método | Ruta | Auth | Body |
|--------|------|------|------|
| GET | `/mine` | Usuario | — |
| POST | `/` | Usuario | fecha, hora, tipo_servicio, notas? |
| PATCH | `/:id/cancel` | Usuario | — |

---

## Points `/api/points` *(nuevo)*

| Método | Ruta | Auth | Body |
|--------|------|------|------|
| GET | `/mine` | Usuario | — |
| POST | `/redeem` | Usuario | cantidad, descripcion |

---

## Marketing `/api/marketing`

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/banners` | Público |
| POST | `/banners` | Admin/Gerente |
| DELETE | `/banners/:id` | Admin/Gerente |
| POST | `/broadcast` | Admin/Gerente |

---

## Users, Reviews, Branches, Settings, Chatbot

Ver colección Postman en `docs/postman_collection.json` para ejemplos completos de request/response.

---

## Ejemplo curl (login + trade-in)

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password1"}'

curl -b cookies.txt http://localhost:5000/api/sale_requests/mine
```
