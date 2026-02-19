import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";
import { orpc } from "@/orpc/orpc-client";

export const organizationKeys = {
  all: ["organization"] as const,
  members: (orgId: string | undefined, params?: unknown) =>
    [...organizationKeys.all, "members", orgId, params] as const,
  invitations: (orgId: string | undefined, params?: unknown) =>
    [...organizationKeys.all, "invitations", orgId, params] as const,
  invitation: (invitationId: string) =>
    [...organizationKeys.all, "invitation", invitationId] as const,
  activeMember: (orgId: string | undefined) =>
    [...organizationKeys.all, "activeMember", orgId] as const,
  userInvitations: (params?: unknown) =>
    [...organizationKeys.all, "userInvitations", params] as const,
};

export const organizationInvitationsOptions = (organizationId: string) =>
  queryOptions({
    queryKey: organizationKeys.invitations(organizationId),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listInvitations({
        query: {
          organizationId,
        },
      });
      if (error) {
        throw new Error(error.message ?? "Failed to fetch invitations", {
          cause: error,
        });
      }
      return data;
    },
    staleTime: 30_000,
  });

export const organizationMembersOptions = (
  organizationId: string,
  params?: { page?: number; pageSize?: number; search?: string }
) =>
  queryOptions({
    queryKey: organizationKeys.members(organizationId, params),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId,
          offset: params?.page ?? 1,
          limit: params?.pageSize ?? 10,
          ...(params?.search && {
            filterValue: params.search,
          }),
        },
      });
      if (error) {
        throw new Error(error.message ?? "Failed to fetch members", {
          cause: error,
        });
      }
      return data;
    },
    staleTime: 15_000,
  });

export const activeMemberOptions = (organizationId: string) =>
  queryOptions({
    queryKey: organizationKeys.activeMember(organizationId),
    queryFn: async () => {
      const { data, error } = await authClient.organization.getActiveMember({
        query: { organizationId },
      });
      if (error) {
        throw new Error(error.message ?? "Failed to fetch active member", {
          cause: error,
        });
      }
      return data;
    },
    staleTime: 15_000,
  });

export const invitationByIdOptions = (invitationId: string) =>
  queryOptions({
    queryKey: organizationKeys.invitation(invitationId),
    queryFn: async () => {
      const { data, error } = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (error) {
        throw new Error(error.message, {
          cause: error,
        });
      }
      return data;
    },
    retry: false,
  });

export const userInvitationsOptions = () =>
  queryOptions({
    queryKey: organizationKeys.userInvitations(),
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.listUserInvitations();

      if (error || !data) {
        throw new Error(error.message ?? "Failed to fetch user invitations", {
          cause: error,
        });
      }

      const organizations =
        await orpc.organization.getOrganizationsFromIdList.call({
          ids: data.map((invitation) => invitation.organizationId),
        });

      return data.map((invitation) => ({
        ...invitation,
        organization: organizations.find(
          (organization) => organization.id === invitation.organizationId
        ),
      }));
    },
    staleTime: 30_000,
  });
