import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { tenants } from "@workspace/db/schema";
import { runSeed } from "../services/seed.service";
import { addDays } from "../utils/dateUtils";

async function main() {
  console.log("🚀 Setting up demo tenant...");

  const existing = await db.select().from(tenants).where(eq(tenants.slug, "demo")).limit(1);
  let tenantId: string;

  if (existing.length > 0) {
    tenantId = existing[0].id;
    console.log(`✅ Demo tenant already exists: ${tenantId}`);
  } else {
    const [tenant] = await db.insert(tenants).values({
      name: "شركة كنوز التجريبية",
      slug: "demo",
      status: "active",
      subscriptionStatus: "active",
      trialStartsAt: new Date(),
      trialEndsAt: addDays(new Date(), 30),
      trialDays: 30,
    }).returning();
    tenantId = tenant.id;
    console.log(`✅ Created demo tenant: ${tenantId}`);
  }

  console.log("🌱 Seeding demo data...");
  await runSeed(tenantId);
  console.log("✅ Demo data seeded successfully!");
  console.log("\n📋 Demo accounts:");
  console.log("  owner@demo.local       — مالك");
  console.log("  admin@demo.local       — مدير");
  console.log("  manager@demo.local     — مدير فرع");
  console.log("  cashier@demo.local     — كاشير");
  console.log("  inventory@demo.local   — مدير مخزون");
  console.log("  purchasing@demo.local  — مسؤول مشتريات");
  console.log("  accountant@demo.local  — محاسب");
  console.log("  sales@demo.local       — مندوب مبيعات");
  console.log("\n🔑 Password for all: Demo@12345");

  process.exit(0);
}

main().catch(err => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
