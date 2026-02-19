import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import type { OrganizationRole } from "@/lib/auth/permissions";
import {
  canDeleteInvitations,
  canDeleteOrganization,
  canInviteMembers,
  canManageInvitations,
  canManageOrganization,
  canRemoveMembers,
  canUpdateMemberRoles,
} from "@/lib/auth/permissions";

export function useOrganizationPermissions(organizationId?: string) {
  const { data: activeMember } = useQuery({
    queryKey: ["organization", "member", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return null;
      }
      const { data, error } = await authClient.organization.getActiveMember({
        query: { organizationId },
      });

      if (error) {
        console.error("Failed to fetch active member:", error);
        return null;
      }
      return data;
    },
    enabled: Boolean(organizationId),
    staleTime: 2 * 60 * 1000, // 5 minutes
  });

  const role = (activeMember?.role as OrganizationRole) || "member";
  const isOrganizationMember = true;

  return {
    role,
    isOrganizationMember,
    canManageOrganization: canManageOrganization(role),
    canDeleteOrganization: canDeleteOrganization(role),
    canInvite: canInviteMembers(role),
    canRemove: canRemoveMembers(role),
    canUpdateRoles: canUpdateMemberRoles(role),
    canManageInvitations: canManageInvitations(role),
    canDeleteInvitations: canDeleteInvitations(role),
  };
}
