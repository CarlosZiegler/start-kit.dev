# api-query-patterns: Use React Query with oRPC Effectively

## Priority: HIGH

## Explanation

Data fetching uses React Query via oRPC's `queryOptions()` and `mutationOptions()`. Key patterns include: prefetching in route loaders, conditional queries with `skipToken`, cache invalidation after mutations, and automatic 401 redirect handling.

## Bad Example

```typescript
// Wrong: manual fetch, no caching, no error handling
function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/rpc/dashboard/stats")
      .then(r => r.json())
      .then(setData);
  }, []);
}
```

## Good Example: Basic Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-client";

function DashboardStats() {
  const { data, isLoading, error } = useQuery(
    orpc.dashboard.stats.queryOptions()
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;
  return <StatsCard data={data} />;
}
```

## Good Example: Query with Input

```typescript
// Parameterized query
const { data } = useQuery(
  orpc.dashboard.users.queryOptions({
    input: { search, limit: 10, offset: page * 10 },
  })
);
```

## Good Example: Conditional Query with skipToken

```typescript
import { skipToken, useQuery } from "@tanstack/react-query";

function SearchResults({ search }: { search: string }) {
  // Skip query when search is empty
  const { data } = useQuery(
    orpc.dashboard.users.queryOptions({
      input: search ? { search } : skipToken,
    })
  );
}
```

## Good Example: Prefetch in Route Loader

```typescript
// src/routes/(dashboard)/overview/index.tsx
export const Route = createFileRoute("/(dashboard)/overview/")({
  loader: async ({ context }) => {
    // Prefetch during navigation — data ready before component mounts
    await context.queryClient.ensureQueryData(
      orpc.dashboard.stats.queryOptions()
    );
  },
  component: OverviewPage,
});
```

## Good Example: Mutation with Cache Invalidation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function UpdateProfileForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...orpc.profile.update.mutationOptions(),
    onSuccess: () => {
      // Invalidate related queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      toast.success(t("profile.updated"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

## Good Example: Auto 401 Redirect

```typescript
// Configured in QueryClient (src/routes/__root.tsx)
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.cause?.status === 401) {
        queryClient.setQueryData(authQueryOptions().queryKey, null);
        window.location.href = "/sign-in";
      }
    },
  }),
});
```

## Context

- `orpc.<domain>.<procedure>.queryOptions()` — for `useQuery` / `ensureQueryData`
- `orpc.<domain>.<procedure>.mutationOptions()` — for `useMutation`
- Use `skipToken` for conditional queries (replaces `enabled: false` pattern)
- Prefetch in route `loader` with `ensureQueryData` for instant page loads
- `keepPreviousData` for pagination (prevents layout shift)
- Invalidate specific query keys after mutations — avoid broad invalidation
- Auto 401 redirect configured in QueryClient's `queryCache.onError`
- Toast notifications via `sonner` for success/error feedback
