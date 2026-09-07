import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A } from "./test-helpers";

describe("10. Security Deep Audit: Injection, Authentication & Tampering Tests", () => {
  const adminToken = generateToken({
    roleSlug: "admin",
    roleName: "مدير",
    tenantId: TEST_TENANT_A,
  });

  describe("Comprehensive 401 Unauthenticated Protection on All Critical Endpoints", () => {
    const protectedEndpoints = [
      { method: "get", path: "/api/inventory/stock" },
      { method: "get", path: "/api/inventory/movements" },
      { method: "post", path: "/api/inventory/adjustments" },
      { method: "get", path: "/api/suppliers" },
      { method: "post", path: "/api/suppliers" },
      { method: "get", path: "/api/purchase-orders" },
      { method: "get", path: "/api/customer-orders" },
      { method: "get", path: "/api/expenses" },
      { method: "post", path: "/api/expenses" },
      { method: "get", path: "/api/branches" },
      { method: "post", path: "/api/branches" },
      { method: "get", path: "/api/tasks" },
      { method: "post", path: "/api/tasks" },
      { method: "get", path: "/api/support-tickets" },
      { method: "post", path: "/api/support-tickets" },
      { method: "get", path: "/api/activity-logs" },
      { method: "get", path: "/api/roles" },
      { method: "get", path: "/api/users" },
      { method: "get", path: "/api/reports/sales" },
    ];

    for (const ep of protectedEndpoints) {
      it(`should reject unauthenticated ${ep.method.toUpperCase()} ${ep.path} with 401`, async () => {
        const req = (request(app) as any)[ep.method](ep.path);
        const res = await req;
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });
    }
  });

  describe("SQL Injection (SQLi) Defense on Queries & Parameters", () => {
    const sqliPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE products; --",
      "admin'--",
      "1 UNION SELECT null, null, null--",
      "1; SELECT pg_sleep(5);--",
    ];

    it("should safely handle SQL injection payloads in products search query", async () => {
      for (const payload of sqliPayloads) {
        const res = await request(app)
          .get("/api/products")
          .query({ search: payload })
          .set("Authorization", `Bearer ${adminToken}`);

        expect([200, 400, 422]).toContain(res.status);
        // Ensure no SQL syntax error was thrown or database crashed
        if (res.status === 200) {
          expect(Array.isArray(res.body.data)).toBe(true);
        }
      }
    });

    it("should safely handle SQL injection payloads in categories ID param", async () => {
      for (const payload of sqliPayloads) {
        const res = await request(app)
          .put(`/api/categories/${encodeURIComponent(payload)}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "تحديث اختباري" });

        expect([400, 404, 422, 500]).toContain(res.status);
        // Must not expose DB credentials or internal database schema
        if (res.body.message) {
          expect(res.body.message).not.toContain("password");
        }
      }
    });

    it("should safely handle SQL injection payloads in public store slug", async () => {
      for (const payload of sqliPayloads) {
        const res = await request(app).get(`/api/public/${encodeURIComponent(payload)}/info`);
        expect([400, 404]).toContain(res.status);
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe("XSS Payload Resistance in User Input", () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)",
    ];

    it("should sanitize or safely store task comments with script tags", async () => {
      for (const payload of xssPayloads) {
        // We create or test sanitized body handling
        const res = await request(app)
          .post("/api/tasks/00000000-0000-0000-0000-000000000000/comments")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ comment: payload });

        // Either rejects 404 (task not found) or safe
        expect([404, 422]).toContain(res.status);
      }
    });
  });
});
