# auth-route-protection: Protect Routes with beforeLoad + loader Pattern

## Priority: HIGH

## Explanation

Protected routes use TanStack Router's `beforeLoad` to check authentication and `loader` to redirect unauthenticated users. The `(dashboard)` layout group enforces auth for all child routes. Auth session is prefetched in `__root.tsx` and passed via route context.

## Bad Example

```typescript
// Wrong: checking auth in component — too late, data may have loaded
function DashboardPage() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth) navigate({ to: "/sign-in" });
  }, [auth]);

  if (!auth) return null; // Flash of content
  return <Dashboard />;
}
```

## Good Example

```typescript
// src/routes/(dashboard)/layout.tsx — actual project pattern
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { authQueryOptions } from "@/lib/auth/queries";

export const Route = createFileRoute("/(dashboard)")({
  beforeLoad: async ({ context }) => {
    // Prefetch auth session via React Query
    await context.queryClient.ensureQueryData(authQueryOptions());
  },
  loader: async ({ context }) => {
    // Check if user is authenticated
    const auth = context.queryClient.getQueryData(authQueryOptions().queryKey);
    if (!auth) {
      throw redirect({ to: "/sign-in" });
    }
    return { auth };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
```

## Good Example: Auth Prefetch in Root

```typescript
// src/routes/__root.tsx — prefetch auth for all routes
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.ensureQueryData(authQueryOptions());
    return { auth };
  },
  component: RootComponent,
});
```

## Context

- Auth is prefetched once in `__root.tsx` via `ensureQueryData`
- Dashboard layout checks auth in `loader` and redirects to `/sign-in`
- All routes under `(dashboard)/` are automatically protected by the layout
- Public routes (landing, pricing, terms) live outside the `(dashboard)` group
- Auth routes (sign-in, sign-up, etc.) live in the `(auth)` group
- Route groups use parentheses: `(dashboard)`, `(auth)` — no URL segment added
- The `layout.tsx` file name is used instead of `_layout.tsx` (configured via router token)
