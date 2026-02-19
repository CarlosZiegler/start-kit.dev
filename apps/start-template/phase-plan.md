# Admin Area Phase Plan (TanStack Start + Better Auth + Drizzle + Stripe)

Repo: `/root/clawd/start-template`

## Goals / Non‑Goals

### Goals
- Add an **Admin Area** accessible **only** to **Super Admins** (a global role, not org-scoped).
- Super Admin capabilities:
  - Create/manage **workspaces/organizations** across the whole app.
  - Manage **users** globally.
  - “Superpowers”:
    - **Impersonate** a user (with explicit session marking + easy revert).
    - **Override roles** (global role + org roles where applicable).
    - **Ban/unban** users (already supported by schema).
    - Optional: **credit adjustments** (internal ledger; avoid mutating Stripe directly).
- Follow **Better Auth best practices** (role/AC, org plugin, email/password, 2FA, session safety, auditability).
- Align with existing architecture:
  - Features live under `src/features/*`
  - Existing org system: `src/features/organizations/*`
  - Permissions: `src/lib/auth/permissions.ts` + guard component(s).
  - Routes under `src/routes/(dashboard)/*` (TanStack Start file-based).

### Non‑Goals (for initial release)
- Building a full “admin CMS” UI (keep it functional, internal-tool grade first).
- Full billing ops inside admin (refunds, proration management, coupon mgmt) unless explicitly required.
- Multi-tenant “admin per workspace” (this is **global super admin only**).

---

## Proposed Role Model

### Global user roles
Current: `UserRole = "user" | "admin" | "owner"` stored as `user.role` (text).

Add:
- `"super_admin"` (global)

Notes:
- Keep existing `admin`/`owner` semantics intact (they appear to map to Better Auth `admin` plugin roles).
- Treat `super_admin` as **strict superset** of all actions, but still enforce explicit checks for destructive operations.

### Organization roles
Current: `OrganizationRole = "member" | "admin" | "owner"` stored on `member.role`.

No change required, but super admins should be able to:
- View orgs without membership.
- Optionally add themselves as member/owner for operational tasks (audited).

---

## High-Level Architecture Additions

### New feature modules
- `src/features/admin/*` (new)
  - `components/` (tables, forms)
  - `queries/` (TanStack Query loaders)
  - `server/` (server-only functions / RPC endpoints)
  - `types/` (admin DTOs)
  - `audit/` (audit log helpers)

### New guards
- `src/components/guards/super-admin-guard.tsx` (client-side UI guard)
- `src/lib/auth/require-super-admin.ts` (server-side enforcement)

### New route group
- `src/routes/(admin)/*`
  - `layout.tsx` (admin shell + nav)
  - `index.tsx` (dashboard)
  - `users/*`
  - `organizations/*`
  - `audit/*` (optional but strongly recommended)

### API boundary
Prefer **server functions / RPC** that already exist (`src/routes/api/rpc.$.ts`) or TanStack Start server-only fns.
- Avoid exposing generic admin actions via public endpoints.
- Enforce: authn + super-admin authz + CSRF/session checks.

---

## Data Model Changes (Drizzle)

### Required
1. **Super admin role support**
   - Update types and Better Auth admin plugin config to include `super_admin`.
   - Decide how super admins are provisioned (see Migration/Bootstrap).

2. **Audit log table** (recommended baseline for impersonation, bans, role changes)
   - `admin_audit_log`
     - `id`, `createdAt`
     - `actorUserId` (who did it)
     - `action` (enum/string)
     - `targetType` (user/org/subscription/etc)
     - `targetId`
     - `metadata` (JSON text)
     - `ipAddress`, `userAgent` (pull from session if available)

3. **Impersonation safety**
   - Session already includes `impersonatedBy` field (`session.impersonatedBy`).
   - Ensure all server-side “who am I” helpers and UI banners respect it.

### Optional
- **Credits ledger** (if credit adjustments are implemented)
  - `credits_ledger` with immutable entries
  - `balance` computed by sum (or cached materialized column)

