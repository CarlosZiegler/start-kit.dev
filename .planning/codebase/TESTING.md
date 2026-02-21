# Testing Patterns

**Analysis Date:** 2026-02-21

## Test Framework

**Runner:**
- Vitest (^4.0.18) - modern Vite-native test runner
- Config: `apps/start-template/vitest.config.ts`
- Environment: jsdom (browser-like testing)
- Globals: enabled (no need to import `describe`, `it`, `expect`)

**Assertion Library:**
- Built-in Vitest assertions (extends Chai): `expect()`

**Setup:**
- Setup file: `vitest.setup.ts` runs before tests
- Includes `@testing-library/jest-dom` matchers
- Auto-cleanup via `afterEach(() => cleanup())`
- Global i18next mock (returns translation keys as-is)

**Run Commands:**
```bash
bun run test              # Run all tests
bun run test:watch       # Watch mode
bun run test:ui          # Interactive UI
bun run test:coverage    # Generate coverage report
```

## Test File Organization

**Location:**
- Co-located with source in `__tests__/` subdirectories
- `src/lib/__tests__/` for utility tests
- `src/lib/auth/__tests__/` for auth/permission tests
- `src/lib/payment/__tests__/` for payment logic tests
- `src/lib/validations/__tests__/` for validation schema tests
- `src/components/__tests__/` for component tests
- `src/hooks/__tests__/` for hook tests

**Naming:**
- Files: `<name>.test.ts` for utilities, `<name>.test.tsx` for components
- Pattern: matches source file name but in `__tests__/` subdirectory
- Example: `src/lib/utils.ts` → `src/lib/__tests__/utils.test.ts`

**Structure:**
```
src/
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── lib/auth/
│   ├── permissions.ts
│   └── __tests__/
│       └── permissions.test.ts
└── components/
    ├── cookie-consent.tsx
    └── __tests__/
        └── cookie-consent.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest";

import { cn, nanoid, uuid } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false, "baz")).toBe("foo baz");
  });
});

describe("nanoid utility", () => {
  it("generates unique IDs", () => {
    const id1 = nanoid();
    const id2 = nanoid();
    expect(id1).not.toBe(id2);
  });
});
```

**Patterns:**

- One `describe` block per function/feature
- One `it` block per specific behavior
- Clear test names describe "what should happen": "merges class names correctly", "generates unique IDs"
- Arrange-Act-Assert pattern (implicit in test structure)

**Setup/Teardown:**
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ConsentAwareAnalytics", () => {
  beforeEach(() => {
    useCookieConsentOptionalMock.mockReset(); // Reset mocks between tests
  });

  it("does not render analytics when consent is not granted", () => {
    // ... test
  });
});
```

## Mocking

**Framework:** Vitest's built-in mocking with `vi.mock()` and `vi.fn()`

**Mocking Module Dependencies:**
```typescript
const { useCookieConsentOptionalMock } = vi.hoisted(() => ({
  useCookieConsentOptionalMock: vi.fn(),
}));

vi.mock("@/lib/cookie-consent-context", () => ({
  useCookieConsentOptional: useCookieConsentOptionalMock,
}));

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
```

**Mocking Custom Functions:**
```typescript
const mockT = vi.fn((key: string) => key) as unknown as TFunction;

// Use in test
const result = getPlanDisplayName("free", mockT);
expect(result).toBe("PLAN_FREE");
```

**Mock Setup in vitest.setup.ts:**
```typescript
vi.mock("i18next", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "en",
    init: vi.fn(),
  },
}));
```

**What to Mock:**
- External API calls and HTTP requests
- i18n (`i18next`) - mock returns translation keys as-is
- Context providers that depend on external state
- Analytics/third-party libraries with side effects
- File system operations (never actually read/write files in tests)

**What NOT to Mock:**
- Business logic functions (test their actual behavior)
- Validation functions - test real Zod schemas
- Permission check functions - test actual rules
- Pure utility functions - test real implementations
- Database models/ORM - use test fixtures instead

## Fixtures and Factories

**Test Data:**
- Use simple inline objects for small test data
- No factory pattern yet; keep fixtures minimal

**Example - Validation Tests (use `safeParse`):**
```typescript
describe("sign in validation behavior", () => {
  it("rejects invalid email format", () => {
    const result = signInSchema.safeParse({
      email: "invalid-email",
      password: "Password1",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      rememberMe: false,
    });
    expect(result.success).toBe(true);
  });
});
```

**Location:**
- Keep test data inline in test files
- Use factories only for complex object hierarchies
- Define types separately in `__tests__/` directory if reused

## Coverage

**Requirements:** No strict coverage targets enforced; optional measurement

**View Coverage:**
```bash
bun run test:coverage
```

**Config (`vitest.config.ts`):**
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  exclude: [
    "node_modules/",
    "src/**/__tests__/**",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "dist/",
    ".output/",
    "coverage/",
  ],
}
```

