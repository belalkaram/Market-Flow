You are a senior full-stack engineer and production-readiness architect.



I have an ERP / SaaS supermarket management system with a separated Frontend and Backend.



Current stack:

\- Backend: Node.js / Express 5

\- Database: PostgreSQL / Neon

\- ORM: Drizzle ORM

\- Validation: Zod and drizzle-zod in some routes

\- Auth: JWT + bcrypt

\- Security: Helmet, rate limiting, AppError, centralized error handler

\- Multi-tenant system using tenantId

\- Frontend already exists and is connected to the API



The project is already partially production-ready, but I need you to harden the backend structure, data integrity, validation, security, scalability, and frontend-backend contract without breaking the current UI or existing features.



Important:

Do not rebuild the project from scratch.

Do not remove working features.

Do not add fake buttons or mock actions.

Do not move business logic to the frontend.

Backend must remain the source of truth.

Frontend should only display data and call APIs.

All financial, stock, permission, and tenant checks must happen in the backend.



Your job is to inspect the existing codebase first, understand the current architecture, then apply the following improvements carefully.



==================================================

PHASE 1 — CRITICAL PRODUCTION FIXES

==================================================



1\. Fix missing Database Transactions



The most important issue is that purchases and inventory operations are not fully atomic.



You must update the following routes/services:



A) purchases.ts — POST /

Create Purchase Order must be wrapped inside db.transaction().



The transaction must include:

\- insert purchase order

\- insert all purchase order items

\- calculate totals server-side

\- validate supplierId belongs to the same tenant

\- validate all products belong to the same tenant

\- reject empty items array

\- reject invalid quantity / price values

\- rollback everything if any item insert fails



Do not allow a purchase order to be created without all its items.



B) purchases.ts — POST /:id/receive

Receiving a purchase order must be wrapped inside db.transaction().



The transaction must include:

\- verify purchase order exists and belongs to req.user.tenantId

\- verify order status allows receiving

\- load order items inside the transaction

\- update product stock for every item

\- create stock movements / audit records if they exist in the current schema

\- update purchase order status to received

\- rollback everything if any product stock update fails



Important:

All update statements must include tenantId protection where applicable.

Do not rely only on a previous SELECT.

Use tenantId checks in update conditions whenever possible.



C) inventory.ts — POST /adjustments

Inventory adjustment must be wrapped inside db.transaction().



The transaction must include:

\- verify product exists and belongs to req.user.tenantId

\- calculate old stock and new stock in backend

\- update product stock

\- insert inventory adjustment record

\- insert stock movement record

\- insert audit log if available

\- rollback everything if any step fails



Acceptance criteria:

\- No stock update can happen without a matching movement / adjustment record.

\- No purchase order can exist partially without its items.

\- Any failure inside the operation must rollback all previous steps.



==================================================

PHASE 2 — UNIFIED VALIDATION STRUCTURE

==================================================



2\. Create a reusable validateBody middleware



Create a centralized middleware:



validateBody(schema)



Requirements:

\- Use Zod

\- Validate req.body before controller/service logic

\- Return safe 400 response if validation fails

\- Do not expose internal stack trace

\- Attach sanitized/validated output back to req.body

\- Support nested objects and arrays

\- Work with TypeScript types where possible



Apply it to all POST / PUT / PATCH routes, especially:

\- purchases.ts

\- products.ts

\- customers.ts

\- suppliers.ts

\- expenses.ts

\- inventory.ts

\- sales.ts

\- auth/register if needed



3\. Create proper Zod schemas



Create or improve schemas for:

\- createPurchaseOrderSchema

\- purchaseOrderItemSchema

\- receivePurchaseOrderSchema if needed

\- inventoryAdjustmentSchema

\- productSchema

\- customerSchema

\- supplierSchema

\- expenseSchema



Rules:

\- quantity must be positive

\- price must be zero or positive where appropriate

\- required IDs must be validated

\- text fields must have max length

\- dates must be valid

\- arrays must not be empty

\- reject unknown dangerous fields where possible

\- do not trust frontend-calculated totals



Backend must recalculate totals.



==================================================

PHASE 3 — SANITIZATION AND XSS HARDENING

==================================================



4\. Replace weak regex sanitization



Current sanitizeString regex is not enough.



Install and use a stronger sanitization approach such as sanitize-html.



Create a reusable sanitizer utility:

\- sanitizeText(value)

\- sanitizeOptionalText(value)

\- sanitizeObjectTextFields(obj)



Apply it only to free text fields, such as:

\- product name

\- category name

\- customer name

\- supplier name

\- notes

\- descriptions

\- expense description

\- address

\- public order notes



Do not incorrectly sanitize:

\- passwords

\- numbers

\- booleans

\- dates

\- IDs

\- emails unless handled carefully



Rules:

\- Strip HTML tags

\- Strip scripts

\- Strip event handlers

\- Strip javascript: URLs

\- Keep plain Arabic and English text safe

\- Do not break normal Arabic input



==================================================

PHASE 4 — DATABASE INDEXES AND QUERY PERFORMANCE

==================================================



5\. Add explicit Drizzle indexes



Review the schema and add indexes for large and frequently queried tables.



At minimum add indexes on:

\- tenantId

\- createdAt

\- productId

\- customerId

\- supplierId

\- orderId

\- userId



Add composite indexes where useful:

\- tenantId + createdAt

\- tenantId + productId

\- tenantId + status

\- tenantId + name/search fields if used

\- tenantId + orderDate

\- tenantId + saleDate

\- tenantId + purchaseDate



Important:

Foreign keys in PostgreSQL do not automatically create indexes.