---

## Phases / Waves

Each phase includes:
- Scope
- Tasks
- Acceptance criteria
- Risks / notes

### Phase 0 — Discovery & Design Lock (0.5–1 day)

**Scope**: Confirm current auth flows, routing conventions, and where to hook admin.

**Tasks**
- Map current auth/session access patterns:
  - Where `authClient` session is used
  - How server-only functions read session/user
- Review existing org features for reuse (lists, create forms, slug validation).
- Decide naming: `super_admin` vs `superadmin` (recommend `super_admin` for clarity).
- Decide provisioning strategy:
  - Env-based bootstrap email list
  - One-time script to promote a user

**Acceptance criteria**
- Written decisions: role string, bootstrap path, endpoint style (RPC vs route actions).
- Inventory of existing components/utilities to reuse.

**Risks / notes**
- Better Auth plugin behavior depends on configured roles; confirm `adminRoles` handling supports adding `super_admin`.

---

### Phase 1 — AuthZ Foundation: Super Admin Role (1–2 days)

**Scope**: Add super admin role end-to-end (DB → Better Auth → guards → server enforcement).

**Tasks**
1. **Permissions layer** (`src/lib/auth/permissions.ts`)
   - Extend `UserRole` to include `super_admin`.
   - Add `super_admin` role via `ac.newRole({ ... })`:
     - Either full statements for all resources
     - Or reuse `adminAc` + extend with extra statements if needed.
   - Add helper: `isSuperAdmin(role?: string): boolean`.

2. **Better Auth configuration** (`src/lib/auth/auth.ts`, `src/lib/auth/auth-client.ts`)
   - Add `super_admin` to admin plugin config:
     - `adminRoles: ["admin", "owner", "super_admin"]`
     - `roles: { super_admin: superAdminRole, ... }`

3. **Server-side enforcement**
   - Create `requireSuperAdmin(ctx)` helper that:
     - Gets session/user
     - Checks `user.role === "super_admin"`
     - Throws/returns 403 consistently

4. **Client-side guard**
   - `SuperAdminGuard` component that uses `authClient.useSession()` and checks role.

5. **UI affordances**
   - Add global banner when impersonating (reads `session.impersonatedBy`).
   - Hide any admin nav link unless super admin.

**Acceptance criteria**
- Non-super-admin cannot access `/admin` routes (server redirect or 403).
- Super admin sees Admin Area nav and can load Admin shell.
- Role checks exist in both server + client layers.

**Risks / notes**
- Relying only on client guard is insecure; all mutations must be server-enforced.
- Ensure “impersonated session” doesn’t grant admin access (admin check should evaluate the **effective user** but also block admin routes when impersonating unless explicitly allowed). Best practice: **impersonation should drop super admin privileges** until reverted.

---

### Phase 2 — Routing & Admin Shell (1 day)

**Scope**: Create admin route group with layout, navigation, and baseline pages.

**Tasks**
- Add `src/routes/(admin)/layout.tsx`
  - Admin navbar: Users, Organizations, Audit, (Credits)
  - Consistent page container and breadcrumb
  - “Exit impersonation” button if active
- Add `src/routes/(admin)/index.tsx` dashboard
- Add route-level protection:
  - Use route loaders (server) to enforce super admin before rendering

**Acceptance criteria**
- `/admin` renders shell for super admins.
- `/admin` blocks for everyone else (no data leakage; no partial render).

**Risks / notes**
- TanStack Start loader patterns: ensure redirects happen server-side for best UX and security.
- Keep bundles small (Vercel/React best practice): lazy-load heavy admin tables; split routes.

---

### Phase 3 — Organization Management (Global) (2–4 days)

**Scope**: Super admin CRUD for organizations (workspaces) + member ops.

**Tasks**
1. **List & search organizations**
   - Table with pagination, search by name/slug/id
   - Show: member count, createdAt, subscription summary (if applicable)

2. **Create organization**
   - Reuse org validations from `src/features/organizations`
   - Allow setting name/slug/logo

