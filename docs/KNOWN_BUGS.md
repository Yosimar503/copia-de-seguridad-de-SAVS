# Bugs conocidos — SAVS / The Destiny Vault

## Plantilla de reporte

```markdown
### BUG-XXX — Título breve
- **Severidad:** Alta | Media | Baja
- **Módulo:** Frontend / Backend / Integración
- **Pasos para reproducir:**
  1. ...
- **Resultado esperado:**
- **Resultado actual:**
- **Estado:** Abierto | En progreso | Resuelto
- **Fecha:**
```

---

## Registro

### BUG-001 — Migraciones pendientes en entornos nuevos
- **Severidad:** Media
- **Módulo:** Backend
- **Descripción:** Citas y puntos requieren `npx sequelize-cli db:migrate` antes de usar `/appointments` y `/points`.
- **Estado:** Documentado — ejecutar migración en despliegue.

### BUG-002 — Rol en ProtectedRoute
- **Severidad:** Baja
- **Módulo:** Frontend
- **Descripción:** El rol debe coincidir en minúsculas (`cliente`, `admin`, `gerente`). Roles con otro nombre en BD pueden bloquear rutas.
- **Estado:** Abierto
