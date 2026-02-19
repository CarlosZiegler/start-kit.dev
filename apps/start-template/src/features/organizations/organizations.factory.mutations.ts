import { mutationOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

// Organization invitations
export const cancelInvitationOptions = () =>
  mutationOptions({
    mutationFn: async (invitationId: string) => {
      await authClient.organization.cancelInvitation({ invitationId });
    },
  });

type ResendInvitationInput = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "owner" | "member";
};

export const resendInvitationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      email,
      role,
      organizationId,
    }: ResendInvitationInput) => {
      await authClient.organization.inviteMember({
        email,
        role,
        organizationId,
        resend: true,
      });
    },
  });

type InviteMemberInput = {
  organizationId?: string;
  email: string;
  role: "admin" | "owner" | "member";
  resend?: boolean;
};

export const inviteMemberOptions = () =>
  mutationOptions({
    mutationFn: async ({
      email,
      role,
      organizationId,
      resend = false,
    }: InviteMemberInput) =>
      await authClient.organization.inviteMember({
        email,
        role,
        organizationId,
        resend,
      }),
  });

// Organization members
type RemoveMemberInput = {
  memberIdOrEmail: string;
  organizationId: string;
};

export const removeMemberOptions = () =>
  mutationOptions({
    mutationFn: async ({
      memberIdOrEmail,
      organizationId,
    }: RemoveMemberInput) => {
      await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId,
      });
    },
  });

type UpdateMemberRoleInput = {
  memberId: string;
  role: string;
  organizationId: string;
};

export const updateMemberRoleOptions = () =>
  mutationOptions({
    mutationFn: async ({
      memberId,
      role,
      organizationId,
    }: UpdateMemberRoleInput) => {
      await authClient.organization.updateMemberRole({
        memberId,
        role,
        organizationId,
      });
    },
  });

// Accept / Reject invitation
export const acceptInvitationOptions = () =>
  mutationOptions({
    mutationFn: async (invitationId: string) => {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (error) {
        throw new Error(error.message, {
          cause: error,
        });
      }
    },
  });

export const rejectInvitationOptions = () =>
  mutationOptions({
    mutationFn: async (invitationId: string) => {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });
      if (error) {
        throw new Error(error.message, {
          cause: error,
        });
      }
    },
  });

// Create organization + slug check
type CreateOrganizationInput = {
  name: string;
  slug: string;
  logo?: string;
  metadata?: string;
};

export const createOrganizationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      name,
      slug,
      logo,
      metadata,
    }: CreateOrganizationInput) => {
      const parsedMetadata = metadata ? JSON.parse(metadata) : {};
      const result = await authClient.organization.create({
        name,
        slug,
        logo: logo || undefined,
        metadata: parsedMetadata,
      });
      if (result.error) {
        throw new Error(result.error.message, {
          cause: result.error,
        });
      }
      return result;
    },
  });

export const checkSlugOptions = () =>
  mutationOptions({
    mutationFn: async (slug: string) => {
      const result = await authClient.organization.checkSlug({ slug });
      if (result.error) {
        throw new Error(result.error.message, {
          cause: result.error,
        });
      }
      return result;
    },
  });

// Update organization
type UpdateOrganizationInput = {
  organizationId: string;
  data: {
    name?: string;
    slug?: string;
    logo?: string;
  };
};

export const updateOrganizationOptions = () =>
  mutationOptions({
    mutationFn: async ({ organizationId, data }: UpdateOrganizationInput) => {
      const { error } = await authClient.organization.update({
        organizationId,
        data,
      });
      if (error) {
        throw new Error(error.message ?? "Failed to update organization", {
          cause: error,
        });
      }
    },
  });
