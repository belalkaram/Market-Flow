import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { platformAdmins } from "@workspace/db/schema";

async function setupSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@marketflow.app";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2025";
  const name = process.env.SUPER_ADMIN_NAME || "مشرف النظام";

  const existing = await db.select({ id: platformAdmins.id })
    .from(platformAdmins).where(eq(platformAdmins.email, email)).limit(1);

  if (existing.length > 0) {
    console.log(`✓ Super Admin already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await db.insert(platformAdmins).values({ name, email, passwordHash: hash, status: "active" });
  console.log(`✓ Super Admin created: ${email}`);
  console.log(`  Password: ${password}`);
}

setupSuperAdmin()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
