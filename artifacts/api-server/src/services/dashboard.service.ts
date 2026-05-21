import { eq, count, sum, and, gte, desc, lt } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  products, salesOrders, purchaseOrders, customers, users,
  tasks, expenses, branches, stockMovements
} from "@workspace/db/schema";
import { sql } from "drizzle-orm";

export async function getDashboardSummary(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalProductsResult,
    todaySalesResult,
    monthSalesResult,
    totalCustomersResult,
    pendingTasksResult,
    lowStockResult,
    totalBranchesResult,
    totalUsersResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(products).where(and(eq(products.tenantId, tenantId), eq(products.isActive, true))),
    db.select({ total: sum(salesOrders.totalAmount) }).from(salesOrders).where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, today), eq(salesOrders.status, "completed"))),
    db.select({ total: sum(salesOrders.totalAmount) }).from(salesOrders).where(and(eq(salesOrders.tenantId, tenantId), gte(salesOrders.createdAt, new Date(today.getFullYear(), today.getMonth(), 1)), eq(salesOrders.status, "completed"))),
    db.select({ count: count() }).from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.isActive, true))),
    db.select({ count: count() }).from(tasks).where(and(eq(tasks.tenantId, tenantId), eq(tasks.status, "pending"))),
    db.select({ count: count() }).from(products).where(and(eq(products.tenantId, tenantId), sql`${products.currentStock} <= ${products.minStock}`, eq(products.isActive, true))),
    db.select({ count: count() }).from(branches).where(and(eq(branches.tenantId, tenantId), eq(branches.isActive, true))),
    db.select({ count: count() }).from(users).where(and(eq(users.tenantId, tenantId), eq(users.isActive, true))),
  ]);

  // Last 7 days sales chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const salesChart = await db
    .select({
      date: sql<string>`DATE(${salesOrders.createdAt})`,
      total: sum(salesOrders.totalAmount),
      count: count(),
    })
    .from(salesOrders)
    .where(and(
      eq(salesOrders.tenantId, tenantId),
      gte(salesOrders.createdAt, sevenDaysAgo),
      eq(salesOrders.status, "completed"),
    ))
    .groupBy(sql`DATE(${salesOrders.createdAt})`)
    .orderBy(sql`DATE(${salesOrders.createdAt})`);

  // Top products by sales count
  const recentSales = await db
    .select()
    .from(salesOrders)
    .where(and(eq(salesOrders.tenantId, tenantId), eq(salesOrders.status, "completed")))
    .orderBy(desc(salesOrders.createdAt))
    .limit(5);

  return {
    totalProducts: totalProductsResult[0]?.count ?? 0,
    todaySales: Number(todaySalesResult[0]?.total ?? 0),
    monthSales: Number(monthSalesResult[0]?.total ?? 0),
    totalCustomers: totalCustomersResult[0]?.count ?? 0,
    pendingTasks: pendingTasksResult[0]?.count ?? 0,
    lowStockProducts: lowStockResult[0]?.count ?? 0,
    totalBranches: totalBranchesResult[0]?.count ?? 0,
    totalUsers: totalUsersResult[0]?.count ?? 0,
    salesChart,
    recentSales,
  };
}
