import type { AuthSession } from "./auth-client";

export const SUPER_ADMIN_ROLE = "super_admin" as const;

function normalizeRoles(role: string | null | undefined) {
  return (role ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isSuperAdminRole(role: string | null | undefined) {
  return normalizeRoles(role).includes(SUPER_ADMIN_ROLE);
}

export function isSuperAdminSession(session: AuthSession | null | undefined) {
  const role = (session?.user as { role?: string } | undefined)?.role;
  return isSuperAdminRole(role);
}

export function isImpersonatingSession(
  session: AuthSession | null | undefined
) {
  const impersonatedBy = (
    session?.session as { impersonatedBy?: string } | undefined
  )?.impersonatedBy;
  return Boolean(impersonatedBy);
}
