import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { tasks, taskComments, users, insertTaskSchema, insertTaskCommentSchema } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await db
      .select({ task: tasks, assigneeName: users.name })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(and(eq(tasks.tenantId, req.user!.tenantId), isNull(tasks.deletedAt)))
      .orderBy(desc(tasks.createdAt));
    success(res, rows.map(r => ({ ...r.task, assigneeName: r.assigneeName })));
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db.select({ task: tasks, assigneeName: users.name }).from(tasks).leftJoin(users, eq(tasks.assignedTo, users.id)).where(and(eq(tasks.id, req.params.id), eq(tasks.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "المهمة غير موجودة");
    const comments = await db.select({ comment: taskComments, userName: users.name }).from(taskComments).leftJoin(users, eq(taskComments.userId, users.id)).where(eq(taskComments.taskId, req.params.id)).orderBy(desc(taskComments.createdAt));
    success(res, { ...row.task, assigneeName: row.assigneeName, comments: comments.map(c => ({ ...c.comment, userName: c.userName })) });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = insertTaskSchema.safeParse({ ...req.body, tenantId: req.user!.tenantId, createdBy: req.user!.userId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(tasks).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(tasks).set({ ...req.body, updatedAt: new Date() }).where(and(eq(tasks.id, req.params.id), eq(tasks.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المهمة غير موجودة");
    success(res, row);
  } catch (err) { next(err); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "in_progress", "done", "cancelled"].includes(status)) throw new AppError(422, "حالة غير صحيحة");
    const [row] = await db.update(tasks).set({ status, updatedAt: new Date() }).where(and(eq(tasks.id, req.params.id), eq(tasks.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المهمة غير موجودة");
    success(res, row);
  } catch (err) { next(err); }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const [task] = await db.select().from(tasks).where(and(eq(tasks.id, req.params.id), eq(tasks.tenantId, req.user!.tenantId), isNull(tasks.deletedAt)));
    if (!task) throw new AppError(404, "المهمة غير موجودة");

    const parsed = insertTaskCommentSchema.safeParse({ taskId: req.params.id, userId: req.user!.userId, comment: req.body.comment });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(taskComments).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(tasks).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(tasks.id, req.params.id), eq(tasks.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المهمة غير موجودة");
    success(res, { message: "تم حذف المهمة بنجاح" });
  } catch (err) { next(err); }
});

export default router;
