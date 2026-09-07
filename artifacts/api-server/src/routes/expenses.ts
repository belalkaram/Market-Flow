import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { expenses, insertExpenseSchema } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.select().from(expenses).where(eq(expenses.tenantId, req.user!.tenantId)).orderBy(desc(expenses.createdAt)).limit(200);
    success(res, rows);
  } catch (err) { next(err); }
});

router.post("/", requireRole("owner", "admin", "accountant"), async (req, res, next) => {
  try {
    const parsed = insertExpenseSchema.safeParse({ ...req.body, tenantId: req.user!.tenantId, createdBy: req.user!.userId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(expenses).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", requireRole("owner", "admin", "accountant"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(expenses).set({ ...req.body, updatedAt: new Date() }).where(and(eq(expenses.id, id), eq(expenses.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المصروف غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", requireRole("owner", "admin", "accountant"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المصروف غير موجود");
    success(res, { message: "تم حذف المصروف بنجاح" });
  } catch (err) { next(err); }
});

export default router;
