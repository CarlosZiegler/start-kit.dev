# Codebase Structure

**Analysis Date:** 2026-02-21

## Directory Layout

```
apps/start-template/
├── src/
│   ├── routes/                      # File-based routing (TanStack Router)
│   │   ├── __root.tsx              # Root layout, global providers
│   │   ├── index.tsx               # Landing page
│   │   ├── (auth)/                 # Layout group: sign-in, sign-up, password reset
│   │   ├── (dashboard)/            # Protected layout group: chat, organizations, settings
│   │   ├── api/                    # Backend API routes
│   │   │   ├── rpc.$.ts           # oRPC gateway (main backend handler)
│   │   │   ├── auth/$.ts          # Better-Auth handler
│   │   │   ├── chat/              # Streaming AI chat endpoints
│   │   │   └── storage/$.ts       # File storage endpoints
│   │   ├── pricing.tsx, privacy.tsx, terms.tsx
│   │   └── routeTree.gen.ts        # Auto-generated (TanStack Router)
│   │
│   ├── features/                    # Feature modules (co-located logic)
│   │   ├── organizations/           # Org management (components, queries, mutations, types)
│   │   ├── settings/                # User settings (profile, security, billing, appearance)
│   │   ├── subscription/            # Stripe subscription UI
│   │   ├── payment/                 # Payment/checkout features
│   │   ├── landing/                 # Landing page components & data
│   │   └── command-search/          # Command palette / search UI
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # Base UI primitives (~57 shadcn/Base UI components)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── data-grid-enhanced.tsx  # Advanced table component
│   │   │   └── ...
│   │   ├── ai-elements/             # AI SDK UI components
│   │   ├── emails/                  # React Email templates
│   │   ├── guards/                  # Permission-based route guards
│   │   ├── error-boundary.tsx       # Global error handling
│   │   ├── not-found.tsx            # 404 page
│   │   ├── theme-provider.tsx       # Next Themes
│   │   └── __tests__/               # Component tests
│   │
│   ├── lib/                         # Core libraries & services
│   │   ├── auth/                    # Authentication & RBAC
│   │   │   ├── auth.ts             # Better-Auth configuration
│   │   │   ├── auth-client.ts      # Client-side auth SDK
│   │   │   ├── permissions.ts      # RBAC rules
│   │   │   ├── queries.ts          # Auth React Query options
│   │   │   ├── email-helpers.ts    # Email sending utilities
│   │   │   ├── email-config.ts     # Email template config
│   │   │   └── __tests__/          # Auth tests
│   │   │
│   │   ├── db/                      # Database layer (Drizzle + Postgres)
│   │   │   ├── index.ts            # Drizzle client initialization
│   │   │   ├── secure-client.ts    # RLS context helper (withRls)
│   │   │   ├── rls.ts              # RLS policy setup
│   │   │   ├── rls.test.ts         # RLS policy tests
│   │   │   ├── db.utils.ts         # Database utilities
│   │   │   ├── schema/             # Drizzle ORM schema definitions
│   │   │   │   ├── auth.ts         # User, session, account (Better-Auth)
│   │   │   │   ├── storage.ts      # File metadata
│   │   │   │   ├── index.ts        # Schema exports
│   │   │   │   └── ...
│   │   │   └── migrations/         # Drizzle migration files
│   │   │
│   │   ├── storage/                 # File storage service
│   │   │   └── s3.ts               # S3-compatible upload/download
│   │   │
│   │   ├── stripe/                  # Stripe payment integration
│   │   │   ├── plans.config.ts     # Stripe plan definitions
│   │   │   ├── plan.utils.ts       # Plan lookup utilities
│   │   │   └── stripe-client.ts    # Stripe SDK client
│   │   │
│   │   ├── payment/                 # Payment utilities
│   │   │   └── __tests__/          # Payment tests
│   │   │
│   │   ├── intl/                    # Internationalization
│   │   │   ├── i18n.ts             # i18next configuration
│   │   │   └── locales/            # Translation files
│   │   │
│   │   ├── validations/             # Zod validation schemas
│   │   │   ├── *.ts                # Form validation schemas
│   │   │   └── __tests__/          # Validation tests
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   └── app.config.ts       # App-level constants
│   │   │
│   │   ├── chat/                    # AI chat utilities
│   │   ├── env.server.ts            # Server env vars validation
│   │   ├── env.client.ts            # Client env vars validation
│   │   ├── date-utils.ts            # Date formatting
│   │   ├── device-utils.ts          # Device detection
│   │   ├── cookie-consent.ts        # Cookie consent
│   │   ├── flags.ts                 # Feature flags
│   │   ├── resend.ts                # Email provider
│   │   └── __tests__/               # Lib unit tests
│   │
│   ├── orpc/                        # Type-safe RPC layer
│   │   ├── orpc-server.ts          # Server config & middleware
│   │   ├── orpc-client.ts          # Client config & initialization
│   │   ├── index.ts                # Router composition
│   │   └── routes/                 # RPC procedure definitions
│   │       ├── profile.ts          # User profile queries/mutations
│   │       ├── organization.ts     # Organization management
│   │       ├── dashboard.ts        # Dashboard data
│   │       ├── storage.ts          # File operations
│   │       └── chat.ts             # AI chat
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-*.ts                # Hook definitions
│   │   └── __tests__/              # Hook tests
│   │
│   ├── utils/                       # Utility functions
│   │   ├── seo.ts                  # SEO helpers
│   │   └── *.ts                    # Other utilities
│   │
│   ├── providers/                   # React Context providers
│   │   ├── subscription-provider.tsx
│   │   └── ...
│   │
│   ├── app.css                      # Global styles & design tokens
│   ├── client.tsx                   # Client entry point
│   ├── server.ts                    # Server entry point
│   └── router.tsx                   # Router configuration
│
├── public/                          # Static assets
│   ├── images/
│   ├── favicon*
│   └── site.webmanifest
│
├── scripts/                         # Utility scripts
│   ├── start-docker.sh
│   ├── redis.sh
│   ├── upload-to-s3.ts
│   └── ...
│
├── .planning/                       # Planning & analysis docs
│   └── codebase/                   # Generated codebase docs
│
├── package.json                     # App dependencies
├── vite.config.ts                   # Vite build config
├── vitest.config.ts                 # Test config
├── drizzle.config.ts                # Drizzle ORM config
├── tailwind.config.ts               # Tailwind CSS v4 config
├── biome.json                       # Code formatter/linter
└── tsconfig.json                    # TypeScript config
```

