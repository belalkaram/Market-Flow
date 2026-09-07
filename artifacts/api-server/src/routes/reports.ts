import { Router } from "express";
import { eq, and, gte, lte, desc, sum, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { salesOrders, salesOrderItems, products, expenses, purchaseOrders, customers } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success } from "../utils/response";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

router.get("/sales", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period = "30d" } = req.query as { period?: string };

    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const [dailySales, topProducts, paymentBreakdown, totalStats] = await Promise.all([
      db.select({
        date: sql<string>`DATE(${salesOrders.createdAt})`,
        total: sum(salesOrders.totalAmount),
        count: count(),
      })
      .from(salesOrders)
      .where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, from), eq(salesOrders.status, "completed")))
      .groupBy(sql`DATE(${salesOrders.createdAt})`)
      .orderBy(sql`DATE(${salesOrders.createdAt})`),

      db.select({
        productId: salesOrderItems.productId,
        productName: salesOrderItems.productName,
        totalQty: sum(salesOrderItems.quantity),
        totalRevenue: sum(salesOrderItems.totalPrice),
      })
      .from(salesOrderItems)
      .innerJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, from), eq(salesOrders.status, "completed")))
      .groupBy(salesOrderItems.productId, salesOrderItems.productName)
      .orderBy(desc(sum(salesOrderItems.totalPrice)))
      .limit(10),

      db.select({
        method: salesOrders.paymentMethod,
        total: sum(salesOrders.totalAmount),
        count: count(),
      })
      .from(salesOrders)
      .where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, from), eq(salesOrders.status, "completed")))
      .groupBy(salesOrders.paymentMethod),

      db.select({
        totalRevenue: sum(salesOrders.totalAmount),
        totalOrders: count(),
        totalTax: sum(salesOrders.taxAmount),
        totalDiscount: sum(salesOrders.discountAmount),
      })
      .from(salesOrders)
      .where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, from), eq(salesOrders.status, "completed"))),
    ]);

    success(res, {
      period,
      dailySales: dailySales.map(r => ({ date: r.date, total: Number(r.total ?? 0), count: Number(r.count) })),
      topProducts: topProducts.map(r => ({ productName: r.productName ?? 'غير معروف', totalQty: Number(r.totalQty ?? 0), totalRevenue: Number(r.totalRevenue ?? 0) })),
      paymentBreakdown: paymentBreakdown.map(r => ({ method: r.method, total: Number(r.total ?? 0), count: Number(r.count) })),
      summary: {
        totalRevenue: Number(totalStats[0]?.totalRevenue ?? 0),
        totalOrders: Number(totalStats[0]?.totalOrders ?? 0),
        totalTax: Number(totalStats[0]?.totalTax ?? 0),
        totalDiscount: Number(totalStats[0]?.totalDiscount ?? 0),
        avgOrderValue: totalStats[0]?.totalOrders
          ? Number(totalStats[0].totalRevenue ?? 0) / Number(totalStats[0].totalOrders)
          : 0,
      },
    });
  } catch (err) { next(err); }
});

router.get("/expenses", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period = "30d" } = req.query as { period?: string };
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const [byCategory, byMonth, totals] = await Promise.all([
      db.select({
        type: expenses.type,
        total: sum(expenses.amount),
        count: count(),
      })
      .from(expenses)
      .where(and(eq(expenses.tenantId, tenantId), gte(expenses.expenseDate, from)))
      .groupBy(expenses.type)
      .orderBy(desc(sum(expenses.amount))),

      db.select({
        month: sql<string>`TO_CHAR(${expenses.expenseDate}::date, 'YYYY-MM')`,
        total: sum(expenses.amount),
      })
      .from(expenses)
      .where(and(eq(expenses.tenantId, tenantId), gte(expenses.expenseDate, from)))
      .groupBy(sql`TO_CHAR(${expenses.expenseDate}::date, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${expenses.expenseDate}::date, 'YYYY-MM')`),

      db.select({ total: sum(expenses.amount), count: count() })
        .from(expenses)
        .where(and(eq(expenses.tenantId, tenantId), gte(expenses.expenseDate, from))),
    ]);

    success(res, {
      period,
      byCategory: byCategory.map(r => ({ type: r.type, total: Number(r.total ?? 0), count: Number(r.count) })),
      byMonth: byMonth.map(r => ({ month: r.month, total: Number(r.total ?? 0) })),
      summary: { totalExpenses: Number(totals[0]?.total ?? 0), totalCount: Number(totals[0]?.count ?? 0) },
    });
  } catch (err) { next(err); }
});

router.get("/inventory", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        currentStock: products.currentStock,
        minStock: products.minStock,
        costPrice: products.purchasePrice,
        salePrice: products.salePrice,
      })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(products.currentStock);

    const totalValue = rows.reduce((s, p) => s + (Number(p.currentStock) * Number(p.costPrice ?? 0)), 0);
    const lowStock = rows.filter(p => Number(p.currentStock) <= Number(p.minStock ?? 0));
    const outOfStock = rows.filter(p => Number(p.currentStock) === 0);

    success(res, {
      products: rows.map(p => ({
        ...p,
        currentStock: Number(p.currentStock),
        costPrice: Number(p.costPrice ?? 0),
        salePrice: Number(p.salePrice),
        stockValue: Number(p.currentStock) * Number(p.costPrice ?? 0),
      })),
      summary: {
        totalProducts: rows.length,
        totalStockValue: totalValue,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
      },
    });
  } catch (err) { next(err); }
});

export default router;
