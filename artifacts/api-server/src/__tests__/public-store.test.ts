import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("5. Public Store & Customer Ordering API Tests", () => {
  it("should return store information for existing valid slug (GET /api/public/demo/info)", async () => {
    const res = await request(app).get("/api/public/demo/info");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("شركة كنوز التجريبية");
    expect(res.body.data.status).toBe("active");
    expect(Array.isArray(res.body.data.branches)).toBe(true);
  });

  it("should return products catalog for existing slug (GET /api/public/demo/products)", async () => {
    const res = await request(app).get("/api/public/demo/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it("should reject malicious or invalid slugs with 400 Bad Request (SQLi / path traversal defense)", async () => {
    const maliciousSlugs = [
      "demo' OR '1'='1",
      "../../etc/passwd",
      "<script>alert(1)</script>",
      "demo; DROP TABLE users;--",
      "a", // too short (min 2)
    ];

    for (const slug of maliciousSlugs) {
      const res = await request(app).get(`/api/public/${encodeURIComponent(slug)}/info`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("رابط المتجر غير صحيح");
    }
  });

  it("should return 404 for a syntactically valid but non-existent store slug", async () => {
    const res = await request(app).get("/api/public/non-existent-store-slug-9999/info");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  describe("Customer Order Placement Validation", () => {
    it("should reject customer orders without customerName (422)", async () => {
      const res = await request(app)
        .post("/api/public/demo/order")
        .send({
          customerPhone: "96599112233",
          paymentMethod: "cash_on_delivery",
          deliveryMethod: "delivery",
          items: [
            {
              productId: "00000000-0000-0000-0000-000000000000",
              productName: "Test Product",
              quantity: 1,
              unitPrice: 10,
              totalPrice: 10,
            },
          ],
          subtotal: 10,
          total: 10,
        });

      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should reject customer orders with empty items (422)", async () => {
      const res = await request(app)
        .post("/api/public/demo/order")
        .send({
          customerName: "محمد خالد",
          customerPhone: "96599112233",
          paymentMethod: "cash_on_delivery",
          deliveryMethod: "delivery",
          items: [],
          subtotal: 0,
          total: 0,
        });

      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should reject honeypot-triggered bot submissions with bot-rejected id", async () => {
      const res = await request(app)
        .post("/api/public/demo/order")
        .send({
          customerName: "Spam Bot",
          customerPhone: "96599112233",
          paymentMethod: "cash_on_delivery",
          deliveryMethod: "delivery",
          items: [
            {
              productId: "00000000-0000-0000-0000-000000000000",
              productName: "Test",
              quantity: 1,
              unitPrice: 10,
              totalPrice: 10,
            },
          ],
          subtotal: 10,
          total: 10,
          _hp: "bot-filled-honeypot-content", // Honeypot field filled
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("bot-rejected");
    });
  });
});
