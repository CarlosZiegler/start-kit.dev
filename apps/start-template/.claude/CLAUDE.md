# Start Kit — Claude Code Rules

## Framework Stack

- IMPORTANT: This is **TanStack Start** (NOT Next.js). No Next.js APIs, no `<Image>`, no `next/head`, no `getServerSideProps`.
- Runtime: **Bun** (not Node). Use `bun` for all scripts, not `npm`/`yarn`/`npx`.
- React 19 with function components. Use `ref` as prop (no `React.forwardRef`).
- Monorepo: **Turborepo** with Bun workspaces.

## Commands

| Task | Command |
|------|---------|
| Dev server | `bun run dev` (port 3000) |
| Build | `bun run build` |
| Lint & format | `bun x ultracite fix` |
| Check lint | `bun x ultracite check` |
| Type check | `bun run tsc --noEmit` |
| Tests | `bun run test` |
| DB push | `bun run db:push` |
| DB generate | `bun run db:generate` |
| DB studio | `bun run db:studio` |

## Source Structure

```
src/
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout (ThemeProvider, i18n, toasts)
│   ├── (auth)/          # Auth layout group (no URL segment)
│   ├── (dashboard)/     # Protected dashboard layout group
│   └── api/             # Backend API routes
├── features/            # Feature modules (co-located logic)
│   ├── organizations/   # Components, hooks, mutations, queries, types
│   ├── settings/        # Profile, security, appearance sections
│   ├── subscription/    # Stripe subscription UI
│   ├── payment/         # Stripe checkout
│   ├── landing/         # Landing page components
│   └── command-search/  # Command palette
├── components/
│   ├── ui/              # ~57 shadcn/Base UI primitives (Button, Card, Input...)
│   ├── ai-elements/     # AI chat components (Message, CodeBlock, Canvas...)
│   ├── emails/          # React Email templates
│   └── guards/          # Permission-based guards
├── lib/
│   ├── auth/            # Better-Auth config, client, permissions (RBAC)
│   ├── db/              # Drizzle ORM schema, RLS policies
│   ├── storage/         # S3-compatible file storage
│   ├── stripe/          # Stripe config, plans
│   ├── intl/            # i18n setup
│   └── config/          # App config
├── orpc/                # oRPC client + server (type-safe RPC)
│   └── routes/          # profile, organization, dashboard, storage
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── app.css              # Global styles + Tailwind design tokens
├── router.tsx           # TanStack Router config
├── client.tsx           # Client entry
└── server.ts            # Server entry
```

## Data Flow Architecture

```
UI (React) → React Query → oRPC Client → /api/rpc (Elysia) → oRPC Server → Drizzle ORM → PostgreSQL
```

### oRPC Patterns

- Server routes: `src/orpc/routes/` — each file exports a sub-router
- Client: `src/orpc/orpc-client.ts` — `createTanstackQueryUtils(client)`
- Middleware chain: `publicProcedure → protectedProcedure (requireAuth) → protectedRlsProcedure (withRls)`
- Validation: Zod schemas for all inputs/outputs

```tsx
// Query
const { data } = useQuery(orpc.profile.get.queryOptions({ input: { id } }))

// Mutation
const mutation = useMutation(orpc.profile.update.mutationOptions({
  onSuccess: () => { refetchSession(); toast.success(t("SAVED")) },
  onError: (e: Error) => toast.error(e.message),
}))

// Invalidation
queryClient.invalidateQueries({ queryKey: orpc.profile.get.queryKey() })
```

### Authentication (Better-Auth)

- Server: `src/lib/auth/auth.ts` — Better-Auth config with plugins (org, 2FA, passkeys, stripe, admin)
- Client: `src/lib/auth/auth-client.ts` — `authClient` for client-side calls
- Session: prefetched in `__root.tsx` `beforeLoad`, available via `useQuery(authQueryOptions())`
- Roles: `user`, `admin`, `owner`, `super_admin` — checked via `@/lib/auth/permissions`
- Auth mutations: throw on `result.error` so React Query catches failures

```tsx
const result = await authClient.signIn.social({ provider, callbackURL })
if (result.error) throw new Error(result.error.message || "Auth failed")
```

### Database (Drizzle + PostgreSQL)

- Schema: `src/lib/db/schema/` — auth.ts, storage.ts, organization.ts, user.ts
- Client: `drizzle-orm/bun-sql` (Bun native SQL)
- RLS: Postgres Row-Level Security via `withRls()` middleware — sets `request.user_id` and `request.org_id`
- IMPORTANT: Always use `protectedRlsProcedure` for data queries that need org/user scoping

### Forms

- React Hook Form + Zod + `@hookform/resolvers/zod`
- Field components: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend`, `FieldGroup`
- Always use `Controller` from react-hook-form with `data-invalid` and `aria-invalid`

### Routing

- File-based routing in `src/routes/`
- Layout groups: `(auth)`, `(dashboard)` — parenthesized, no URL segment
- Navigation: `useNavigate()` from `@tanstack/react-router`
- Protected routes: `beforeLoad` checks session and redirects to `/sign-in`
- Router preloads on hover (`intent` strategy)

## Component Conventions

### File Naming

- UI primitives: `kebab-case.tsx` (e.g., `button.tsx`, `data-grid-enhanced.tsx`)
- Feature files: `<feature>.<scope>.<type>.tsx` (e.g., `settings.page.section.profile.tsx`)
- Named exports only (PascalCase). No default exports.
- Sub-components: `ComponentSubpart` (e.g., `CardHeader`, `CardTitle`)

### Component Pattern

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, ...props }: Props & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size, className }))} data-slot="button" {...props} />;
}

export { Button, buttonVariants };
```

