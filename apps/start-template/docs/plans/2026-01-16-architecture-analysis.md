# Architecture Cleanup Implementation Plan

> **Status:** ✅ COMPLETED (2026-01-16)

**Goal:** Complete remaining technical debt items from architecture analysis

**Architecture:** Enable production-ready features (rate limiting, email config), improve type safety, and add backend pagination support

**Tech Stack:** Better Auth, Resend, oRPC, Drizzle ORM, Zod

---

## Completed Items (Earlier Session)

- ✅ Type safety in subscription provider
- ✅ Removed duplicate types
- ✅ Centralized app configuration (`APP_CONFIG`)
- ✅ Deleted dead code (unused modal files)
- ✅ Polar payment provider removal (Stripe-only)

---

## Task 1: Enable Rate Limiting for Production ✅

**Files:**
- Modified: `src/lib/auth/auth.ts:296-302`

**Change:** `enabled: false` → `enabled: true`

---

## Task 2: Add Email Environment Variables ✅

**Files:**
- Modified: `src/lib/env.server.ts`

**Change:** Added `RESEND_FROM_EMAIL: z.string().optional()`

---

## Task 3: Refactor Email Service to Use Environment Config ✅

**Files:**
- Modified: `src/lib/resend.ts`
- Modified: `.env.example`

**Changes:**
- Removed hardcoded `from` and `to` values
- Uses `env.RESEND_FROM_EMAIL` with fallback to `payload.from` or `DEFAULT_FROM`
- Added `RESEND_FROM_EMAIL` to `.env.example`

---

## Task 4: Add Pagination to Organization Invitations Query ⏭️ SKIPPED

**Reason:** Better Auth limitation

The `listUserInvitations` API is provided by Better Auth's organization plugin. Unlike `listMembers` which supports `offset`/`limit` params, the invitations endpoints don't expose server-side pagination.

**Current behavior:** Client-side filtering works for reasonable data sizes.

**Future:** Monitor Better Auth updates for pagination support.

---

## Task 5: Add Pagination to Organizations List Query ⏭️ SKIPPED

**Reason:** Same Better Auth limitation as Task 4.

---

## Task 6: Final Cleanup - Remove Unused Exports ✅

**Files:**
- Modified: `src/lib/payment/types.ts`

**Change:** Removed unused `SubscriptionStatus` re-export (was added for backwards compatibility but never used).

---

## Summary

| Task | Description | Status |
|------|-------------|--------|
| 1 | Enable rate limiting | ✅ Complete |
| 2 | Add email env vars | ✅ Complete |
| 3 | Refactor email service | ✅ Complete |
| 4 | Pagination for invitations | ⏭️ Skipped (Better Auth limitation) |
| 5 | Pagination for organizations | ⏭️ Skipped (Better Auth limitation) |
| 6 | Final type cleanup | ✅ Complete |

---

## Files Changed

```
src/lib/auth/auth.ts          # Rate limiting enabled
src/lib/env.server.ts         # Added RESEND_FROM_EMAIL
src/lib/resend.ts             # Uses env var for from address
src/lib/payment/types.ts      # Removed unused re-export
.env.example                  # Added RESEND_FROM_EMAIL
```

---

## Notes

- **DB auth schema is generated** by Better Auth - do not modify directly
- **Pagination for Better Auth queries** - limited by what the library exposes; client-side pagination is acceptable for now
- **Rate limiting** is now enabled - consider switching to `storage: "database"` for distributed deployments
