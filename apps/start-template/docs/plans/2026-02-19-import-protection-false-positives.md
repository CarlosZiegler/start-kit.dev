# Import Protection False Positives with Compiler-Boundary-Aware Patterns

## Problem Summary

TanStack Start's `import-protection` plugin flags `*.server.*` imports as violations even when those imports are **only referenced inside compiler-recognized boundaries** (`createServerOnlyFn`, `createIsomorphicFn`, `createServerFn`).

The TanStack Start compiler correctly prunes these imports from client bundles, but the static analysis runs **before** compilation and cannot see through these boundaries.

**Impact**: Forces users to either disable import-protection entirely (`enabled: false`) or add manual `onViolation` overrides — both defeat the purpose of the safety net.

**Affected stack**: Any combination of server-only libraries (better-auth, Drizzle, Resend, S3, etc.) with isomorphic entry points (oRPC, TanStack server functions).

---

## Real-World Reproduction

Stack: TanStack Start + better-auth + oRPC + Drizzle + t3-env + Resend + Bun S3

All 7 import chains below are flagged by import-protection. All are false positives.

### Chain 1: Auth via `createServerOnlyFn`

```
router.tsx
  -> lib/auth/queries.ts
    -> lib/auth/auth-server-fn.ts
      -> lib/auth/auth.ts
        -> env.server.ts   <-- FLAGGED
```

**Why safe**: `auth.ts` wraps the entire `betterAuth()` config in `createServerOnlyFn()`. The compiler replaces it with a throw stub on the client, pruning the `env.server` import.

```ts
// src/lib/auth/auth.ts
const getAuthConfig = createServerOnlyFn(() =>
  betterAuth({
    secret: env.BETTER_AUTH_SECRET, // only referenced inside boundary
    // ...
  })
);
```

### Chain 2: oRPC Routes via `createIsomorphicFn`

```
router.tsx
  -> orpc/orpc-client.ts
    -> orpc/index.ts
      -> orpc/routes/profile.ts -> env.server.ts   <-- FLAGGED
      -> orpc/routes/storage.ts -> env.server.ts   <-- FLAGGED
```

**Why safe**: `orpc-client.ts` uses `createIsomorphicFn()`. The client gets an RPC link via `fetch()`. The server implementation (including all route imports) is pruned.

```ts
// src/orpc/orpc-client.ts
const getOrpcClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => createORPCContext({ headers: getRequestHeaders() }),
    })
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      // ...
    });
    return createORPCClient(link);
  });
```

### Chain 3: Database via `createIsomorphicFn`

```
router.tsx
  -> orpc/orpc-client.ts
    -> orpc/orpc-server.ts
      -> lib/db/index.ts
        -> env.server.ts   <-- FLAGGED
```

**Why safe**: `orpc-server.ts` is only referenced inside `createIsomorphicFn().server()`. Client build prunes it.

### Chain 4: Resend via `createServerOnlyFn`

```
lib/resend.ts -> env.server.ts   <-- FLAGGED
```

**Why safe**: `resend.ts` is only imported by `auth.ts` email handlers, which live inside `createServerOnlyFn()`.

### Chain 5: Storage via API Route

```
routeTree.gen.ts
  -> routes/api/storage/$.ts
    -> lib/storage/index.ts
      -> env.server.ts   <-- FLAGGED
```

**Why safe**: API routes (`routes/api/**`) are server-only by nature in TanStack Start.

### Chain 6: Chat Stream Context

```
lib/chat/stream-context.ts -> env.server.ts   <-- FLAGGED
```

**Why safe**: Only used in server-side AI streaming handlers.

**Key pattern**: Every chain terminates inside a compiler boundary. None of this code reaches the client bundle.

---

## Root Cause Analysis

### The Timing Problem

Import-protection runs as a Vite plugin during module resolution — **before** the TanStack Start compiler rewrites environment boundaries.

```
1. Vite resolves import graph (static analysis)
2. Import-protection checks ALL resolved imports   <-- flags violations here
3. TanStack Start compiler rewrites boundaries
4. Dead imports get pruned                          <-- server imports removed here
```

The plugin sees the full import graph at step 2, where `env.server.ts` is still connected to everything. By step 4, those connections are gone — but the warnings already fired.

### The False Positive Pattern

Any import referenced **exclusively** inside a compiler boundary will be flagged even though it will never reach the client:

- `createServerOnlyFn(() => ...)` — compiler replaces with throw stub
- `createIsomorphicFn().server(() => ...)` — compiler removes server branch
- `createServerFn().handler(() => ...)` — compiler replaces with RPC stub

**This is not a user error.** The code follows exactly what TanStack Start's own documentation recommends. These APIs exist precisely to wrap server-only code.

---

## Workarounds (Interim Solutions)

### A: Disable Entirely (current approach)

```ts
// app.config.ts or vite config
importProtection: {
  enabled: false,
}
```

**Downside**: Loses all protection. Actual leaks won't be caught.

### B: `onViolation` Allowlist

```ts
importProtection: {
  onViolation: (info) => {
    const allowedImporters = [
      'lib/auth/auth.ts',
      'lib/db/index.ts',
      'lib/resend.ts',
      'lib/storage/index.ts',
      'lib/chat/stream-context.ts',
      'orpc/routes/',
    ];
    const isAllowed = allowedImporters.some(
      (p) => info.importer.includes(p)
    );
    if (isAllowed && info.resolved?.includes('env.server')) {
      return false; // suppress this violation
    }
  },
}
```

**Downside**: Manual maintenance. New files importing `env.server` need to be added to the list.

### C: `ignoreImporters` Pattern

```ts
importProtection: {
  ignoreImporters: [
    '**/lib/auth/**',
    '**/lib/db/**',
    '**/lib/resend.ts',
    '**/lib/storage/**',
    '**/lib/chat/**',
    '**/orpc/**',
  ],
}
```

**Downside**: Ignores ALL violations from these files, not just `env.server` imports. Could mask real leaks.

---

## Proposed Enhancement

Import-protection should recognize TanStack Start's own compiler boundaries and suppress violations for imports that are only referenced inside them.

If an import of a `*.server.*` file is only reachable through code inside:

- `createServerOnlyFn(() => ...)`
- `createIsomorphicFn().server(() => ...)`
- `createServerFn().handler(() => ...)`

...then the plugin should **not** flag it, because the compiler will prune it.

### Implementation Idea

The plugin already walks the import graph. It could additionally check whether the referencing code site is inside a recognized boundary call expression. If **all** references to the flagged import are inside boundaries, suppress the violation.

### Alternative: Two-Pass Approach

1. First pass: Run compiler rewrites (or simulate them) to determine which imports survive
2. Second pass: Run import-protection on the post-rewrite graph

This would eliminate false positives entirely since it would only flag imports that actually survive compilation.

---

## Reproduction Repository

- **Stack**: TanStack Start + better-auth + oRPC + Drizzle + t3-env (`@t3-oss/env-core`) + Resend + Bun S3
- **Runtime**: Bun
- **Pattern**: `env.server.ts` centralizes all server environment variables via `createEnv()` with Zod validation
- **Key file**: `src/lib/env.server.ts` — imported by 7 server-only modules, all behind compiler boundaries
- **Current fix**: `importProtection: { enabled: false }` — no server code leaks to frontend (verified)