## Directory Purposes

**routes/:**
- Purpose: File-based routing tree (TanStack Router auto-generates from file structure)
- Contains: Page components, layout groups, API routes
- Key files: `__root.tsx` (root layout), `(dashboard)/layout.tsx` (protected layout), `api/rpc.$.ts` (main RPC handler)
- Import: `src/routes/` → auto-compiled to `src/routeTree.gen.ts`

**features/:**
- Purpose: Domain-specific feature modules with co-located UI and logic
- Contains: Components, hooks, mutations, queries, types
- Pattern: Each folder is self-contained; imports from `src/lib/` and `src/components/`
- Example: `src/features/organizations/` has all org-related UI and API calls

**components/ui/:**
- Purpose: Reusable, unstyled UI primitives (shadcn/Base UI)
- Contains: ~57 components (Button, Card, Input, Dialog, etc.)
- Pattern: Named exports only; use CVA for variants
- Convention: Each file is one component with sub-components as named exports

**lib/auth/:**
- Purpose: Authentication and authorization
- Contains: Better-Auth config, session management, RBAC
- Key files: `auth.ts` (server config), `auth-client.ts` (client SDK), `permissions.ts` (role checks)
- Exports: `authClient` for client calls, `auth` for server, permission functions

**lib/db/:**
- Purpose: Database access and schema
- Contains: Drizzle ORM client, schema definitions, migrations, RLS helpers
- Key files: `secure-client.ts` (RLS wrapper), `rls.test.ts` (policy tests), `schema/` (table definitions)
- Critical: Always use `protectedRlsProcedure` for org/user-scoped data

