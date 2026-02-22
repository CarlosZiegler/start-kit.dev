# arch-orpc-procedures: Use the Correct oRPC Procedure Level

## Priority: CRITICAL

## Explanation

This project uses oRPC with three procedure levels, each adding security layers. Always use the most restrictive procedure that fits your use case. The chain is defined in `src/orpc/orpc-server.ts`.

- `publicProcedure` — No auth required. Has error handling and timing middleware.
- `protectedProcedure` — Requires authenticated session. Extends public with `requireAuth`.
- `protectedRlsProcedure` — Requires auth + runs inside an RLS transaction. Use for any query on tables with PostgreSQL Row-Level Security policies.

## Bad Example

```typescript
// Using publicProcedure for data that requires auth
import { publicProcedure } from "@/orpc/orpc-server";

export const getUserProfile = publicProcedure
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input, context }) => {
    // No auth check — anyone can read any user's profile
    return await context.db.query.user.findFirst({
      where: eq(user.id, input.userId),
    });
  });
```

## Good Example

```typescript
// src/orpc/routes/profile.ts — actual project pattern
import { protectedProcedure } from "@/orpc/orpc-server";
import * as z from "zod";

export const profileRouter = orpc.router({
  get: protectedProcedure
    .handler(async ({ context }) => {
      // context.session is guaranteed by protectedProcedure
      return await context.db.query.user.findFirst({
        where: eq(user.id, context.session.user.id),
      });
    }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
    }))
    .handler(async ({ input, context }) => {
      return await context.db
        .update(user)
        .set({ name: input.name })
        .where(eq(user.id, context.session.user.id))
        .returning();
    }),
});
```

## Good Example: RLS-Protected Procedure

```typescript
// For tables with RLS policies (e.g., storage files scoped to org)
import { protectedRlsProcedure } from "@/orpc/orpc-server";

export const storageRouter = orpc.router({
  list: protectedRlsProcedure
    .handler(async ({ context }) => {
      // context.db is RLS-scoped — automatically filters by user/org
      return await context.db.query.file.findMany();
    }),
});
```

## Context

- Use `publicProcedure` only for truly public data (health checks, public config)
- Use `protectedProcedure` for authenticated endpoints on non-RLS tables
- Use `protectedRlsProcedure` for any table with RLS policies (storage, org-scoped data)
- The procedure chain: `publicProcedure` → `protectedProcedure` → `protectedRlsProcedure`
- Input validation uses Zod schemas — always validate with `.input(z.object({...}))`
- Errors are automatically mapped: `ValidationError` → 422, `ORPCError` → appropriate status
