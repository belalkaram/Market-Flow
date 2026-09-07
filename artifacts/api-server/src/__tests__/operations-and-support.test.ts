import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A, TEST_TENANT_B } from "./test-helpers";

describe("8. Operations, Expenses, Branches, Tasks & Support Tests", () => {
  const adminTokenA = generateToken({
    roleSlug: "admin",
    roleName: "مدير",
    tenantId: TEST_TENANT_A,
  });

  const cashierTokenA = generateToken({
    roleSlug: "cashier",
    roleName: "كاشير",
    tenantId: TEST_TENANT_A,
  });

  const adminTokenB = generateToken({
    roleSlug: "admin",
    roleName: "مدير",
    tenantId: TEST_TENANT_B,
  });

  describe("Expenses Management & RBAC", () => {
    it("should allow admin to list expenses", async () => {
      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID cashier from creating expenses (403)", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({
          title: "مصروف احتيالي",
          amount: 500,
          category: "مكتبية",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should FORBID cashier from deleting expenses (403)", async () => {
      const res = await request(app)
        .delete("/api/expenses/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should reject creating expense with invalid body (422)", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Branches Management & RBAC", () => {
    it("should allow authenticated user to view active branches", async () => {
      const res = await request(app)
        .get("/api/branches")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID cashier from creating branches (403)", async () => {
      const res = await request(app)
        .post("/api/branches")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({
          name: "فرع وهمي",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should FORBID cashier from deleting branches (403)", async () => {
      const res = await request(app)
        .delete("/api/branches/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });
  });

  describe("Tasks & Comment Isolation", () => {
    it("should list tasks scoped to tenant", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 404 when commenting on non-existent or cross-tenant task (IDOR)", async () => {
      const res = await request(app)
        .post("/api/tasks/00000000-0000-0000-0000-000000000000/comments")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ comment: "تعليق غير مصرح به" });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجودة");
    });
  });

  describe("Support Tickets & IDOR", () => {
    it("should list support tickets for tenant", async () => {
      const res = await request(app)
        .get("/api/support-tickets")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 404 when patching non-existent or cross-tenant support ticket (IDOR)", async () => {
      const res = await request(app)
        .patch("/api/support-tickets/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ status: "closed" });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجودة");
    });
  });
});
