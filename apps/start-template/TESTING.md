# Testing Guide

## Overview

This project uses **Vitest** for behavior-focused testing. We test **what code does** (behavior), not **how it does it** (implementation).

## Philosophy: Behavior Over Implementation

**We DO test:**

- Business rules and policies
- User-facing behavior and outcomes
- Permission checks and validation rules
- Edge cases and error scenarios
- Integration between modules

**We DON'T test:**

- Internal implementation details
- Private helper functions
- Trivial one-to-one mappings
- CSS classes or DOM structure
- Every single line of code

## Test Structure

```
src/
├── lib/
│   ├── __tests__/              # Utility tests
│   ├── auth/__tests__/          # Auth validation, permissions
│   ├── payment/__tests__/       # Payment/subscription behavior
│   └── validations/__tests__/   # Form validation behavior
hooks/
└── __tests__/                  # Hook behavior tests
```

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode (development)
bun run test:watch

# Run tests with visual UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## Coverage Status

**Current: 82% coverage** across tested files

### Coverage Breakdown:

- `lib/validations/auth.ts` - 100% (28 tests)
- `lib/payment/plan.utils.ts` - 100% (17 tests)
- `lib/auth/permissions.ts` - 61% (22 tests)
- `lib/device-utils.ts` - 100% (13 tests)
- `lib/format-date.ts` - 91% (10 tests)
- `lib/utils.ts` - 40% (11 tests)
- `hooks/use-copy-to-clipboard.ts` - 85% (6 tests)

## Test Categories

### 1. Validation Behavior

Tests form validation rules and business constraints.

**File:** `src/lib/validations/__tests__/auth.test.ts`

Tests password complexity, email format, and cross-field validation.

### 2. Permission Behavior

Tests role-based access control policies.

**File:** `src/lib/auth/__tests__/permissions.test.ts`

Tests who can do what (invite, remove, delete, manage).

### 3. Plan/Subscription Behavior

Tests subscription-related business logic.

**File:** `src/lib/payment/__tests__/plan.utils.test.ts`

Tests plan lookup, free tier detection, and display behavior.

### 4. Utility Behavior

Tests helper functions and utilities.

**Files:**

- `src/lib/__tests__/utils.test.ts`
- `src/lib/__tests__/device-utils.test.ts`
- `src/lib/__tests__/format-date.test.ts`

### 5. Hook Behavior

Tests React hook behavior and state changes.

**File:** `src/hooks/__tests__/use-copy-to-clipboard.test.ts`

## Writing Behavior-Focused Tests

### Validation Tests

Test business rules, not implementation:

```typescript
describe("sign up validation behavior", () => {
  it("rejects password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      password: "password123",
      confirmPassword: "password123",
      // ... other fields
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration", () => {
    const result = signUpSchema.safeParse({
      password: "Password123",
      confirmPassword: "Password123",
      // ... other fields
    });
    expect(result.success).toBe(true);
  });
});
```

### Permission Tests

Test who can do what:

```typescript
describe("organization deletion behavior", () => {
  it("only owner can delete organization", () => {
    expect(canDeleteOrganization("owner")).toBe(true);
    expect(canDeleteOrganization("admin")).toBe(false);
    expect(canDeleteOrganization("member")).toBe(false);
  });
});
```

### Hook Tests

Test observable behavior:

```typescript
describe("useCopyToClipboard", () => {
  it("initializes with copied false", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
  });

  it("sets copied to true after copying", async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      result.current.copy("test");
    });
    expect(result.current.copied).toBe(true);
  });
});
```

## Test Commands

- `bun run test` - Run all Vitest tests
- `bun run test:watch` - Watch mode for development
- `bun run test:ui` - Visual test runner
- `bun run test:coverage` - Generate coverage report

## Best Practices

1. **Describe behavior in test names**: "rejects password without uppercase letter" vs "validates password"
2. **One behavior per test**: Each test should verify one clear rule
3. **Test edge cases**: Empty strings, undefined values, boundary conditions
4. **Use descriptive test names**: User-focused, not implementation-focused
5. **Avoid implementation details**: Don't test private functions or internal state
6. **Keep tests fast**: Tests should run in milliseconds, not seconds

## Example Test Files

- `src/lib/validations/__tests__/auth.test.ts` - Validation behavior
- `src/lib/auth/__tests__/permissions.test.ts` - Permission behavior
- `src/lib/payment/__tests__/plan.utils.test.ts` - Subscription behavior
- `src/hooks/__tests__/use-copy-to-clipboard.test.ts` - Hook behavior

## Troubleshooting

### Import errors using `@/` alias

Ensure `vite-tsconfig-paths` plugin is configured in `vitest.config.ts`.

### Tests timing out

- Tests should be fast (<100ms)
- If timing out, check for infinite loops or slow operations
- Use mocks for external dependencies

### Module mocking issues

Mock at the top of test file:

```typescript
vi.mock("@/lib/api", () => ({
  fetchData: vi.fn().mockResolvedValue({ data: "mock" }),
}));
```

## Future Tests (Not Yet Implemented)

- Component behavior tests (UI interactions)
- Organization mutation tests (with mocked auth)
- ORPC route handler tests
- Email template rendering tests
