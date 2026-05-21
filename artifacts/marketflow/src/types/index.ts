export type Role = 'owner' | 'admin' | 'branch_manager' | 'cashier' | 'inventory_manager' | 'purchasing_officer' | 'accountant' | 'supplier_viewer';

export interface User { id: number; name: string; role: Role; branch: string; email: string; phone: string; lastLogin: string; status: 'active' | 'inactive'; }

export interface Product { id: number; name: string; barcode: string; sku: string; category: string; supplier: string; purchasePrice: number; salePrice: number; tax: number; minStock: number; currentStock: number; unit: string; status: 'active' | 'inactive'; expiryDate?: string; image?: string; }

export interface Category { id: number; name: string; icon: string; productCount: number; order: number; }

export interface Branch { id: number; name: string; city: string; address: string; manager: string; employeesCount: number; status: 'active' | 'closed'; todaySales: number; phone: string; }

export interface Supplier { id: number; name: string; phone: string; email: string; address: string; totalPurchases: number; balance: number; lastDeal: string; rating: number; }

export interface SaleItem { productId: number; productName: string; quantity: number; price: number; discount: number; }

export interface Sale { id: number; invoiceNumber: string; date: string; cashier: string; branch: string; customer: string; paymentMethod: 'cash' | 'card' | 'wallet' | 'mixed'; total: number; discount: number; tax: number; status: 'completed' | 'returned' | 'suspended'; items: SaleItem[]; }

export interface PurchaseOrder { id: number; orderNumber: string; supplier: string; date: string; branch: string; status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled'; total: number; user: string; }

export interface StockMovement { id: number; date: string; product: string; type: 'sale' | 'purchase' | 'return' | 'transfer' | 'waste' | 'adjustment'; quantityBefore: number; quantityAfter: number; user: string; branch: string; notes: string; }

export interface Expense { id: number; type: string; date: string; branch: string; amount: number; paymentMethod: string; employee: string; notes: string; approved: boolean; }

export interface Customer { id: number; name: string; phone: string; orders: number; totalPurchases: number; loyaltyPoints: number; lastVisit: string; }

export interface Notification { id: number; type: string; title: string; message: string; time: string; read: boolean; }

export interface ActivityLog { id: number; user: string; action: string; page: string; time: string; ip: string; branch: string; details: string; }