**lib/storage/:**
- Purpose: File upload/download management
- Contains: S3 client, upload logic, URL generation
- Pattern: Abstracted S3 API; supports any S3-compatible provider

**orpc/routes/:**
- Purpose: Backend RPC procedure definitions
- Contains: Handlers for queries and mutations, input validation, business logic
- Key files: One file per domain (profile.ts, organization.ts, etc.)
- Pattern: Export sub-routers; compose in `src/orpc/index.ts`

## Key File Locations

**Entry Points:**
- `src/client.tsx`: Client hydration entry
- `src/server.ts`: Server request handler
- `src/router.tsx`: Router configuration & React Query setup
- `src/routes/__root.tsx`: Root layout, global providers

**Configuration:**
- `src/lib/auth/auth.ts`: Better-Auth config
- `src/lib/env.server.ts`: Server environment variables
- `src/lib/env.client.ts`: Client environment variables
- `src/lib/stripe/plans.config.ts`: Stripe plans
- `src/lib/intl/i18n.ts`: i18n configuration

**Core Logic:**
- `src/orpc/orpc-server.ts`: oRPC context, middleware
- `src/orpc/routes/`: Domain-specific procedures (profile, organization, etc.)
- `src/lib/db/schema/`: Drizzle table definitions
- `src/lib/auth/permissions.ts`: RBAC rules

**Testing:**
- `src/lib/__tests__/`: Utilities, helpers
- `src/lib/auth/__tests__/`: Permission tests
- `src/lib/db/rls.test.ts`: RLS policy tests
- `src/lib/payment/__tests__/`: Payment logic tests
- `src/lib/validations/__tests__/`: Schema validation tests
- `src/components/__tests__/`: Component tests

## Naming Conventions

**Files:**
- Route files: `index.tsx` or `[param].tsx`
- Feature files: `<feature>.<scope>.<type>.tsx` (e.g., `organizations.members-table.tsx`)
- UI primitives: `kebab-case.tsx` (e.g., `button.tsx`, `data-grid-enhanced.tsx`)
- Hooks: `use-<name>.ts` (e.g., `use-organization-permissions.ts`)
- Utilities: `<name>-utils.ts` or `<name>.ts`
- Tests: `*.test.ts` or `*.spec.ts`
- Factories/Query options: `<feature>.factory.queries.ts`, `<feature>.factory.mutations.ts`

**Directories:**
- Feature folders: PascalCase or lowercase plural (e.g., `organizations`, `settings`)
- Layout groups: Parenthesized (e.g., `(auth)`, `(dashboard)`)
- Sub-routes: Lowercase with hyphens (e.g., `/two-factor`, `/reset-password`)
- API routes: `api/<domain>/<endpoint>`

**Components:**
- Named exports: `export { Button }`
- Sub-components: `Button.Group`, `Button.Icon` (nested exports)
- Props type: `ButtonProps` (or `<Component>Props`)
- Styled wrapper: No separate styled files; styles inline with CVA

**Database:**
- Tables: `camelCase` in code, `snake_case` in SQL (Drizzle auto-converts)
- Columns: `camelCase` (e.g., `createdAt`, `updatedAt`, `userId`)
- Constraints: Foreign keys reference singular table name (e.g., `userId` → `user` table)

**API/oRPC:**
- Procedure names: `camelCase` (e.g., `profile.update`, `organization.listMembers`)
- Input schemas: Exported as `<Procedure>Input` (e.g., `ProfileUpdateInput`)
- Output schemas: Exported as `<Procedure>Output` (e.g., `ProfileUpdateOutput`)

## Where to Add New Code

