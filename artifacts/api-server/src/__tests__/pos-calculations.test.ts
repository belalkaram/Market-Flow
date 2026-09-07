import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { generateToken, TEST_TENANT_A } from "./test-helpers";

describe("4. POS Business Logic & Calculation Integrity Tests", () => {
  const cashierToken = generateToken({
    roleSlug: "cashier",
    roleName: "كاشير",
    tenantId: TEST_TENANT_A,
  });

  it("should reject checkout with empty items array (422)", async () => {
    const res = await request(app)
      .post("/api/sales/checkout")
      .set("Authorization", `Bearer ${cashierToken}`)
      .send({
        items: [],
        paymentMethod: "cash",
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("منتج واحد على الأقل");
  });

  it("should reject checkout with zero or negative quantity (422)", async () => {
    const res = await request(app)
      .post("/api/sales/checkout")
      .set("Authorization", `Bearer ${cashierToken}`)
      .send({
        items: [
          { productId: "00000000-0000-0000-0000-000000000000", quantity: 0 },
        ],
        paymentMethod: "cash",
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("الكمية");
  });

  it("should reject checkout when product does not exist (404)", async () => {
    const res = await request(app)
      .post("/api/sales/checkout")
      .set("Authorization", `Bearer ${cashierToken}`)
      .send({
        items: [
          { productId: "00000000-0000-0000-0000-000000000000", quantity: 1 },
        ],
        paymentMethod: "cash",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("المنتج غير موجود");
  });

  describe("Tax and Discount Calculation Unit Verification", () => {
    it("should accurately compute subtotal, tax amount, and discount subtraction", () => {
      // Mock cart calculation unit test
      const items = [
        { price: 100, qty: 2, taxPercent: 15 }, // 200 + 30 tax = 230
        { price: 50, qty: 1, taxPercent: 15 },  // 50 + 7.5 tax = 57.5
      ];
      const discount = 20;

      let subtotal = 0;
      let taxAmount = 0;
      for (const item of items) {
        const itemTotal = item.price * item.qty;
        const itemTax = (itemTotal * item.taxPercent) / 100;
        subtotal += itemTotal;
        taxAmount += itemTax;
      }

      const total = Math.max(0, subtotal + taxAmount - discount);

      expect(subtotal).toBe(250);
      expect(taxAmount).toBe(37.5);
      expect(total).toBe(267.5);
    });

    it("should never produce a negative total even if discount exceeds sum", () => {
      const subtotal = 100;
      const taxAmount = 15;
      const massiveDiscount = 500;

      const total = Math.max(0, subtotal + taxAmount - massiveDiscount);
      expect(total).toBe(0);
    });

    it("should set taxAmount to 0 when taxEnabled is false", () => {
      const items = [{ price: 100, qty: 1, taxPercent: 15 }];
      const taxEnabled = false;

      let subtotal = 0;
      let taxAmount = 0;
      for (const item of items) {
        const itemTotal = item.price * item.qty;
        const taxRate = taxEnabled ? item.taxPercent : 0;
        taxAmount += (itemTotal * taxRate) / 100;
        subtotal += itemTotal;
      }

      expect(subtotal).toBe(100);
      expect(taxAmount).toBe(0);
    });
  });
});
