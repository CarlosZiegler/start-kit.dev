import { useQuery } from "@tanstack/react-query";
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
import { activeMemberOptions } from "./organizations.factory.queries";

export function useOrganizationPermissions(organizationId?: string) {
  const { data: activeMember } = useQuery(
    organizationId
      ? activeMemberOptions(organizationId)
      : { queryKey: ["organization", "activeMember", undefined], queryFn: () => null, enabled: false }
  );

  const role = (activeMember?.role as OrganizationRole) || "member";

  return {
    role,
    isOrganizationMember: Boolean(activeMember),
    canManageOrganization: canManageOrganization(role),
    canDeleteOrganization: canDeleteOrganization(role),
    canInvite: canInviteMembers(role),
    canRemove: canRemoveMembers(role),
    canUpdateRoles: canUpdateMemberRoles(role),
    canManageInvitations: canManageInvitations(role),
    canDeleteInvitations: canDeleteInvitations(role),
  };
}
