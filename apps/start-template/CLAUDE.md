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
| Tests (watch) | `bun run test:watch` |
| Tests (coverage) | `bun run test:coverage` |
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

## oRPC + React Query Patterns

Server routes: `src/orpc/routes/` — each file exports a sub-router.
Client: `src/orpc/orpc-client.ts` — `createTanstackQueryUtils(client)`.
Middleware chain: `publicProcedure → protectedProcedure (requireAuth) → protectedRlsProcedure (withRls)`.
Validation: Zod schemas for all inputs/outputs.

### Queries

```tsx
// Standard query
const { data } = useQuery(orpc.profile.get.queryOptions({ input: { id } }))

// Conditional query with skipToken
useQuery(orpc.planet.list.queryOptions({
  input: search ? { search } : skipToken,
}))

// Smooth transitions during pagination/search
import { keepPreviousData } from "@tanstack/react-query"
const { data } = useQuery({
  ...orpc.agents.list.queryOptions({ input }),
  placeholderData: keepPreviousData,
})
```

### Mutations

```tsx
const mutation = useMutation(orpc.profile.update.mutationOptions({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: orpc.profile.get.queryKey() })
    toast.success(t("SAVED"))
  },
  onError: (e: Error) => toast.error(e.message),
}))
```

For auth mutations — throw on `result.error` so React Query catches failures:

```tsx
const result = await authClient.signIn.social({ provider, callbackURL })
if (result.error) throw new Error(result.error.message || "Auth failed")
```

### Invalidation

```tsx
queryClient.invalidateQueries({ queryKey: orpc.profile.get.queryKey() })
refetchSession() // after auth mutations
```

### Error Handling

- Use `isDefinedError()` from `@orpc/client` for type-safe error checking
- Surface errors via `toast` (sonner) or field-level errors. NEVER `console.log()`
- Auth errors: throw on `result.error`
- 401 responses: auto-redirect to `/sign-in` via query client error handler

## Authentication (Better-Auth)

- Server: `src/lib/auth/auth.ts` — Better-Auth config with plugins (org, 2FA, passkeys, stripe, admin)
- Client: `src/lib/auth/auth-client.ts` — `authClient` for client-side calls
- Session: prefetched in `__root.tsx` `beforeLoad`, available via `useQuery(authQueryOptions())`
- Roles: `user`, `admin`, `owner`, `super_admin` — checked via `@/lib/auth/permissions`

## Database (Drizzle + PostgreSQL)

- Schema: `src/lib/db/schema/` — auth.ts, storage.ts, organization.ts, user.ts
- Client: `drizzle-orm/bun-sql` (Bun native SQL)
- RLS: Postgres Row-Level Security via `withRls()` middleware — sets `request.user_id` and `request.org_id`
- IMPORTANT: Always use `protectedRlsProcedure` for data queries that need org/user scoping

## Forms (React Hook Form + Zod)

Use Controller + Field components for all forms:

```tsx
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  mode: "onChange", // or "onBlur", "onSubmit", "onTouched", "all"
})

<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Field Types

- **Input/Textarea**: Spread `field` directly
- **Select**: Use `field.value` and `field.onChange`
- **Checkbox array**: Manually manipulate array in `onCheckedChange`
- **RadioGroup**: Use `field.value` / `field.onChange`
- **Switch**: Use `field.checked` / `onCheckedChange`

### Array Fields

Use `useFieldArray` for dynamic arrays. CRITICAL: Use `field.id` as key (not index):

```tsx
const { fields, append, remove } = useFieldArray({ control: form.control, name: "emails" })

{fields.map((field, index) => (
  <Controller key={field.id} name={`emails.${index}.address`} control={form.control} ... />
))}
```

### Accessibility

Always pair `data-invalid` on `<Field>` with `aria-invalid` on the form control.
Use `<FieldSet>`, `<FieldLegend>`, `<FieldGroup>` for grouped inputs.

## DataGridEnhanced — Standard Table Component

All table logic lives in the route file. Use the composable pattern:

```tsx
<DataGridEnhanced columns={columns} data={data} pagination={pagination}>
  <DataGridEnhanced.Toolbar searchable searchBind={bind} showColumnVisibility />
  <DataGridEnhanced.Content emptyMessage="No results" />
  <DataGridEnhanced.Pagination showRowsPerPage showSelectedCount />
