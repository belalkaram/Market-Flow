# MarketFlow ERP — SaaS Platform

نظام ERP متكامل متعدد المستأجرين (Multi-Tenant SaaS) لإدارة السوبرماركت والبقالات — واجهة عربية RTL كاملة مع نقطة بيع، مخزون، مشتريات، مبيعات، تقارير، وأكثر.

## Run & Operate

- `pnpm --filter @workspace/marketflow run dev` — run the frontend (PORT env var, default 20659, BASE_PATH=/)
- `pnpm --filter @workspace/api-server run dev` — run the API server (PORT=8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Shadcn UI + Wouter routing
- Animations: GSAP + @gsap/react, Framer Motion
- Charts: Recharts
- API: Express 5 + JWT auth
- DB: PostgreSQL + Drizzle ORM (26 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/marketflow/src/` — React frontend (ERP UI, Arabic RTL)
  - `pages/` — 33 pages (all with breadcrumbs, empty states, loading skeletons, toast notifications)
  - `pages/super-admin/` — Super Admin platform management pages
  - `components/layout/` — Sidebar (grouped nav), Navbar, MainLayout, PageHeader (subtitle+actions+breadcrumbs)
  - `components/charts/` — SalesChart, ProfitChart (Recharts)
  - `hooks/useAuth.tsx` — AuthProvider + useAuth (KEEP IN ONE FILE — splitting causes "Invalid hook call" error)
  - `hooks/useAuth.ts` — thin re-export barrel (DO NOT DELETE)
  - `hooks/usePermissions.ts` — dynamic permissions: `can(page, action)`, `canViewPage(href)`
  - `lib/api.ts` — all API client functions + TypeScript interfaces
- `artifacts/api-server/src/` — Express backend
  - `routes/` — auth, products, categories, customers, suppliers, employees, expenses, branches, tasks, purchases, sales, inventory, reports, roles, notifications, settings, profile, platform
  - `middlewares/auth.ts` — JWT auth, requireAuth, requireSuperAdmin, requireStoreActive
  - `services/auth.service.ts` — login (returns trial info: tenantStatus, trialDaysLeft, isTrialExpired)
- `lib/db/src/schema/` — Drizzle schema (26 tables)

## Database Tables (26)

| Category | Tables |
|---|---|
| Multi-tenant | tenants, platform_admins, subscription_plans, store_subscriptions, store_payments |
| Users & Auth | users, roles, permissions, role_permissions |
| Operations | products, categories, suppliers, customers, branches |
| Commerce | sales_orders, sales_order_items, purchase_orders, purchase_order_items |
| Finance | expenses |
| Inventory | stock_movements, inventory_adjustments |
| Productivity | tasks, task_comments |
| Audit | activity_logs, audit_logs, platform_audit_logs |

## Demo Accounts (tenant: شركة كنوز التجريبية)

| Role | Email | Password |
|---|---|---|
| مالك (Owner) | owner@demo.local | Demo@12345 |
| مدير (Admin) | admin@demo.local | Demo@12345 |
| كاشير (Cashier) | cashier@demo.local | Demo@12345 |
| مدير مخزون | inventory@demo.local | Demo@12345 |

**Super Admin:** `superadmin@marketflow.app` / `SuperAdmin@2025`  
Super Admin portal: `/super-admin/login`

## SaaS Features Built

- **Multi-tenant architecture** — each store is an isolated tenant
- **10-day trial system** — auto-expires, trial warning banner on dashboard (≤7 days left)
- **Store registration** — `/register-store` creates tenant + owner user + starts trial
- **Trial/Suspended screens** — `/trial-expired`, `/store-suspended` with redirect from login
- **Super Admin portal** — platform dashboard, store management (activate/suspend/deactivate/extend trial), plans management
- **Dynamic permissions** — page_key/action_key based, visual editor in RolesPage, `usePermissions()` hook
- **Subscription plans** — 4 plans seeded: تجريبي (0 SAR), أساسي (99 SAR), احترافي (199 SAR), مؤسسي (399 SAR)

## Pages (33 total)

**Authenticated (ERP):**
Dashboard, POS (نقطة البيع), Products, AddProduct, Categories, Inventory, StockMovements, Suppliers, SupplierDetail, Purchases, Sales, Returns, Customers, Expenses, Accounting, Reports, Employees, Roles, Branches, Tasks, Notifications, Settings, Profile, ActivityLogs, BranchSelection

**Auth/Onboarding:**
Login, RegisterStore, TrialExpired, StoreSuspended, Unauthorized, SplashPage, NotFound

**Super Admin:**
super-admin/Login, super-admin/Dashboard

## Architecture Decisions

- **useAuth.tsx** exports BOTH `AuthProvider` AND `useAuth` in ONE FILE — splitting into separate files causes "Invalid hook call" error from duplicate React instances via HMR. `useAuth.ts` is a thin re-export barrel and must exist alongside it.
- **RTL layout**: full Arabic UI, `dir="rtl"`, Cairo font, right-side sidebar, breadcrumbs in all 22+ pages
- **PageHeader** supports `title`, `subtitle`, `breadcrumbs`, `action`, `actions`, `className` props
- **Empty states**: all pages have rich empty states with icons + description + CTA buttons
- **JWT auth** stored in localStorage, sent as Bearer token; backend validates on every request
- **API server port**: 8080 (hardcoded in workflow), Frontend: PORT env var (20659 in "Start application" workflow)

## User Preferences

- Language: Arabic (عربي) — full RTL layout
- Brand colors: Emerald #10B981, Dark Navy #0F172A, Orange alerts #F97316, Red errors #EF4444
- Font: Cairo (Google Fonts) — MUST be first @import in index.css
- Do not split useAuth into separate files (causes runtime errors)
- Keep TypeScript strict — run `npx tsc --noEmit` to verify zero errors before delivering

## Gotchas

- Cairo font `@import` must be the FIRST line in `index.css` before all other imports
- `useAuth.tsx` must export BOTH `AuthProvider` and `useAuth` from the same file — never split
- `useAuth.ts` (re-export barrel) must coexist with `useAuth.tsx` — both files are needed
- `dir` prop is not supported on all Shadcn components — use `style={{ direction: 'rtl' }}` on `DropdownMenuContent` instead
- `useStaggerFadeIn` returns `RefObject<HTMLDivElement>` — apply to a wrapping `<div>`, not a `<form>`
- API `queryFn` must be wrapped: `queryFn: () => api.list()` not `queryFn: api.list` when the function takes optional params
