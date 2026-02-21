# Architecture

**Analysis Date:** 2026-02-21

## Pattern Overview

**Overall:** Full-stack TypeScript application using a client-server architecture with type-safe RPC communication. TanStack Start (meta-framework built on Vite) provides file-based routing with SSR capabilities. Data flows through a centralized oRPC (Open RPC) router that bridges frontend queries/mutations to backend handlers.

**Key Characteristics:**
- Isomorphic client creation with server-side and client-side implementations
- React Query for client-side caching and async state management
- oRPC for type-safe, schema-validated RPC with middleware chain
- Postgres Row-Level Security (RLS) at database level for data isolation
- Modular feature-based organization with co-located logic
- Better-Auth for authentication with multi-provider support and role-based access control

## Layers

**Client Layer (React UI):**
- Location: `src/routes/`, `src/features/`, `src/components/`
- Purpose: Render UI, manage client state with React Query, trigger mutations/queries
- Contains: Route components, feature UI, reusable components
- Depends on: oRPC client, React Query, Jotai (atomic state), i18n
- Used by: End users via browser

**API Gateway / RPC Handler Layer:**
- Location: `src/routes/api/rpc.$.ts`
- Purpose: Accept HTTP RPC requests, route to appropriate handler, return responses
- Contains: Elysia HTTP server, oRPC RPCHandler middleware, CORS/error handling
- Depends on: oRPC server, Elysia framework
- Used by: Client layer RPC calls

**Business Logic / oRPC Router Layer:**
- Location: `src/orpc/routes/`, `src/orpc/orpc-server.ts`, `src/orpc/index.ts`
- Purpose: Define RPC procedures with input validation, access control, execution logic
- Contains: Router definitions, procedure handlers, middleware (auth, RLS, timing/error)
- Depends on: Database layer, auth service, storage service
- Used by: API gateway, client via type-safe oRPC client

**Authentication & Authorization Layer:**
- Location: `src/lib/auth/auth.ts`, `src/lib/auth/auth-client.ts`, `src/lib/auth/permissions.ts`
- Purpose: Session management, credential verification, role-based access control
- Contains: Better-Auth configuration, RBAC rules, passkey/2FA/magic-link plugins
- Depends on: Database (user/session/organization schema), Stripe (payment provider)
- Used by: oRPC context, protected procedures, UI guards

**Data Access Layer (Database):**
- Location: `src/lib/db/`, `src/lib/db/schema/`
- Purpose: ORM interface to PostgreSQL, schema definition, RLS policy application
- Contains: Drizzle ORM schema, migrations, RLS context helper (`withRls`)
- Depends on: PostgreSQL instance, Postgres RLS policies
- Used by: oRPC handlers, storage service

**Support Services:**
- **Storage:** `src/lib/storage/` — S3-compatible file uploads with metadata tracking
- **Stripe:** `src/lib/stripe/` — Payment processing, subscription management, plan definitions
- **i18n:** `src/lib/intl/` — Multi-language support with server-side language detection
- **Validations:** `src/lib/validations/` — Zod schemas for form/input validation

## Data Flow

**Standard Query (Read) Flow:**

1. **Client:** `useQuery(orpc.profile.get.queryOptions({ input }))`
2. **React Query:** Checks cache; if stale/missing, triggers fetch
3. **oRPC Client:** Serializes input, sends POST to `/api/rpc`
4. **API Gateway:** Routes to `RPCHandler.handle()`, extracts auth from cookies
5. **oRPC Server:** Deserializes, runs middleware chain:
   - `createORPCContext()` extracts session from headers
   - `protectedProcedure` middleware checks `session.user` exists
   - `protectedRlsProcedure` calls `withRls()` to set Postgres RLS context
6. **Handler:** Executes with validated input + context
7. **Database:** Postgres RLS policies filter rows based on `request.user_id` / `request.org_id`
8. **Return:** Handler returns typed response
9. **Client:** React Query caches, re-renders with new data

**Standard Mutation (Write) Flow:**

