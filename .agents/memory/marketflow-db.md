---
name: MarketFlow DB Schema
description: 28-table PostgreSQL schema, pre-existing type errors, and migration approach
---

# MarketFlow DB Schema

## Tables (28 total)
| Category | Tables |
|---|---|
| Multi-tenant | tenants, platform_admins, subscription_plans, store_subscriptions, store_payments |
| Users & Auth | users, roles, permissions, role_permissions |
| Operations | products, categories, suppliers, customers, branches |
| Commerce | sales_orders, sales_order_items, purchase_orders, purchase_order_items |
| Finance | expenses |
| Inventory | stock_movements, inventory_adjustments |
| Productivity | tasks, task_comments |
| Support | support_tickets, order_requests |
| Audit | activity_logs, audit_logs, platform_audit_logs |

## Schema Files Location
`lib/db/src/schema/` — one file per domain, all exported from `lib/db/src/schema/index.ts`

## Migration / Push
- Dev push: `pnpm --filter @workspace/db run push`
- Does NOT require manual migrations in dev — drizzle push applies changes directly

## Pre-existing Typecheck Errors (NOT to fix)
The `lib/db` typecheck has errors like:
```
error TS2344: Type 'ZodObject<...>' does not satisfy constraint 'ZodType<any,any,any>'
```
These are caused by a `drizzle-zod` version mismatch with Zod v4. They are pre-existing and the app runs correctly at runtime despite these errors. Do NOT attempt to "fix" them by downgrading Zod — the rest of the codebase depends on Zod v4.

**Why:** `drizzle-zod` exports are used only for schema validation in routes; the runtime esbuild bundle doesn't run tsc, so the app works fine.

## activityLogs Schema Fields
`id, tenantId, branchId, userId, userName, action, page, details, ipAddress, createdAt`
