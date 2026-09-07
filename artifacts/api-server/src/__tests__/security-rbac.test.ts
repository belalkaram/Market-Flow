import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, generateSuperAdminToken, TEST_TENANT_A } from "./test-helpers";

describe("2. Security & RBAC Privilege Escalation Tests", () => {
  const cashierToken = generateToken({ roleSlug: "cashier", roleName: "كاشير", tenantId: TEST_TENANT_A });
  const adminToken = generateToken({ roleSlug: "admin", roleName: "مدير", tenantId: TEST_TENANT_A });
  const ownerToken = generateToken({ roleSlug: "owner", roleName: "مالك", tenantId: TEST_TENANT_A });

  describe("Unauthenticated Access Restrictions (401)", () => {
    it("should reject requests without token to /api/products", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject requests without token to /api/sales", async () => {
      const res = await request(app).get("/api/sales");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject requests without token to /api/roles", async () => {
      const res = await request(app).get("/api/roles");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject requests without token to /api/users", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Cashier Privilege Escalation Prevention (403 Forbidden)", () => {
    it("should BLOCK cashier from viewing roles list (GET /api/roles)", async () => {
      const res = await request(app)
        .get("/api/roles")
        .set("Authorization", `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from modifying permissions (PUT /api/roles/:id/permissions)", async () => {
      const res = await request(app)
        .put("/api/roles/00000000-0000-0000-0000-000000000000/permissions")
        .set("Authorization", `Bearer ${cashierToken}`)
        .send({ permissionIds: ["test-perm-id"] });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from viewing employee list (GET /api/users)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from creating employees (POST /api/users)", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${cashierToken}`)
        .send({
          name: "Attacker User",
          email: "attacker@test.local",
          password: "password123",
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from accessing financial reports (GET /api/reports/sales)", async () => {
      const res = await request(app)
        .get("/api/reports/sales")
        .set("Authorization", `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from modifying store settings (PUT /api/settings/store)", async () => {
      const res = await request(app)
        .put("/api/settings/store")
        .set("Authorization", `Bearer ${cashierToken}`)
        .send({ store_name: "Hacked Store" });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from modifying order page settings (PUT /api/settings/order-page)", async () => {
      const res = await request(app)
        .put("/api/settings/order-page")
        .set("Authorization", `Bearer ${cashierToken}`)
        .send({ publicOrderingEnabled: false });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should BLOCK cashier from accessing activity audit logs (GET /api/activity-logs)", async () => {
      const res = await request(app)
        .get("/api/activity-logs")
        .set("Authorization", `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });
  });

  describe("Platform SuperAdmin Isolation", () => {
    it("should BLOCK normal tenant admin from accessing superadmin endpoints (GET /api/platform/stores)", async () => {
      const res = await request(app)
        .get("/api/platform/stores")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("للمشرفين فقط");
    });

    it("should ALLOW valid superadmin token to access superadmin endpoints", async () => {
      const superAdminToken = generateSuperAdminToken();
      const res = await request(app)
        .get("/api/platform/stores")
        .set("Authorization", `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
