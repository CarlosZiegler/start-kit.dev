# Admin Area MVP Plan

## Selected approach

- **Global role**: introduce `super_admin` role in Better Auth admin plugin role map.
- **3-layer authorization**:
  1. **Route guard**: admin route (`/(dashboard)/admin/`) checks `super_admin` in `beforeLoad`.
  2. **API authz**: all admin oRPC procedures use `requireSuperAdmin` middleware.
  3. **Navigation visibility**: sidebar renders Admin section only for `super_admin`.
- **Global org operations**: implemented via dedicated admin oRPC router backed by direct DB + Better Auth admin APIs. This avoids org-membership limitation from org plugin endpoints for global support scenarios.
- **Impersonation controls**: start/stop impersonation endpoints require super admin and explicit reason; sensitive actions blocked while impersonating.
- **Audit logging**: new `admin_audit_log` table stores sensitive action trail with reason and metadata.

## Trade-offs

- Route generation for TanStack file routes may require regenerating `routeTree.gen.ts` in your normal app workflow.
- For org membership admin actions, this MVP intentionally bypasses member-scoped org plugin checks and applies explicit super-admin checks instead.
- UI is intentionally minimal for MVP; advanced UX (filters, confirmation modals per action, richer data-grid controls) can follow.

## Checklist

- [x] Add `super_admin` role to Better Auth server and client role maps.
- [x] Add role utility helpers (`isSuperAdmin*`, impersonation detection).
- [x] Add admin audit table + migration.
- [x] Add admin oRPC router with guarded procedures.
- [x] Add audit writes for sensitive actions.
- [x] Add admin route with route-level guard.
- [x] Add navigation visibility controls.
- [x] Add helper tests for super-admin detection/impersonation.
