# auth-rbac: Use RBAC Roles and Permission Helpers

## Priority: HIGH

## Explanation

Role-Based Access Control is defined in `src/lib/auth/permissions.ts`. The project defines user-level and organization-level roles with granular permission checks via `can*` helper functions. Always use these helpers instead of manual role checks.

## Bad Example

```typescript
// Wrong: hardcoding role checks inline
function DeleteOrgButton({ org }) {
  const { data: session } = useQuery(authQueryOptions());

  // Fragile: doesn't account for role hierarchy
  if (session.user.role !== "owner") return null;

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

## Good Example

```typescript
// src/lib/auth/permissions.ts — permission helpers
import { createAccessControl } from "better-auth/plugins/access";

// Role hierarchy
// super_admin > owner > admin > user/member

export function canManageOrganization(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canDeleteOrganization(role: string): boolean {
  return role === "owner";
}

export function canInviteMembers(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canRemoveMembers(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canUpdateMemberRoles(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function getAssignableRoles(currentRole: string): string[] {
  if (currentRole === "owner") return ["admin", "member"];
  if (currentRole === "admin") return ["member"];
  return [];
}

export function canAssignRole(assignerRole: string, targetRole: string): boolean {
  return getAssignableRoles(assignerRole).includes(targetRole);
}
```

## Good Example: Using Permissions in UI

```typescript
// In a feature component
import { canManageOrganization, canDeleteOrganization } from "@/lib/auth/permissions";

function OrganizationActions({ memberRole }: { memberRole: string }) {
  return (
    <div>
      {canManageOrganization(memberRole) && (
        <Button onClick={handleEdit}>Edit Organization</Button>
      )}
      {canDeleteOrganization(memberRole) && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete Organization
        </Button>
      )}
    </div>
  );
}
```

## Good Example: Using Permissions in API

```typescript
// In an oRPC procedure
export const deleteOrganization = protectedProcedure
  .input(z.object({ orgId: z.string() }))
  .handler(async ({ input, context }) => {
    const member = await context.db.query.member.findFirst({
      where: and(
        eq(member.userId, context.session.user.id),
        eq(member.organizationId, input.orgId),
      ),
    });

    if (!member || !canDeleteOrganization(member.role)) {
      throw new ORPCError("FORBIDDEN");
    }

    await context.db.delete(organization).where(eq(organization.id, input.orgId));
  });
```

## Context

- Permission helpers live in `src/lib/auth/permissions.ts`
- Use `can*` functions both in UI (conditional rendering) and API (authorization)
- Role hierarchy: `super_admin` > `owner` > `admin` > `member`/`user`
- Organization roles: `owner`, `admin`, `member`
- User roles: `super_admin`, `admin`, `user`
- Access Control definitions use `better-auth/plugins/access` for statement-based permissions
- Resources with permissions: `organization`, `member`, `invitation`, `project`
- Always check permissions server-side too — UI checks are for UX, not security
