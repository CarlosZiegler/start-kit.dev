# Codebase Structure

**Analysis Date:** 2026-02-11

## Directory Layout

```
start-template/
├── src/                          # Application source code
│   ├── routes/                   # TanStack React Router file-based routes
│   ├── features/                 # Feature-based modules (organizations, settings, etc)
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Shared libraries and utilities
│   ├── hooks/                    # Custom React hooks
│   ├── orpc/                     # RPC route definitions and client setup
│   ├── providers/                # React context providers
│   ├── utils/                    # Helper utilities
│   ├── client.tsx                # Client entry point
│   ├── server.ts                 # Server entry point
│   ├── router.tsx                # Router configuration
│   └── app.css                   # Global styles
├── public/                       # Static assets
├── docs/                         # Documentation
├── scripts/                      # Utility scripts (database, storage, etc)
├── .planning/                    # GSD planning documents
├── vite.config.ts                # Vite build configuration
├── vite.bun.config.ts            # Bun build configuration
├── vitest.config.ts              # Vitest test configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── drizzle.config.ts             # Drizzle ORM configuration
```

## Directory Purposes

**src/routes/**
- Purpose: File-based routing using TanStack React Router (file name = URL path)
- Contains: Page components, nested layouts, API handlers
- Key files: `__root.tsx` (root layout), `(auth)/`, `(dashboard)/`, `api/`
- Pattern: Folders in parentheses denote layout groups; `$` suffix creates catch-all routes

**src/routes/(auth)/**
- Purpose: Authentication flow pages (sign-in, sign-up, password reset, etc)
- Contains: Auth form components, magic link handling, two-factor setup
- Key files: `sign-in.tsx`, `sign-up.tsx`, `layout.tsx` (auth layout wrapper)

**src/routes/(dashboard)/**
- Purpose: Protected dashboard pages (organizations, settings, lab features)
- Contains: Dashboard layout, organization pages, settings sections, lab experiments
- Key files: `layout.tsx` (main dashboard layout), `organizations/`, `settings/`, `lab/`

**src/routes/api/**
- Purpose: Server API endpoints (RPC, auth callbacks, file storage, etc)
- Contains: Backend HTTP handlers
- Key files: `rpc.$.ts` (main RPC endpoint), `auth/$.ts` (auth callbacks), `storage/$.ts` (file uploads)

**src/features/**
- Purpose: Feature-specific business logic, components, and data queries
- Contains: Self-contained feature modules with components, queries, mutations, types
- Key subdirectories:
  - `organizations/` - Organization management (CRUD, members, invitations, roles)
  - `settings/` - User settings (profile, security, 2FA, sessions, appearance)
  - `subscription/` - Subscription and billing (plans, payment, stripe integration)
  - `payment/` - Payment processing (Stripe integration)
  - `landing/` - Marketing landing page components
  - `lab/` - Experimental features (chat, block generator, MCP apps)
  - `command-search/` - Command palette/search interface

**src/components/**
- Purpose: Reusable UI components and component utilities
- Contains: Shadcn components, custom component wrappers, guards, layouts
- Key subdirectories:
  - `ui/` - Shadcn-based primitive components (button, dialog, input, etc)
  - `ai-elements/` - AI-specific UI components
  - `emails/` - React Email templates for transactional emails
  - `guards/` - Route protection components (auth guards, org guards)
  - `__tests__/` - Component test files

**src/lib/**
- Purpose: Shared libraries, utilities, and cross-cutting concerns
- Contains: Configuration, database, auth, validation, storage, etc
- Key subdirectories:
  - `auth/` - Better Auth setup, session queries, permissions, auth client
  - `db/` - Drizzle ORM, database schema, RLS policies, secure client
  - `config/` - Application configuration (app.config.ts with app name, URLs, etc)
  - `validations/` - Zod validation schemas for auth, settings, subscription
  - `intl/` - i18next internationalization setup
  - `payment/` - Payment utilities
  - `storage/` - S3 and storage client setup
  - `stripe/` - Stripe integration utilities
  - `ai/` - AI/LLM utilities
  - `chat/` - Chat message handling
  - `tanstack-ai/` - TanStack AI integration

**src/lib/db/schema/**
- Purpose: Database schema definitions using Drizzle ORM
- Contains: Tables for auth, users, organizations, storage, embeddings
- Key files:
  - `auth.ts` - Better Auth generated schema (users, sessions, accounts)
  - `resources.ts` - Application-specific tables (organizations, members, invitations)
  - `storage.ts` - File storage metadata
  - `embeddings.ts` - Vector embeddings for AI features
  - `index.ts` - Exports all schemas

**src/orpc/**
- Purpose: RPC router and client setup for type-safe client-server communication
- Contains: ORPC server/client initialization, route handlers
- Key files:
  - `orpc-server.ts` - ORPC middleware, context creation, middleware chain
  - `orpc-client.ts` - Isomorphic client (server-side router, client-side RPC link)
  - `index.ts` - Main router composition
  - `routes/organization.ts` - Organization endpoints (list, create, update, delete members, invitations)
  - `routes/profile.ts` - Profile endpoints (get, update)
  - `routes/dashboard.ts` - Dashboard data endpoints
  - `routes/storage.ts` - Storage/file handling endpoints

**src/providers/**
- Purpose: React context providers for global state
- Contains: Subscription provider, cookie consent provider
- Key files: `subscription-provider.tsx`

**src/hooks/**
- Purpose: Custom React hooks for reusable logic
- Contains: Hooks for mobile detection, clipboard, dialogs, search
- Key files:
  - `use-mobile.ts` - Detect mobile viewport
  - `use-copy-to-clipboard.ts` - Copy to clipboard with toast feedback
  - `use-confirmation-dialog.ts` - Reusable confirmation dialog logic
  - `use-debounced-search-param.ts` - Debounced URL param updates

**src/utils/**
- Purpose: Utility functions and helpers
- Contains: SEO utilities, logging, date formatting, scripts
- Key files:
  - `seo.ts` - SEO metadata (title, description, open graph)
  - `log.ts` - Logging utilities
  - `scripts.ts` - Script injection utilities

## Key File Locations

**Entry Points:**
- `src/client.tsx` - Browser hydration entry point (imports StartClient)
- `src/server.ts` - Server entry point (exports ServerEntry)
- `src/router.tsx` - Router initialization with QueryClient and context
- `src/routes/__root.tsx` - Root layout, providers setup, context creation

**Configuration:**
- `src/lib/config/app.config.ts` - Application settings (name, URLs, etc)
- `src/lib/env.server.ts` - Server-side environment variables
- `src/lib/env.client.ts` - Client-side environment variables
- `vite.config.ts` - Build configuration (plugins, SSR setup)
- `tsconfig.json` - TypeScript compiler options

**Core Logic:**
- `src/lib/auth/auth-client.ts` - Better Auth client setup with plugins
- `src/lib/auth/auth.ts` - Better Auth server configuration (plugins, database)
- `src/lib/auth/permissions.ts` - RBAC permission definitions
- `src/lib/db/index.ts` - Drizzle ORM initialization
- `src/orpc/orpc-server.ts` - ORPC context and middleware

**Testing:**
- `vitest.config.ts` - Vitest configuration
- `src/lib/__tests__/` - Unit tests for shared libraries
- `src/lib/db/rls.test.ts` - RLS policy validation tests
- `src/lib/validations/__tests__/` - Validation schema tests
- `src/components/__tests__/` - Component tests

## Naming Conventions

**Files:**
- `[feature].types.ts` - Type definitions for a feature (e.g., `organizations.types.ts`)
- `[feature].factory.queries.ts` - React Query query options and key factories
- `[feature].factory.mutations.ts` - Mutation functions and options
- `[feature].[component].tsx` - Feature-specific React components
- `use-[name].ts` - Custom React hooks
- `[name].config.ts` - Configuration files
- `[name].utils.ts` - Utility/helper functions

**Directories:**
- kebab-case for directory names: `src/features/[feature-name]/`
- Parentheses for layout groups: `src/routes/(auth)/`, `src/routes/(dashboard)/`
- Dollar sign suffix for catch-all routes: `api/rpc.$.ts`

**TypeScript/Variables:**
- camelCase for functions, variables, and object properties
- PascalCase for React components and type names
- UPPER_SNAKE_CASE for constants and environment variables

## Where to Add New Code

**New Feature:**
- Create `src/features/[feature-name]/` directory
- Add `[feature].types.ts` with type definitions
- Add `[feature].factory.queries.ts` with React Query factories
- Add `[feature].factory.mutations.ts` with mutation functions
- Add `[feature].[component].tsx` for feature components
- Create ORPC route in `src/orpc/routes/[feature].ts`
- Create page route in `src/routes/(dashboard)/[feature]/index.tsx` if needed
- Add validation schemas in `src/lib/validations/[feature].ts`

**New Component/Module:**
- Reusable UI: `src/components/ui/[component].tsx`
- Reusable business logic: `src/components/[component].tsx`
- Feature-specific: `src/features/[feature]/[component].tsx`
- Layout/guard: `src/components/guards/[guard].tsx`

**Utilities:**
- Shared helpers: `src/lib/[domain]/[utility].ts`
- Feature helpers: `src/features/[feature]/[utility].ts`
- General utilities: `src/utils/[utility].ts`

**Database:**
- New tables: Add to `src/lib/db/schema/[domain].ts`
- If new domain: Create `src/lib/db/schema/[domain].ts` and export from `schema/index.ts`
- RLS policies: Add to `src/lib/db/rls.ts`

**API Endpoints:**
- RPC routes: `src/orpc/routes/[domain].ts`
- Special endpoints: `src/routes/api/[path]/index.ts` or `$.ts`

## Special Directories

**src/.output/**
- Purpose: Nitro build output directory
- Generated: Yes
- Committed: No
- Contains: Server chunks, compiled assets, node_modules bundling

**src/routes/routeTree.gen.ts**
- Purpose: Auto-generated file route tree from TanStack Router
- Generated: Yes (via `tsc` or build)
- Committed: No
- Usage: Imported by router.tsx to construct route hierarchy

**public/**
- Purpose: Static assets served by CDN/web server
- Contains: Images, favicons, robots.txt
- Key: `public/images/landing/` for marketing images

**docs/plans/**
- Purpose: GSD-generated implementation plans
- Generated: Yes (via `/gsd:plan-phase`)
- Committed: No

---

*Structure analysis: 2026-02-11*
