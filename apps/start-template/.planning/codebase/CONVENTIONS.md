# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- Component files: PascalCase with `.tsx` extension - `SubscriptionProvider.tsx`, `ConsentAwareAnalytics.tsx`
- Utility/library files: camelCase with `.ts` extension - `permissions.ts`, `device-utils.ts`, `plan.utils.ts`
- Hook files: `use-` prefix with camelCase - `use-mobile.ts`, `use-copy-to-clipboard.ts`, `use-debounced-search-param.ts`
- Feature files: descriptive names with domain prefix - `organizations.factory.mutations.ts`, `block-generator.config.ts`
- Test files: `*.test.ts` or `*.test.tsx` - `utils.test.ts`, `permissions.test.ts`
- Email templates: `.tsx` extension - `verify-email.tsx`, `welcome-email.tsx`

**Functions:**
- Regular functions: camelCase starting with verb - `getDeviceType()`, `canManageOrganization()`, `findPlanByName()`
- React components: PascalCase - `SubscriptionProvider()`, `ConsentAwareAnalytics()`
- Helper functions: descriptive camelCase - `fileToDataUrl()`, `getDeviceInfo()`
- Permission checkers: `can*` prefix - `canAssignRole()`, `canInviteMembers()`, `canDeleteOrganization()`
- Getters: `get*` prefix - `getAssignableRoles()`, `getUserPlanName()`, `getDeviceIconRendered()`
- Type guards: `is*` prefix - `isFreePlan()`

**Variables:**
- Constants: UPPER_SNAKE_CASE for compile-time constants - `MOBILE_BREAKPOINT`, `DEVICE_ICONS`, `DEFAULT_DEVICE_ICON`
- State/regular variables: camelCase - `isMobile`, `subscription`, `deviceType`
- Boolean variables: `is*` or `can*` prefix - `isMobile`, `canLoadAnalytics`

**Types:**
- Exported types: PascalCase - `DeviceType`, `SignInFormData`, `SignUpFormData`, `SubscriptionContextValue`
- Type imports: `type` keyword used - `import type { TFunction } from "i18next"`
- Zod schemas: PascalCase with `Schema` suffix - `signInSchema`, `signUpSchema`, `changePasswordSchema`

## Code Style

**Formatting:**
- Tool: Ultracite (oxfmt) via Biome
- Line width: 80 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style (trailing commas in multi-line objects/arrays)
- Quote style: Double quotes for strings, no single quotes
- Semicolons: Always included
- Arrow functions: Always require parentheses around parameters

**Linting:**
- Tool: Ultracite (oxlint) via Biome
- Extends: `ultracite/oxlint/core`, `ultracite/oxlint/react`, `ultracite/oxlint/remix`
- Key enforced rules:
  - No `var` declarations - use `const` or `let`
  - No `console` statements (removed in production)
  - No unused imports or variables
  - Type-safe React patterns (dependencies, hooks at top level)
  - Accessibility compliance (ARIA, semantic HTML)

## Import Organization

**Order:**
1. External packages - React, libraries, third-party - `import * as React from "react"`
2. Internal absolute imports using path alias - `import { cn } from "@/lib/utils"`
3. Type imports grouped separately - `import type { DeviceType } from "@/lib/device-utils"`

**Path Aliases:**
- `@/` - Maps to `src/` directory for absolute imports
- Used consistently: `@/lib/utils`, `@/components/cookie-consent`, `@/lib/auth/permissions`

**Barrel Files:**
- Minimal use of barrel files (index.ts re-exports)
- Direct imports from source files preferred - `import { cn } from "@/lib/utils"` not `import { cn } from "@/lib"`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations with meaningful error handling
- Use `throw new Error()` with descriptive messages - not string throws
- Zod validation with `safeParse()` for form data - returns `{ success, data, error }`
- Early returns to avoid nested conditionals
- Type narrowing instead of non-null assertions (`!`)

**Examples:**
```typescript
// Error handling in file reader
const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Validation with safeParse
const result = signInSchema.safeParse({
  email: "test@example.com",
  password: "Password123",
});
if (!result.success) {
  // Handle validation errors
}
```

## Logging

**Framework:** Console methods (project uses Pino on backend, console on frontend)

**Patterns:**
- Backend: Pino logger with structured logging - `console.log("[Stripe Webhook] Received event:", {...})`
- Frontend: Minimal logging, no debug statements in production
- Logging statements indicate important operations only (auth events, webhooks, errors)

## Comments

**When to Comment:**
- Complex permission logic explained with JSDoc blocks
- Email configurations and stripe webhook handling documented
- Magic numbers extracted with explanatory constant names

**JSDoc/TSDoc:**
- Function documentation includes purpose and behavior
- Example from permissions.ts:
```typescript
/**
 * Check if user can manage organization (update settings)
 * Owner, Admin, and Member can all manage (read-only for member)
 */
export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}
```

## Function Design

**Size:** Keep functions focused and single-responsibility
- Utility functions: 5-20 lines typically
- Component functions: 30-100 lines
- Complex business logic extracted to separate functions

**Parameters:**
- Named parameters for clarity - use object destructuring for multiple params
- Optional parameters come last - `function getDeviceInfo(userAgent?: string, fallback = "Unknown device")`
- Type annotations required for parameters

**Return Values:**
- Explicit return types specified for exported functions
- Return early to reduce nesting
- Promise-based async functions use `async/await`

## Module Design

**Exports:**
- Named exports preferred - `export function canManageOrganization()`
- Default exports rarely used
- `export type` for types - `export type UserRole = "user" | "admin" | "owner"`

**Module Organization:**
- Logical grouping: related types/constants at top
- Reusable utilities extracted to separate files
- No side effects at module level except initialization

## React Patterns

**Component Structure:**
- Function components only (no class components)
- Props typed with interface - `type SubscriptionProviderProps = { children: ReactNode }`
- Context utilities exported with provider
- Hook validation in provider context hooks:
```typescript
export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  }
  return context;
}
```

**Hooks:**
- Hooks called at top level only, never conditionally
- All dependencies specified in dependency arrays
- Custom hooks follow `use*` naming convention

## Validation & Zod

**Patterns:**
- Zod schemas defined at module level, exported
- Form schemas include validation rules in schema definition
- Cross-field validation using `.refine()` method
- Type inference from schemas: `type SignUpFormData = z.infer<typeof signUpSchema>`

**Examples:**
```typescript
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

---

*Convention analysis: 2026-02-11*
