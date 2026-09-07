import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A, TEST_TENANT_B } from "./test-helpers";

describe("6. Inventory, Catalog & Purchases Lifecycle Tests", () => {
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

  describe("Categories Management & RBAC", () => {
    it("should allow admin to list categories", async () => {
      const res = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID cashier from creating categories (403)", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({ name: "تصنيف غير مسموح" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should FORBID cashier from updating categories (403)", async () => {
      const res = await request(app)
        .put("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({ name: "تعديل غير مسموح" });

      expect(res.status).toBe(403);
    });

    it("should reject creating category without name (422)", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Products Catalog & RBAC", () => {
    it("should allow any authenticated user to view products", async () => {
      const res = await request(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID cashier from creating products (403)", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({
          name: "منتج هجومي",
          salePrice: 100,
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should FORBID cashier from deleting products (403)", async () => {
      const res = await request(app)
        .delete("/api/products/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should reject product creation with invalid data (422)", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          // missing name and required fields
          barcode: "123456",
        });

      expect(res.status).toBe(422);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .get("/api/products/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("غير موجود");
    });
  });

  describe("Inventory & Stock Balances", () => {
    it("should return inventory stock balances scoped to tenant", async () => {
      const res = await request(app)
        .get("/api/inventory/stock")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const item of res.body.data) {
        expect(item.tenantId).toBe(TEST_TENANT_A);
      }
    });

    it("should return stock movements audit log scoped to tenant", async () => {
      const res = await request(app)
        .get("/api/inventory/movements")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const m of res.body.data) {
        expect(m.tenantId).toBe(TEST_TENANT_A);
      }
    });

    it("should return low stock products list", async () => {
      const res = await request(app)
        .get("/api/inventory/low-stock")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should reject inventory adjustment with invalid payload (422)", async () => {
      const res = await request(app)
        .post("/api/inventory/adjustments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          // missing productId, adjustment, etc.
          reason: "جرد سنوي",
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  describe("Suppliers & Purchases RBAC & IDOR", () => {
    it("should allow admin to list suppliers", async () => {
      const res = await request(app)
        .get("/api/suppliers")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID cashier from creating suppliers (403)", async () => {
      const res = await request(app)
        .post("/api/suppliers")
        .set("Authorization", `Bearer ${cashierTokenA}`)
        .send({
          name: "شركة التوريدات",
          phone: "96511223344",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("صلاحية");
    });

    it("should FORBID cashier from deleting suppliers (403)", async () => {
      const res = await request(app)
        .delete("/api/suppliers/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(403);
    });

    it("should prevent Tenant B from reading Tenant A's supplier by ID (IDOR)", async () => {
      const suppliersA = await request(app)
        .get("/api/suppliers")
        .set("Authorization", `Bearer ${adminTokenA}`);

      if (suppliersA.body.data && suppliersA.body.data.length > 0) {
        const supplierId = suppliersA.body.data[0].id;

        const crossRead = await request(app)
          .get(`/api/suppliers/${supplierId}`)
          .set("Authorization", `Bearer ${adminTokenB}`);

        expect(crossRead.status).toBe(404);
      }
    });
  });
});