1. **Client:** `useMutation(orpc.profile.update.mutationOptions({ onSuccess: () => invalidate }))`
2. **Form:** User submits form with validation (React Hook Form + Zod)
3. **Mutation Handler:** Calls RPC procedure, catches errors
4. **API Gateway → oRPC Server:** Same as queries (middleware chain applies)
5. **Handler:** Validates input schema, updates database within `withRls()` transaction
6. **Cache Invalidation:** `onSuccess` callback calls `queryClient.invalidateQueries({ queryKey: ... })`
7. **Client:** React Query re-fetches data, UI updates

**Authentication Flow:**

1. **Initial Load:** `__root.tsx` calls `context.queryClient.prefetchQuery(authQueryOptions())`
2. **Auth Query:** Calls Better-Auth API (`/api/auth/getSession`), stores session in React Query
3. **Protected Routes:** `beforeLoad` checks session; redirects to `/sign-in` if null
4. **Sign-In:** User submits credentials to `authClient.signIn.email()` or `signIn.social()`
5. **Better-Auth Handler:** Validates, creates session, sets auth cookie (httpOnly)
6. **Route Guard:** 401 responses auto-redirect via router's `queryCache.onError` handler
7. **Logout:** `authClient.signOut()` clears session, invalidates auth query

**State Management:**

**Server State (oRPC + React Query):**
- All server data managed via React Query caching layer
- Queries prefetch on route navigation (TanStack Router `intent` preload strategy)
- Stale time: 2 minutes default; mutations invalidate specific keys
- Example: `useQuery(orpc.profile.get.queryOptions())` → cached for 2 min

**Client State (Jotai atoms + React Hook Form):**
- UI state (modals, tabs, filters) via Jotai atoms
- Form state via React Hook Form `useForm()` + `useFieldArray()` for arrays
- Global theme state via Next Themes provider

**Session State:**
- Stored in React Query: `authQueryOptions().queryKey`
- Available in all routes via `RootContext.session`
- Persisted server-side via Better-Auth session cookie

## Key Abstractions

**oRPC Router Abstraction:**
- Purpose: Type-safe RPC boundary between client and server
- Examples: `src/orpc/routes/profile.ts`, `src/orpc/routes/organization.ts`, `src/orpc/routes/chat.ts`
- Pattern: Each router exports a sub-router with `orpc.router({ procedure1, procedure2, ... })`
- Input/output validated via Zod schemas; errors caught by middleware

**RLS (Row-Level Security) Transaction:**
- Purpose: Automatically filter database queries by user/organization
- Examples: `src/lib/db/secure-client.ts`, `src/orpc/orpc-server.ts`
- Pattern: `context.rls(async (db) => { /* db queries auto-filtered */ })`
- Implementation: Sets Postgres session vars `request.user_id` and `request.org_id`

**Feature Module Pattern:**
- Purpose: Co-locate UI, logic, types, queries, mutations for a domain
- Examples: `src/features/organizations/`, `src/features/settings/`, `src/features/subscription/`
- Structure: Each feature folder contains:
  - Components: `*.tsx` (UI)
  - Types: `*.types.ts` (TypeScript types)
  - Queries: `*.factory.queries.ts` (React Query options)
  - Mutations: `*.factory.mutations.ts` (React Query mutations)
  - Utils: `*.utils.ts` (helpers)
  - Hooks: `use-*.ts` (custom React hooks)

**Procedure Middleware Chain:**
- Purpose: Progressively restrict access and provide context
- Pattern:
  ```
  publicProcedure → protectedProcedure → protectedRlsProcedure
  ```
- `publicProcedure`: No auth required
- `protectedProcedure`: Requires `session.user`; context includes `session`, `db`, `auth`
- `protectedRlsProcedure`: Additionally wraps queries in `withRls()` for Postgres RLS

