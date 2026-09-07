import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import type { JwtPayload } from "../middlewares/auth";

export const TEST_TENANT_A = "c94e637d-21fc-407c-9f02-2ad0d47c2a2a";
export const TEST_TENANT_B = "b83d526c-10eb-406b-8e01-1bc0c36b1b1b";

export function generateToken(payload: Partial<JwtPayload> = {}): string {
  const defaultPayload: JwtPayload = {
    userId: "test-user-id-1234",
    tenantId: TEST_TENANT_A,
    branchId: "test-branch-id-1234",
    roleSlug: "admin",
    roleName: "مدير",
    ...payload,
  };
  return jwt.sign(defaultPayload, JWT_SECRET, { expiresIn: "1h" });
}

export function generateSuperAdminToken(): string {
  return jwt.sign(
    { adminId: "6618639c-d766-40a0-b44c-ee18b25d84e3", type: "platform_admin" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}
