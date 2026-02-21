# Coding Conventions

**Analysis Date:** 2026-02-21

## Naming Patterns

**Files:**
- Feature files follow pattern `<feature>.<scope>.<type>.tsx` (e.g., `organizations.create-dialog.tsx`, `settings.page.section.profile.tsx`)
- UI component files: `kebab-case.tsx` (e.g., `button.tsx`, `data-grid-enhanced.tsx`, `field-label.tsx`)
- Utility/helper files: `kebab-case.ts` (e.g., `plan.utils.ts`, `super-admin.ts`)
- Type definition files: `<feature>.types.ts` (e.g., `organizations.types.ts`)
- Test directories: `__tests__/` (co-located with source)
- Test files: `<name>.test.ts` or `<name>.test.tsx`

**Functions:**
- Use camelCase for all functions: `canAssignRole()`, `getPlanDisplayName()`, `getUserPlanName()`
- Prefix permission functions with verb: `can*` for checks (`canDeleteOrganization()`), `get*` for retrieval (`getAssignableRoles()`)
- Factory functions: `*Options()` for React Query mutationOptions/queryOptions (e.g., `createOrganizationOptions()`, `resendInvitationOptions()`)
- Exported components: PascalCase with function declaration (e.g., `export function OrganizationCreateDialog()`)

**Variables:**
- Use camelCase: `currentUserRole`, `organizationId`, `invitationId`, `createOrganizationMutation`
- Constants with enums/readonly: PascalCase or camelCase depending on usage
- Avoid `var`, use `const` by default, `let` only when reassignment needed
- Boolean predicates: `is*`, `can*`, `has*` (e.g., `isFreePlan()`, `canManageOrganization()`, `hasPermission()`)

**Types:**
- Type names: PascalCase (e.g., `OrganizationRole`, `OrganizationMember`, `RawOrganizationMember`)
- Generic types: PascalCase (e.g., `TFunction`)
- Use `type` keyword for type definitions, `interface` only for extensibility
- Export types with `export type` statement, not via barrel exports

## Code Style

**Formatting:**
- Prettier (^3.8.1) with default config inherited from package root
- Line length: no hard limit, readability-focused
- Quotes: double quotes (`"`) for strings and imports
- Semicolons: required at statement ends
- Indentation: 2 spaces

**Linting:**
- Biome (2.4.4) via Ultracite (7.2.3)
- Config: `biome.jsonc` extends `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/remix`
- Rule override: `style.useConsistentTypeDefinitions` is `off` (allows both `type` and `interface`)
- Enforced by CI: run `bun run check` to validate
- Auto-fix via: `bun run fix` (ultracite fix)
- Key rules enforced:
  - No `console`, `debugger`, `alert` in production code
  - No `any` type (use `unknown` if needed)
  - No `var` declarations
  - No default exports (named exports only)
  - Use `for...of` over `.forEach()`
  - `===` and `!==` only (no loose equality)
  - Semantic HTML and ARIA for accessibility

## Import Organization

**Order (strict):**
1. External dependencies (React, third-party libraries): `import React from "react"`
2. Type imports: `import type { ClassValue } from "clsx"`
3. Internal absolute imports: `import { cn } from "@/lib/utils"`
4. Relative imports (if any, avoid): `import { localHelper } from "./helpers"`

