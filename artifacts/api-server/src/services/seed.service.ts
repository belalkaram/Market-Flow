import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  tenants, branches, roles, users, categories, products,
  suppliers, purchaseOrders, purchaseOrderItems,
  customers, salesOrders, salesOrderItems,
  tasks, expenses, stockMovements,
} from "@workspace/db/schema";

const DEMO_PASSWORD = "Demo@12345";

export async function clearDemoData(tenantId: string) {
  // Delete in dependency order
  await db.delete(stockMovements).where(eq(stockMovements.tenantId, tenantId));
  await db.delete(salesOrderItems).where(
    eq(salesOrderItems.salesOrderId, 
      db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.tenantId, tenantId)).limit(1) as any)
  );
  // Use raw delete with subquery approach - simpler to delete all related data
  const salesOrderIds = await db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.tenantId, tenantId));
  if (salesOrderIds.length > 0) {
    for (const { id } of salesOrderIds) {
      await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, id));
    }
  }
  await db.delete(salesOrders).where(eq(salesOrders.tenantId, tenantId));

  const poIds = await db.select({ id: purchaseOrders.id }).from(purchaseOrders).where(eq(purchaseOrders.tenantId, tenantId));
  for (const { id } of poIds) {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
  }
  await db.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, tenantId));

  await db.delete(expenses).where(eq(expenses.tenantId, tenantId));
  await db.delete(tasks).where(eq(tasks.tenantId, tenantId));
  await db.delete(products).where(eq(products.tenantId, tenantId));
  await db.delete(categories).where(eq(categories.tenantId, tenantId));
  await db.delete(suppliers).where(eq(suppliers.tenantId, tenantId));
  await db.delete(customers).where(eq(customers.tenantId, tenantId));
  await db.delete(users).where(eq(users.tenantId, tenantId));
  await db.delete(roles).where(eq(roles.tenantId, tenantId));
  await db.delete(branches).where(eq(branches.tenantId, tenantId));
}

