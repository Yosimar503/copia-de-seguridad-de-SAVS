# API v1 — SAVS

Base: `/api/v1`

| Módulo | Rutas |
|--------|-------|
| Tracking | `GET /tracking/stages`, `GET /tracking`, `PATCH /tracking/user/:id` |
| Trade-in | `GET/POST /trade-in`, `PUT/DELETE /trade-in/:id` |
| Marketing | `GET/POST /marketing/campaigns`, `POST /marketing/broadcast`, banners |
| CRM | `GET/POST /crm/leads`, `POST /crm/leads/:id/interactions` |
| Fidelización | `GET /loyalty/me`, `POST /loyalty/redeem` |
| Citas | `GET/POST /appointments` |
| Promos | `GET /promotions/catalog` |
| Reportes | `GET /reports/dashboard`, `POST /reports/generate` (`formato`: json, csv, excel, pdf) |

Legacy sigue en `/api/*`. Migrar: `npm run db:init` + `npm run db:seed:pipeline`.
