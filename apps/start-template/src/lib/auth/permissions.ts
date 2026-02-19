import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

// Define custom statements for our application
export const statement = {
  ...defaultStatements,
  // Organization-specific permissions
  organization: ["create", "read", "update", "delete", "manage"],
  member: ["create", "read", "update", "delete", "invite", "remove"],
  invitation: ["create", "read", "delete", "accept"],
  project: ["create", "read", "update", "delete", "share"],
} as const;

// Create access control instance
const ac = createAccessControl(statement);

// Define roles with specific permissions
export const user = ac.newRole({
  ...userAc.statements,
});

// Organization member role - full organization member (limited permissions)
export const member = ac.newRole({
  ...userAc.statements,
  organization: ["read"],
  member: ["read"],
  invitation: ["read"],
  project: ["create", "read", "update", "delete", "share"],
});

// Organization admin role - full control except delete org or change owner
export const admin = ac.newRole({
  ...adminAc.statements,
  organization: ["create", "read", "update", "manage"],
  member: ["create", "read", "update", "delete", "invite", "remove"],
  invitation: ["create", "read", "delete"],
  project: ["create", "read", "update", "delete", "share"],
});

// Organization owner role - full control
export const owner = ac.newRole({
  ...adminAc.statements,
  organization: ["create", "read", "update", "delete", "manage"],
  member: ["create", "read", "update", "delete", "invite", "remove"],
  invitation: ["create", "read", "delete", "accept"],
  project: ["create", "read", "update", "delete", "share"],
});

export const superAdmin = ac.newRole({
  ...adminAc.statements,
  organization: ["create", "read", "update", "delete", "manage"],
  member: ["create", "read", "update", "delete", "invite", "remove"],
  invitation: ["create", "read", "delete", "accept"],
  project: ["create", "read", "update", "delete", "share"],
});

// Export the access control instance and roles
export { ac };

// Role type definitions
export type UserRole = "user" | "admin" | "owner" | "super_admin";
export type OrganizationRole = "member" | "admin" | "owner";

const assignableRoles: Record<UserRole, UserRole[]> = {
  super_admin: ["user", "admin", "owner", "super_admin"],
  owner: ["user", "admin", "owner"],
  admin: ["user", "admin"],
  user: ["user"],
} as const;

// Get available roles that a user can assign based on their own role
export function getAssignableRoles(currentUserRole: UserRole) {
  return assignableRoles[currentUserRole];
}

// Check if a user can assign a specific role
export function canAssignRole(
  currentUserRole: UserRole,
  targetRole: UserRole
): boolean {
  const roles = getAssignableRoles(currentUserRole);
  return roles.includes(targetRole);
}

// ========================================
// Organization-specific permission helpers
// ========================================

/**
 * Check if user can manage organization (update settings)
 * Owner, Admin, and Member can all manage (read-only for member)
 */
export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can delete organization
 * Only owner can delete
 */
export function canDeleteOrganization(role: OrganizationRole): boolean {
  return role === "owner";
}

/**
 * Check if user can invite members to organization
 * Only Owner and Admin can invite organization members
 * Regular members cannot invite to organization level
 */
export function canInviteMembers(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can remove members from organization
 * Only Owner and Admin can remove members
 */
export function canRemoveMembers(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can update member roles
 * Only Owner and Admin can update roles
 */
export function canUpdateMemberRoles(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can manage invitations
 * Only admin/owner can manage invitations
 */
export function canManageInvitations(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can delete invitations
 * Only Owner and Admin can delete invitations
 */
export function canDeleteInvitations(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

type Statements =
  | typeof user.statements
  | typeof admin.statements
  | typeof owner.statements
  | typeof superAdmin.statements;

const permissions: Record<UserRole, Statements> = {
  user: user.statements,
  admin: admin.statements,
  owner: owner.statements,
  super_admin: superAdmin.statements,
} as const;

type OrganizationStatements =
  | typeof member.statements
  | typeof admin.statements
  | typeof owner.statements;

const organizationPermissions: Record<
  OrganizationRole,
  OrganizationStatements
> = {
  member: member.statements,
  admin: admin.statements,
  owner: owner.statements,
} as const;

// Get user permissions based on role
export function getUserPermissions(role: UserRole) {
  return permissions[role];
}

// Get organization permissions based on role
export function getOrganizationPermissions(role: OrganizationRole) {
  return organizationPermissions[role];
}

// Check if user has specific permission
export function hasPermission(
  userRole: UserRole,
  resource: keyof typeof statement,
  action: (typeof statement)[keyof typeof statement][number]
): boolean {
  const perm = getUserPermissions(userRole);

  // Handle the case where permissions might be empty or the resource doesn't exist
  if (!perm || typeof perm !== "object") {
    return false;
  }

  const resourceActions = perm[resource as keyof typeof perm] as
    | readonly string[]
    | undefined;
  return Boolean(resourceActions?.includes(action));
}

// Check if organization member has specific permission
export function hasOrganizationPermission(
  role: OrganizationRole,
  resource: keyof typeof statement,
  action: (typeof statement)[keyof typeof statement][number]
): boolean {
  const perm = getOrganizationPermissions(role);

  if (!perm || typeof perm !== "object") {
    return false;
  }

  const resourceActions = perm[resource as keyof typeof perm] as
    | readonly string[]
    | undefined;
  return Boolean(resourceActions?.includes(action));
}
