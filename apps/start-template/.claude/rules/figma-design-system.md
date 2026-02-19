# Figma Design System Rules

Rules for implementing Figma designs in this TanStack Start + Base UI + Tailwind v4 project.

## Framework Context

- IMPORTANT: This is **TanStack Start** (not Next.js). No Next.js APIs, no `<Image>`, no `next/head`.
- Runtime: **Bun** (not Node). Use `bun` for scripts, not `npm`/`yarn`.
- UI primitives: **@base-ui/react** (not Radix UI). All components wrap Base UI primitives.
- Styling: **Tailwind CSS v4** with CSS-first config. Tokens live in `src/app.css`, not `tailwind.config`.
- Component style: **shadcn/ui** variant (`base-maia`). CLI: `bunx shadcn@latest add <component>`.

## Component Organization

- IMPORTANT: Reuse components from `@/components/ui/` before creating new ones (~57 primitives available)
- App-level shared components: `@/components/` (AppSidebar, NavUser, ThemeSwitcher, etc.)
- Feature components: `@/features/<feature-name>/` (co-located with feature logic)
- AI chat components: `@/components/ai-elements/`
- Kibo UI extras: `@/components/ui/kibo-ui/`
- Email templates: `@/components/emails/`

### File Naming

- Component files: `kebab-case.tsx` (e.g., `button-group.tsx`, `input-group.tsx`)
- Feature files: `<feature>.<scope>.<type>.tsx` (e.g., `settings.page.section.profile.tsx`)
- Component exports: PascalCase named exports. No default exports.
- Sub-components: `ComponentSubpart` (e.g., `CardHeader`, `CardTitle`, `CardContent`)

## Component Pattern

Every component must follow this exact pattern:

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as PrimitiveName from "@base-ui/react/primitive-name";

const componentVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" },
});

function ComponentName({
  className,
  variant,
  size,
  ...props
}: PrimitiveName.Props & VariantProps<typeof componentVariants>) {
  return (
    <PrimitiveName
      className={cn(componentVariants({ variant, size, className }))}
      data-slot="component-name"
      {...props}
    />
  );
}

export { ComponentName, componentVariants };
```

### Key Conventions

- IMPORTANT: Always add `data-slot="name"` to every component and sub-component
- Always merge classNames with `cn()` from `@/lib/utils`
- Use CVA (`class-variance-authority`) for all variant-based styling
- Spread `...props` last on the element
- `className` always first in destructuring, merged via `cn()`
- Props typed as `React.ComponentProps<"element">` for native elements
- Props typed as `Primitive.Props` for Base UI primitives

## Design Tokens

- IMPORTANT: Never hardcode colors. All colors are CSS custom properties in `src/app.css` using OKLCH format.
- IMPORTANT: Use Tailwind utility classes that reference the token system (e.g., `bg-primary`, `text-muted-foreground`, `border-border`)

### Available Token Categories

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

Font: `Inter Variable` (loaded via `@fontsource-variable/inter`). Use `font-sans`.

### Dark Mode

Class-based via `next-themes` (`.dark` class on `<html>`). All tokens have dark variants in `src/app.css`. No manual dark mode logic needed — tokens auto-switch.

## Styling Rules

- Use **Tailwind utility classes** for all styling
- Custom animations: `framer-motion` / `motion` library, or `tw-animate-css`
- IMPORTANT: When Figma MCP returns React + Tailwind code, it matches this project's stack. Adapt to use existing components and tokens.
- Use `data-slot` attribute selectors for parent-child CSS targeting (project convention)

## Figma MCP Integration Flow

When implementing from Figma:

1. **Get design context** — Run `get_design_context` for the target node(s)
2. **If truncated** — Run `get_metadata` for the high-level map, then re-fetch specific nodes
3. **Get screenshot** — Run `get_screenshot` for visual reference of the variant
4. **Download assets** — Download any needed images/SVGs
5. **Implement** — Translate to project conventions:
   - Replace any raw Tailwind colors with token-based utilities (`bg-primary` not `bg-orange-500`)
   - Reuse existing components from `@/components/ui/` (Button, Card, Input, etc.)
   - Add `data-slot` attributes to all elements
   - Use CVA for variants
6. **Validate** — Compare implementation against Figma screenshot for 1:1 fidelity

## Asset Handling

- IMPORTANT: If Figma MCP returns a localhost source for an image/SVG, use that source directly
- IMPORTANT: DO NOT install new icon packages. Primary icon lib: `lucide-react`. Secondary: `@tabler/icons-react`, `@remixicon/react`
- DO NOT create placeholder images if a source is provided
- Store downloaded assets in `public/`

## Architecture Context

When implementing Figma screens that need data/interactivity:

| Concern | Pattern |
|---------|---------|
| Data fetching | oRPC client via `@/orpc/orpc-client` + TanStack Query |
| Forms | React Hook Form + Zod validation (`@hookform/resolvers/zod`) |
| Auth | `authClient` from `@/lib/auth/auth-client` |
| State | Jotai atoms for global, URL params via TanStack Router |
| Routing | TanStack Router file-based routes in `src/routes/` |
| Toasts | `sonner` |
| Theme | `next-themes` with `attribute="class"` |
| i18n | `i18next` + `react-i18next` |

### Import Alias

Always use `@/*` which maps to `./src/*`. No deep relative imports.

## Registries

Available shadcn registries for adding components:

- `@shadcn` — default shadcn/ui components
- `@ai-elements` — AI SDK UI components (`registry.ai-sdk.dev`)
- `@kibo-ui` — Kibo UI components (`kibo-ui.com`)
- `@reui` — ReUI components (`reui.io`)