Add explicit index() definitions in Drizzle schema.

Create migration files properly.

Do not destroy existing data.



==================================================

PHASE 5 — PAGINATION, FILTERING, AND LARGE DATA SAFETY

==================================================



6\. Add pagination to all list endpoints



All GET list endpoints must support:

\- page

\- limit

\- search

\- sortBy

\- sortOrder

\- dateFrom/dateTo where relevant



Rules:

\- default limit = 20 or 50

\- maximum limit = 100

\- never return unlimited rows from large tables

\- response must include pagination metadata:

&#x20; {

&#x20;   data: \[],

&#x20;   pagination: {

&#x20;     page,

&#x20;     limit,

&#x20;     total,

&#x20;     totalPages

&#x20;   }

&#x20; }



Apply to:

\- products

\- customers

\- suppliers

\- sales

\- purchases

\- inventory movements

\- expenses

\- audit logs

\- activity logs

\- security logs

\- reports where relevant



7\. Fix reports that load all data



Reports must not fetch all rows into memory.



Improve reports by:

\- requiring date range or applying a safe default range

\- using SQL aggregation where possible

\- limiting result size

\- adding pagination where reports return rows

\- preventing exports with unlimited data

\- returning clear error if the requested range is too large



For heavy exports:

\- keep simple export for small data

\- prepare structure for future background jobs

\- do not implement Redis or queue unless already available or easy to add without breaking the app



==================================================

PHASE 6 — AUTHORIZATION AND PERMISSIONS HARDENING

==================================================



8\. Backend permissions must be the real authority



Frontend may hide buttons, but backend must enforce all permissions.



Create or improve middleware:

\- requireAuth

\- requirePermission(resource, action)

\- requireSuperAdmin

\- requireTenantOwner if needed

\- requireStoreActive



Permission examples:

\- products:read

\- products:create

\- products:update

\- products:delete

\- sales:read

\- sales:create

\- purchases:read

\- purchases:create

\- purchases:receive

\- inventory:read

\- inventory:adjust

\- reports:read

\- settings:update

\- users:manage

\- roles:manage



Rules:

\- Owner has all tenant permissions

\- Super Admin has platform permissions only where appropriate

\- Employee permissions are dynamic

\- Never rely only on role name in frontend

\- All protected routes must have backend permission checks



==================================================

PHASE 7 — AUDIT LOGS

==================================================



9\. Strengthen entity-level audit logs



For sensitive actions, create audit logs that answer:

\- who did it?

\- tenantId

\- entity type

\- entity id

\- action

\- before value if available

\- after value if available

\- timestamp

\- IP/user-agent if available



Apply audit logs to:

\- product create/update/delete

\- stock adjustment

\- purchase order creation

\- purchase receiving

\- sale creation

\- user permission changes

\- tenant activation/suspension

\- settings changes



Do not log passwords or sensitive secrets.



==================================================

PHASE 8 — CORS, CONFIG, AND SECURITY HEADERS

==================================================



10\. Review production config



Ensure:

\- DATABASE\_URL comes only from env

\- JWT\_SECRET comes only from env

\- no hardcoded secrets

\- no mock data in production routes

\- NODE\_ENV=production hides stack traces

\- CORS is restricted to allowed domains from env

\- Helmet is enabled

\- rate limits are active

\- request body size is limited

\- generic login error is preserved

\- tenant status is checked during login and protected requests



Add clear env validation on server startup:

\- DATABASE\_URL required

\- JWT\_SECRET required

\- CORS\_ORIGIN required in production

\- any required public URL / app URL if used



==================================================

PHASE 9 — FRONTEND-BACKEND CONTRACT

==================================================



11\. Update frontend only where needed



Frontend must:

\- use the real APIs

\- handle new pagination response format

\- show validation errors cleanly

\- not calculate trusted totals

\- not bypass backend rules

\- hide buttons based on permissions, but not depend on that for security

\- show friendly errors for 403, 401, 400, 500

\- not contain fake CRUD actions



Do not redesign the whole UI.

Only update what is necessary to match the hardened backend.



==================================================

PHASE 10 — TESTING AND SELF-CHECK

==================================================



12\. Add or run validation tests / manual checks



At the end, verify these scenarios:



Transactions:

\- creating purchase with invalid item must create nothing

\- receiving purchase with one invalid product must update no stock

\- inventory adjustment failure must not change stock without logs



Tenant isolation:

\- tenant A cannot read/update/delete tenant B data

\- update/delete queries include tenantId where applicable



Validation:

\- invalid purchase body rejected

\- empty items rejected

\- negative quantity rejected

\- invalid price rejected



Security:

\- unauthenticated request rejected

\- unauthorized employee rejected

\- suspended tenant rejected

\- login error does not reveal whether email exists



Pagination:

\- list endpoints return limited results

\- max limit cannot exceed 100

\- reports do not load unlimited rows



==================================================

OUTPUT REQUIRED

==================================================



After making the changes, provide:



1\. Summary of what you changed

2\. Files modified

3\. New middleware/utilities added

4\. New schemas added

5\. Database migrations added

6\. Any commands I need to run

7\. Any env variables I need to add

8\. Any remaining risks or TODOs

9\. Confirmation that backend is now the source of truth for:

&#x20;  - validation

&#x20;  - authorization

&#x20;  - tenant isolation

&#x20;  - financial calculations

&#x20;  - stock updates

&#x20;  - error handling



Important:

Do not say “done” unless the code actually compiles.

Run type checks / lint / build if available.

If something cannot be completed, explain exactly why and what file needs manual review.

