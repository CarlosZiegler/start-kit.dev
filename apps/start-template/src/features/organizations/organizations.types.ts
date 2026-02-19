import type { InvitationStatus } from "better-auth/plugins";

type OrganizationRole = "owner" | "admin" | "member";

type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type RawOrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
  };
};

type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  status: InvitationStatus;
  inviterId: string;
  expiresAt: Date;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  metadata?: string | null;
};

export type {
  Organization,
  OrganizationInvitation,
  OrganizationMember,
  OrganizationRole,
  RawOrganizationMember,
};
