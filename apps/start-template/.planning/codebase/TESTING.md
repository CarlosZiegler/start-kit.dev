# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `/Users/zietec/work/start-template/vitest.config.ts`
- Node environment with jsdom for DOM testing
- TSConfig path resolution enabled

**Assertion Library:**
- Vitest built-in expect assertions
- Testing Library matchers via `@testing-library/jest-dom`

**Run Commands:**
```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode with auto-rerun
npm run test:ui          # Open Vitest UI dashboard
npm run test:coverage    # Generate coverage report
npm run test:db          # Run specific RLS test file
```

## Test File Organization

**Location:**
- Co-located with source code in `__tests__` directories
- Examples:
  - `src/lib/__tests__/utils.test.ts` → for `src/lib/utils.ts`
  - `src/components/__tests__/cookie-consent.test.tsx` → for `src/components/cookie-consent.tsx`
  - `src/lib/auth/__tests__/permissions.test.ts` → for `src/lib/auth/permissions.ts`

**Naming:**
- Files: `*.test.ts` or `*.test.tsx`
- Alternative format `*.spec.ts` also supported but not used in current codebase

**Structure:**
```
src/
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── components/
│   ├── cookie-consent.tsx
│   └── __tests__/
│       └── cookie-consent.test.tsx
└── lib/auth/
    ├── permissions.ts
    └── __tests__/
        └── permissions.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest";

describe("feature behavior", () => {
  it("specific behavior when condition", () => {
    // Arrange
    const input = ...;

    // Act
    const result = fn(input);

    // Assert
    expect(result).toBe(...);
  });

  it("another behavior", () => {
    // Test implementation
  });
});
```

**Patterns:**
- Setup: `beforeEach()` for common test initialization
- Cleanup: Automatic via `afterEach()` in vitest.setup.ts
- Suite naming: Descriptive feature name + "behavior"
- Test naming: "specific behavior when condition" format

**Example from permissions.test.ts:**
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

## Mocking

**Framework:** Vitest built-in `vi` module

**Patterns:**

Module mocking with `vi.mock()`:
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

Mock functions setup in beforeEach:
```typescript
describe("ConsentAwareAnalytics", () => {
  beforeEach(() => {
    useCookieConsentOptionalMock.mockReset();
  });

  it("renders analytics when consent granted", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: true,
    });
    // Test implementation
  });
});
```

Global mock setup in vitest.setup.ts:
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
- External dependencies (analytics, i18n, context providers)
- API calls and network requests
- Browser APIs when testing logic independent of DOM

**What NOT to Mock:**
- Internal utility functions
- Core business logic (test actual behavior)
- Zod validators (test real validation logic)

## Testing Library Integration

**Setup in vitest.setup.ts:**
```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();  // Auto cleanup after each test
});
```

**Component Testing Pattern:**
```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("ConsentAwareAnalytics", () => {
  it("does not render analytics when consent is not granted", () => {
    // Mock setup
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: false,
    });

    // Render component
    render(<ConsentAwareAnalytics />);

    // Query and assert
    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
  });

  it("renders analytics after analytics consent opt-in", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: true,
    });

    render(<ConsentAwareAnalytics />);

    expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
  });
});
```

## Fixtures and Factories

**Test Data:**
- No dedicated fixture files in current codebase
- Mock data defined inline within test suite
- Example from plan.utils.test.ts:
```typescript
const plans = [
  { name: "free", price: 0 },
  { name: "pro", price: 10 },
  { name: "enterprise", price: 100 },
];

it("finds plan by name", () => {
  const result = findPlanByName(plans, "PRO");
  expect(result).toEqual({ name: "pro", price: 10 });
});
```

**Location:** Test data defined within test files, no separate factory files

## Coverage

**Requirements:** No enforced coverage threshold

**View Coverage:**
```bash
npm run test:coverage
```

**Reporter:** V8 provider with text, JSON, and HTML output
- HTML report generated in `coverage/` directory
- Excluded from coverage:
  - `node_modules/`
  - `src/**/__tests__/**`
  - `dist/`, `.output/`, `coverage/`
  - Test files themselves

**Config from vitest.config.ts:**
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
  ],
}
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and utilities
- Approach: Pure function testing with various inputs
- Examples:
  - `utils.test.ts`: Tests `cn()`, `nanoid()`, `uuid()` utilities
  - `permissions.test.ts`: Tests permission logic functions
  - `plan.utils.test.ts`: Tests plan lookup and detection functions

**Integration Tests:**
- Scope: Component integration with context/hooks
- Approach: Component rendering with mock providers
- Examples:
  - `cookie-consent.test.tsx`: Tests component behavior with mocked context
  - `format-date.test.ts`: Tests date formatting with different locales

**E2E Tests:**
- Framework: Not used in current codebase
- No Playwright, Cypress, or similar setup

**Database Tests:**
- Location: `src/lib/db/rls.test.ts`
- Test: Row-level security policies (RLS) in PostgreSQL
- Run: `npm run test:db`

## Common Patterns

**Async Testing:**
- Async functions tested directly with await
- No done callbacks - Vitest handles promises automatically
```typescript
it("handles async operations", async () => {
  const result = await asyncFunction();
  expect(result).toEqual(...);
});
```

**Validation Testing:**
```typescript
it("rejects invalid input", () => {
  const result = signInSchema.safeParse({
    email: "invalid-email",
    password: "Pass1",
  });
  expect(result.success).toBe(false);
});

it("accepts valid input", () => {
  const result = signInSchema.safeParse({
    email: "test@example.com",
    password: "Password123",
  });
  expect(result.success).toBe(true);
});
```

**Zod Schema Testing Pattern:**
```typescript
describe("sign up validation behavior", () => {
  it("rejects password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",  // lowercase only
      confirmPassword: "password123",
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

**Conditional Logic Testing:**
```typescript
it("identifies free plan case insensitive", () => {
  expect(isFreePlan("FREE")).toBe(true);
  expect(isFreePlan("Free")).toBe(true);
  expect(isFreePlan("pro")).toBe(false);
});

it("treats undefined as free plan", () => {
  expect(isFreePlan(undefined)).toBe(true);
});
```

## Environment Setup

**Setup File:** `/Users/zietec/work/start-template/vitest.setup.ts`

Configuration includes:
- Testing Library cleanup hook
- i18next global mock
- jsdom environment for DOM APIs

**Global Mocks:**
- i18next returns translation keys as-is (no actual translations in tests)
- Prevents external service calls during tests

---

*Testing analysis: 2026-02-11*
