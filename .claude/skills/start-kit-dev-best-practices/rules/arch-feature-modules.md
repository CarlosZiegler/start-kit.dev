# arch-feature-modules: Organize Features as Co-located Modules

## Priority: HIGH

## Explanation

Domain logic lives in `src/features/<feature>/` with co-located components, queries, mutations, and types. This keeps related code together and makes features self-contained. Use `src/components/` only for shared, reusable UI primitives.

## Bad Example

```
# Spreading feature logic across the codebase
src/
  components/
    CreateOrganizationDialog.tsx   # Feature component mixed with UI primitives
    OrganizationMembersTable.tsx
  hooks/
    useOrganizationPermissions.ts
  queries/
    organizationQueries.ts         # Centralized queries file
  mutations/
    organizationMutations.ts
```

## Good Example

```
# Actual project structure — co-located feature modules
src/features/
  organizations/
    organizations.create-dialog.tsx          # Feature component
    organizations.edit-dialog.tsx
    organizations.members-table.tsx
    organizations.invitations-table.tsx
    organizations.factory.queries.ts         # Query factory functions
    organizations.factory.mutations.ts       # Mutation factory functions
    organizations.types.ts                   # Feature-specific types
  settings/
    settings.profile-form.tsx
    settings.security-section.tsx
    settings.appearance-section.tsx
    settings.sessions-section.tsx
  subscription/
    subscription.plan-selector.tsx
    subscription.billing-portal.tsx
  payment/
    payment.types.ts
  command-search/
    command-search.dialog.tsx
  themes/
    themes.switcher.tsx
```

## Good Example: Feature File Naming

```typescript
// Pattern: <feature>.<scope>.<type>.tsx
// Examples:
organizations.create-dialog.tsx        // feature.scope.type
organizations.factory.queries.ts       // feature.factory.queries
organizations.factory.mutations.ts     // feature.factory.mutations
settings.profile-form.tsx              // feature.scope-form
settings.security-section.tsx          // feature.scope-section
```

## Good Example: Query Factory Pattern

```typescript
// src/features/organizations/organizations.factory.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export const organizationMembersOptions = (orgId: string, params?: {
  query?: string;
  limit?: number;
  offset?: number;
}) =>
  queryOptions({
    queryKey: ["organization", orgId, "members", params],
    queryFn: async () => {
      const { data, error } = await authClient.organization.listMembers({
        query: { organizationId: orgId, ...params },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
```

## Context

- `src/features/` — Domain-specific modules (organizations, settings, subscription, etc.)
- `src/components/ui/` — Shared UI primitives (button, card, dialog, field, etc.)
- `src/components/` — Shared composed components (not feature-specific)
- `src/hooks/` — Shared custom hooks (useDebouncedSearchParam, useCopyToClipboard)
- `src/lib/` — Core services (auth, db, storage, stripe, i18n, validations)
- `src/orpc/` — RPC layer (router, context, procedures, route handlers)
- Feature components import from `@/components/ui/` but never the reverse
