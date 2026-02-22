# arch-file-organization: Follow Naming Conventions and Import Patterns

## Priority: HIGH

## Explanation

Consistent file naming and import patterns make the codebase navigable. This project enforces specific conventions for files, components, imports, and code style.

## Bad Example

```typescript
// Wrong: relative imports, default exports, camelCase file
// src/features/organizations/CreateOrganization.tsx
export default function CreateOrganization() { ... }

// Wrong: importing with relative paths
import { Button } from "../../components/ui/button";
import { db } from "../../../lib/db";
```

## Good Example

```typescript
// Correct: kebab-case file, named export, path alias
// src/features/organizations/organizations.create-dialog.tsx
export function OrganizationCreateDialog() { ... }

// Correct: path aliases only
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

// Correct: import ordering
// 1. External dependencies
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";

// 2. Type imports (separate)
import type { Organization } from "@/lib/auth/auth-client";

// 3. Internal absolute imports
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { orpc } from "@/orpc/orpc-client";

// 4. Relative imports (same feature)
import { organizationMembersOptions } from "./organizations.factory.queries";
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `create-dialog.tsx`, `auth-client.ts` |
| Feature files | `<feature>.<scope>.<type>` | `organizations.create-dialog.tsx` |
| Components | PascalCase function | `function OrganizationCreateDialog()` |
| Hooks | `use-<name>.ts` | `use-debounced-search-param.ts` |
| Types | PascalCase | `type AuthSession`, `type AppRouter` |
| Functions | camelCase | `canAssignRole()`, `getPlanDisplayName()` |
| Permission helpers | `can*` prefix | `canManageOrganization()`, `canInviteMembers()` |
| Query factories | `*Options()` suffix | `organizationMembersOptions()`, `authQueryOptions()` |
| DB tables | camelCase (auto snake_case) | `twoFactor` → `two_factor` |
| Route files | `index.tsx` or `[param].tsx` | `overview/index.tsx`, `$chatId.tsx` |
| Test files | `*.test.ts(x)` in `__tests__/` | `__tests__/permissions.test.ts` |

## Context

- Path alias `@/*` maps to `src/*` (configured in tsconfig.json)
- Use `import type {}` for type-only imports
- Named exports only — no default exports
- Components use function declarations, not arrow functions
- Biome enforces: no `console`, no `any`, no `var`, `===` only
- Prettier: 2-space indentation
- React 19: ref as prop (no `React.forwardRef`), `use client` directive when needed
