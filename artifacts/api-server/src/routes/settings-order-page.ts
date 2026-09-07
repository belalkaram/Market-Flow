import { Router } from "express";
import { db } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success } from "../utils/response";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const rows = await db.execute(sql`
      SELECT id, name, slug, phone, address
      FROM tenants
      WHERE id = ${tenantId}
    `);
    if (rows.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المتجر غير موجود' });
      return;
    }
    const tenant = rows.rows[0] as any;

    const settingRows = await db.execute(sql`
      SELECT setting_key, setting_value
      FROM tenant_settings
      WHERE tenant_id = ${tenantId}
        AND setting_key LIKE 'order_page_%'
    `).catch(() => ({ rows: [] }));

    const settings: Record<string, any> = {};
    for (const row of settingRows.rows as any[]) {
      try { settings[row.setting_key] = JSON.parse(row.setting_value); }
      catch { settings[row.setting_key] = row.setting_value; }
    }

    success(res, {
      tenantSlug: tenant.slug ?? '',
      publicStoreName: settings['order_page_store_name'] ?? tenant.name ?? '',
      publicOrderingEnabled: settings['order_page_enabled'] ?? false,
      publicDescription: settings['order_page_description'] ?? '',
      publicWhatsappNumber: settings['order_page_whatsapp'] ?? tenant.phone ?? '',
      publicPhone: settings['order_page_phone'] ?? '',
      publicAddress: settings['order_page_address'] ?? tenant.address ?? '',
      publicArea: settings['order_page_area'] ?? '',
      deliveryEnabled: settings['order_page_delivery_enabled'] ?? true,
      pickupEnabled: settings['order_page_pickup_enabled'] ?? true,
      deliveryFee: settings['order_page_delivery_fee'] ?? 0,
      minimumOrderAmount: settings['order_page_min_order'] ?? 0,
      showProductStock: settings['order_page_show_stock'] ?? false,
      allowOutOfStockDisplay: settings['order_page_show_out_of_stock'] ?? false,
      cashEnabled: settings['order_page_cash'] ?? true,
      walletEnabled: settings['order_page_wallet'] ?? false,
      bankTransferEnabled: settings['order_page_bank_transfer'] ?? false,
    });
  } catch (err) { next(err); }
});

router.put("/", requireRole("owner", "admin"), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const body = req.body as Record<string, any>;

    const keyMap: Record<string, string> = {
      publicOrderingEnabled: 'order_page_enabled',
      publicStoreName: 'order_page_store_name',
      publicDescription: 'order_page_description',
      publicWhatsappNumber: 'order_page_whatsapp',
      publicPhone: 'order_page_phone',
      publicAddress: 'order_page_address',
      publicArea: 'order_page_area',
      deliveryEnabled: 'order_page_delivery_enabled',
      pickupEnabled: 'order_page_pickup_enabled',
      deliveryFee: 'order_page_delivery_fee',
      minimumOrderAmount: 'order_page_min_order',
      showProductStock: 'order_page_show_stock',
      allowOutOfStockDisplay: 'order_page_show_out_of_stock',
      cashEnabled: 'order_page_cash',
      walletEnabled: 'order_page_wallet',
      bankTransferEnabled: 'order_page_bank_transfer',
    };

    for (const [bodyKey, settingKey] of Object.entries(keyMap)) {
      if (bodyKey in body) {
        const val = JSON.stringify(body[bodyKey]);
        await db.execute(sql`
          INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, updated_at)
          VALUES (${tenantId}, ${settingKey}, ${val}, NOW())
          ON CONFLICT (tenant_id, setting_key)
          DO UPDATE SET setting_value = ${val}, updated_at = NOW()
        `).catch(() => {});
      }
    }

    success(res, { updated: true });
  } catch (err) { next(err); }
});

export default router;
