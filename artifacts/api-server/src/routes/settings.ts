import { Router } from "express";
import { db } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success } from "../utils/response";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

// GET /api/settings/store
router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const settingRows = await db.execute(sql`
      SELECT setting_key, setting_value
      FROM tenant_settings
      WHERE tenant_id = ${tenantId}
    `).catch(() => ({ rows: [] }));

    const settings: Record<string, any> = {};
    for (const row of settingRows.rows as any[]) {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    }

    success(res, settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/store
router.put("/", requireRole("owner", "admin"), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const body = req.body as Record<string, any>;

    for (const [key, val] of Object.entries(body)) {
      const valStr = JSON.stringify(val);
      await db.execute(sql`
        INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, updated_at)
        VALUES (${tenantId}, ${key}, ${valStr}, NOW())
        ON CONFLICT (tenant_id, setting_key)
        DO UPDATE SET setting_value = ${valStr}, updated_at = NOW()
      `).catch(() => {});
    }

    success(res, { updated: true });
  } catch (err) {
    next(err);
  }
});

export default router;
