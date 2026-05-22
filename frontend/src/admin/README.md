# Módulo Admin — Plan de refactor

## Estado actual

| Fase | Tema | Estado |
|------|------|--------|
| **1** | Arquitectura base (`constants`, `utils`, layout, rutas anidadas) | ✅ Hecho |
| **2** | `admin/services/` — API dedicada al panel | ✅ Hecho |
| **3** | `admin/hooks/` — datos compartidos (usuarios, stats) | ✅ Hecho |
| **4** | `TradeInAdmin` + `TradeInPage` funcional | Pendiente |
| **5** | `TrackingManagement` en `admin/components/` | Pendiente |
| **6** | `MarketingBroadcast` en `admin/components/` | Pendiente |
| **7** | Migrar páginas a `admin/pages/` (Dashboard, Users, etc.) | Pendiente |
| **8** | TypeScript (`.tsx`) + tipos estrictos | Opcional |

## Estructura objetivo

```
src/admin/
├── components/
│   ├── AdminSidebar/
│   ├── AdminLayout/
│   ├── AdminLoader/
│   ├── TrackingManagement/   ← Fase 5
│   ├── MarketingBroadcast/   ← Fase 6
│   └── TradeInAdmin/         ← Fase 4
├── pages/
│   ├── Dashboard.jsx         ← migrar desde pages/admin/
│   ├── TrackingPage.jsx
│   ├── MarketingPage.jsx
│   └── TradeInPage.jsx
├── hooks/
├── services/
├── utils/
├── types/
├── styles/
└── routes/
    └── AdminRoutes.jsx
```

## Rutas

Definidas en `constants/routes.js`. El menú lateral se genera desde `ADMIN_NAV_ITEMS`.
