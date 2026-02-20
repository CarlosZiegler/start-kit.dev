# Start Kit — Agent Instructions

## Stack

- **TanStack Start** (NOT Next.js) — no Next.js APIs
- **Bun** runtime — use `bun` for all commands
- **React 19** — `ref` as prop, no `React.forwardRef`
- **@base-ui/react** — UI primitives (not Radix UI)
- **Tailwind CSS v4** — CSS-first config, tokens in `src/app.css`
- **Turborepo** monorepo with Bun workspaces

## Commands

```
bun run dev              # Dev server (port 3000)
bun run build            # Production build
bun x ultracite fix      # Format & lint fix
bun x ultracite check    # Lint check
bun run tsc --noEmit     # Type check
bun run test             # Run tests (Vitest)
bun run db:push          # Push schema to DB
bun run db:generate      # Generate migrations
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
├── orpc/           # oRPC client/server + routes
├── hooks/          # Custom React hooks
├── utils/          # Utilities
└── app.css         # Tailwind design tokens (OKLCH)
```

## Key Constraints

- IMPORTANT: `data-slot="name"` on every component root element
- IMPORTANT: Never hardcode colors — use token utilities (`bg-primary`, `text-muted-foreground`)
- IMPORTANT: Use `protectedRlsProcedure` for data queries needing org/user scoping
- IMPORTANT: Reuse `@/components/ui/` primitives (~57 available) before creating new ones
- IMPORTANT: DO NOT install new icon packages. Use: `lucide-react`, `@tabler/icons-react`, `@remixicon/react`
- Always use `@/*` import alias (maps to `./src/*`). No deep relative imports.
- Named exports only (PascalCase). No default exports.
- No `console`, `any`, `var` in production code
- Surface errors via `toast` (sonner) or field errors. Never `console.log()`
- Use `import type` / `export type` for type-only imports
- Run `bun x ultracite fix` before committing

## Patterns Summary

- **oRPC**: `orpc.<route>.<method>.queryOptions()` / `.mutationOptions()`
- **Auth**: `authClient` for client-side, throw on `result.error`
- **Forms**: React Hook Form + Zod + Controller pattern with Field components
- **Tables**: DataGridEnhanced composable pattern with `useDebouncedSearchParam`
- **State**: Jotai atoms for global, URL params via TanStack Router
- **Styling**: CVA for variants, `cn()` for class merging
- **Tests**: Vitest, behavior-focused, co-located in `__tests__/`

## Detailed Reference

For comprehensive patterns, code examples, and component conventions, see `.claude/CLAUDE.md`.
