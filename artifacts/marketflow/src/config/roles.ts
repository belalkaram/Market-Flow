export type RoleSlug = 
  | 'owner' | 'admin' | 'branch_manager' | 'cashier' 
  | 'inventory_manager' | 'purchasing_officer' | 'accountant' 
  | 'sales_rep' | 'supplier_viewer';

const ROLES_CONFIG: Record<string, string[]> = {
  owner: ['all'],
  admin: ['all'],
  branch_manager: [
    '/home', '/dashboard', '/pos', '/products', '/inventory', '/stock-movements',
    '/purchases', '/suppliers', '/sales', '/returns', '/customers',
    '/expenses', '/employees', '/branches', '/notifications', '/tasks',
    '/settings', '/profile', '/activity-logs', '/categories',
    '/customer-orders', '/order-settings', '/support',
  ],
  cashier: [
    '/home', '/dashboard', '/pos', '/sales', '/returns', '/profile', '/notifications',
    '/customer-orders', '/support',
  ],
  inventory_manager: [
    '/home', '/dashboard', '/products', '/inventory', '/stock-movements',
    '/categories', '/notifications', '/profile', '/tasks', '/support',
  ],
  purchasing_officer: [
    '/home', '/dashboard', '/purchases', '/suppliers', '/inventory', '/stock-movements',
    '/notifications', '/profile', '/tasks', '/support',
  ],
  accountant: [
    '/home', '/dashboard', '/sales', '/returns', '/expenses', '/accounting',
    '/reports', '/customers', '/notifications', '/profile', '/tasks', '/support',
  ],
  sales_rep: [
    '/home', '/dashboard', '/pos', '/sales', '/customers', '/notifications', '/profile',
    '/tasks', '/customer-orders', '/support',
  ],
  supplier_viewer: ['/home', '/purchases', '/profile', '/notifications', '/support'],
};

const COMMON_ALLOWED_ROUTES = ['/home', '/profile', '/notifications', '/support', '/unauthorized'];

export function canAccessRoute(roleSlug: string, route: string): boolean {
  if (!roleSlug) return false;
  if (roleSlug === 'owner' || roleSlug === 'admin') return true;
  if (COMMON_ALLOWED_ROUTES.some(r => route === r || route.startsWith(`${r}/`))) return true;
  const allowed = ROLES_CONFIG[roleSlug] ?? [];
  return allowed.some(r => route === r || route.startsWith(`${r}/`));
}
