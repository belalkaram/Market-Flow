import { pgTable, text, boolean, timestamp, uuid, index, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants, branches } from "./tenants";
import { products } from "./products";
import { users } from "./users";

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  type: text("type").notNull(), // sale, purchase, return, transfer, waste, adjustment
  quantityBefore: integer("quantity_before").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  referenceType: text("reference_type"), // sales_order, purchase_order, adjustment
  referenceId: uuid("reference_id"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("stock_movements_tenant_id_idx").on(t.tenantId),
  index("stock_movements_product_id_idx").on(t.productId),
  index("stock_movements_type_idx").on(t.type),
  index("stock_movements_created_at_idx").on(t.createdAt),
]);

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  adjustmentType: text("adjustment_type").notNull(), // waste, correction, found, transfer_in, transfer_out
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("inventory_adjustments_tenant_id_idx").on(t.tenantId),
  index("inventory_adjustments_product_id_idx").on(t.productId),
]);

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true });
export const insertInventoryAdjustmentSchema = createInsertSchema(inventoryAdjustments).omit({ id: true, createdAt: true });

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
