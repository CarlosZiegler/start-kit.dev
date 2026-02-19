# Admin Area (Super Admin) — Phase Plan (2026-02-13)

## Goal
Add an **Admin Area** that is only visible/accessible to **system-wide admins** ("superpowers") and can:

- Create/manage **workspaces/organizations** (system view)
- Manage **users across the entire app** (ban/unban, role changes, reset 2FA, etc.)
- Optional: **impersonate** a user for support/debug
- Optional: manage app-wide settings (feature flags, credits, plan overrides)

This should integrate cleanly with the existing stack:
- TanStack Start routing (`src/routes/(dashboard)/*`)
- Better Auth plugins already enabled: `admin(...)`, `organization(...)`, `twoFactor()`, `passkey()`, etc. (`src/lib/auth/auth.ts`)
- Drizzle + Postgres schema in `src/lib/db/schema/*`
- Existing org permission system: `src/lib/auth/permissions.ts` + `src/components/guards/permission-guard.tsx`

## Non-Goals
- Full “admin panel” product polish (themes, charts, etc.) beyond MVP
- Organization-level admin features (already exist under Organizations)
- Building an end-user docs/marketing area for admin features

## Current State (repo reality check)
- Better Auth **admin plugin** configured with roles `user | admin | owner` and `adminRoles: ["admin", "owner"]` (`src/lib/auth/auth.ts`).
- DB schema includes `user.role` (nullable text) and `session.impersonatedBy` already exists (`src/lib/db/schema/auth.ts`).
- UI has an org-level `PermissionGuard` built around active org membership.

## Key Design Decisions (make these explicit early)

### 1) System role vs organization role
We need a **system-level role** separate from organization membership.

- Organization role controls access inside a workspace (member/admin/owner).
- System role controls access to **/admin** and global operations.

✅ Proposed: introduce `UserRole = user | admin | owner | super_admin`.
- Keep `owner` meaning “high-trust” if you want, but make **`super_admin`** the only role allowed to access Admin Area.
- Alternatively: treat `owner` as superadmin and skip new role. (Not recommended; it mixes concepts and makes future RBAC harder.)

### 2) How to enforce access
Enforce at **3 layers**:

1. **Route guard (server-side redirect)** for `/admin/*`
2. **API authorization** in server handlers (ORPC / auth admin API)
3. **Navigation hiding** (don’t show admin items unless allowed)

### 3) Admin capabilities (MVP vs later)
MVP “superpowers”:
- List users
- View a user (profile + memberships/orgs + sessions)
- Set user role (to/from super_admin)
- Ban/unban user

Phase 2 optional:
- Impersonation
- Credits adjustments / ledger
- Audit logs

## Risks / Gotchas
- `user.role` currently nullable → ensure default + migration to avoid null-based bypass or inconsistent checks.
- RLS: the app uses Postgres RLS helpers (`src/lib/db/rls.ts`, `withRls(...)`). Admin endpoints that read across orgs may need a **non-RLS** path or a controlled “admin RLS bypass” connection.
- Impersonation is powerful: must be auditable, time-bound, and clearly indicated in UI.

---

## Phase 0 — Planning & Alignment

### Wave 0.1 — Confirm scope and role semantics
- [ ] Decide whether to add a new `super_admin` role or reuse `owner`.
- [ ] Decide MVP admin features (users + workspaces only) vs extras.
- [ ] Decide whether admin endpoints will use Better Auth Admin plugin APIs vs custom ORPC routes.

**Acceptance criteria**
- Written decision: exact roles and who can access `/admin`.

---

## Phase 1 — Data Model + Auth Role Wiring

### Wave 1.1 — Add `super_admin` to role types and access control
- [ ] Update `src/lib/auth/permissions.ts`
  - [ ] Extend `export type UserRole = "user" | "admin" | "owner" | "super_admin"`.
  - [ ] Add a new role via `ac.newRole(...)` (likely based on `adminAc` + any extra statements).
  - [ ] Update `assignableRoles` so only `super_admin` (and optionally `owner`) can assign `super_admin`.
- [ ] Update Better Auth admin plugin config in `src/lib/auth/auth.ts`
  - [ ] Add `"super_admin"` to `adminRoles`.
  - [ ] Extend `roles` mapping to include `super_admin`.

### Wave 1.2 — Enforce DB defaults for `user.role`
- [ ] Add a Drizzle migration to set `user.role` default to `"user"` and backfill nulls.
  - [ ] SQL: `update "user" set role='user' where role is null;`
  - [ ] SQL: set default constraint (or enforce at app level if you prefer).
- [ ] Ensure new users get a role consistently.

**Acceptance criteria**
- New role exists in code.
- Admin plugin recognizes the role.
- No null user roles in DB after migration.

---

## Phase 2 — Route Guards + Navigation

### Wave 2.1 — Server-side guard for Admin routes
- [ ] Add new route group under dashboard, e.g.
  - `src/routes/(dashboard)/admin/` (and subroutes)