**New Feature (Domain Module):**
- Primary code:
  - `src/features/<feature>/` — Create folder
  - `src/features/<feature>/<feature>.components.tsx` — Feature UI
  - `src/features/<feature>/<feature>.types.ts` — Types
  - `src/features/<feature>/<feature>.factory.queries.ts` — React Query options
  - `src/features/<feature>/<feature>.factory.mutations.ts` — Mutations
- Backend:
  - `src/orpc/routes/<feature>.ts` — oRPC procedures
  - `src/lib/db/schema/<feature>.ts` — Drizzle tables (if needed)
- Tests:
  - `src/features/<feature>/__tests__/` — Feature tests
  - `src/orpc/routes/<feature>.test.ts` — RPC tests (if complex logic)

**New Page/Route:**
- Location: `src/routes/<segment>/index.tsx` or `src/routes/<segment>/[param].tsx`
- Add to layout group if protected: `src/routes/(dashboard)/<segment>/index.tsx`
- If dynamic: `src/routes/(dashboard)/<segment>/$paramId.tsx`

**New UI Component:**
- If primitive (reusable): `src/components/ui/<name>.tsx`
- If feature-specific: `src/features/<feature>/<feature>.<scope>.tsx`
- Follow CVA pattern: Define variants, export component + variants

**New Utility/Helper:**
- Generic utilities: `src/utils/<name>.ts`
- Domain-specific: `src/lib/<domain>/<name>.ts`
- Format: Named exports, side-effect free

**New API/RPC Procedure:**
- Location: `src/orpc/routes/<domain>.ts`
- Add to appropriate router file or create new one
- Include Zod schema for input/output
- Use `protectedProcedure` or `protectedRlsProcedure` as needed

**New Database Table:**
- Location: `src/lib/db/schema/<domain>.ts` or expand existing schema file
- Use Drizzle `pgTable()` API
- Include timestamps: `createdAt`, `updatedAt`
- Add foreign keys and constraints
- Create migration: `bun run db:generate`

## Special Directories

**src/routes/api/:**
- Purpose: Backend API endpoints
- Generated: No (manually created)
- Committed: Yes
- Special files:
  - `rpc.$.ts` — Main oRPC gateway; all RPC calls route here
  - `auth/$.ts` — Better-Auth session handler
  - `chat/index.ts` — Streaming AI chat (Server-Sent Events)
  - `storage/$.ts` — File upload/download proxy

**src/lib/db/migrations/:**
- Purpose: Drizzle migration history
- Generated: Yes (`bun run db:generate` creates new migrations)
- Committed: Yes (track all schema changes)
- Manual: Do NOT edit migration files; modify `schema/` files instead

**src/.planning/codebase/:**
- Purpose: Generated codebase analysis documents
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**src/components/ui/:**
- Purpose: Reusable primitives
- Generated: Yes (some via `shadcn` CLI, but managed in codebase)
- Committed: Yes
- Pattern: Run `bun run add-ui-components` to add new shadcn components

**public/:**
- Purpose: Static assets served at `/`
- Generated: No
- Committed: Yes (except large binary assets)
- Examples: Images, favicons, manifests

## Import Patterns

**Path Aliases:**
```typescript
// CORRECT: Use @ alias for all imports from src/
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { db } from '@/lib/db'

// WRONG: Avoid relative imports
import { Button } from '../../../components/ui/button'
```

**Type Imports:**
```typescript
// CORRECT: Use import type for types only
import type { User } from '@/lib/auth/auth'
import { authClient } from '@/lib/auth/auth-client'

// WRONG: Mixed imports (splits compilation)
import { authClient, type Session } from '@/lib/auth/auth-client'
```

**Feature/Module Organization:**
```typescript
// From components/ui/:
import { Button, Card, CardContent } from '@/components/ui/card'

// From features/:
import { OrganizationForm } from '@/features/organizations/organizations.create-dialog'

// From lib/:
import { authClient } from '@/lib/auth/auth-client'
import { db } from '@/lib/db'
```

---

*Structure analysis: 2026-02-21*
