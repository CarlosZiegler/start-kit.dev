# api-adding-endpoints: Add New oRPC Routes End-to-End

## Priority: CRITICAL

## Explanation

Adding a new API endpoint involves 4 steps: define the procedure in an oRPC route file, register it in the router, export query/mutation options from the client, and use them in components. This ensures type safety flows from database to UI.

## Bad Example

```typescript
// Wrong: creating a separate REST endpoint
// src/routes/api/users.ts
export async function GET(request: Request) {
  const users = await db.query.user.findMany();
  return new Response(JSON.stringify(users));
}
```

## Good Example: Step 1 — Define the Procedure

```typescript
// src/orpc/routes/dashboard.ts
import { protectedProcedure, orpc } from "@/orpc/orpc-server";
import * as z from "zod";
import { user } from "@/lib/db/schema";
import { count, like } from "drizzle-orm";

export const dashboardRouter = orpc.router({
  stats: protectedProcedure
    .handler(async ({ context }) => {
      const [userCount] = await context.db
        .select({ count: count() })
        .from(user);
      return { totalUsers: userCount.count };
    }),

  users: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
    }))
    .handler(async ({ input, context }) => {
      const where = input.search
        ? like(user.name, `%${input.search}%`)
        : undefined;

      const [data, [total]] = await Promise.all([
        context.db.query.user.findMany({
          where,
          limit: input.limit,
          offset: input.offset,
        }),
        context.db.select({ count: count() }).from(user).where(where),
      ]);

      return { data, total: total.count };
    }),
});
```

## Good Example: Step 2 — Register in Router

```typescript
// src/orpc/index.ts
import { dashboardRouter } from "./routes/dashboard";

export const router = orpc.router({
  profile: profileRouter,
  organization: organizationRouter,
  dashboard: dashboardRouter,  // Add new router here
  storage: storageRouter,
  chat: chatRouter,
});
```

## Good Example: Step 3 — Use on Client

```typescript
// In a component — types flow automatically
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";

function DashboardStats() {
  // orpc.dashboard.stats.queryOptions() is fully typed
  const { data } = useQuery(orpc.dashboard.stats.queryOptions());

  return <div>Total Users: {data?.totalUsers}</div>;
}

// For mutations
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...orpc.profile.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

## Context

- oRPC route files live in `src/orpc/routes/<domain>.ts`
- Register routes in `src/orpc/index.ts` router
- Client uses `orpc.<domain>.<procedure>.queryOptions()` for queries
- Client uses `orpc.<domain>.<procedure>.mutationOptions()` for mutations
- The `orpc` client is created via `createTanstackQueryUtils()` in `src/orpc/orpc-client.ts`
- Types flow end-to-end: Zod input schema → handler → client → component
- API is served via Elysia at `/api/rpc` (see `src/routes/api/rpc.$.ts`)
- All HTTP methods are supported (GET, POST, PUT, PATCH, DELETE)
