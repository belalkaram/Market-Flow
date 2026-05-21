import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@workspace/db";
import { platformAdmins } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success, created } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();
router.use(requireSuperAdmin);

router.get("/", async (req, res, next) => {
  try {
    const admins = await db.select({
      id: platformAdmins.id,
      name: platformAdmins.name,
      email: platformAdmins.email,
      status: platformAdmins.status,
      createdAt: platformAdmins.createdAt,
    }).from(platformAdmins).orderBy(platformAdmins.createdAt);
    success(res, admins);
  } catch (err) { next(err); }
});

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const existing = await db.select().from(platformAdmins).where(eq(platformAdmins.email, body.email));
    if (existing.length) throw new AppError(409, "البريد الإلكتروني مستخدم بالفعل");

    const passwordHash = await bcrypt.hash(body.password, 10);
    const [admin] = await db.insert(platformAdmins).values({
      name: body.name,
      email: body.email,
      passwordHash,
      status: "active",
    }).returning({ id: platformAdmins.id, name: platformAdmins.name, email: platformAdmins.email, status: platformAdmins.status });
    created(res, admin);
  } catch (err) { next(err); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(["active", "inactive"]) }).parse(req.body);
    await db.update(platformAdmins).set({ status }).where(eq(platformAdmins.id, id));
    success(res, { id, status });
  } catch (err) { next(err); }
});

export default router;
