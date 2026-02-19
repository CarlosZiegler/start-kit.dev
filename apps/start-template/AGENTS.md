# Start Kit — Agent Instructions

## Critical Context

- This is **TanStack Start** (NOT Next.js). No Next.js APIs.
- Runtime: **Bun**. Use `bun` for all commands.
- React 19 — `ref` as prop, no `React.forwardRef`.
- UI primitives: **@base-ui/react** (not Radix UI).
- Styling: **Tailwind CSS v4** — CSS-first config, tokens in `src/app.css`.
- Package manager: **Bun** in a **Turborepo** monorepo.

## Commands

```
bun run dev          # Dev server (port 3000)
bun run build        # Production build
bun x ultracite fix  # Format & lint fix
bun x ultracite check # Lint check
bun run tsc --noEmit # Type check
bun run test         # Run tests (Vitest)
bun run db:push      # Push schema to DB
bun run db:generate  # Generate migrations
bun run db:studio    # Open Drizzle Studio
```

## Architecture

### Data Flow

```
UI (React) → React Query → oRPC Client → /api/rpc (Elysia) → oRPC Server → Drizzle ORM → PostgreSQL
```

### Source Layout

```
src/
├── routes/          # TanStack Router file-based routes
│   ├── (auth)/     # Auth layout group
│   ├── (dashboard)/ # Protected dashboard group
│   └── api/        # API routes (rpc, auth, storage, chat)
├── features/       # Feature modules (components + logic co-located)
├── components/
│   ├── ui/         # ~57 shadcn/Base UI primitives
│   ├── ai-elements/ # AI chat components
│   └── emails/     # React Email templates
├── lib/
│   ├── auth/       # Better-Auth config, client, RBAC permissions
│   ├── db/         # Drizzle schema, RLS policies
│   ├── storage/    # S3-compatible file storage
│   └── stripe/     # Stripe config
├── orpc/           # oRPC client/server, routes (profile, org, dashboard, storage)
├── hooks/          # Custom React hooks
├── utils/          # Utilities
└── app.css         # Tailwind design tokens (OKLCH CSS custom properties)
```

### Import Alias

`@/*` maps to `./src/*`. Always use this. No deep relative imports.

## oRPC Patterns

Server routes in `src/orpc/routes/`. Client in `src/orpc/orpc-client.ts`.

```tsx
// Query
useQuery(orpc.profile.get.queryOptions({ input: { id } }))

// Mutation
useMutation(orpc.profile.update.mutationOptions({
  onSuccess: () => { refetchSession(); toast.success(t("SAVED")) },
  onError: (e: Error) => toast.error(e.message),
}))

// Invalidation
queryClient.invalidateQueries({ queryKey: orpc.profile.get.queryKey() })
```

Middleware chain: `publicProcedure → protectedProcedure → protectedRlsProcedure`

Use `protectedRlsProcedure` for data requiring org/user scoping (sets `request.user_id` / `request.org_id` for Postgres RLS).

## Authentication (Better-Auth)

- Server: `src/lib/auth/auth.ts`
- Client: `src/lib/auth/auth-client.ts`
- Session: `useQuery(authQueryOptions())` — prefetched in root `beforeLoad`
- Roles: `user`, `admin`, `owner`, `super_admin`
- Auth mutations: throw on `result.error`

## Database (Drizzle + PostgreSQL)

- Schema: `src/lib/db/schema/`
- Driver: `drizzle-orm/bun-sql`
- Row-Level Security enforced via `withRls()` middleware

## Forms

React Hook Form + Zod + `Controller` pattern:

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

## Component Conventions

### Naming

- Files: `kebab-case.tsx`
- Feature files: `<feature>.<scope>.<type>.tsx`
- Exports: PascalCase named exports. No default exports.
- Sub-components: `ComponentSubpart` (CardHeader, CardTitle)

### Pattern

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const variants = cva("base", { variants: { ... }, defaultVariants: { ... } });

function Component({ className, variant, ...props }: Props & VariantProps<typeof variants>) {
  return <div className={cn(variants({ variant, className }))} data-slot="component" {...props} />;
}

export { Component, variants };
```

### Rules

- IMPORTANT: `data-slot="name"` on every component root
- Merge classes with `cn()` (clsx + tailwind-merge)
- CVA for variants
- Reuse `@/components/ui/` (~57 primitives) before creating new ones
- Client components: `"use client"` directive

## Styling

### Tokens (src/app.css)

Never hardcode colors. Use token utilities:

| Category | Usage |
|----------|-------|
| Brand | `bg-primary`, `text-primary-foreground` |
| Secondary | `bg-secondary`, `text-secondary-foreground` |
| Muted | `bg-muted`, `text-muted-foreground` |
| Accent | `bg-accent`, `text-accent-foreground` |
| Destructive | `bg-destructive` |
| Border | `border-border`, `ring-ring` |
| Background | `bg-background`, `bg-card`, `bg-popover` |
| Sidebar | `bg-sidebar`, `text-sidebar-foreground` |
| Charts | `fill-chart-1` through `fill-chart-5` |

Radius: `radius-sm` through `radius-2xl` (base: 0.625rem).
Font: `font-sans` (Inter Variable).
Dark mode: class-based via `next-themes`. Tokens auto-switch.

## Error Handling

- Surface errors via `toast` (sonner) or field errors. No `console`.
- oRPC: `isDefinedError()` for type-safe error handling
- Auth: throw on `result.error`
- 401: auto-redirect to `/sign-in`

## Code Quality

Ultracite (Biome) enforces: no `any`, no `var`, no `console`, no default exports, semantic HTML, ARIA accessibility, `import type` for types, `===`/`!==`, no array indices as keys. Run `bun x ultracite fix` before committing.

## i18n

`i18next` + `react-i18next`. Use `t()` for all user-facing strings.

## Icons

Primary: `lucide-react`. Secondary: `@tabler/icons-react`, `@remixicon/react`. Do NOT install new icon packages.

## Figma MCP Flow

1. `get_design_context` for target nodes
2. `get_screenshot` for visual reference
3. Implement with project tokens and existing components
4. Add `data-slot` attributes, use CVA for variants
5. Validate against screenshot

Asset handling: use localhost sources directly, store in `public/`.

## Key Libraries

| Library | Purpose |
|---------|---------|
| `@tanstack/react-start` | Full-stack framework |
| `@tanstack/react-router` | File-based routing |
| `@tanstack/react-query` | Async state |
| `@base-ui/react` | UI primitives |
| `@orpc/*` | Type-safe RPC |
| `better-auth` | Authentication |
| `drizzle-orm` | Database ORM |
| `zod` | Validation |
| `react-hook-form` | Forms |
| `stripe` | Payments |
| `sonner` | Toasts |
| `jotai` | Global state |
| `motion` | Animations |
| `recharts` | Charts |
