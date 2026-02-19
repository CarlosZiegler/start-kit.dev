# Architecture

**Analysis Date:** 2026-02-11

## Pattern Overview

**Overall:** Full-stack isomorphic React application with TanStack Start, using a client-server architecture with RPC-based API communication and tight integration between frontend components and backend logic.

**Key Characteristics:**
- Server-side rendering (SSR) with TanStack React Start framework
- RPC-based API layer (ORPC) for type-safe client-server communication
- Modular feature-based organization with co-located components, hooks, and data queries
- React Query for client-side data caching and synchronization
- Better Auth for authentication with multiple strategies (passkeys, email OTP, magic links, 2FA)
- Drizzle ORM for database layer with row-level security (RLS)
- Vite with Nitro for build and server runtime

## Layers

**Routing & Framework Layer:**
- Purpose: Manages application routing, SSR, and request/response handling
- Location: `src/routes`, `src/client.tsx`, `src/server.ts`, `src/router.tsx`
- Contains: TanStack React Router page components, layouts, API routes
- Depends on: TanStack React Start, Vite, Nitro
- Used by: Browser, server runtime

**API/RPC Layer:**
- Purpose: Handles client-server communication through type-safe RPC protocol
- Location: `src/orpc/orpc-client.ts`, `src/orpc/orpc-server.ts`, `src/orpc/index.ts`, `src/orpc/routes/`
- Contains: ORPC router definitions, route handlers, context setup
- Depends on: ORPC framework, Better Auth, Drizzle ORM
- Used by: Frontend components, API endpoints

**Authentication & Authorization:**
- Purpose: Manages user identity, sessions, organization roles, and permissions
- Location: `src/lib/auth/`, `src/lib/db/schema/auth.ts`
- Contains: Auth client setup, session management, permission roles, auth plugins
- Depends on: Better Auth framework, database layer
- Used by: ORPC context, protected routes, feature modules

**Data Access Layer:**
- Purpose: Manages database connections, queries, and row-level security
- Location: `src/lib/db/`
- Contains: Drizzle ORM setup, schema definitions, RLS policies, secure client
- Depends on: Drizzle ORM, Bun SQL driver
- Used by: ORPC route handlers, auth system

**Feature Modules:**
- Purpose: Self-contained business logic for application features
- Location: `src/features/[feature-name]/`
- Contains: Components, React Query factories, mutations, utilities, types
- Depends on: React, React Query, ORPC client, UI components
- Used by: Page routes, other feature modules

**Component Layer:**
- Purpose: Reusable UI components and component utilities
- Location: `src/components/`
- Contains: UI primitives (shadcn), business component wrappers, layout components, guards
- Depends on: React, Tailwind CSS, headless UI libraries
- Used by: Feature modules, page routes

**Utility & Library Layer:**
- Purpose: Cross-cutting concerns and shared utilities
- Location: `src/lib/` (config, validations, intl, storage, etc.), `src/utils/`
- Contains: Configuration, validation schemas (Zod), i18n setup, storage clients, helpers
- Depends on: External libraries (Zod, i18next, etc.)
- Used by: All layers above

## Data Flow

**Client-Side Query Pattern:**

1. Feature module (e.g., `organizations.list-table.tsx`) calls `authClient.useListOrganizations()`
2. Query hook uses React Query with options from factory (e.g., `organizationKeys`, `organizationListOptions`)
3. Query executes on component mount or when dependencies change
4. Data cached by React Query with configurable stale time (default 2 minutes)
5. Component re-renders with loading/error/success states
6. User interaction triggers mutation via factory (e.g., `useCreateOrganization`)

**Mutation & Cache Invalidation:**

1. Mutation function calls authClient or ORPC endpoint
2. On success, query cache is invalidated using query keys
3. Related queries are refetched automatically
4. Toast notifications show success/error states
5. UI updates reflect new data

**Server-Side Request Handling:**

1. Client RPC call sent to `/api/rpc` endpoint via `src/routes/api/rpc.$.ts`
2. RPCHandler processes request with CORS and error interceptors
3. ORPC context created with request headers for auth extraction
4. Router matches handler to appropriate route (profile, organization, dashboard, storage)
5. Route handler accesses database with authenticated user context
6. Response returned to client with session/auth info

**State Management:**

- React Query manages server state on client (queries, mutations, cache)
- React hooks manage local UI state (modals, forms, pagination)
- Better Auth manages session state with cookie-based storage
- No Redux/Vuex; query client acts as single source of truth for server data
- Form state managed by React Hook Form with Zod validation

## Key Abstractions

