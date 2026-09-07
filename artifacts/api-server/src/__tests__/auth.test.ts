import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { requireAuth, requireRole } from "../middlewares/auth";
import { generateToken, TEST_TENANT_A } from "./test-helpers";
import type { Request, Response, NextFunction } from "express";

describe("1. Authentication & Security Middleware Unit Tests", () => {
  describe("Password Hashing (bcrypt)", () => {
    it("should correctly hash a password and verify it", async () => {
      const password = "SuperSecretPassword@123";
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2")).toBe(true);

      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await bcrypt.compare("WrongPassword", hash);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe("JWT Token Verification", () => {
    it("should generate a valid JWT and decode expected claims", () => {
      const token = generateToken({ roleSlug: "admin", tenantId: TEST_TENANT_A });
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.tenantId).toBe(TEST_TENANT_A);
      expect(decoded.roleSlug).toBe("admin");
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });

    it("should fail verification if token is signed with a wrong secret", () => {
      const invalidToken = jwt.sign({ userId: "123" }, "wrong-secret-key-12345");
      expect(() => jwt.verify(invalidToken, JWT_SECRET)).toThrow();
    });

    it("should fail verification if token is expired", () => {
      const expiredToken = jwt.sign({ userId: "123" }, JWT_SECRET, { expiresIn: "-1s" });
      expect(() => jwt.verify(expiredToken, JWT_SECRET)).toThrow();
    });
  });

  describe("requireAuth Middleware", () => {
    it("should reject request when Authorization header is missing (401)", () => {
      const req = { headers: {} } as Request;
      const res = {} as Response;
      let caughtError: any;
      const next: NextFunction = (err) => { caughtError = err; };

      requireAuth(req, res, next);
      expect(caughtError).toBeDefined();
      expect(caughtError.statusCode).toBe(401);
    });

    it("should reject request when Authorization header does not start with Bearer (401)", () => {
      const req = { headers: { authorization: "Basic dXNlcjpwYXNz" } } as Request;
      const res = {} as Response;
      let caughtError: any;
      const next: NextFunction = (err) => { caughtError = err; };

      requireAuth(req, res, next);
      expect(caughtError).toBeDefined();
      expect(caughtError.statusCode).toBe(401);
    });

    it("should reject request with an invalid/tampered token (401)", () => {
      const req = { headers: { authorization: "Bearer invalid.token.signature" } } as Request;
      const res = {} as Response;
      let caughtError: any;
      const next: NextFunction = (err) => { caughtError = err; };

      requireAuth(req, res, next);
      expect(caughtError).toBeDefined();
      expect(caughtError.statusCode).toBe(401);
    });

    it("should successfully populate req.user on valid token", () => {
      const token = generateToken({ roleSlug: "admin", tenantId: TEST_TENANT_A });
      const req = { headers: { authorization: `Bearer ${token}` } } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = (err) => {
        if (!err) nextCalled = true;
      };

      requireAuth(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user?.tenantId).toBe(TEST_TENANT_A);
      expect(req.user?.roleSlug).toBe("admin");
    });
  });

  describe("requireRole Middleware", () => {
    it("should allow access when user role matches allowed roles", () => {
      const req = { user: { roleSlug: "admin" } } as any;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = (err) => {
        if (!err) nextCalled = true;
      };

      const middleware = requireRole("owner", "admin");
      middleware(req, res, next);
      expect(nextCalled).toBe(true);
    });

    it("should forbid access when user role does not match allowed roles (403)", () => {
      const req = { user: { roleSlug: "cashier" } } as any;
      const res = {} as Response;
      let caughtError: any;
      const next: NextFunction = (err) => { caughtError = err; };

      const middleware = requireRole("owner", "admin");
      middleware(req, res, next);
      expect(caughtError).toBeDefined();
      expect(caughtError.statusCode).toBe(403);
    });
  });
});
