import { db } from "@workspace/db";
import { permissions, roles, rolePermissions, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const RESOURCES = [
  'dashboard', 'pos', 'products', 'categories', 'inventory',
  'stock-movements', 'purchases', 'suppliers', 'sales', 'returns',
  'customers', 'expenses', 'accounting', 'reports', 'tasks',
  'employees', 'roles', 'branches', 'notifications', 'settings',
  'profile', 'activity-logs',
];

const ACTIONS = ['view', 'create', 'update', 'delete'];

const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  branch_manager: {
    dashboard: ['view'], pos: ['view', 'create'],
    products: ['view', 'create', 'update'], categories: ['view'],
    inventory: ['view', 'create', 'update'], 'stock-movements': ['view', 'create'],
    purchases: ['view', 'create', 'update'], suppliers: ['view', 'create', 'update'],
    sales: ['view', 'create', 'update'], returns: ['view', 'create'],
    customers: ['view', 'create', 'update'], expenses: ['view', 'create'],
    tasks: ['view', 'create', 'update'], employees: ['view'],
    branches: ['view'], notifications: ['view'], settings: ['view'],
    profile: ['view', 'update'],
  },
  cashier: {
    dashboard: ['view'], pos: ['view', 'create'],
    sales: ['view', 'create'], returns: ['view', 'create'],
    customers: ['view', 'create'], notifications: ['view'],
    profile: ['view', 'update'],
  },
  inventory_manager: {
    dashboard: ['view'], products: ['view', 'create', 'update', 'delete'],
    categories: ['view', 'create', 'update', 'delete'],
    inventory: ['view', 'create', 'update'], 'stock-movements': ['view', 'create'],
    notifications: ['view'], tasks: ['view', 'create', 'update'],
    profile: ['view', 'update'],
  },
  purchasing_officer: {
    dashboard: ['view'], purchases: ['view', 'create', 'update', 'delete'],
    suppliers: ['view', 'create', 'update'], inventory: ['view'],
    'stock-movements': ['view'], notifications: ['view'],
    tasks: ['view', 'create', 'update'], profile: ['view', 'update'],
  },
  accountant: {
    dashboard: ['view'], sales: ['view'], returns: ['view'],
    expenses: ['view', 'create', 'update', 'delete'],
    accounting: ['view', 'create'], reports: ['view'],
    customers: ['view'], notifications: ['view'],
    tasks: ['view'], profile: ['view', 'update'],
  },
  sales_rep: {
    dashboard: ['view'], pos: ['view', 'create'],
    sales: ['view', 'create'], customers: ['view', 'create', 'update'],
    notifications: ['view'], tasks: ['view', 'create'],
    profile: ['view', 'update'],
  },
  supplier_viewer: {
    purchases: ['view'], suppliers: ['view'],
    notifications: ['view'], profile: ['view', 'update'],
  },
};

async function main() {
  console.log('🌱 Seeding permissions...');

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      await db.insert(permissions)
        .values({ resource, action, description: `${action}:${resource}` })
        .onConflictDoNothing();
    }
  }

  const allPerms = await db.select().from(permissions);
  const permMap = new Map(allPerms.map(p => [`${p.resource}:${p.action}`, p.id]));

  const allRoles = await db.select().from(roles);

  for (const role of allRoles) {
    const slug = role.slug;

    if (slug === 'owner' || slug === 'admin') {
      for (const perm of allPerms) {
        await db.insert(rolePermissions)
          .values({ roleId: role.id, permissionId: perm.id })
          .onConflictDoNothing();
      }
      continue;
    }

    const config = ROLE_PERMISSIONS[slug];
    if (!config) continue;

    for (const [resource, actions] of Object.entries(config)) {
      for (const action of actions) {
        const permId = permMap.get(`${resource}:${action}`);
        if (!permId) continue;
        await db.insert(rolePermissions)
          .values({ roleId: role.id, permissionId: permId })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`✅ Permissions seeded: ${allPerms.length} permissions across ${allRoles.length} roles`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
