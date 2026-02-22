# db-rls-policies: Implement Row-Level Security Correctly

## Priority: HIGH

## Explanation

Row-Level Security (RLS) isolates data at the database level. The project uses PostgreSQL RLS policies with a `withRls()` wrapper that sets `request.user_id` and `request.org_id` via `set_config()` inside a transaction. Always use `protectedRlsProcedure` for RLS-protected tables.

## Bad Example

```typescript
// Wrong: querying RLS-protected table without RLS context
import { protectedProcedure } from "@/orpc/orpc-server";

export const listFiles = protectedProcedure
  .handler(async ({ context }) => {
    // This bypasses RLS — no user_id/org_id set in PostgreSQL
    return await context.db.query.file.findMany();
  });
```

## Good Example

```typescript
// src/lib/db/secure-client.ts — the withRls wrapper
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export type RlsSession = {
  user: { id: string };
  session: { activeOrganizationId: string | null };
};

export const withRls = async <T>(
  session: RlsSession,
  fn: (tx: typeof db) => Promise<T>
) => {
  return db.transaction(async (tx) => {
    // Set PostgreSQL session variables for RLS policy evaluation
    await tx.execute(
      sql`select set_config('request.user_id', ${session.user.id}, true)`
    );
    await tx.execute(
      sql`select set_config('request.org_id', ${session.session.activeOrganizationId ?? ""}, true)`
    );
    return await fn(tx);
  });
};
```

## Good Example: Using protectedRlsProcedure

```typescript
// The correct way to query RLS-protected tables
import { protectedRlsProcedure } from "@/orpc/orpc-server";

export const storageRouter = orpc.router({
  list: protectedRlsProcedure
    .handler(async ({ context }) => {
      // context.db is RLS-scoped — PostgreSQL enforces row filtering
      return await context.db.query.file.findMany({
        orderBy: (file, { desc }) => [desc(file.createdAt)],
      });
    }),
});
```

## Good Example: RLS Policy in Schema

```typescript
// src/lib/db/schema/storage.ts — RLS policies defined alongside table
export const file = pgTable(
  "file",
  { /* columns */ },
  (table) => [
    // Indexes...
    pgPolicy("file_select_policy", {
      for: "select",
      using: sql`(user_id = current_setting('request.user_id', true) OR organization_id = current_setting('request.org_id', true))`,
    }),
    pgPolicy("file_insert_policy", {
      for: "insert",
      withCheck: sql`(user_id = current_setting('request.user_id', true))`,
    }),
  ]
);
```

## Context

- RLS policies must stay in sync with application auth logic
- `protectedRlsProcedure` automatically wraps in `withRls()` transaction
- `set_config('request.user_id', ...)` with `true` = local to transaction only
- Always test RLS policies (see `src/lib/db/rls.test.ts` for examples)
- Tables with RLS: `file` (storage). Add policies when creating org-scoped tables
- If a table doesn't have RLS policies, use `protectedProcedure` instead
