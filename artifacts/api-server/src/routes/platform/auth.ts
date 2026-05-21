import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { platformAdmins } from "@workspace/db/schema";
import { JWT_SECRET } from "../../config/jwt";
import { AppError } from "../../middlewares/errorHandler";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success } from "../../utils/response";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) throw new AppError(422, "بيانات غير صحيحة");
    
    const admins = await db.select().from(platformAdmins)
      .where(eq(platformAdmins.email, body.data.email))
      .limit(1);
    
    if (!admins.length) throw new AppError(401, "بريد إلكتروني أو كلمة مرور غير صحيحة");
    const admin = admins[0];
    
    if (admin.status !== "active") throw new AppError(401, "الحساب موقوف");
    
    const valid = await bcrypt.compare(body.data.password, admin.passwordHash);
    if (!valid) throw new AppError(401, "بريد إلكتروني أو كلمة مرور غير صحيحة");
    
    const token = jwt.sign(
      { adminId: admin.id, type: "platform_admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    success(res, {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireSuperAdmin, async (req, res, next) => {
  try {
    const admin = (req as any).platformAdmin;
    success(res, { id: admin.id, name: admin.name, email: admin.email });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireSuperAdmin, (_req, res) => {
  success(res, { message: "تم تسجيل الخروج" });
});

export default router;