3. **Edit organization**
   - Update name/slug/logo
   - Handle slug collisions safely

4. **Delete organization** (dangerous)
   - Require explicit confirmation
   - Audit log entry
   - Decide on cascade behavior (members/invitations cascade already)

5. **Member management (as super admin)**
   - Add/remove user to org
   - Change org role (member/admin/owner)
   - Optional: “Add self as owner” action (audited)

**Acceptance criteria**
- Super admin can create/update/delete an org.
- Super admin can manage org membership without being a member.
- All actions produce audit log entries.

**Risks / notes**
- Deleting org may orphan subscriptions depending on how referenceIds are used; confirm subscription linkage for org-based vs user-based subscriptions.

---

### Phase 4 — Global User Management (2–4 days)

**Scope**: Browse users, inspect details, manage bans, global role, sessions.

**Tasks**
1. **User list**
   - Search: email, name, id
   - Filters: role, banned, 2FA enabled, createdAt range

2. **User detail view**
   - Profile summary
   - Org memberships
   - Sessions (active sessions; ability to revoke)
   - Subscription overview (Stripe customerId + current plan status)

3. **Ban/unban**
   - Use existing `user.banned`, `banReason`, `banExpires`
   - Add UI and server mutations
   - Enforce ban consistently:
     - On session creation
     - On request (middleware/guard)

4. **Global role management**
   - Change `user.role` among allowed roles
   - Only super admin can set `super_admin`
   - Prevent self-demotion without explicit confirmation

**Acceptance criteria**
- Super admin can ban/unban and the ban is enforced app-wide.
- Super admin can change user global roles with audit trail.
- User search works and does not leak to non-admin.

**Risks / notes**
- Enforcing bans requires consistent check points; confirm where auth session validation occurs in this app.

---

### Phase 5 — Superpowers (Impersonation + Overrides) (2–3 days)

**Scope**: Impersonation flow, safe-by-default.

**Tasks**
1. **Impersonation start**
   - Action from user detail: “Impersonate user”
   - Server mutation:
     - Verify actor is super admin
     - Create new session for target with `impersonatedBy = actorUserId`
     - Optionally store original session id to enable revert

2. **Impersonation banner + exit**
   - Always show when impersonating
   - “Exit impersonation” revokes impersonated session and returns to admin

3. **Authorization semantics during impersonation**
   - Best practice: while impersonating, the effective role is the **target user role**.
   - Block access to `/admin` while impersonating unless you explicitly allow “admin while impersonating” (recommend **block**).

4. **Override roles (org-level)**
   - On org member management, allow setting org role regardless of actor membership.

**Acceptance criteria**
- Super admin can impersonate, sees banner, can exit.
- All impersonation events are audited.
- Admin routes are not accessible while impersonating (recommended default).

**Risks / notes**
- Session fixation / leakage risk: ensure new session cookies replace old ones safely.
- Always log impersonation events; they’re security-sensitive.

---

### Phase 6 — Audit Logs (1–2 days)

**Scope**: Provide visibility into admin actions.

**Tasks**
- Implement audit logger helper `logAdminAction({ actor, action, target, metadata })`.
- Add server hooks in all admin mutations.
- Admin UI:
  - List + filters (action type, actor, target)
  - Detail view of metadata JSON

**Acceptance criteria**
- All admin mutations write audit rows.
- Super admin can view audit logs.

**Risks / notes**
- Metadata may include PII; keep minimal and redact secrets.

---

### Phase 7 — Optional: Credits / Adjustments (2–4 days)

**Scope**: Simple internal credit system.

**Tasks**
- Add `credits_ledger` table (immutable entries).
- Add helper to compute balance.
- Admin UI to add/subtract credits with reason.
- Integrate credit checks where relevant (if app has usage metering).

**Acceptance criteria**
- Super admin can add/subtract credits and see balance.
- Audit log records credit adjustments.

**Risks / notes**
- Do not conflate credits with Stripe billing unless the product requires it.

---

### Phase 8 — Hardening, Performance, and DX (1–3 days)

