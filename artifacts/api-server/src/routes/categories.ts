import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { categories, insertCategorySchema } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.select().from(categories).where(and(eq(categories.tenantId, req.user!.tenantId), eq(categories.isActive, true)));
    success(res, rows);
  } catch (err) { next(err); }
});

router.post("/", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const parsed = insertCategorySchema.safeParse({ ...req.body, tenantId: req.user!.tenantId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(categories).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(categories).set({ ...req.body, updatedAt: new Date() }).where(and(eq(categories.id, id), eq(categories.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "الفئة غير موجودة");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(categories).set({ isActive: false, updatedAt: new Date() }).where(and(eq(categories.id, id), eq(categories.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "الفئة غير موجودة");
    success(res, { message: "تم حذف الفئة بنجاح" });
  } catch (err) { next(err); }
});

export default router;