</DataGridEnhanced>
```

### Server-Side Pagination + URL Search (Standard Pattern)

```tsx
export const Route = createFileRoute("/agents/")({
  component: RouteComponent,
  validateSearch: z.object({ query: z.string().optional() }),
})

function RouteComponent() {
  const { bind, searchValue } = useDebouncedSearchParam(Route, "query")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useQuery({
    ...orpc.agents.list.queryOptions({
      input: {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: searchValue || undefined,
      },
    }),
    placeholderData: keepPreviousData,
  })

  // Reset to page 0 on search/filter change
  useEffect(() => {
    setPagination(p => p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })
  }, [searchValue])

  return (
    <DataGridEnhanced
      columns={columns}
      data={data?.data ?? []}
      manualPagination
      pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
      pagination={pagination}
      onPaginationChange={setPagination}
      isLoading={isLoading}
    >
      <DataGridEnhanced.Toolbar searchable searchBind={bind} />
      <DataGridEnhanced.Content emptyMessage="No results" />
      <DataGridEnhanced.Pagination showRowsPerPage />
    </DataGridEnhanced>
  )
}
```

### DataGrid Gotchas

1. **Search**: Use `useDebouncedSearchParam` + `searchBind={bind}`. NOT `searchColumn` or `onSearchChange` (deprecated)
2. **Reset pagination** when search/filters change to avoid empty pages
3. **Use `keepPreviousData`** to prevent loading flicker during pagination
4. **Use `getRowId`** for stable row identity: `getRowId={r => r.id}`

### DataGrid Features

- **Row Selection**: `createSelectColumn()` + `enableRowSelection` + `rowSelection` state
- **Drag & Drop**: `createDragColumn()` + `enableDragDrop` + `onDragEnd`
- **Column Visibility**: `showColumnVisibility` on Toolbar
- **Sorting**: `enableSorting: true` on column defs

```tsx
import { createSelectColumn, createDragColumn } from "@/components/ui/data-grid-enhanced"

const columns: ColumnDef<Agent>[] = [
  createSelectColumn(),
  createDragColumn(row => row.id),
  { accessorKey: "name", header: "Name" },
]
```

## Routing

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
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" },
})

function Button({ className, variant, size, ...props }: Props & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size, className }))} data-slot="button" {...props} />
}

export { Button, buttonVariants }
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

## Styling (Tailwind CSS v4)

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

1. `get_design_context` for target nodes
2. `get_screenshot` for visual reference
3. Implement with project tokens and existing components
4. Add `data-slot` attributes, use CVA for variants
5. Validate against screenshot

Asset handling: use localhost sources directly, store in `public/`.
IMPORTANT: DO NOT install new icon packages. Use: `lucide-react`, `@tabler/icons-react`, `@remixicon/react`.

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

## Testing (Vitest)

Behavior-focused: test WHAT code does, not HOW.

### What to Test

- Business rules, policies, validation schemas
- Permission checks and role logic
- User-facing behavior and outcomes
- Edge cases and error scenarios

### What NOT to Test

- Implementation details or private functions
- CSS classes or DOM structure
- Trivial one-to-one mappings

### Test Organization

Tests co-located with source in `__tests__/` folders:
- `src/lib/__tests__/` — utilities
- `src/lib/auth/__tests__/` — permissions
- `src/lib/payment/__tests__/` — plans
- `src/lib/validations/__tests__/` — validation schemas
- `src/hooks/__tests__/` — hooks

### Test Commands

```bash
bun run test           # Run all
bun run test:watch     # Watch mode
bun run test:coverage  # Coverage report
```

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
| `@ai-sdk/react` | AI SDK integration |
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
