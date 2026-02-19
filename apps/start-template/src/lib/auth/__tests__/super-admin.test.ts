import { describe, expect, it } from "vitest";

import {
  isImpersonatingSession,
  isSuperAdminRole,
  isSuperAdminSession,
} from "@/lib/auth/super-admin";

describe("super admin helpers", () => {
  it("accepts comma separated roles", () => {
    expect(isSuperAdminRole("user,super_admin")).toBe(true);
    expect(isSuperAdminRole("admin")).toBe(false);
  });

  it("detects super admin from session", () => {
    const session = {
      user: { role: "super_admin" },
      session: {},
    } as never;

    expect(isSuperAdminSession(session)).toBe(true);
  });

  it("detects impersonation", () => {
    const session = {
      user: { role: "super_admin" },
      session: { impersonatedBy: "admin-id" },
    } as never;

    expect(isImpersonatingSession(session)).toBe(true);
  });
});