**Example:**
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { createOrganizationOptions } from "@/features/organizations/organizations.factory.mutations";
import type { OrganizationFormData } from "@/features/organizations/organizations.utils";
```

**Path Aliases:**
- `@/*` → `./src/*` (absolute imports only, no relative paths)
- Always use path aliases, never deep relative imports like `../../../lib/`

**Import Type:**
- Use `import type { TypeName }` for types, separate from value imports
- Always explicitly mark types when re-exporting

## Error Handling

**Patterns:**
- Zod for schema validation: use `safeParse()` to return `{ success: boolean, data?, error? }`
- React Query: throw errors in mutation functions to be caught by error handlers
- Better Auth errors: check `result.error` and throw as Error: `if (result.error) throw new Error(result.error.message)`
- UI notifications: surface errors via toast (`sonner`), never `console.log()` errors
- Permission checks: return boolean from permission functions, throw in protected routes via `beforeLoad`
- Field-level errors: use React Hook Form's `fieldState.error` with `<FieldError>` component

**Error Messages:**
- All user-facing error messages use i18n keys: `t("ORG_CREATE_FAILED")`, `t("COMMON_UNKNOWN_ERROR")`
- Combine with specific error detail when available: `` t("KEY") + (error.message || "") ``

## Logging

**Framework:** No centralized logging library; use `console` in development only.

**Patterns:**
- NO console logs in production code (Biome enforces via linter)
- Errors surface via toast notifications, not logs
- Server-side: Pino logger available for backend (`pino` package installed but not heavily used)
- Query errors: caught by React Query error handlers, display in UI
- Validation errors: show in form fields, not console

## Comments

**When to Comment:**
- JSDoc for exported functions, especially permission/validation helpers
- Inline comments for non-obvious business logic (e.g., permission matrices)
- No comments for self-documenting code (variable names explain intent)

**JSDoc/TSDoc:**
```typescript
/**
 * Check if user can manage organization (update settings)
 * Owner and Admin can manage
 */
export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}
```

**Comment Style:**
- Block comments: `/* ... */` for multi-line explanations
- Inline comments: `// ...` for single lines
- Avoid over-commenting; prefer clear naming

## Function Design

**Size:**
- Keep functions focused on single responsibility
- Permission check functions: typically 2-5 lines
- Mutation/query factory functions: 5-15 lines
- Component functions: 50-150 lines (split into sub-components if larger)

**Parameters:**
- Prefer single parameter objects for functions with 2+ params
- Type each parameter explicitly
- Use optional chaining and nullish coalescing where needed

**Return Values:**
- Be explicit about what a function returns
- Use `void` for functions with side effects only
- Use type unions carefully: `string | undefined` over `string | null | undefined`
- Permission functions return `boolean`
- Mutation/query options return factory-created options objects

## Module Design

**Exports:**
- Named exports only, no default exports
- Export as many named items as needed; don't force barrel files
- Co-locate related exports: types with functions, utilities with helpers

**Barrel Files:**
- Use index files (`index.ts`) for grouping related exports
- Pattern: `export { Component1, Component2 } from "./component1"`
- Keep barrel files minimal, list all exports explicitly

**Example from codebase (`organizations.factory.mutations.ts`):**
```typescript
export const cancelInvitationOptions = () =>
  mutationOptions({ mutationFn: async (invitationId: string) => { ... } });

export const resendInvitationOptions = () =>
  mutationOptions({ mutationFn: async (input: ResendInvitationInput) => { ... } });
```

## Component Conventions (UI & Features)

**File Naming:**
- UI: `button.tsx`, `input.tsx`, `field-label.tsx`
- Feature modules: `organizations.create-dialog.tsx`, `settings.page.section.profile.tsx`

**Named Exports Only:**
```typescript
export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(...)} {...props} />
}

export { Button, buttonVariants }
```

**Props Pattern:**
- Define explicit Props interface/type
- Use `React.ComponentProps<"element">` for native elements
- Spread `...props` last after named props
- Always merge classes with `cn()` from `@/lib/utils`

**Class Merging:**
```typescript
const buttonVariants = cva("base-classes", {
  variants: { /* ... */ },
  defaultVariants: { /* ... */ },
})

function Button({ className, variant, size, ...props }: Props & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

**data-slot Attribute (Required):**
```typescript
export function Button({ className, ...props }: Props) {
  return <button className={cn(...)} data-slot="button" {...props} />
}
```

**Client Directive:**
```typescript
"use client"

export function DialogContent() { /* ... */ }
```

## TypeScript Rules

- Strict mode enabled (`tsconfig.json`)
- No implicit `any` (Biome enforces)
- Prefer `unknown` over `any` if must accept anything
- Use `satisfies` operator for const assertions: `const colors = { ... } satisfies Record<string, string>`
- Avoid type assertions unless absolutely necessary
- Use discriminated unions for complex type logic

## React 19 Conventions

- Use function components (no class components)
- Ref as prop: no `React.forwardRef` needed, just accept `ref` prop
- `key` prop: use stable IDs, not array indices (Biome enforces)
- Hooks: use standard rules (only in components/hooks, not conditional)
- `use client` directive: add at top of client components

---

*Convention analysis: 2026-02-21*
