# Dead Code Cleanup Design

## Summary

Remove confirmed dead features: embeddings/pgvector, resources table, admin audit log, and API Keys plugin. All verified as zero usage — no routes, no UI, no imports beyond schema definitions.

## What Gets Removed

### Files to Delete (6)

| File | Feature | Reason |
|------|---------|--------|
| `src/lib/db/schema/embeddings.ts` | Embeddings | Never queried, no routes, no UI |
| `src/lib/db/schema/resources.ts` | Resources | Only FK target for embeddings |
| `src/lib/db/schema/admin.ts` | Admin audit log | `adminAuditLog` table never written to |
| `src/lib/auth/admin-audit.ts` | Admin audit log | `writeAdminAuditLog()` never called |
| `scripts/setup-vector-extension.ts` | pgvector | No embeddings = no vector extension needed |
| `src/lib/db/migrations/0002_admin_audit_log.sql` | Admin audit log | Migration for unused table |

### Files to Edit (5)

**`src/lib/db/schema/index.ts`** — remove 3 barrel exports:
```diff
- export * from "./admin";
- export * from "./embeddings";
- export * from "./resources";
```

**`src/lib/auth/auth.ts`** — remove apiKey plugin:
```diff
- import { apiKey } from "better-auth/plugins";
  // ...in plugins array:
- apiKey({
-   enableSessionForAPIKeys: true,
-   rateLimit: { enabled: false },
- }),
```

**`src/lib/auth/auth-client.ts`** — remove apiKeyClient:
```diff
- import { apiKeyClient } from "better-auth/client/plugins";
  // ...in plugins array:
- apiKeyClient(),
```

**`package.json`** — remove setup-vector script:
```diff
- "db:setup-vector": "bun --env-file=.env run ./scripts/setup-vector-extension.ts",
```

**`src/lib/db/migrations/0000_lush_shinko_yamashiro.sql`** — remove DDL for dead tables:
- Lines creating `embeddings` table + vector column
- Lines creating `resources` table
- Lines creating `apikey` table
- Foreign key constraints for embeddings and apikey
- Indexes: `embeddingIndex`, `apikey_key_idx`, `apikey_userId_idx`

### Migration Metadata (snapshot JSON)

Remove table definitions for `embeddings`, `resources`, `apikey`, `admin_audit_log` from:
- `src/lib/db/migrations/meta/0000_snapshot.json`
- `src/lib/db/migrations/meta/0001_snapshot.json`
- `src/lib/db/migrations/meta/0002_snapshot.json`

## Migration Strategy

Create a new Drizzle migration that drops the unused tables from any existing database:

```sql
DROP TABLE IF EXISTS "embeddings" CASCADE;
DROP TABLE IF EXISTS "resources" CASCADE;
DROP TABLE IF EXISTS "apikey" CASCADE;
DROP TABLE IF EXISTS "admin_audit_log" CASCADE;
DROP EXTENSION IF EXISTS vector;
```

This is safer than rewriting migration history — existing deployments will cleanly drop the tables.

## What Stays (Not Dead)

| Feature | Status | Why Keep |
|---------|--------|----------|
| Admin plugin (better-auth) | Active | Roles, permissions, sidebar link work |
| `super-admin.ts` | Active | Used by sidebar + permission checks |
| `permissions.ts` | Active | Used by admin + organization plugins |
| Organizations | Fully active | Routes, UI, permissions, invitations |
| Stripe/Payments | Fully active | Pricing, billing, subscriptions, emails |
| Chat/AI | Fully active | Route, streaming, resumable streams |
| Auth methods (2FA, passkeys, magic link, OTP) | Fully active | All have routes + UI |
| i18n | Fully active | 156 occurrences across 68 files |
| Redis | Partial | Optional chat stream resumption |

## Risk Assessment

**Low risk.** All removed code is confirmed dead:
- Embeddings/resources: zero queries, zero routes
- Admin audit log: `writeAdminAuditLog()` has zero callers
- API Keys: zero UI, zero routes

Only touching active files for apiKey removal (`auth.ts`, `auth-client.ts`) — simple plugin list changes.

## Execution Order

1. Delete 6 dead files
2. Edit 5 files (remove imports/exports/plugin configs)
3. Edit migration metadata snapshots
4. Generate new drop-tables migration
5. Run `bun run db:push` to apply
6. Verify build: `bun run build` or `bun dev`

## Post-Cleanup

After cleanup is verified, return to CLI design for the getting-started wizard. The CLI will no longer need:
- pgvector/vector DB setup step
- API Keys configuration
- Admin audit log migration
