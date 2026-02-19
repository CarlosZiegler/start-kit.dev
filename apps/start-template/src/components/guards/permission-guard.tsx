import type { ReactNode } from "react";

import { useOrganizationPermissions } from "@/features/organizations/use-organization-permissions";
import { authClient } from "@/lib/auth/auth-client";

type PermissionGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  organizationId?: string;
} & (
  | {
      permission: keyof ReturnType<typeof useOrganizationPermissions>;
    }
  | {
      customCheck: (
        permissions: ReturnType<typeof useOrganizationPermissions>
      ) => boolean;
    }
);

/**
 * Guard component that conditionally renders children based on organization permissions
 *
 * @example
 * // Using named permission
 * <PermissionGuard permission="canManageOrg">
 *   <EditButton />
 * </PermissionGuard>
 *
 * @example
 * // Using custom check
 * <PermissionGuard customCheck={(perms) => perms.role === 'owner'}>
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * // With fallback
 * <PermissionGuard permission="canInvite" fallback={<div>No access</div>}>
 *   <InviteButton />
 * </PermissionGuard>
 */
export function PermissionGuard(props: PermissionGuardProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const permissions = useOrganizationPermissions(activeOrganization?.id);

  const hasAccess =
    "permission" in props
      ? Boolean(permissions[props.permission])
      : props.customCheck(permissions);

  if (!hasAccess) {
    return props.fallback || null;
  }

  return props.children;
}
