// API server URL (configurable for standalone deployments, defaults to /api for unified/proxied setups)
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") || "/api";

function getToken(): string | null {
  return localStorage.getItem("mf_token");
}

import { setApiCache, getApiCache, addSyncQueueItem, saveOfflineSale } from "./offlineDb";
import { offlineSyncManager } from "./offlineSync";

function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const cacheKey = `${method}:${path}`;

  // If user is currently offline and trying a GET request, immediately try cache
  if (!isOnline() && method === "GET") {
    const cached = await getApiCache<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    throw new ApiError(0, "أنت غير متصل بالإنترنت ولم يتم العثور على بيانات مخزنة محلياً");
  }

  // If user is offline and trying a POST/PUT/DELETE
  if (!isOnline() && method !== "GET") {
    return handleOfflineMutation<T>(method, path, body);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, json.message || "حدث خطأ غير متوقع", json.errors);
    }

    // On successful GET, update cache in the background (non-blocking)
    if (method === "GET") {
      setApiCache(cacheKey, json.data).catch(() => {});
    }

    return json.data as T;
  } catch (err: any) {
    // Check if network error (offline or server unreachable)
    const isNetworkError =
      err instanceof TypeError ||
      err?.message?.includes("fetch") ||
      err?.message?.includes("network") ||
      !isOnline();

    if (isNetworkError) {
      if (method === "GET") {
        const cached = await getApiCache<T>(cacheKey);
        if (cached !== null) {
          return cached;
        }
      } else {
        return handleOfflineMutation<T>(method, path, body);
      }
    }

    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err?.message || "تعذر الاتصال بالخادم، تم حفظ العمليات محلياً");
  }
}

