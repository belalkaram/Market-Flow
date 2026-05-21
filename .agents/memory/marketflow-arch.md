---
name: MarketFlow Architecture
description: Critical architectural constraints, hook rules, and file layout that must not be violated
---

# MarketFlow ERP — Architecture

## Stack
- pnpm monorepo, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Shadcn UI + Wouter routing (artifacts/marketflow/src/)
- API: Express 5 + JWT (artifacts/api-server/src/)
- DB: PostgreSQL + Drizzle ORM (lib/db/src/schema/)
- Animations: GSAP + Framer Motion | Charts: Recharts | Validation: Zod v4 + drizzle-zod

## CRITICAL: useAuth hook — never split
`artifacts/marketflow/src/hooks/useAuth.tsx` exports BOTH `AuthProvider` AND `useAuth` from ONE FILE.
`artifacts/marketflow/src/hooks/useAuth.ts` is a thin re-export barrel — must coexist with useAuth.tsx.

**Why:** Splitting into separate files causes "Invalid hook call" from duplicate React instances via HMR.
**How to apply:** Never move AuthProvider or useAuth to separate files. Never delete useAuth.ts.

## RTL Layout
- Full Arabic UI, `dir="rtl"`, Cairo font, right-side sidebar
- Cairo font `@import` must be FIRST line in index.css before all other imports
- `dir` prop not supported on all Shadcn components — use `style={{ direction: 'rtl' }}` on DropdownMenuContent

## Routing
- App.tsx uses wouter `Switch/Route`
- ProtectedRoute uses wouter `useLocation` navigate (NOT `window.location.href`)
- Super Admin routes: `/super-admin/*` — use `SuperAdminLayout` + `useSuperAdmin` hook
- Super Admin token: stored as `mf_sa_token` in localStorage

## Ports
- Frontend: PORT env var, default 20659 (`Start application` workflow)
- API server: PORT=8080 (`API Server` workflow)
- API proxied at `/api` by Replit reverse proxy

## useStaggerFadeIn
Returns `RefObject<HTMLDivElement>` — apply to a wrapping `<div>`, NOT a `<form>`.