- [ ] Create an admin layout route that:
  - [ ] Fetches current session via existing patterns (e.g. `auth.api.getSession` / `getCurrentUserFn`).
  - [ ] Redirects to dashboard overview if not `super_admin`.
  - [ ] Shows admin navigation when allowed.

### Wave 2.2 — Hide admin nav for non-admins
- [ ] Update sidebar nav builder (`src/components/app-sidebar.tsx` and/or `src/components/nav-items.tsx`) to conditionally include “Admin”.
- [ ] Add a lightweight `useIsSuperAdmin()` hook (client) that reads session user role.

**Acceptance criteria**
- Visiting `/admin` as non-super-admin redirects (no flash of content).
- Admin menu item only appears for super admins.

---

## Phase 3 — Admin: Workspaces/Organizations Management

### Wave 3.1 — Admin UI: list + create workspaces
- [ ] Admin page: `GET /admin/workspaces`
  - [ ] List organizations (id/name/slug/createdAt, member count)
- [ ] Admin page: `POST /admin/workspaces/new`
  - [ ] Create organization on behalf of system admin (decide if creator becomes owner)

### Wave 3.2 — Admin API: organization operations
Choose one approach:

A) **Use Better Auth organization plugin APIs** from server-side handlers
- [ ] Create server-only functions to call Better Auth org APIs with admin privileges.

B) **Use ORPC + Drizzle** (system DB access)
- [ ] Add ORPC routes under `src/orpc/routes/admin.ts` guarded by `super_admin`.
- [ ] Ensure these routes do NOT rely on org-scoped RLS transaction unless intended.

**Acceptance criteria**
- Super admin can list orgs.
- Super admin can create an org from admin area.

---

## Phase 4 — Admin: User Management

### Wave 4.1 — List users
- [ ] Admin page: `/admin/users`
  - [ ] Table: email, name, role, banned, 2FA enabled, createdAt
  - [ ] Search/filter by email

### Wave 4.2 — User detail + actions
- [ ] Admin page: `/admin/users/$userId`
  - [ ] Show user profile
  - [ ] Show memberships/orgs (join table `member`)
  - [ ] Show sessions (and whether currently impersonated)
- [ ] Actions:
  - [ ] Set role (including super_admin)
  - [ ] Ban/unban
  - [ ] Force sign-out (invalidate sessions)

**Acceptance criteria**
- Super admin can perform actions; non-admin cannot access endpoints.
- Actions are confirmed with UI dialogs and are auditable (at least via logs).

---

## Phase 5 (Optional) — Impersonation

### Wave 5.1 — Impersonate with audit trail
- [ ] Use existing `session.impersonatedBy` to mark impersonation.
- [ ] Add admin action: “Impersonate user”
  - [ ] Creates a new session for target user with `impersonatedBy = adminUserId`
  - [ ] UI banner: “You are impersonating X. Exit impersonation.”
- [ ] Add “exit impersonation” action that returns to admin’s own session.

**Acceptance criteria**
- Impersonation is clearly visible in UI.
- All impersonated sessions are marked.

---

## Phase 6 — Security Hardening (Better Auth best practices)

- [ ] Ensure admin actions require **recent authentication** (re-auth) or 2FA.
- [ ] Ensure rate limits for admin endpoints.
- [ ] Ensure password/email flows follow best practices (no user enumeration; consistent errors; verify email before sensitive operations).
- [ ] Ensure 2FA best practices: enforce for super_admin.

**Acceptance criteria**
- Super admin must have 2FA enabled (or a clear, enforced policy).

---

## Phase 7 — Testing Plan

### Unit/behavior tests (Vitest)
- [ ] Add tests for `isSuperAdmin` checks and role assignment rules.
- [ ] Add tests for admin route guard behavior.
- [ ] Add tests for admin API procedures (UNAUTHORIZED vs FORBIDDEN).

### Integration tests
- [ ] If staying in Vitest only: test ORPC procedures by calling handlers with mocked sessions.
- [ ] Optional: add Playwright later for true end-to-end.

**Commands**
- `bun test`
- `bun test:coverage`

**Acceptance criteria**
- New admin permission checks covered.
- No regression in existing permission tests (`src/lib/auth/__tests__/permissions.test.ts`).

---

## Phase 8 — Migration & Rollout

- [ ] Add migration for `user.role` default/backfill.
- [ ] Add a one-time script to promote the first super admin (by email) in dev/prod.
- [ ] Document env + operational steps in README or `docs/admin.md`.

**Acceptance criteria**
- Deployable with clear steps.
- Safe bootstrap path to create first super admin.

---

## Skill/Tool Updates (as requested)
You said you added these new Better Auth skills:
- `better-auth-security-best-practices`
- `email-and-password-best-practices`
- `organization-best-practices`
- `two-factor-auth-best-practices`

✅ Plan uses them conceptually (security + orgs + 2FA). If you want, next step is to **apply them during implementation** to enforce rules (especially: 2FA required for super admins; safe password reset; org RBAC correctness).