export async function runSeed(tenantId: string) {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Branches
  const [mainBranch, kuwaitBranch, cairoBranch] = await db.insert(branches).values([
    { tenantId, name: "الفرع الرئيسي", city: "الكويت", address: "شارع الخليج العربي، الكويت", phone: "96599001122" },
    { tenantId, name: "فرع الكويت", city: "الكويت", address: "شارع السالمية، الكويت", phone: "96599003344" },
    { tenantId, name: "فرع القاهرة", city: "القاهرة", address: "شارع التحرير، الدقي، القاهرة", phone: "01012345678" },
  ]).returning();

  // 2. Roles
  const roleData = [
    { tenantId, name: "مالك", slug: "owner", description: "صلاحيات كاملة", isSystem: true },
    { tenantId, name: "مدير", slug: "admin", description: "صلاحيات إدارية عامة", isSystem: true },
    { tenantId, name: "مدير فرع", slug: "branch_manager", description: "إدارة الفرع المحدد", isSystem: true },
    { tenantId, name: "كاشير", slug: "cashier", description: "نقطة البيع فقط", isSystem: true },
    { tenantId, name: "مدير مخزون", slug: "inventory_manager", description: "إدارة المخزون والمنتجات", isSystem: true },
    { tenantId, name: "مسؤول مشتريات", slug: "purchasing_officer", description: "إدارة المشتريات والموردين", isSystem: true },
    { tenantId, name: "محاسب", slug: "accountant", description: "التقارير المالية والمبيعات", isSystem: true },
    { tenantId, name: "مندوب مبيعات", slug: "sales_rep", description: "متابعة المبيعات والعملاء", isSystem: true },
  ];
  const insertedRoles = await db.insert(roles).values(roleData).returning();
  const roleMap: Record<string, string> = {};
  for (const r of insertedRoles) roleMap[r.slug] = r.id;

  // 3. Users
  await db.insert(users).values([
    { tenantId, branchId: mainBranch.id, roleId: roleMap["owner"], name: "أحمد الكنوز", email: "owner@demo.local", passwordHash: hash, phone: "96599111001", isActive: true },
    { tenantId, branchId: mainBranch.id, roleId: roleMap["admin"], name: "سلطان العمري", email: "admin@demo.local", passwordHash: hash, phone: "96599111002", isActive: true },
    { tenantId, branchId: kuwaitBranch.id, roleId: roleMap["branch_manager"], name: "محمد الشمري", email: "manager@demo.local", passwordHash: hash, phone: "96599111003", isActive: true },
    { tenantId, branchId: cairoBranch.id, roleId: roleMap["cashier"], name: "عمر فاروق", email: "cashier@demo.local", passwordHash: hash, phone: "01099111004", isActive: true },
    { tenantId, branchId: mainBranch.id, roleId: roleMap["inventory_manager"], name: "خالد المطيري", email: "inventory@demo.local", passwordHash: hash, phone: "96599111005", isActive: true },
    { tenantId, branchId: mainBranch.id, roleId: roleMap["purchasing_officer"], name: "منى العجمي", email: "purchasing@demo.local", passwordHash: hash, phone: "96599111006", isActive: true },
    { tenantId, branchId: mainBranch.id, roleId: roleMap["accountant"], name: "سارة حسن", email: "accountant@demo.local", passwordHash: hash, phone: "96599111007", isActive: true },
    { tenantId, branchId: kuwaitBranch.id, roleId: roleMap["sales_rep"], name: "فيصل النجدي", email: "sales@demo.local", passwordHash: hash, phone: "96599111008", isActive: true },
  ]);

  const [owner, admin, manager, cashier] = await db.select().from(users).where(eq(users.tenantId, tenantId));

  // 4. Categories
  const catData = [
    { tenantId, name: "ألبان ومشتقات", icon: "Milk", sortOrder: 1 },
    { tenantId, name: "مشروبات", icon: "Coffee", sortOrder: 2 },
    { tenantId, name: "بقالة وحبوب", icon: "ShoppingBag", sortOrder: 3 },
    { tenantId, name: "منظفات ومستلزمات", icon: "SprayCan", sortOrder: 4 },
    { tenantId, name: "لحوم ودواجن", icon: "Drumstick", sortOrder: 5 },
    { tenantId, name: "مجمدات", icon: "Snowflake", sortOrder: 6 },
    { tenantId, name: "مخبوزات وحلويات", icon: "Cookie", sortOrder: 7 },
    { tenantId, name: "خضار وفاكهة", icon: "Apple", sortOrder: 8 },
  ];
  const insertedCats = await db.insert(categories).values(catData).returning();
  const catMap: Record<string, string> = {};
  for (const c of insertedCats) catMap[c.name] = c.id;

  // 5. Suppliers
  const [sup1, sup2, sup3, sup4] = await db.insert(suppliers).values([
    { tenantId, name: "شركة النور للتوريدات", phone: "96522334455", email: "contact@alnoor.com", address: "منطقة الشويخ، الكويت", rating: "4.5", balance: "-50000" },
    { tenantId, name: "شركة الخير للمواد الغذائية", phone: "96522998877", email: "sales@alkheir.com", address: "منطقة الري، الكويت", rating: "4.8", balance: "0" },
    { tenantId, name: "شركة الصفوة للمشروبات", phone: "96523344556", email: "info@alsafwa.com", address: "منطقة السالمية، الكويت", rating: "4.2", balance: "-120000" },
    { tenantId, name: "شركة المدينة للمنظفات", phone: "96555667788", email: "orders@almadina.com", address: "منطقة الفروانية، الكويت", rating: "3.9", balance: "-15000" },
  ]).returning();

  // 6. Products
  const prodData = [
    { tenantId, categoryId: catMap["ألبان ومشتقات"], name: "لبن كامل الدسم جهينة 1 لتر", barcode: "6221043011111", sku: "DAI-JOH-001", purchasePrice: "25", salePrice: "32", taxPercent: "14", minStock: 50, currentStock: 120, unit: "قطعة", expiryDate: new Date("2026-04-10") },
    { tenantId, categoryId: catMap["بقالة وحبوب"], name: "أرز مصري الضحى 5 كيلو", barcode: "6221043022222", sku: "GRO-DOH-005", purchasePrice: "140", salePrice: "165", taxPercent: "0", minStock: 20, currentStock: 45, unit: "قطعة" },
    { tenantId, categoryId: catMap["بقالة وحبوب"], name: "زيت عباد الشمس عافية 1.6 لتر", barcode: "6221043033333", sku: "GRO-AFI-160", purchasePrice: "110", salePrice: "135", taxPercent: "0", minStock: 30, currentStock: 12, unit: "قطعة" },
    { tenantId, categoryId: catMap["بقالة وحبوب"], name: "سكر أبيض الأسرة 1 كيلو", barcode: "6221043044444", sku: "GRO-OSR-001", purchasePrice: "35", salePrice: "40", taxPercent: "0", minStock: 100, currentStock: 250, unit: "قطعة" },
    { tenantId, categoryId: catMap["مشروبات"], name: "شاي ناعم ليبتون 250 جرام", barcode: "6221043055555", sku: "BEV-LIP-250", purchasePrice: "45", salePrice: "55", taxPercent: "14", minStock: 40, currentStock: 85, unit: "قطعة" },
    { tenantId, categoryId: catMap["مشروبات"], name: "مياه معدنية نستله 1.5 لتر", barcode: "6221043066666", sku: "BEV-NES-150", purchasePrice: "5.5", salePrice: "7.5", taxPercent: "14", minStock: 200, currentStock: 450, unit: "قطعة" },
    { tenantId, categoryId: catMap["ألبان ومشتقات"], name: "جبنة بيضاء دومتي 500 جرام", barcode: "6221043077777", sku: "DAI-DOM-500", purchasePrice: "40", salePrice: "52", taxPercent: "14", minStock: 30, currentStock: 22, unit: "قطعة" },
    { tenantId, categoryId: catMap["بقالة وحبوب"], name: "مكرونة ريجينا 400 جرام", barcode: "6221043088888", sku: "GRO-REG-400", purchasePrice: "12", salePrice: "15", taxPercent: "0", minStock: 100, currentStock: 5, unit: "قطعة" },
    { tenantId, categoryId: catMap["منظفات ومستلزمات"], name: "مسحوق غسيل أريال 2.5 كيلو", barcode: "6221043099999", sku: "CLN-ARI-250", purchasePrice: "180", salePrice: "220", taxPercent: "14", minStock: 20, currentStock: 35, unit: "قطعة" },
    { tenantId, categoryId: catMap["مخبوزات وحلويات"], name: "بسكويت أوريو 6 قطع", barcode: "6221043101010", sku: "SNC-ORE-006", purchasePrice: "8", salePrice: "10", taxPercent: "14", minStock: 50, currentStock: 120, unit: "قطعة" },
    { tenantId, categoryId: catMap["مشروبات"], name: "عصير مانجو بيتي 1 لتر", barcode: "6221043111111", sku: "BEV-BEY-001", purchasePrice: "18", salePrice: "25", taxPercent: "14", minStock: 40, currentStock: 60, unit: "قطعة" },
    { tenantId, categoryId: catMap["مشروبات"], name: "قهوة نسكافيه سريعة التحضير 200 جرام", barcode: "6221043121212", sku: "BEV-NES-200", purchasePrice: "130", salePrice: "160", taxPercent: "14", minStock: 15, currentStock: 40, unit: "قطعة" },
    { tenantId, categoryId: catMap["خضار وفاكهة"], name: "تفاح أحمر 1 كيلو", barcode: "6221043131313", sku: "FRU-APP-001", purchasePrice: "15", salePrice: "22", taxPercent: "0", minStock: 30, currentStock: 80, unit: "كيلو" },
    { tenantId, categoryId: catMap["لحوم ودواجن"], name: "دجاج كامل مبرد 1 كيلو", barcode: "6221043141414", sku: "MEA-CHK-001", purchasePrice: "18", salePrice: "28", taxPercent: "0", minStock: 50, currentStock: 35, unit: "كيلو" },
    { tenantId, categoryId: catMap["مجمدات"], name: "بيتزا الأولى مجمدة", barcode: "6221043151515", sku: "FRZ-PIZ-001", purchasePrice: "25", salePrice: "38", taxPercent: "14", minStock: 20, currentStock: 45, unit: "قطعة" },
  ];
  const insertedProds = await db.insert(products).values(prodData).returning();

  // 7. Customers
  const [cust1, cust2, cust3] = await db.insert(customers).values([
    { tenantId, name: "محمد سلامة", phone: "96599221133", totalPurchases: "15000", loyaltyPoints: 150 },
    { tenantId, name: "أحمد شوقي", phone: "01033445566", totalPurchases: "8500", loyaltyPoints: 85 },
    { tenantId, name: "فاطمة الزهراء", phone: "96555778899", totalPurchases: "22000", loyaltyPoints: 220 },
    { tenantId, name: "عبدالله المنصور", phone: "96599334455", totalPurchases: "5200", loyaltyPoints: 52 },
  ]).returning();

  // 8. Purchase Orders
  const [po1] = await db.insert(purchaseOrders).values([
    { tenantId, branchId: mainBranch.id, supplierId: sup1.id, orderNumber: "PO-2024-001", status: "received", totalAmount: "5250", createdBy: cashier.id, receivedAt: new Date("2024-03-20") },
    { tenantId, branchId: kuwaitBranch.id, supplierId: sup2.id, orderNumber: "PO-2024-002", status: "sent", totalAmount: "3600", createdBy: cashier.id },
    { tenantId, branchId: cairoBranch.id, supplierId: sup3.id, orderNumber: "PO-2024-003", status: "draft", totalAmount: "1800", createdBy: cashier.id },
  ]).returning();

  if (po1 && insertedProds.length >= 2) {
    await db.insert(purchaseOrderItems).values([
      { purchaseOrderId: po1.id, productId: insertedProds[0].id, quantity: 100, receivedQuantity: 100, unitPrice: "25", totalPrice: "2500" },
      { purchaseOrderId: po1.id, productId: insertedProds[1].id, quantity: 50, receivedQuantity: 50, unitPrice: "140", totalPrice: "7000" },
    ]);
  }

  // 9. Sales Orders (demo data)
  const now = new Date();
  const salesData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const total = (Math.random() * 500 + 50).toFixed(2);
    const tax = (Number(total) * 0.14).toFixed(2);
    salesData.push({
      tenantId,
      branchId: i % 3 === 0 ? cairoBranch.id : i % 3 === 1 ? kuwaitBranch.id : mainBranch.id,
      customerId: i % 4 === 0 ? cust1.id : i % 4 === 1 ? cust2.id : null,
      cashierId: cashier.id,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(4, "0")}`,
      status: i === 5 ? "returned" : "completed",
      paymentMethod: i % 3 === 0 ? "cash" : i % 3 === 1 ? "card" : "wallet",
      subtotal: total,
      discountAmount: "0",
      taxAmount: i % 2 === 0 ? tax : "0",
      totalAmount: i % 2 === 0 ? String(Number(total) + Number(tax)) : total,
      createdAt: date,
    });
  }
  const insertedSales = await db.insert(salesOrders).values(salesData).returning();

  // Add items to first few sales
  if (insertedSales.length > 0 && insertedProds.length >= 3) {
    await db.insert(salesOrderItems).values([
      { salesOrderId: insertedSales[0].id, productId: insertedProds[0].id, productName: insertedProds[0].name, quantity: 3, unitPrice: insertedProds[0].salePrice, discountAmount: "0", taxPercent: insertedProds[0].taxPercent, totalPrice: String(Number(insertedProds[0].salePrice) * 3) },
      { salesOrderId: insertedSales[0].id, productId: insertedProds[4].id, productName: insertedProds[4].name, quantity: 2, unitPrice: insertedProds[4].salePrice, discountAmount: "0", taxPercent: insertedProds[4].taxPercent, totalPrice: String(Number(insertedProds[4].salePrice) * 2) },
    ]);
  }

  // 10. Tasks
  const insertedUsers = await db.select().from(users).where(eq(users.tenantId, tenantId));
  await db.insert(tasks).values([
    { tenantId, branchId: mainBranch.id, title: "جرد المخزون الشهري", description: "مراجعة وجرد جميع المنتجات في المستودع الرئيسي", status: "pending", priority: "high", assignedTo: insertedUsers[4]?.id, createdBy: insertedUsers[0]?.id },
    { tenantId, branchId: kuwaitBranch.id, title: "تجديد عقد المورد", description: "التفاوض مع شركة الصفوة على شروط العقد الجديد", status: "in_progress", priority: "urgent", assignedTo: insertedUsers[5]?.id, createdBy: insertedUsers[1]?.id },
    { tenantId, branchId: cairoBranch.id, title: "تدريب الكاشيرين الجدد", description: "عقد جلسة تدريبية على نظام نقطة البيع", status: "pending", priority: "medium", assignedTo: insertedUsers[2]?.id, createdBy: insertedUsers[1]?.id },
    { tenantId, branchId: mainBranch.id, title: "إعداد تقرير المبيعات الأسبوعي", description: "تجميع وتحليل بيانات المبيعات للأسبوع الماضي", status: "done", priority: "medium", assignedTo: insertedUsers[6]?.id, createdBy: insertedUsers[0]?.id },
    { tenantId, branchId: kuwaitBranch.id, title: "فحص المنتجات منتهية الصلاحية", description: "مراجعة تواريخ الصلاحية وسحب المنتجات المنتهية", status: "in_progress", priority: "high", assignedTo: insertedUsers[4]?.id, createdBy: insertedUsers[2]?.id },
  ]);

  // 11. Expenses
  await db.insert(expenses).values([
    { tenantId, branchId: mainBranch.id, type: "rent", description: "إيجار المستودع الرئيسي - شهر مارس", amount: "5000", paymentMethod: "bank_transfer", isApproved: true, createdBy: insertedUsers[0]?.id, expenseDate: new Date("2024-03-01") },
    { tenantId, branchId: kuwaitBranch.id, type: "utilities", description: "فاتورة الكهرباء - فرع الكويت", amount: "850", paymentMethod: "cash", isApproved: true, createdBy: insertedUsers[2]?.id, expenseDate: new Date("2024-03-10") },
    { tenantId, branchId: cairoBranch.id, type: "maintenance", description: "صيانة أجهزة نقطة البيع", amount: "1200", paymentMethod: "cash", isApproved: false, createdBy: insertedUsers[3]?.id, expenseDate: new Date("2024-03-15") },
    { tenantId, branchId: mainBranch.id, type: "salaries", description: "سلف موظف - خالد المطيري", amount: "2000", paymentMethod: "cash", isApproved: true, createdBy: insertedUsers[1]?.id, expenseDate: new Date("2024-03-20") },
  ]);

  // 12. Stock movements from the demo sales
  if (insertedProds.length >= 2) {
    await db.insert(stockMovements).values([
      { tenantId, branchId: cairoBranch.id, productId: insertedProds[0].id, type: "sale", quantityBefore: 123, quantityChange: -3, quantityAfter: 120, notes: "مبيعات نقطة البيع" },
      { tenantId, branchId: cairoBranch.id, productId: insertedProds[7].id, type: "waste", quantityBefore: 15, quantityChange: -10, quantityAfter: 5, notes: "هالك - تالف" },
      { tenantId, branchId: mainBranch.id, productId: insertedProds[1].id, type: "purchase", quantityBefore: 0, quantityChange: 45, quantityAfter: 45, notes: "استلام طلب شراء PO-2024-001" },
    ]);
  }
}