### Key Rules

- IMPORTANT: Always add `data-slot="name"` to every component root element
- Always merge classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Use CVA for variant-based styling
- Props: `React.ComponentProps<"element">` for native, `Primitive.Props` for Base UI
- `className` first in destructuring, spread `...props` last
- IMPORTANT: Reuse `@/components/ui/` primitives before creating new ones (~57 available)
- Client components: add `"use client"` directive at top

### Import Alias

Always use `@/*` → `./src/*`. No deep relative imports.

## Styling

### Tailwind CSS v4

- CSS-first config — all tokens in `src/app.css`, NOT in `tailwind.config`
- IMPORTANT: Never hardcode colors. Use token-based utilities: `bg-primary`, `text-muted-foreground`, `border-border`
- Color format: OKLCH custom properties

### Design Tokens (src/app.css)

| Category | Tokens | Usage |
|----------|--------|-------|
| Background | `background`, `card`, `popover` | `bg-background`, `bg-card` |
| Foreground | `foreground`, `card-foreground`, `popover-foreground` | `text-foreground` |
| Brand | `primary`, `primary-foreground` | `bg-primary`, `text-primary-foreground` |
| Secondary | `secondary`, `secondary-foreground` | `bg-secondary` |
| Muted | `muted`, `muted-foreground` | `bg-muted`, `text-muted-foreground` |
| Accent | `accent`, `accent-foreground` | `bg-accent` |
| Destructive | `destructive`, `destructive-foreground` | `bg-destructive` |
| Border/Input | `border`, `input`, `ring` | `border-border`, `ring-ring` |
| Charts | `chart-1` through `chart-5` | `fill-chart-1` |
| Sidebar | `sidebar`, `sidebar-*` | `bg-sidebar` |

### Radius Scale

Base: `--radius: 0.625rem`. Derived: `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-2xl`.

### Typography

Font: `Inter Variable` via `@fontsource-variable/inter`. Use `font-sans`.

### Dark Mode

Class-based via `next-themes` (`.dark` on `<html>`). Tokens auto-switch. No manual dark mode logic needed.

### Animations

Use `framer-motion` / `motion` library, or `tw-animate-css`. Not CSS keyframes.

## Figma MCP Integration

### Required Flow

1. `get_design_context` — fetch structured representation for target node(s)
2. If truncated — `get_metadata` for high-level map, then re-fetch specific nodes
3. `get_screenshot` — visual reference
4. Download needed assets
5. Implement using project conventions (tokens, existing components, `data-slot`)
6. Validate against screenshot for 1:1 fidelity

### Asset Handling

- IMPORTANT: Use localhost sources from Figma MCP directly
- IMPORTANT: DO NOT install new icon packages. Use: `lucide-react`, `@tabler/icons-react`, `@remixicon/react`
- Store downloaded assets in `public/`

### Registries

- `@shadcn` — default shadcn/ui
- `@ai-elements` — AI SDK UI (`registry.ai-sdk.dev`)
- `@kibo-ui` — Kibo UI (`kibo-ui.com`)
- `@reui` — ReUI (`reui.io`)

## Code Quality (Ultracite / Biome)

Run `bun x ultracite fix` before committing. Key enforced rules:

- No `console`, `debugger`, `alert` in production
- No `any` type — use `unknown` if needed
- No `var` — use `const`/`let`
- No default exports — named exports only
- Use `for...of` over `.forEach()`
- Use `import type` / `export type` for types
- Semantic HTML and ARIA for accessibility
- `===` / `!==` only
- React 19: `ref` as prop, no `forwardRef`
- No array indices as keys

## Error Handling

- oRPC errors: middleware catches and transforms. Zod validation → BAD_REQUEST (422). Use `isDefinedError()` for type-safe errors.
- Auth errors: throw on `result.error` so React Query handles failures
- UI errors: surface via `toast` (sonner) or field-level errors. No `console`.
- 401 responses: auto-redirect to `/sign-in` via query client error handler

## i18n

- `i18next` + `react-i18next`
- Use `t()` for all user-facing strings
- Server-side language detection in root layout

## Storage

- S3-compatible (AWS S3, R2, SeaweedFS, DigitalOcean Spaces)
- Upload via oRPC: `orpc.storage.upload`
- File metadata tracked in Drizzle DB
- Presigned URLs via storage service at `src/lib/storage/`

## Key Libraries

| Library | Usage |
|---------|-------|
| `@tanstack/react-start` | Full-stack framework |
| `@tanstack/react-router` | File-based routing |
| `@tanstack/react-query` | Async state management |
| `@tanstack/ai` | AI integration |
| `@base-ui/react` | Accessible UI primitives |
| `@orpc/*` | Type-safe RPC |
| `better-auth` | Authentication |
| `drizzle-orm` | Database ORM |
| `zod` | Schema validation |
| `react-hook-form` | Form state |
| `stripe` | Payments |
| `sonner` | Toast notifications |
| `jotai` | Atomic global state |
| `next-themes` | Theme management |
| `framer-motion` / `motion` | Animations |
| `lucide-react` | Primary icons |
| `recharts` | Charts |
