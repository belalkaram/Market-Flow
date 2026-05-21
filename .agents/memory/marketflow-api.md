---
name: MarketFlow API Patterns
description: Backend response helpers, auth middleware, route registration, and platform auth
---

# MarketFlow API — Backend Patterns

## Response Helpers (artifacts/api-server/src/utils/response.ts)
- `success(res, data)` — 200 response
- `created(res, data)` — 201 response
- `paginated(res, data, meta)` — paginated list
- NOT `res.json(success(data))` — the helper takes `res` as first arg

## Auth Middleware (artifacts/api-server/src/middlewares/auth.ts)
- `requireAuth` — validates JWT, populates req.user
- `requireStoreActive` — blocks if tenant is suspended/expired
- `req.user` shape: `{ userId, tenantId, branchId, roleSlug, roleName }`

## Platform Auth (artifacts/api-server/src/middlewares/platformAuth.ts)
- `requireSuperAdmin` — validates super admin JWT (token header `mf_sa_token`)
- Used for all `/platform/*` routes

## Route Registration
- ERP routes: registered in `artifacts/api-server/src/routes/index.ts`
- Platform (super admin) routes: registered in `artifacts/api-server/src/routes/platform/index.ts`
- Both are mounted in `artifacts/api-server/src/app.ts`

## New Tables Added (session: May 2026)
- `support_tickets` — tenant support requests
- `order_requests` — WhatsApp order requests
- Schema file: `lib/db/src/schema/support.ts`, exported from `lib/db/src/schema/index.ts`
- DB push command: `pnpm --filter @workspace/db run push`

## API Client (frontend)
- Base: `artifacts/marketflow/src/lib/api.ts`
- Generic helpers: `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete`
- Token: stored as `mf_token` in localStorage, sent as Bearer
- `queryFn` must be wrapped: `queryFn: () => api.list()` NOT `queryFn: api.list` when fn takes optional params

## Sales Return Endpoint
- POST `/api/sales/:id/return` — creates return from existing sale
- Body: `{ items, reason, notes, totalAmount }`

## Activity Logs Endpoint
- GET `/api/activity-logs` — supports `?action=&dateFrom=&dateTo=`
- GET `/api/activity-logs/stats` — today's summary stats
