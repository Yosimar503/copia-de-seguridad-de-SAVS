# Guía de testing manual

## Entorno

| Componente | Comando | URL |
|------------|---------|-----|
| Backend | `cd backend && npm install && npm run dev` | http://localhost:5000 |
| Frontend | `cd frontend && npm install && npm run dev` | http://localhost:5173 |
| DB | `cd backend && npx sequelize-cli db:migrate` | MySQL SAVS_DB |

## Datos de prueba

- Usar usuario existente en seed o registrar uno nuevo con contraseña `Password1` (8+ chars, mayúscula, número).
- Admin/gerente: según seed del proyecto.

## Flujos

### 1. Vender auto (`/vender-auto`)
1. Login como cliente.
2. Completar TradeInForm (marca, modelo, año, km, condición, precio, imagen).
3. Verificar toast y card en lista lateral.

### 2. Perfil tracking y puntos (`/perfil`)
1. Pestaña **Seguimiento**: ver trade-in y contactos.
2. Pestaña **Puntos**: ver saldo; probar canje demo 100 pts.

### 3. Citas (`/agendar-cita`)
1. Elegir fecha futura, hora, tipo de servicio.
2. Confirmar → aparece en Mis citas.
3. Cancelar → estado cancelada.

### 4. Catálogo (`/inventory`)
1. Verificar badge dorado en vehículos con tag Oferta/Promoción.
2. Sin banners en marketing: catálogo sigue cargando.

### 5. Admin
1. Login admin → `/admin`.
2. Verificar que cliente no accede a `/admin/users`.

## Herramientas

- REST: `tests/api/endpoints.http` (VS Code REST Client)
- Flujos: `tests/e2e/flujos.md`
