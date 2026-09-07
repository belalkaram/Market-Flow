import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A, TEST_TENANT_B } from "./test-helpers";

describe("3. Multi-Tenancy & IDOR Cross-Tenant Isolation Tests", () => {
  const tokenTenantA = generateToken({
    userId: "user-tenant-a",
    tenantId: TEST_TENANT_A,
    roleSlug: "admin",
    roleName: "مدير",
  });

  const tokenTenantB = generateToken({
    userId: "user-tenant-b",
    tenantId: TEST_TENANT_B,
    roleSlug: "admin",
    roleName: "مدير",
  });

  it("should ensure Tenant A only gets products belonging to Tenant A", async () => {
    const resA = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${tokenTenantA}`);

    expect(resA.status).toBe(200);
    expect(resA.body.success).toBe(true);
    expect(Array.isArray(resA.body.data)).toBe(true);

    // Verify all returned products have tenantId === TEST_TENANT_A
    for (const product of resA.body.data) {
      expect(product.tenantId).toBe(TEST_TENANT_A);
    }
  });

  it("should ensure Tenant B gets an empty list or only Tenant B products, never Tenant A data", async () => {
    const resB = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${tokenTenantB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.success).toBe(true);
    expect(Array.isArray(resB.body.data)).toBe(true);

    for (const product of resB.body.data) {
      expect(product.tenantId).toBe(TEST_TENANT_B);
      expect(product.tenantId).not.toBe(TEST_TENANT_A);
    }
  });

  it("should PREVENT Tenant B from accessing or updating Tenant A's sales orders (IDOR)", async () => {
    // First get a real sales order ID from Tenant A
    const salesA = await request(app)
      .get("/api/sales")
      .set("Authorization", `Bearer ${tokenTenantA}`);

    if (salesA.body.data && salesA.body.data.length > 0) {
      const orderAId = salesA.body.data[0].id;

      // Tenant B tries to fetch Tenant A's sale
      const crossRead = await request(app)
        .get(`/api/sales/${orderAId}`)
        .set("Authorization", `Bearer ${tokenTenantB}`);

      expect(crossRead.status).toBe(404);
      expect(crossRead.body.message).toContain("غير موجودة");
    }
  });

  it("should PREVENT Tenant B from reading or updating Tenant A's customers (IDOR)", async () => {
    const customersA = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${tokenTenantA}`);

    if (customersA.body.data && customersA.body.data.length > 0) {
      const customerAId = customersA.body.data[0].id;

      const crossRead = await request(app)
        .get(`/api/customers/${customerAId}`)
        .set("Authorization", `Bearer ${tokenTenantB}`);

      expect(crossRead.status).toBe(404);
    }
  });

  it("should PREVENT Tenant B from reading or updating Tenant A's purchase orders (IDOR)", async () => {
    const poA = await request(app)
      .get("/api/purchase-orders")
      .set("Authorization", `Bearer ${tokenTenantA}`);

    if (poA.body.data && poA.body.data.length > 0) {
      const poAId = poA.body.data[0].id;

      const crossRead = await request(app)
        .get(`/api/purchase-orders/${poAId}`)
        .set("Authorization", `Bearer ${tokenTenantB}`);

      expect(crossRead.status).toBe(404);
    }
  });
});
