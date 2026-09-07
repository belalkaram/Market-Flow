import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A, TEST_TENANT_B } from "./test-helpers";

describe("7. Sales, Customer Orders & Returns Lifecycle Tests", () => {
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

  describe("Sales Orders List & Detail", () => {
    it("should allow cashier and admin to list sales orders", async () => {
      const res = await request(app)
        .get("/api/sales")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 404 for non-existent sale order ID", async () => {
      const res = await request(app)
        .get("/api/sales/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجودة");
    });
  });

  describe("Customer Online Orders (/api/customer-orders)", () => {
    it("should list incoming customer orders for Tenant A", async () => {
      const res = await request(app)
        .get("/api/customer-orders")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should reject updating order status with invalid status payload (422/400)", async () => {
      const res = await request(app)
        .put("/api/customer-orders/00000000-0000-0000-0000-000000000000/status")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({});

      expect([400, 422]).toContain(res.status);
    });

    it("should return 404 when updating a non-existent customer order status", async () => {
      const res = await request(app)
        .put("/api/customer-orders/00000000-0000-0000-0000-000000000000/status")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "processing" });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجود");
    });

    it("should return 404 when converting a non-existent customer order to sale", async () => {
      const res = await request(app)
        .post("/api/customer-orders/00000000-0000-0000-0000-000000000000/convert-to-sale")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجود");
    });

    it("should PREVENT Tenant B from updating or converting Tenant A's customer orders (IDOR)", async () => {
      // First get real customer orders for Tenant A if any
      const ordersA = await request(app)
        .get("/api/customer-orders")
        .set("Authorization", `Bearer ${adminTokenA}`);

      if (ordersA.body.data && ordersA.body.data.length > 0) {
        const orderIdA = ordersA.body.data[0].id;

        // Tenant B attempts to modify Tenant A's customer order
        const crossUpdate = await request(app)
          .put(`/api/customer-orders/${orderIdA}/status`)
          .set("Authorization", `Bearer ${adminTokenB}`)
          .send({ status: "cancelled" });

        expect(crossUpdate.status).toBe(404);

        // Tenant B attempts to convert Tenant A's customer order
        const crossConvert = await request(app)
          .post(`/api/customer-orders/${orderIdA}/convert-to-sale`)
          .set("Authorization", `Bearer ${adminTokenB}`);

        expect(crossConvert.status).toBe(404);
      }
    });
  });

  describe("Sales Returns & Refunds", () => {
    it("should allow listing returned sales orders via status filter", async () => {
      const res = await request(app)
        .get("/api/sales?status=returned")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 404 when attempting to refund a non-existent sale order", async () => {
      const res = await request(app)
        .post("/api/sales/00000000-0000-0000-0000-000000000000/refund")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجودة");
    });
  });
});
