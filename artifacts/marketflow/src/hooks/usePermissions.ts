import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

export interface Permission {
  resource: string;
  action: string;
}

const HREF_TO_RESOURCE: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/pos': 'pos',
  '/products': 'products',
  '/categories': 'categories',
  '/inventory': 'inventory',
  '/stock-movements': 'stock-movements',
  '/purchases': 'purchases',
  '/suppliers': 'suppliers',
  '/sales': 'sales',
  '/returns': 'returns',
  '/customers': 'customers',
  '/expenses': 'expenses',
  '/accounting': 'accounting',
  '/reports': 'reports',
  '/tasks': 'tasks',
  '/employees': 'employees',
  '/roles': 'roles',
  '/branches': 'branches',
  '/notifications': 'notifications',
  '/settings': 'settings',
  '/profile': 'profile',
  '/activity-logs': 'activity-logs',
  '/customer-orders': 'sales',
  '/order-settings': 'settings',
};

export function usePermissions() {
  const { isAuthenticated, currentUser } = useAuth();
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['user-permissions', currentUser?.id],
    queryFn: () => api.get<Permission[]>('/auth/permissions'),
    enabled: isAuthenticated && !isOwnerOrAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const can = (resource: string, action: string = 'view'): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    if (isOwnerOrAdmin) return true;
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const canViewPage = (href: string): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    if (isOwnerOrAdmin) return true;
    const resource = HREF_TO_RESOURCE[href];
    if (!resource) return true;
    return can(resource, 'view');
  };

  return { permissions, can, canViewPage, isOwnerOrAdmin };
}
