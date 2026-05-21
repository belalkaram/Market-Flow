import { Product, Branch, User, Supplier, Category, Sale, PurchaseOrder, StockMovement, Expense, Customer, Notification, ActivityLog } from '../types';

export const mockBranches: Branch[] = [
  { id: 1, name: "فرع القاهرة", city: "القاهرة", address: "شارع التحرير، الدقي", manager: "محمد علي", employeesCount: 15, status: 'active', todaySales: 45000, phone: "01012345678" },
  { id: 2, name: "فرع الجيزة", city: "الجيزة", address: "شارع الهرم الرئيسي", manager: "طارق سعيد", employeesCount: 12, status: 'active', todaySales: 32000, phone: "01112345678" },
  { id: 3, name: "فرع الإسكندرية", city: "الإسكندرية", address: "محطة الرمل", manager: "ياسر إبراهيم", employeesCount: 10, status: 'active', todaySales: 28000, phone: "01212345678" },
  { id: 4, name: "فرع المنصورة", city: "المنصورة", address: "شارع الجمهورية", manager: "محمود حسن", employeesCount: 8, status: 'active', todaySales: 15000, phone: "01098765432" }
];

export const mockUsers: User[] = [
  { id: 1, name: "أحمد محمد", role: "owner", branch: "المركز الرئيسي", email: "ahmed@marketflow.com", phone: "01000000001", lastLogin: "2024-03-24T08:30:00Z", status: "active" },
  { id: 2, name: "محمد علي", role: "branch_manager", branch: "فرع القاهرة", email: "mohamed@marketflow.com", phone: "01000000002", lastLogin: "2024-03-24T09:00:00Z", status: "active" },
  { id: 3, name: "سارة حسن", role: "accountant", branch: "المركز الرئيسي", email: "sara@marketflow.com", phone: "01000000003", lastLogin: "2024-03-24T09:15:00Z", status: "active" },
  { id: 4, name: "خالد سمير", role: "inventory_manager", branch: "فرع القاهرة", email: "khaled@marketflow.com", phone: "01000000004", lastLogin: "2024-03-24T07:45:00Z", status: "active" },
  { id: 5, name: "منى عادل", role: "purchasing_officer", branch: "المركز الرئيسي", email: "mona@marketflow.com", phone: "01000000005", lastLogin: "2024-03-24T10:00:00Z", status: "active" },
  { id: 6, name: "عمر فاروق", role: "cashier", branch: "فرع القاهرة", email: "omar@marketflow.com", phone: "01000000006", lastLogin: "2024-03-24T14:00:00Z", status: "active" },
];

export const mockCategories: Category[] = [
  { id: 1, name: "ألبان", icon: "Milk", productCount: 45, order: 1 },
  { id: 2, name: "مشروبات", icon: "Coffee", productCount: 120, order: 2 },
  { id: 3, name: "بقالة", icon: "ShoppingBag", productCount: 350, order: 3 },
  { id: 4, name: "منظفات", icon: "SprayCan", productCount: 85, order: 4 },
  { id: 5, name: "لحوم", icon: "Drumstick", productCount: 30, order: 5 },
  { id: 6, name: "مجمدات", icon: "Snowflake", productCount: 65, order: 6 },
  { id: 7, name: "مخبوزات", icon: "Croissant", productCount: 25, order: 7 },
  { id: 8, name: "خضار وفاكهة", icon: "Apple", productCount: 80, order: 8 },
  { id: 9, name: "حلويات", icon: "Cookie", productCount: 150, order: 9 }
];

export const mockSuppliers: Supplier[] = [
  { id: 1, name: "شركة النور للتوريدات", phone: "01122334455", email: "contact@alnoor.com", address: "العبور، القاهرة", totalPurchases: 1500000, balance: -50000, lastDeal: "2024-03-20", rating: 4.5 },
  { id: 2, name: "شركة الخير للمواد الغذائية", phone: "01099887766", email: "sales@alkheir.com", address: "مدينة نصر، القاهرة", totalPurchases: 850000, balance: 0, lastDeal: "2024-03-22", rating: 4.8 },
  { id: 3, name: "شركة الصفوة للمشروبات", phone: "01233445566", email: "info@alsafwa.com", address: "السادس من أكتوبر، القاهرة", totalPurchases: 2100000, balance: -120000, lastDeal: "2024-03-23", rating: 4.2 },
  { id: 4, name: "شركة المدينة للمنظفات", phone: "01555667788", email: "orders@almadina.com", address: "شبرا، القاهرة", totalPurchases: 450000, balance: -15000, lastDeal: "2024-03-18", rating: 3.9 }
];

