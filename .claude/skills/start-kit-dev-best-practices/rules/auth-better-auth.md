# auth-better-auth: Configure Better-Auth Server and Client Correctly

## Priority: CRITICAL

## Explanation

Authentication uses Better-Auth with a rich plugin chain. The server config lives in `src/lib/auth/auth.ts`, the client in `src/lib/auth/auth-client.ts`, and session queries in `src/lib/auth/queries.ts`. Plugin ordering matters — plugins are interdependent.

## Bad Example

```typescript
// Wrong: creating a separate auth system or manually managing sessions
import jwt from "jsonwebtoken";

export async function verifyAuth(request: Request) {
  const token = request.headers.get("authorization");
  return jwt.verify(token, process.env.SECRET);
}
```

## Good Example: Server Config

```typescript
// src/lib/auth/auth.ts — key structure (simplified)
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization, twoFactor, passkey, magicLink, emailOTP } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    admin({ defaultRole: "user" }),
    organization({ /* roles, permissions */ }),
    emailOTP({ /* config */ }),
    twoFactor({ issuer: appConfig.name }),
    passkey({ rpName: appConfig.name, rpID: env.BETTER_AUTH_BASE_URL }),
    magicLink({ /* config */ }),
    stripe({ stripeClient, stripeWebhookSecret, /* lifecycle hooks */ }),
  ],
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { cookieCache: { enabled: true, maxAge: 60 * 5 } },
  // ... email config, trusted origins
});
```

## Good Example: Client Config

```typescript
// src/lib/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient, passkeyClient, adminClient, organizationClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
    stripeClient({ subscription: true }),
    // ... other client plugins
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;
```

## Good Example: Session Query with React Query

```typescript
// src/lib/auth/queries.ts
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.all,
    queryFn: () => getUser(),
  });

// Prefetched in __root.tsx beforeLoad
export const Route = createFileRoute("__root")({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.ensureQueryData(authQueryOptions());
    return { auth };
  },
});
```

## Context

- Better-Auth plugin chain is order-dependent — don't rearrange without testing
- Server config: `src/lib/auth/auth.ts` (never import on client)
- Client config: `src/lib/auth/auth-client.ts` (safe for browser)
- Session queries: `src/lib/auth/queries.ts` (React Query integration)
- Auth session is prefetched in `__root.tsx` and available via route context
- Use `authClient.$Infer.Session` for session type inference
- Cookie caching enabled (5 min) to reduce session lookups
- Email delivery uses Resend — configure in auth.ts email section
