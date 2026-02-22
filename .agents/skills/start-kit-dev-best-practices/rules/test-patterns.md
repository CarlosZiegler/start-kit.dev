# test-patterns: Follow Vitest Testing Conventions

## Priority: HIGH

## Explanation

Tests use Vitest with jsdom environment. Test files are co-located in `__tests__/` subdirectories next to the code they test. Focus on behavior (what code does), not implementation. Mock external dependencies but never mock business logic.

## Bad Example

```typescript
// Wrong: testing implementation details
test("calls setState with correct value", () => {
  const spy = vi.spyOn(component, "setState");
  component.handleClick();
  expect(spy).toHaveBeenCalledWith({ count: 1 });
});

// Wrong: test file in separate top-level directory
// tests/lib/auth/permissions.test.ts  ← too far from source
```

## Good Example

```typescript
// src/lib/auth/__tests__/permissions.test.ts — actual project pattern
import { describe, expect, it } from "vitest";
import {
  canAssignRole,
  canDeleteOrganization,
  canInviteMembers,
  canManageOrganization,
  getAssignableRoles,
} from "../permissions";

describe("canAssignRole", () => {
  it("owner can assign admin and member roles", () => {
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("owner", "member")).toBe(true);
  });

  it("admin can only assign member role", () => {
    expect(canAssignRole("admin", "member")).toBe(true);
    expect(canAssignRole("admin", "admin")).toBe(false);
    expect(canAssignRole("admin", "owner")).toBe(false);
  });

  it("member cannot assign any role", () => {
    expect(canAssignRole("member", "member")).toBe(false);
    expect(canAssignRole("member", "admin")).toBe(false);
  });
});

describe("canDeleteOrganization", () => {
  it("only owner can delete organization", () => {
    expect(canDeleteOrganization("owner")).toBe(true);
    expect(canDeleteOrganization("admin")).toBe(false);
    expect(canDeleteOrganization("member")).toBe(false);
  });
});
```

## Good Example: Mocking i18n

```typescript
// vitest.setup.ts — i18n mock (automatically applied)
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,  // Return key as-is
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));
```

## Good Example: Zod Schema Testing

```typescript
// Testing validation schemas with safeParse
describe("createOrgSchema", () => {
  it("accepts valid input", () => {
    const result = createOrgSchema.safeParse({ name: "My Org", slug: "my-org" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createOrgSchema.safeParse({ name: "", slug: "my-org" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug characters", () => {
    const result = createOrgSchema.safeParse({ name: "Org", slug: "My Org!" });
    expect(result.success).toBe(false);
  });
});
```

## What to Mock vs What Not to Mock

| Mock | Don't Mock |
|------|-----------|
| External APIs (auth, storage, stripe) | Business logic |
| i18n (`useTranslation`) | Validation schemas |
| Analytics/logging | Permission helpers |
| Network requests | Pure utility functions |
| Browser APIs | Data transformations |

## Context

- Config: `vitest.config.ts` (jsdom, v8 coverage, vite-tsconfig-paths)
- Setup: `vitest.setup.ts` (jest-dom matchers, cleanup, i18n mock)
- Test pattern: `src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}`
- Run: `bun run test` (single run), `bun run test:watch` (watch mode)
- Coverage: `bun run test -- --coverage` (v8 provider, text/json/html)
- Co-locate tests in `__tests__/` next to source files
- Use `describe`/`it` blocks with clear behavior descriptions
- Use `safeParse()` for testing Zod schemas