export const mockProducts: Product[] = [
  { id: 1, name: "لبن كامل الدسم جهينة 1 لتر", barcode: "6221043011111", sku: "DAI-JOH-001", category: "ألبان", supplier: "شركة الخير للمواد الغذائية", purchasePrice: 25, salePrice: 32, tax: 14, minStock: 50, currentStock: 120, unit: "قطعة", status: "active", expiryDate: "2024-04-10" },
  { id: 2, name: "أرز مصري الضحى 5 كيلو", barcode: "6221043022222", sku: "GRO-DOH-005", category: "بقالة", supplier: "شركة النور للتوريدات", purchasePrice: 140, salePrice: 165, tax: 0, minStock: 20, currentStock: 45, unit: "قطعة", status: "active", expiryDate: "2025-01-01" },
  { id: 3, name: "زيت عباد الشمس عافية 1.6 لتر", barcode: "6221043033333", sku: "GRO-AFI-160", category: "بقالة", supplier: "شركة النور للتوريدات", purchasePrice: 110, salePrice: 135, tax: 0, minStock: 30, currentStock: 15, unit: "قطعة", status: "active", expiryDate: "2025-06-15" }, // Low stock
  { id: 4, name: "سكر أبيض الأسرة 1 كيلو", barcode: "6221043044444", sku: "GRO-OSR-001", category: "بقالة", supplier: "شركة النور للتوريدات", purchasePrice: 35, salePrice: 40, tax: 0, minStock: 100, currentStock: 250, unit: "قطعة", status: "active", expiryDate: "2026-01-01" },
  { id: 5, name: "شاي ناعم ليبتون 250 جرام", barcode: "6221043055555", sku: "BEV-LIP-250", category: "مشروبات", supplier: "شركة الصفوة للمشروبات", purchasePrice: 45, salePrice: 55, tax: 14, minStock: 40, currentStock: 85, unit: "قطعة", status: "active", expiryDate: "2025-12-31" },
  { id: 6, name: "مياه معدنية نستله 1.5 لتر", barcode: "6221043066666", sku: "BEV-NES-150", category: "مشروبات", supplier: "شركة الصفوة للمشروبات", purchasePrice: 5.5, salePrice: 7.5, tax: 14, minStock: 200, currentStock: 450, unit: "قطعة", status: "active", expiryDate: "2025-03-20" },
  { id: 7, name: "جبنة بيضاء دومتي 500 جرام", barcode: "6221043077777", sku: "DAI-DOM-500", category: "ألبان", supplier: "شركة الخير للمواد الغذائية", purchasePrice: 40, salePrice: 52, tax: 14, minStock: 30, currentStock: 25, unit: "قطعة", status: "active", expiryDate: "2024-05-15" }, // Low stock
  { id: 8, name: "مكرونة ريجينا 400 جرام", barcode: "6221043088888", sku: "GRO-REG-400", category: "بقالة", supplier: "شركة النور للتوريدات", purchasePrice: 12, salePrice: 15, tax: 0, minStock: 100, currentStock: 5, unit: "قطعة", status: "active", expiryDate: "2025-08-10" }, // Critical stock
  { id: 9, name: "مسحوق غسيل أريال 2.5 كيلو", barcode: "6221043099999", sku: "CLN-ARI-250", category: "منظفات", supplier: "شركة المدينة للمنظفات", purchasePrice: 180, salePrice: 220, tax: 14, minStock: 20, currentStock: 35, unit: "قطعة", status: "active" },
  { id: 10, name: "بسكويت أوريو 6 قطع", barcode: "6221043101010", sku: "SNC-ORE-006", category: "حلويات", supplier: "شركة الخير للمواد الغذائية", purchasePrice: 8, salePrice: 10, tax: 14, minStock: 50, currentStock: 120, unit: "قطعة", status: "active", expiryDate: "2024-11-20" },
  { id: 11, name: "عصير مانجو بيتي 1 لتر", barcode: "6221043111111", sku: "BEV-BEY-001", category: "مشروبات", supplier: "شركة الصفوة للمشروبات", purchasePrice: 18, salePrice: 25, tax: 14, minStock: 40, currentStock: 60, unit: "قطعة", status: "active", expiryDate: "2024-09-15" },
  { id: 12, name: "قهوة سريعة التحضير نسكافيه 200 جرام", barcode: "6221043121212", sku: "BEV-NES-200", category: "مشروبات", supplier: "شركة الصفوة للمشروبات", purchasePrice: 130, salePrice: 160, tax: 14, minStock: 15, currentStock: 40, unit: "قطعة", status: "active", expiryDate: "2025-10-10" }
];

