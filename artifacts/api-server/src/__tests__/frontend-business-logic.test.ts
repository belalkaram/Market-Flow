import { describe, it, expect } from "vitest";

// Mirror of the frontend canAccessRoute and ROLES_CONFIG logic
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

function canAccessRoute(roleSlug: string, route: string): boolean {
  if (!roleSlug) return false;
  if (roleSlug === 'owner' || roleSlug === 'admin') return true;
  if (COMMON_ALLOWED_ROUTES.some(r => route === r || route.startsWith(`${r}/`))) return true;
  const allowed = ROLES_CONFIG[roleSlug] ?? [];
  return allowed.some(r => route === r || route.startsWith(`${r}/`));
}

describe("9. Frontend RBAC Guard & Business Logic Unit Tests", () => {
  describe("canAccessRoute Role Security Matrix", () => {
    it("should allow owner to access ANY route", () => {
      expect(canAccessRoute("owner", "/roles")).toBe(true);
      expect(canAccessRoute("owner", "/employees")).toBe(true);
      expect(canAccessRoute("owner", "/reports")).toBe(true);
      expect(canAccessRoute("owner", "/settings")).toBe(true);
      expect(canAccessRoute("owner", "/pos")).toBe(true);
    });

    it("should allow admin to access ANY route", () => {
      expect(canAccessRoute("admin", "/roles")).toBe(true);
      expect(canAccessRoute("admin", "/employees")).toBe(true);
      expect(canAccessRoute("admin", "/reports")).toBe(true);
      expect(canAccessRoute("admin", "/settings")).toBe(true);
    });

    it("should restrict cashier to allowed POS/sales routes and BLOCK admin routes", () => {
      // Allowed
      expect(canAccessRoute("cashier", "/pos")).toBe(true);
      expect(canAccessRoute("cashier", "/sales")).toBe(true);
      expect(canAccessRoute("cashier", "/returns")).toBe(true);
      expect(canAccessRoute("cashier", "/customer-orders")).toBe(true);

      // Blocked
      expect(canAccessRoute("cashier", "/roles")).toBe(false);
      expect(canAccessRoute("cashier", "/employees")).toBe(false);
      expect(canAccessRoute("cashier", "/reports")).toBe(false);
      expect(canAccessRoute("cashier", "/settings")).toBe(false);
      expect(canAccessRoute("cashier", "/branches")).toBe(false);
      expect(canAccessRoute("cashier", "/accounting")).toBe(false);
      expect(canAccessRoute("cashier", "/inventory")).toBe(false);
      expect(canAccessRoute("cashier", "/purchases")).toBe(false);
    });

    it("should restrict inventory manager to catalog/stock routes", () => {
      expect(canAccessRoute("inventory_manager", "/products")).toBe(true);
      expect(canAccessRoute("inventory_manager", "/inventory")).toBe(true);
      expect(canAccessRoute("inventory_manager", "/categories")).toBe(true);
      expect(canAccessRoute("inventory_manager", "/stock-movements")).toBe(true);

      // Blocked
      expect(canAccessRoute("inventory_manager", "/roles")).toBe(false);
      expect(canAccessRoute("inventory_manager", "/employees")).toBe(false);
      expect(canAccessRoute("inventory_manager", "/sales")).toBe(false);
      expect(canAccessRoute("inventory_manager", "/accounting")).toBe(false);
    });

    it("should restrict accountant to financial routes", () => {
      expect(canAccessRoute("accountant", "/sales")).toBe(true);
      expect(canAccessRoute("accountant", "/expenses")).toBe(true);
      expect(canAccessRoute("accountant", "/accounting")).toBe(true);
      expect(canAccessRoute("accountant", "/reports")).toBe(true);

      // Blocked
      expect(canAccessRoute("accountant", "/roles")).toBe(false);
      expect(canAccessRoute("accountant", "/pos")).toBe(false);
      expect(canAccessRoute("accountant", "/branches")).toBe(false);
    });

    it("should allow common routes for any authenticated role", () => {
      const roles = ["cashier", "inventory_manager", "purchasing_officer", "accountant", "sales_rep", "supplier_viewer"];
      for (const role of roles) {
        expect(canAccessRoute(role, "/home")).toBe(true);
        expect(canAccessRoute(role, "/profile")).toBe(true);
        expect(canAccessRoute(role, "/notifications")).toBe(true);
        expect(canAccessRoute(role, "/support")).toBe(true);
        expect(canAccessRoute(role, "/unauthorized")).toBe(true);
      }
    });

    it("should return false for empty or invalid role", () => {
      expect(canAccessRoute("", "/pos")).toBe(false);
      expect(canAccessRoute("unknown_role", "/roles")).toBe(false);
    });
  });

  describe("Cart & Financial Calculations Unit Integrity", () => {
    function calculateCart({
      items,
      discount = 0,
      taxPercent = 15,
      taxEnabled = true,
    }: {
      items: { price: number; quantity: number }[];
      discount?: number;
      taxPercent?: number;
      taxEnabled?: boolean;
    }) {
      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const effectiveTaxRate = taxEnabled ? taxPercent / 100 : 0;
      const taxAmount = Number((subtotal * effectiveTaxRate).toFixed(2));
      const grandTotal = Math.max(0, Number((subtotal + taxAmount - discount).toFixed(2)));

      return { subtotal, taxAmount, grandTotal };
    }

    it("should calculate exact subtotal, 15% VAT, and grand total", () => {
      const cart = calculateCart({
        items: [
          { price: 25.5, quantity: 2 }, // 51.00
          { price: 10.0, quantity: 3 }, // 30.00
        ],
        discount: 5.0,
        taxPercent: 15,
        taxEnabled: true,
      });

      expect(cart.subtotal).toBe(81.0);
      expect(cart.taxAmount).toBe(12.15); // 81 * 0.15 = 12.15
      expect(cart.grandTotal).toBe(88.15); // 81 + 12.15 - 5 = 88.15
    });

    it("should handle 0 tax rate when tax is disabled", () => {
      const cart = calculateCart({
        items: [{ price: 100, quantity: 1 }],
        discount: 10,
        taxEnabled: false,
      });

      expect(cart.subtotal).toBe(100);
      expect(cart.taxAmount).toBe(0);
      expect(cart.grandTotal).toBe(90);
    });

    it("should prevent negative grand total if discount exceeds total", () => {
      const cart = calculateCart({
        items: [{ price: 50, quantity: 1 }],
        discount: 1000,
      });

      expect(cart.grandTotal).toBe(0);
    });

    it("should handle floating point rounding without precision errors", () => {
      const cart = calculateCart({
        items: [
          { price: 0.1, quantity: 1 },
          { price: 0.2, quantity: 1 },
        ],
        discount: 0,
        taxEnabled: false,
      });

      expect(cart.subtotal).toBeCloseTo(0.3, 5);
      expect(cart.grandTotal).toBeCloseTo(0.3, 5);
    });
  });
});