**Component Variants with CVA:**
- Purpose: Style components with type-safe variant props
- Examples: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`
- Pattern: `cva()` defines base + variant styles; components merge with `cn()`
- Used by: All shadcn-based UI components

## Entry Points

**Client Entry:**
- Location: `src/client.tsx`
- Triggers: Vite hydration on page load
- Responsibilities: Hydrate React app from server-rendered HTML, attach event listeners

**Server Entry:**
- Location: `src/server.ts`
- Triggers: On HTTP request
- Responsibilities: Render React to HTML, handle SSR, return response

**Root Route (Layout):**
- Location: `src/routes/__root.tsx`
- Triggers: On any route load
- Responsibilities:
  - Prefetch session via `authQueryOptions()`
  - Setup i18n language
  - Provide `ThemeProvider`, `I18nextProvider`, `Toaster`
  - Define global `<head>`, `<link>` tags
  - Render route tree via `<RootOutlet />`

**RPC API Entry:**
- Location: `src/routes/api/rpc.$.ts`
- Triggers: On POST/GET to `/api/rpc/*`
- Responsibilities: Create Elysia app with oRPC handler, route requests, handle CORS

**Auth API Entry:**
- Location: `src/routes/api/auth/$.ts`
- Triggers: On request to `/api/auth/*`
- Responsibilities: Delegate to Better-Auth handler, manage sessions/tokens

**Protected Route Example:**
- Location: `src/routes/(dashboard)/overview/index.tsx`
- Pattern:
  ```tsx
  export const Route = createFileRoute('/(dashboard)/overview/')({
    beforeLoad: async ({ context }) => {
      const session = await context.queryClient.ensureQueryData(authQueryOptions())
      if (!session?.user) throw redirect({ to: '/sign-in' })
    }
  })
  ```

## Error Handling

**Strategy:** Multi-level error containment with graceful user messaging

**Patterns:**

**Validation Errors:**
- Zod schema validates input at oRPC procedure boundary
- `protectedProcedure` middleware catches and converts to `INPUT_VALIDATION_FAILED` error
- Client receives flattened errors: `{ fieldName: [message1, message2] }`
- Form displays field-level errors via `FieldError` component

**RPC/Network Errors:**
- Client-side fetch interceptor catches network errors
- `queryCache.onError` middleware detects 401s, clears session, redirects to `/sign-in`
- Other errors surface as toast notifications: `toast.error(error.message)`

**Async Errors in Mutations:**
- Mutation handler catches errors in `onError` callback
- Throws to React Query, which displays via toast
- Example: `onError: (e) => toast.error(e.message)`

**Unhandled Errors:**
- Global error boundary at root route: `DefaultCatchBoundary`
- Location: `src/components/error-boundary.tsx`
- Displays error message, stack trace (dev only), retry/back buttons
- User can copy error details for bug reports

**Database/RLS Errors:**
- Postgres RLS policy violations raise `permission denied` errors
- Caught by oRPC error middleware, converted to `FORBIDDEN` or `UNAUTHORIZED`
- Client receives typed error; UI displays appropriate message

## Cross-Cutting Concerns

**Logging:**
- Server: Pino logger configured in `src/lib/auth/auth.ts`, logs Stripe webhooks, RPC timing (dev only)
- Client: Console errors logged to Sentry (integration available but not configured)
- Pattern: Use `console.info()` for timing (dev), `toast.error()` for user-facing errors

**Validation:**
- Input: Zod schemas at oRPC procedure level and form level (React Hook Form)
- Output: oRPC validates response against handler's return type (type-safe)
- Pattern: Define once in `src/lib/validations/`, reuse in procedures and forms

**Authentication:**
- Session checked at:
  1. Route level: `beforeLoad` redirects if no session
  2. Procedure level: `protectedProcedure` throws `UNAUTHORIZED` if no `session.user`
  3. Database level: RLS policies filter rows by `request.user_id`
- Roles checked via `@/lib/auth/permissions` utilities (e.g., `isOwner(user, org)`)

**File Storage:**
- S3-compatible uploads via `src/lib/storage/`
- File metadata (userId, purpose, fileName) tracked in Drizzle schema
- Presigned URLs generated for secure access
- Example: Avatar upload in `src/orpc/routes/profile.ts` deletes old file, uploads new one

**Internationalization:**
- Server detects language from headers in `setSSRLanguage()`
- Client-side i18next initialized with fallback locale
- All user-facing strings wrapped in `t()` function
- Translations in `src/lib/intl/locales/`

**Theme Management:**
- Next Themes provider in root layout
- CSS custom properties (OKLCH) in `src/app.css`
- Dark/light mode toggled via `.dark` class on `<html>`
- Token-based styling (no hardcoded colors)

---

*Architecture analysis: 2026-02-21*
