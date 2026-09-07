import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  receivedQuantity: z.number().optional(),
  notes: z.string().max(200).optional(),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().optional(),
  orderDate: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
  notes: z.string().max(1000).optional(),
});

export const receivePurchaseOrderSchema = z.object({
  items: z.array(z.object({ itemId: z.string(), receivedQuantity: z.number().positive() })).optional(),
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1),
  adjustment: z.number(),
  reason: z.string().max(500).optional(),
});

export default {};
