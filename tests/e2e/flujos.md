# Flujos E2E — Prueba manual

## Entorno
- Backend: `cd backend && npm run dev` (puerto 5000)
- Frontend: `cd frontend && npm run dev` (puerto 5173)
- Ejecutar migraciones: `cd backend && npx sequelize-cli db:migrate`

---

## Flujo 1: Registro → Login → Acción → Logout

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Ir a `/register`, completar formulario válido | Usuario creado, mensaje de éxito |
| 2 | Ir a `/login` con credenciales | Redirección a `/` o `/admin` según rol |
| 3 | Ir a `/inventory` y abrir un vehículo | Detalle carga sin error |
| 4 | Cerrar sesión desde navbar/perfil | Redirección, `localStorage.user` vacío |

---

## Flujo 2: Venta (trade-in) → Confirmación → Perfil

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Login como cliente | Sesión activa |
| 2 | Ir a `/vender-auto` | Formulario TradeInForm visible |
| 3 | Enviar marca, modelo, año, km, condición, precio, imagen | Toast éxito + solicitud en lista |
| 4 | Ir a `/perfil` → pestaña **Seguimiento** | Solicitud con estado Pendiente |
| 5 | Pestaña **Peticiones** | Misma solicitud listada |

---

## Flujo 3: Agendamiento → Confirmación → Visualización

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Login | Sesión activa |
| 2 | Ir a `/agendar-cita` | Formulario fecha/hora/tipo |
| 3 | Confirmar cita | Toast éxito |
| 4 | Ver lista "Mis citas" | Cita con estado pendiente |
| 5 | Cancelar cita | Estado cancelada |

---

## Flujo 4: Catálogo con promociones

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Admin crea banner en `/admin/marketing` (opcional) | Banners activos en API |
| 2 | Ir a `/inventory` | Vehículos con tag Oferta muestran `PromocionBadge` |
| 3 | Sin banners activos | Catálogo funciona sin errores |
