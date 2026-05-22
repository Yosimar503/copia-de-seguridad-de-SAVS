# Inconsistencias UI ↔ Backend

| Campo / concepto | Frontend | Backend | Corrección propuesta |
|------------------|----------|---------|----------------------|
| Condición trade-in | `condicion` en formulario | Se guarda dentro de `descripcion` como `[Condición] texto` | Agregar columna `condicion` en `SaleRequest` (migración futura) |
| Email usuario | `email` en login | También acepta `correo` | ✅ Backend unifica en auth |
| Trade-in listado cliente | `/sale_requests/mine` | Antes usaba `?userId=` en GET admin | ✅ Corregido con ruta `/mine` |
| Peticiones contacto | `/requests/mine` | Antes GET `/requests` (solo admin) | ✅ Corregido |
| JWT | Cookies HttpOnly | También soporta `Authorization: Bearer` | ✅ Añadido en middleware |
| Puntos nuevos usuarios | Registro FE no muestra puntos | Backend asigna 500 pts al registrar | Sincronizar mensaje en UI post-registro |
| Tracking usuario | Objeto `tracking` en localStorage | Columna JSON `tracking` en Usuario (post-migración) | Cargar tracking desde `GET /users/:id` al abrir perfil |

## Mapeo respuestas API → UI

| Endpoint | Campo API | Campo UI |
|----------|-----------|----------|
| sale_requests | `estado` | badge estado en perfil/seguimiento |
| requests | `status` | normalizado a Pendiente/Aprobada/Rechazada |
| appointments | `estado` | pendiente / cancelada |
| points | `saldo`, `historial` | PerfilPuntos |