## Test Types

**Unit Tests (Primary):**
- Test pure functions and business logic
- Test utility functions: `cn()`, `nanoid()`, `uuid()`
- Test permission/role functions: `canAssignRole()`, `canManageOrganization()`
- Test validation schemas with Zod
- Scope: single function or tightly-coupled module
- Example: `src/lib/__tests__/utils.test.ts` (66 lines, 5 test suites)

**Integration Tests:**
- Test how modules interact
- Test React components with rendering
- Test form submissions and state updates
- Use `@testing-library/react` with `render()` and `screen` queries
- Example: `src/components/__tests__/cookie-consent.test.tsx` - tests component renders based on mock context

**E2E Tests:**
- Not currently used in this codebase
- Would test full user flows (auth, org creation, etc.)
- Framework: Playwright or Cypress (not configured)

## Common Patterns

**Behavior-Focused Tests:**
Focus on WHAT code does, not HOW it does it. Test outcomes and side effects.

Example - Permission Logic:
```typescript
describe("role assignment behavior", () => {
  it("owner can assign any role", () => {
    expect(canAssignRole("owner", "owner")).toBe(true);
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("owner", "user")).toBe(true);
  });

  it("admin can assign user and admin roles", () => {
    expect(canAssignRole("admin", "admin")).toBe(true);
    expect(canAssignRole("admin", "user")).toBe(true);
    expect(canAssignRole("admin", "owner")).toBe(false);
  });
});
```

Tests describe business rules (owner can assign anything), not implementation details.

**Schema Validation Testing:**
```typescript
describe("sign up validation behavior", () => {
  it("rejects password without lowercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "PASSWORD123",
      confirmPassword: "PASSWORD123",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });
});
```

Pattern: Test edge cases and business rules, not all permutations.

**Component Testing:**
```typescript
describe("ConsentAwareAnalytics", () => {
  beforeEach(() => {
    useCookieConsentOptionalMock.mockReset();
  });

  it("does not render analytics when consent is not granted", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: false,
    });

    render(<ConsentAwareAnalytics />);

    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
  });

  it("renders analytics after consent opt-in", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: true,
    });

    render(<ConsentAwareAnalytics />);

    expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
  });
});
```

Pattern: Mock context, render component, assert DOM output. Tests user-visible behavior.

**Async Testing:**
All Vitest async patterns work naturally:

```typescript
it("generates unique IDs", async () => {
  const id1 = nanoid();
  const id2 = nanoid();
  expect(id1).not.toBe(id2);
});
```

(Note: above example is synchronous, but async syntax is supported)

**Error/Edge Case Testing:**
```typescript
describe("plan lookup behavior", () => {
  const plans = [
    { name: "free", price: 0 },
    { name: "pro", price: 10 },
    { name: "enterprise", price: 100 },
  ];

  it("returns undefined for non-existent plan", () => {
    const result = findPlanByName(plans, "platinum");
    expect(result).toBeUndefined();
  });

  it("returns undefined for undefined plan name", () => {
    const result = findPlanByName(plans, undefined);
    expect(result).toBeUndefined();
  });
});
```

Test both success and failure paths, null/undefined cases.

## Testing Best Practices

**Do:**
- Test business rules and policies (permission matrix, validation rules)
- Test edge cases (empty strings, null, undefined, boundary values)
- Test what code does, not how it does it
- Use descriptive test names: "owner can assign any role" not "test assignRole"
- Keep tests focused and isolated (no test interdependencies)
- Mock external dependencies, test internal logic

**Don't:**
- Test implementation details (private functions, specific algorithm)
- Test CSS classes or DOM structure (unless critical to functionality)
- Test trivial getters/setters with no logic
- Import from test files in production code
- Create interdependent tests (test B depends on test A)
- Test dependencies' behavior; assume they work

---

*Testing analysis: 2026-02-21*
