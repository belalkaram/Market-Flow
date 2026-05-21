import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { branches, insertBranchSchema } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const rows = await db.select().from(branches).where(and(eq(branches.tenantId, tenantId), eq(branches.isActive, true)));
    success(res, rows);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const parsed = insertBranchSchema.safeParse({ ...req.body, tenantId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(branches).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const [row] = await db.update(branches).set({ ...req.body, updatedAt: new Date() }).where(and(eq(branches.id, req.params.id), eq(branches.tenantId, tenantId))).returning();
    if (!row) throw new AppError(404, "الفرع غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const [row] = await db.update(branches).set({ isActive: false, updatedAt: new Date() }).where(and(eq(branches.id, req.params.id), eq(branches.tenantId, tenantId))).returning();
    if (!row) throw new AppError(404, "الفرع غير موجود");
    success(res, { message: "تم حذف الفرع بنجاح" });
  } catch (err) { next(err); }
});

export default router;
