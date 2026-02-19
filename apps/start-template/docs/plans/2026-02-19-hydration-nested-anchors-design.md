# Fix: Nested Anchor Hydration Error in Sidebar Navigation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate hydration errors caused by nested `<a>` and `<button><a>` in sidebar nav.

**Architecture:** Use Base UI's `render` prop on `SidebarMenuSubButton` and `SidebarMenuButton` to replace their default tag with TanStack Router's `<Link>`, producing a single DOM element.

**Tech Stack:** Base UI `useRender`, TanStack Router `<Link>`, React

---

## Context

- `SidebarMenuSubButton` uses `useRender` with `defaultTagName: "a"` (see `src/components/ui/sidebar.tsx:664-694`)
- `SidebarMenuButton` uses `useRender` with `defaultTagName: "button"` (see `src/components/ui/sidebar.tsx:497-549`)
- Both accept a `render` prop that replaces the default element entirely
- TanStack Router's `<Link>` renders an `<a>` tag

---

### Task 1: Fix nested `<a><a>` in SidebarMenuSubButton

**Files:**
- Modify: `src/components/nav-items.tsx:80-87`

**Step 1: Replace nested Link with render prop**

Change lines 80-87 from:

```tsx
<SidebarMenuSubItem key={child.title}>
  <SidebarMenuSubButton isActive={!!childActive}>
    <Link className="flex" to={child.url}>
      {child.icon ? <child.icon /> : null}
      <span>{child.title}</span>
    </Link>
  </SidebarMenuSubButton>
</SidebarMenuSubItem>
```

To:

```tsx
<SidebarMenuSubItem key={child.title}>
  <SidebarMenuSubButton isActive={!!childActive} render={<Link to={child.url} />}>
    {child.icon ? <child.icon /> : null}
    <span>{child.title}</span>
  </SidebarMenuSubButton>
</SidebarMenuSubItem>
```

**Step 2: Run lint check**

Run: `bun x ultracite check src/components/nav-items.tsx`
Expected: No errors related to this change

---

### Task 2: Fix nested `<button><a>` in SidebarMenuButton

**Files:**
- Modify: `src/components/nav-items.tsx:99-105`

**Step 1: Replace nested Link with render prop**

Change lines 99-105 from:

```tsx
{item.url ? (
  <SidebarMenuButton isActive={!!parentActive} tooltip={item.title}>
    <Link className="flex w-full items-center gap-2" to={item.url}>
      {item.icon ? <item.icon /> : null}
      <span>{item.title}</span>
    </Link>
  </SidebarMenuButton>
```

To:

```tsx
{item.url ? (
  <SidebarMenuButton isActive={!!parentActive} tooltip={item.title} render={<Link to={item.url} />}>
    {item.icon ? <item.icon /> : null}
    <span>{item.title}</span>
  </SidebarMenuButton>
```

**Step 2: Run lint check**

Run: `bun x ultracite check src/components/nav-items.tsx`
Expected: No errors

---

### Task 3: Verify and commit

**Step 1: Run type check**

Run: `bunx tsc --noEmit --pretty`
Expected: No type errors in `nav-items.tsx`

**Step 2: Run dev server and verify manually**

Run: `bun dev`
Check:
- No hydration errors in browser console
- Sidebar links navigate correctly
- Active state highlighting works
- Tooltip shows on collapsed sidebar

**Step 3: Commit**

```bash
git add src/components/nav-items.tsx
git commit -m "fix(nav): use render prop to prevent nested interactive elements

Replace nested <Link> children with render prop on SidebarMenuSubButton
and SidebarMenuButton. Fixes hydration error from <a> inside <a> and
<a> inside <button>."
```

---

## Testing Checklist

- [ ] No hydration errors in browser console
- [ ] Sidebar sub-item links navigate to correct routes
- [ ] Top-level sidebar links navigate to correct routes
- [ ] Active state highlight works on current route
- [ ] Tooltip shows item title when sidebar is collapsed
- [ ] Lint passes: `bun x ultracite check`
- [ ] Types pass: `bunx tsc --noEmit`