async function handleOfflineMutation<T>(method: string, path: string, body?: any): Promise<T> {
  // If this is a checkout request from POS
  if (path === "/sales/checkout" && body) {
    const tempId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const invoiceNumber = `OFF-${Date.now().toString().slice(-6)}`;
    
    // Attempt to lookup cached products for invoice item descriptions
    const cachedProducts = (await getApiCache<any[]>("GET:/products")) || [];
    const productMap = new Map(cachedProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    let taxAmount = 0;
    const items = (body.items || []).map((it: any) => {
      const prod = productMap.get(it.productId);
      const name = prod ? prod.name : "منتج غير محدد";
      const price = prod ? Number(prod.salePrice) : 0;
      const taxPct = prod && body.taxEnabled ? Number(prod.taxPercent || 0) : 0;
      const itemSubtotal = price * it.quantity;
      const itemTax = itemSubtotal * (taxPct / 100);

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      return {
        item: {
          id: `item_${Math.random()}`,
          salesOrderId: tempId,
          productId: it.productId,
          productName: name,
          quantity: it.quantity,
          unitPrice: String(price),
          discountAmount: "0",
          taxPercent: String(taxPct),
          totalPrice: String(itemSubtotal + itemTax),
        },
        product: prod || null,
      };
    });

    const discountAmount = Number(body.discountAmount || 0);
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    const offlineOrder = {
      id: tempId,
      invoiceNumber,
      status: "completed",
      paymentMethod: body.paymentMethod || "cash",
      subtotal: String(subtotal.toFixed(2)),
      discountAmount: String(discountAmount.toFixed(2)),
      taxAmount: String(taxAmount.toFixed(2)),
      totalAmount: String(totalAmount.toFixed(2)),
      customerName: "عميل نقدي (أوفلاين)",
      cashierName: "كاشير (محلي)",
      notes: body.notes || "فاتورة مسجلة بدون إنترنت",
      createdAt: new Date().toISOString(),
      items,
      isOffline: true,
    };

    // Save to offline sales store
    await saveOfflineSale({
      id: tempId,
      invoiceNumber,
      createdAt: offlineOrder.createdAt,
      items,
      totalAmount: offlineOrder.totalAmount,
      subtotal: offlineOrder.subtotal,
      taxAmount: offlineOrder.taxAmount,
      discountAmount: offlineOrder.discountAmount,
      paymentMethod: offlineOrder.paymentMethod,
      synced: false,
    });

    // Add to sync queue to upload to server when internet returns
    await addSyncQueueItem({
      method,
      path,
      body,
      description: `فاتورة مبيعات ${invoiceNumber}`,
      tempId,
    });

    offlineSyncManager.updateQueueCount();

    return offlineOrder as unknown as T;
  }

  // Any other mutation (create product, category, customer, adjustment, etc.)
  await addSyncQueueItem({
    method,
    path,
    body,
    description: `${method} ${path}`,
  });

  offlineSyncManager.updateQueueCount();

  return { success: true, offline: true, message: "تم الحفظ محلياً وستتم المزامنة تلقائياً" } as unknown as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public override message: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: ApiUser }>("/auth/login", { email, password }),
  me: () => api.get<ApiUser>("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Dashboard
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
};

// Branches
export const branchesApi = {
  list: () => api.get<ApiBranch[]>("/branches"),
  create: (data: Partial<ApiBranch>) => api.post<ApiBranch>("/branches", data),
  update: (id: string, data: Partial<ApiBranch>) => api.put<ApiBranch>(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
};

// Categories
export const categoriesApi = {
  list: () => api.get<ApiCategory[]>("/categories"),
  create: (data: Partial<ApiCategory>) => api.post<ApiCategory>("/categories", data),
  update: (id: string, data: Partial<ApiCategory>) => api.put<ApiCategory>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Products
export const productsApi = {
  list: (params?: { search?: string; categoryId?: string; lowStock?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.categoryId) q.set("categoryId", params.categoryId);
    if (params?.lowStock) q.set("lowStock", "true");
    return api.get<ApiProduct[]>(`/products${q.toString() ? `?${q}` : ""}`);
  },
  get: (id: string) => api.get<ApiProduct>(`/products/${id}`),
  create: (data: Partial<ApiProduct>) => api.post<ApiProduct>("/products", data),
  update: (id: string, data: Partial<ApiProduct>) => api.put<ApiProduct>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Suppliers
export const suppliersApi = {
  list: () => api.get<ApiSupplier[]>("/suppliers"),
  get: (id: string) => api.get<ApiSupplier>(`/suppliers/${id}`),
  create: (data: Partial<ApiSupplier>) => api.post<ApiSupplier>("/suppliers", data),
  update: (id: string, data: Partial<ApiSupplier>) => api.put<ApiSupplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Customers
export const customersApi = {
  list: () => api.get<ApiCustomer[]>("/customers"),
  get: (id: string) => api.get<ApiCustomer>(`/customers/${id}`),
  create: (data: Partial<ApiCustomer>) => api.post<ApiCustomer>("/customers", data),
  update: (id: string, data: Partial<ApiCustomer>) => api.put<ApiCustomer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Sales
export const salesApi = {
  list: (params?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    if (params?.dateFrom) q.set("dateFrom", params.dateFrom);
    if (params?.dateTo) q.set("dateTo", params.dateTo);
    return api.get<ApiSalesOrder[]>(`/sales${q.toString() ? `?${q}` : ""}`);
  },
  get: (id: string) => api.get<ApiSalesOrderFull>(`/sales/${id}`),
  checkout: (data: CheckoutData) => api.post<ApiSalesOrderFull>("/sales/checkout", data),
  refund: (id: string) => api.post<ApiSalesOrder>(`/sales/${id}/refund`),
};

// Purchases
export const purchasesApi = {
  list: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    return api.get<ApiPurchaseOrder[]>(`/purchase-orders${q.toString() ? `?${q}` : ""}`);
  },
  get: (id: string) => api.get<ApiPurchaseOrderFull>(`/purchase-orders/${id}`),
  create: (data: CreatePurchaseOrderData) => api.post<ApiPurchaseOrder>("/purchase-orders", data),
  update: (id: string, data: Partial<ApiPurchaseOrder>) => api.put<ApiPurchaseOrder>(`/purchase-orders/${id}`, data),
  receive: (id: string) => api.post(`/purchase-orders/${id}/receive`),
  cancel: (id: string) => api.delete(`/purchase-orders/${id}`),
};

// Inventory
export const inventoryApi = {
  stock: () => api.get<ApiProduct[]>("/inventory/stock"),
  movements: () => api.get<ApiStockMovement[]>("/inventory/movements"),
  lowStock: () => api.get<ApiProduct[]>("/inventory/low-stock"),
  adjust: (data: AdjustmentData) => api.post("/inventory/adjustments", data),
};

// Tasks
export const tasksApi = {
  list: () => api.get<ApiTask[]>("/tasks"),
  get: (id: string) => api.get<ApiTaskFull>(`/tasks/${id}`),
  create: (data: Partial<ApiTask>) => api.post<ApiTask>("/tasks", data),
  update: (id: string, data: Partial<ApiTask>) => api.put<ApiTask>(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  addComment: (id: string, comment: string) => api.post(`/tasks/${id}/comments`, { comment }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Users
export const usersApi = {
  list: () => api.get<ApiUser[]>("/users"),
  create: (data: Partial<ApiUser> & { password: string }) => api.post<ApiUser>("/users", data),
  update: (id: string, data: Partial<ApiUser>) => api.put<ApiUser>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Roles & Permissions
export const rolesApi = {
  list: () => api.get<(ApiRole & { userCount?: number })[]>("/roles"),
  getPermissions: (id: string) => api.get<{ role: ApiRole; permissions: Array<{ id: string; resource: string; action: string; granted: boolean }> }>(`/roles/${id}/permissions`),
  updatePermissions: (id: string, permissionIds: string[]) => api.put(`/roles/${id}/permissions`, { permissionIds }),
};

export const authPermissionsApi = {
  myPermissions: () => api.get<Array<{ resource: string; action: string }>>("/auth/permissions"),
};

// Expenses
export const expensesApi = {
  list: () => api.get<ApiExpense[]>("/expenses"),
  create: (data: Partial<ApiExpense>) => api.post<ApiExpense>("/expenses", data),
  update: (id: string, data: Partial<ApiExpense>) => api.put<ApiExpense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Admin/Demo
export const adminApi = {
  demoStatus: () => api.get<DemoStatus>("/admin/demo/status"),
  seed: () => api.post("/admin/demo/seed"),
  reset: () => api.post("/admin/demo/reset"),
  clear: () => api.delete("/admin/demo/clear"),
};

// --- Types ---
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tenantId: string;
  branchId?: string;
  role: string;
  roleName: string;
  roleSlug?: string;
  branchName?: string;
  tenantName?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  tenantStatus?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  trialDaysLeft?: number | null;
  isTrialExpired?: boolean;
}

export interface ApiBranch {
  id: string;
  tenantId: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface ApiCategory {
  id: string;
  tenantId: string;
  name: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ApiProduct {
  id: string;
  tenantId: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  barcode?: string;
  sku?: string;
  unit: string;
  purchasePrice: string;
  salePrice: string;
  taxPercent: string;
  minStock: number;
  currentStock: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface ApiSupplier {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: string;
  rating?: string;
  isActive: boolean;
  recentOrders?: ApiPurchaseOrder[];
}

export interface ApiCustomer {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints: number;
  totalPurchases: string;
  lastVisitAt?: string;
}

export interface ApiSalesOrder {
  id: string;
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  customerName?: string;
  cashierName?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  taxPercent: string;
  totalPrice: string;
}

export interface ApiSalesOrderFull extends ApiSalesOrder {
  items: Array<{ item: SalesOrderItem; product: ApiProduct | null }>;
}

export interface ApiPurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  createdByName?: string;
  status: string;
  totalAmount: string;
  notes?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  receivedQuantity?: number;
  unitPrice: string;
  totalPrice: string;
}

export interface ApiPurchaseOrderFull extends ApiPurchaseOrder {
  items: Array<{ item: PurchaseOrderItem; productName: string | null }>;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  status?: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number; unitPrice: string }>;
}

export interface ApiStockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  notes?: string;
  createdAt: string;
}

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
  assigneeName?: string;
  createdAt: string;
}

export interface ApiTaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  comment: string;
  createdAt: string;
}

export interface ApiTaskFull extends ApiTask {
  comments: ApiTaskComment[];
}

export interface ApiRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ApiExpense {
  id: string;
  type: string;
  description: string;
  amount: string;
  paymentMethod: string;
  isApproved: boolean;
  expenseDate: string;
}

export interface DashboardSummary {
  totalProducts: number;
  todaySales: number;
  monthSales: number;
  totalCustomers: number;
  pendingTasks: number;
  lowStockProducts: number;
  totalBranches: number;
  totalUsers: number;
  salesChart: { date: string; total: string; count: number }[];
  recentSales: ApiSalesOrder[];
}

export interface DemoStatus {
  tenant: { id: string; name: string };
  counts: { users: number; products: number; orders: number; tasks: number; branches: number };
  dbStatus: string;
}

export interface CheckoutData {
  items: { productId: string; quantity: number }[];
  customerId?: string;
  paymentMethod: string;
  discountAmount?: number;
  notes?: string;
  taxEnabled?: boolean;
  allowNegative?: boolean;
}

export interface AdjustmentData {
  productId: string;
  branchId?: string;
  adjustmentType: string;
  quantity: number;
  reason?: string;
}
