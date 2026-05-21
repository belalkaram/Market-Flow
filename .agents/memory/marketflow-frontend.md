---
name: MarketFlow Frontend Patterns
description: Page structure, component conventions, RTL layout, sidebar, permissions
---

# MarketFlow Frontend Patterns

## Page Structure (all 33+ pages follow this)
```tsx
<MainLayout>
  <div className="space-y-4 md:space-y-6" dir="rtl">
    <PageHeader
      title="..."
      subtitle="..."
      breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: '...' }]}
      actions={<Button>...</Button>}
    />
    {/* stat cards, filters, table/grid */}
  </div>
</MainLayout>
```

## PageHeader Props
`title`, `subtitle`, `breadcrumbs`, `action` (single), `actions` (multiple), `className`

## Sidebar Navigation (artifacts/marketflow/src/components/layout/Sidebar.tsx)
Grouped nav with `navGroups` array. Groups: الرئيسية, نقطة البيع والمبيعات, المخزون والمنتجات, المشتريات, المالية, الإدارة, الإعدادات.
Uses `usePermissions().canViewPage(href)` to filter items per role.

## Permissions
- `usePermissions()` hook: `can(page, action)`, `canViewPage(href)`
- Dynamic per-role, from DB permissions table

## Super Admin Layout
`SuperAdminLayout` in `artifacts/marketflow/src/components/layout/SuperAdminLayout.tsx`
- Uses `useSuperAdmin()` hook
- Dark slate theme (bg-slate-950), red accent (#DC2626)
- Nav hrefs: `/super-admin/dashboard`, `/super-admin/stores`, `/super-admin/plans`, `/super-admin/admins`, `/super-admin/activity-logs`, `/super-admin/system-health`, `/super-admin/support`

## Products Page — Tab Pattern
Products page has tab bar (المنتجات / الفئات). Tab state with `useState('products')`.
Category CRUD is inside the CategoriesTab sub-component within ProductsPage.

## Inventory Page — Modal Pattern
Single `modal: ModalType` state controls which modal is open ('adjust' | 'transfer' | 'waste' | 'stocktake' | 'receive' | null).
`openModal(product, type)` sets both `activeProduct` and `modal`.

## Returns Page
Multi-step: step='search' shows sales list, step='items' shows item selection.
Only shows `status === 'completed' || status === 'paid'` sales as returnable.

## Register Store Page
4-step wizard: 'store' → 'owner' → 'branch' → 'plan'.
Per-step validation before advancing. Plan picker with 4 plans.

## Demo Accounts (tenant: شركة كنوز التجريبية)
- owner@demo.local / Demo@12345
- admin@demo.local / Demo@12345
- cashier@demo.local / Demo@12345
- inventory@demo.local / Demo@12345
Super Admin: superadmin@marketflow.app / SuperAdmin@2025 (portal: /super-admin/login)