**Scope**: Security and performance best practices (Vercel/React style, adapted to TanStack Start).

**Tasks**
- Security:
  - Ensure all admin endpoints are server-only and enforce super admin.
  - Add secondary confirmation for destructive actions.
  - Rate-limit admin mutations (reuse Better Auth rateLimit, or app-level).
  - Ensure CSP/headers (if configured) allow admin pages.
  - Validate inputs with shared schema (zod/valibot) and server-side constraints.
- Performance:
  - Pagination everywhere; avoid unbounded user/org lists.
  - Route-level code splitting (admin tables in their routes).
  - Avoid heavy client hydration where not needed (prefer loader data).
- Observability:
  - Add structured logs for admin mutations
  - Optional: Sentry hook points

**Acceptance criteria**
- Admin pages load fast with pagination.
- No admin action can be executed without server-side authorization.

**Risks / notes**
- Some “Next.js” recommendations (RSC, edge runtime) aren’t 1:1; apply spirit: split bundles, cache sensibly, minimize client work.

---

## Migration / Rollout Steps

### DB migrations
1. Create new migration for audit logs (and credits if implemented).
2. (Optional) If you want stricter typing:
   - Convert `user.role` to constrained enum type at DB level.
   - Convert `member.role` to constrained enum (already defaulted).

### Bootstrap super admins
Choose one:
- **Option A (recommended)**: env allowlist
  - `SUPER_ADMIN_EMAILS=alice@x.com,bob@y.com`
  - On user create (databaseHook) or on sign-in, if email in allowlist → set role to `super_admin`.
  - Pros: easy for first deploy; Cons: must remove later.
- **Option B**: one-time script
  - `bun scripts/promote-super-admin.ts --email ...`
  - Pros: cleaner long-term; Cons: requires access to DB.

### Deployment order
1. Deploy migrations (audit table) first.
2. Deploy code that can run without the admin area enabled.
3. Enable Admin Area route group.
4. Promote initial super admin(s).

### Backfill / data
- No backfill required unless you introduce enums or credits.

---

## Testing Plan

### Unit tests (Vitest)
- `isSuperAdmin`, permission helpers.
- Input validation schemas for admin mutations.

### Integration tests (server)
- Admin mutations:
  - Create org, update org, delete org
  - Ban/unban
  - Role changes
  - Impersonation start/stop
- Assertions:
  - Non-super-admin gets 403
  - Audit log row is created

### E2E tests (recommended)
Use Playwright (or equivalent) to cover:
- Super admin can access `/admin`.
- Normal user is redirected/blocked.
- Impersonation flow shows banner and blocks `/admin` while impersonating.
- Ban a user → user cannot sign in / session invalidated.

### Security regression tests
- Attempt to call admin endpoints directly as a normal user.
- Verify no sensitive user list data is returned.

---

## Risks / Open Questions

1. **Better Auth admin plugin semantics**
   - Ensure adding `super_admin` doesn’t break existing admin/owner behaviors.

2. **Impersonation cookie/session handling**
   - Must avoid session confusion and ensure safe revert.

3. **Org subscription linkage**
   - Current `authorizeReference` logic mixes user vs org reference.
   - Admin org deletes/changes may need subscription cleanup decisions.

4. **Bans enforcement**
   - Confirm where to block banned users: sign-in, session refresh, route loaders.

---

## Suggested New Skills / Tools

- **Playwright** for E2E testing admin flows.
- **SQL migration discipline** (Drizzle + CI migration checks).
- **Security checklist** for internal tools (audit logging, least privilege, impersonation safeguards).
- Optional: **Feature flags** (simple env toggle) for staging rollout of admin area.

---

## Definition of Done (DoD)

- Admin Area exists under `/(admin)` routes and is **inaccessible** to non-super-admin users.
- Super admin can:
  - Manage orgs
  - Manage users
  - Impersonate safely (audited, reversible)
  - Ban/unban (enforced)
- All admin actions are audited.
- Automated tests cover core permission boundaries.