**Feature Module Pattern:**
- Purpose: Encapsulate business logic with components, queries, mutations, and types
- Examples: `src/features/organizations/`, `src/features/subscription/`, `src/features/settings/`
- Pattern: Each feature has:
  - `[feature].types.ts` - TypeScript type definitions
  - `[feature].factory.queries.ts` - React Query query options and keys
  - `[feature].factory.mutations.ts` - Mutation functions and options
  - `[feature].[component].tsx` - Feature-specific components
  - `use-[feature].ts` - Custom hooks for feature logic

**ORPC Router Pattern:**
- Purpose: Type-safe RPC routes between client and server
- Examples: `src/orpc/routes/organization.ts`, `src/orpc/routes/profile.ts`
- Pattern: Each route file exports a router with:
  - Zod schema validation for inputs
  - Async handler functions
  - Access to authenticated user context
  - Database queries via ORM

**Query Key Factory Pattern:**
- Purpose: Centralized, hierarchical cache key management
- Examples: `organizationKeys`, `profileKeys` in feature factories
- Pattern: Nested object with methods returning typed query key arrays
- Enables invalidating multiple queries by prefix

**Auth Client Plugins:**
- Purpose: Extend Better Auth with organization, passkeys, 2FA, stripe integration
- Examples: `organizationClient()`, `passkeyClient()`, `twoFactorClient()`
- Pattern: Plugins add methods to authClient for specific domains

## Entry Points

**Client Entry:**
- Location: `src/client.tsx`
- Triggers: Browser page load
- Responsibilities: Hydrate React app from server markup, enable interactivity

**Server Entry:**
- Location: `src/server.ts`
- Triggers: HTTP request to server
- Responsibilities: Route request through TanStack Start handler, execute route loaders

**Router Entry:**
- Location: `src/routes/__root.tsx`
- Triggers: Application start (client/server)
- Responsibilities: Create root route context, prefetch auth session, setup providers, define layout

**RPC Endpoint:**
- Location: `src/routes/api/rpc.$.ts`
- Triggers: POST/GET to `/api/rpc/*`
- Responsibilities: Handle RPC calls, create auth context, route to ORPC handlers

**Page Routes:**
- Location: `src/routes/(auth)/`, `src/routes/(dashboard)/`
- Triggers: Client navigation to route path
- Responsibilities: Render page components with loaders, authenticate access

## Error Handling

**Strategy:** Layered error handling from client to server with recovery mechanisms.

**Patterns:**

- **Client-side query errors:** Caught by React Query `onError`, displayed via toast notifications
- **Component boundaries:** Error boundaries catch React render errors, show fallback UI in `DefaultCatchBoundary`
- **Route-level 404s:** Caught by `defaultNotFoundComponent` in router config
- **RPC errors:** Intercepted in client setup with `onError` handler, logged to console
- **Server-side errors:** Caught by ORPC interceptor in `/api/rpc`, logged to console
- **Auth errors:** 401 status triggers redirect to `/sign-in` and clears auth session
- **Validation errors:** Zod schemas throw validation errors which propagate as mutation errors

**Recovery:**
- Retry toast action allows user to retry failed queries
- Route-level loaders redirect to sign-in on auth failure
- Query refetch on window focus allows recovery from temporary failures

## Cross-Cutting Concerns

**Logging:**
- Client: Console logging (development) for errors and RPC issues
- Server: Drizzle query logger (when enabled), ORPC error interceptor
- No structured logging; uses console methods

**Validation:**
- Zod schemas in `src/lib/validations/` for all user inputs
- Applied in mutation handlers and ORPC route handlers
- Frontend form validation via React Hook Form + Zod resolvers

**Authentication:**
- Better Auth session stored in secure HTTP-only cookie
- Server-side session cache reduces server-to-DB calls
- Client-side React Query cache reduces client-to-server calls
- Session prefetched on app root load via `authQueryOptions()`

**Internationalization:**
- i18next with SSR language detection in `src/lib/intl/i18n.ts`
- Language set via `setSSRLanguage()` in root loader
- Passed through context to all components

**Authorization:**
- Organization roles (owner, admin, member) enforced via Better Auth RBAC plugin
- User roles (user, admin) managed by auth system
- Permission checks in component UI (hide/disable buttons) and route guards
- Server-side RLS policies in database for data access control

**Type Safety:**
- Full TypeScript coverage with strict mode
- ORPC generates type-safe client from server router
- Zod schemas provide runtime validation and inferred types
- TanStack Router provides type-safe navigation and loaders

---

*Architecture analysis: 2026-02-11*
