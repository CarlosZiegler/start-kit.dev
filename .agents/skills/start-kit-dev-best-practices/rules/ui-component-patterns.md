# ui-component-patterns: Follow shadcn/ui and Base UI Component Conventions

## Priority: HIGH

## Explanation

UI components in `src/components/ui/` follow shadcn/ui conventions built on `@base-ui/react` primitives. Every component uses `data-slot` attributes for styling hooks, CVA for variant management, `cn()` for class merging, and named exports only.

## Bad Example

```tsx
// Wrong: default export, no data-slot, inline styles, no CVA
export default function MyButton({ variant, ...props }) {
  return (
    <button
      style={{ padding: variant === "large" ? "16px" : "8px" }}
      className="bg-blue-500 text-white"
      {...props}
    />
  );
}
```

## Good Example

```tsx
// src/components/ui/button.tsx — actual project pattern
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof BaseButton> & VariantProps<typeof buttonVariants>) {
  return (
    <BaseButton
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

## Good Example: Composition Pattern

```tsx
// src/components/ui/card.tsx — sub-component composition
function Card({ className, size = "default", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn("group/card bg-card text-card-foreground rounded-xl border shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

// Usage:
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

## Context

- `data-slot="name"` on every component root element — used for Tailwind selectors
- CVA (`class-variance-authority`) for variant management with `defaultVariants`
- `cn()` from `@/lib/utils` = `clsx` + `tailwind-merge` (resolves class conflicts)
- `@base-ui/react` primitives provide accessibility (focus, keyboard, ARIA)
- Named exports only — never use `export default`
- React 19: ref as prop, no `React.forwardRef` needed
- ~57 UI components in `src/components/ui/` (button, card, dialog, field, etc.)
- Responsive styling uses `group-data-[size=sm]/card` selectors for variant-aware children
