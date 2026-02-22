# arch-middleware-chain: Understand the Middleware Chain

## Priority: CRITICAL

## Explanation

The oRPC middleware chain in `src/orpc/orpc-server.ts` processes every request through layers. Understanding the chain order is critical for security and debugging. The chain is:

1. **Error middleware** (`onError`) — Maps validation errors to proper HTTP codes, catches unhandled errors
2. **Timing middleware** — Dev-only logging of procedure execution time
3. **Auth middleware** (`requireAuth`) — Validates session exists, enriches context with typed session
4. **RLS middleware** (`withRlsMiddleware`) — Wraps handler in a PostgreSQL transaction with `set_config` for user/org context

## Bad Example

```typescript
// Creating custom middleware that duplicates auth checks
const myMiddleware = orpc.middleware(async ({ context, next }) => {
  // Don't manually check session — use protectedProcedure instead
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED");
  return await next({ context: { session } });
});

export const myProcedure = publicProcedure.use(myMiddleware);
```

## Good Example

```typescript
// Extend the existing chain — don't rebuild it
import { protectedProcedure, orpc } from "@/orpc/orpc-server";

// Add domain-specific middleware ON TOP of protected
const withOrgAdmin = orpc.middleware(async ({ context, next }) => {
  const member = await context.db.query.member.findFirst({
    where: and(
      eq(member.userId, context.session.user.id),
      eq(member.organizationId, context.session.session.activeOrganizationId),
    ),
  });

  if (!member || !["admin", "owner"].includes(member.role)) {
    throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
  }

  return await next({ context: { member } });
});

// Compose: protected (has auth) → withOrgAdmin (has role check)
export const adminProcedure = protectedProcedure.use(withOrgAdmin);
```

## Good Example: Error Handling Flow

```typescript
// Errors flow through the errorMiddleware automatically
// ValidationError (bad input) → 422 with Zod-formatted error
// ORPCError → preserved with original status code
// Unknown Error → 500 INTERNAL_SERVER_ERROR

// The error middleware in orpc-server.ts handles this:
const errorMiddleware = (error: Error) => {
  if (error instanceof ORPCError && error.code === "BAD_REQUEST"
      && error.cause instanceof ValidationError) {
    const zodError = new z.ZodError(error.cause.issues);
    throw new ORPCError("INPUT_VALIDATION_FAILED", {
      status: 422,
      message: z.prettifyError(zodError),
      data: z.flattenError(zodError),
    });
  }
  // ... other error types
};
```

## Context

- Never duplicate auth checks — use the appropriate procedure level
- Add custom middleware ON TOP of existing procedures, don't rebuild the chain
- The timing middleware only runs in development (`NODE_ENV !== "production"`)
- Error middleware converts `ValidationError` to proper 422 responses with Zod formatting
- The RLS middleware sets PostgreSQL `request.user_id` and `request.org_id` via `set_config`
- Middleware order matters: error handling → timing → auth → RLS → your custom middleware
