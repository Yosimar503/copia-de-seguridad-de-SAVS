# Estado de formularios públicos

| Formulario | Ruta / ubicación | Validación | API | Estado |
|------------|------------------|------------|-----|--------|
| Login | `/login` | email, password requeridos | POST `/auth/login` | ✅ OK |
| Registro | `/register` | email, password complejidad | POST `/auth/register` | ✅ OK |
| Trade-in | `/vender-auto` | TradeInForm inline errors | POST `/sale_requests` | ✅ OK |
| Contacto | `/contact` | según componente | POST `/requests` | ✅ OK |
| Recuperar password | `/recuperar` | complejidad password | POST `/auth/reset-password` | ✅ OK |
| Agendar cita | `/agendar-cita` | fecha, hora, tipo | POST `/appointments` | ✅ OK |
| Simulador crédito | `/simulate-credit` | local | — | ✅ OK |
| Perfil tracking (admin) | `/perfil` | Swal modal | PATCH `/users/:id` | ✅ OK |
| Canje puntos (demo) | `/perfil` → Puntos | saldo mínimo | POST `/points/redeem` | ✅ OK |

## Notas
- Errores API: `utils/apiError.js` + `react-hot-toast`.
- Campos trade-in `condicion` se persiste en `descripcion` (ver `INCONSISTENCIAS.md`).