export const mockSales: Sale[] = [
  { id: 1, invoiceNumber: "INV-240324-001", date: "2024-03-24T10:15:00Z", cashier: "عمر فاروق", branch: "فرع القاهرة", customer: "نقدي", paymentMethod: "cash", total: 250, discount: 0, tax: 35, status: "completed", items: [] },
  { id: 2, invoiceNumber: "INV-240324-002", date: "2024-03-24T10:45:00Z", cashier: "عمر فاروق", branch: "فرع القاهرة", customer: "محمد سلامة", paymentMethod: "card", total: 1450, discount: 50, tax: 203, status: "completed", items: [] },
  { id: 3, invoiceNumber: "INV-240324-003", date: "2024-03-24T11:20:00Z", cashier: "عمر فاروق", branch: "فرع القاهرة", customer: "نقدي", paymentMethod: "wallet", total: 85, discount: 0, tax: 11.9, status: "completed", items: [] },
  { id: 4, invoiceNumber: "INV-240324-004", date: "2024-03-24T12:05:00Z", cashier: "عمر فاروق", branch: "فرع القاهرة", customer: "نقدي", paymentMethod: "cash", total: 320, discount: 0, tax: 44.8, status: "returned", items: [] },
  { id: 5, invoiceNumber: "INV-240324-005", date: "2024-03-24T13:30:00Z", cashier: "عمر فاروق", branch: "فرع القاهرة", customer: "أحمد شوقي", paymentMethod: "mixed", total: 2100, discount: 100, tax: 294, status: "completed", items: [] }
];

export const mockNotifications: Notification[] = [
  { id: 1, type: "alert", title: "مخزون منخفض", message: "مكرونة ريجينا 400 جرام وصلت للحد الأدنى للمخزون (5 قطع المتبقية)", time: "منذ 10 دقائق", read: false },
  { id: 2, type: "info", title: "عملية بيع كبيرة", message: "تم إصدار فاتورة بقيمة 2,100 جنيه في فرع القاهرة", time: "منذ 45 دقيقة", read: false },
  { id: 3, type: "warning", title: "اقتراب انتهاء صلاحية", message: "لبن كامل الدسم جهينة 1 لتر ينتهي صلاحيته خلال 15 يوم", time: "منذ ساعتين", read: true },
  { id: 4, type: "success", title: "استلام طلب شراء", message: "تم استلام طلب الشراء PO-2403-012 من شركة النور للتوريدات", time: "منذ 4 ساعات", read: true },
  { id: 5, type: "alert", title: "إلغاء فاتورة", message: "قام الكاشير عمر فاروق بإلغاء الفاتورة INV-240324-004", time: "منذ 5 ساعات", read: true }
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 1, user: "عمر فاروق", action: "إنشاء فاتورة", page: "نقطة البيع", time: "2024-03-24 13:30", ip: "192.168.1.45", branch: "فرع القاهرة", details: "إصدار فاتورة INV-240324-005 بقيمة 2100 جنيه" },
  { id: 2, user: "خالد سمير", action: "تعديل كمية", page: "المخزون", time: "2024-03-24 12:15", ip: "192.168.1.30", branch: "فرع القاهرة", details: "تعديل رصيد مكرونة ريجينا من 15 إلى 5 (هالك)" },
  { id: 3, user: "عمر فاروق", action: "مرتجع", page: "المرتجعات", time: "2024-03-24 12:05", ip: "192.168.1.45", branch: "فرع القاهرة", details: "استرجاع الفاتورة INV-240324-004 بقيمة 320 جنيه" },
  { id: 4, user: "منى عادل", action: "طلب شراء جديد", page: "المشتريات", time: "2024-03-24 11:30", ip: "192.168.1.22", branch: "المركز الرئيسي", details: "إنشاء طلب شراء PO-2403-015 لشركة الصفوة" },
  { id: 5, user: "أحمد محمد", action: "تسجيل دخول", page: "النظام", time: "2024-03-24 08:30", ip: "192.168.1.10", branch: "المركز الرئيسي", details: "تسجيل دخول ناجح" }
];
