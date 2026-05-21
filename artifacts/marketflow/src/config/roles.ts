export type RoleSlug = 
  | 'owner' | 'admin' | 'branch_manager' | 'cashier' 
  | 'inventory_manager' | 'purchasing_officer' | 'accountant' 
  | 'sales_rep' | 'supplier_viewer';

const ROLES_CONFIG: Record<string, string[]> = {
  owner: ['all'],
  admin: ['all'],
  branch_manager: [
    '/dashboard', '/pos', '/products', '/inventory', '/stock-movements',
    '/purchases', '/suppliers', '/sales', '/returns', '/customers',
    '/expenses', '/employees', '/branches', '/notifications', '/tasks',
    '/settings', '/profile', '/activity-logs', '/categories',
  ],
  cashier: ['/dashboard', '/pos', '/sales', '/returns', '/profile', '/notifications'],
  inventory_manager: [
    '/dashboard', '/products', '/inventory', '/stock-movements',
    '/categories', '/notifications', '/profile', '/tasks',
  ],
  purchasing_officer: [
    '/dashboard', '/purchases', '/suppliers', '/inventory', '/stock-movements',
    '/notifications', '/profile', '/tasks',
  ],
  accountant: [
    '/dashboard', '/sales', '/returns', '/expenses', '/accounting',
    '/reports', '/customers', '/notifications', '/profile', '/tasks',
  ],
  sales_rep: [
    '/dashboard', '/pos', '/sales', '/customers', '/notifications', '/profile', '/tasks',
  ],
  supplier_viewer: ['/purchases', '/profile', '/notifications'],
};

export function canAccessRoute(roleSlug: string, route: string): boolean {
  if (!roleSlug) return false;
  if (roleSlug === 'owner' || roleSlug === 'admin') return true;
  const allowed = ROLES_CONFIG[roleSlug] ?? [];
  return allowed.some(r => route === r || route.startsWith(`${r}/`));
}
