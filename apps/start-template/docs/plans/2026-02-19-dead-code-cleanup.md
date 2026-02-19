# Dead Code Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove dead features (embeddings/pgvector, resources, admin audit log, API Keys plugin) from the codebase.

**Architecture:** Delete 6 dead files, edit 7 files to remove imports/exports/configs, update test infrastructure, generate a drop-tables migration. No new features — pure removal.

**Tech Stack:** Drizzle ORM, better-auth, Bun, Vitest

---

### Task 1: Delete Dead Schema Files

**Files:**
- Delete: `src/lib/db/schema/embeddings.ts`
- Delete: `src/lib/db/schema/resources.ts`
- Delete: `src/lib/db/schema/admin.ts`

**Step 1: Delete the three schema files**

```bash
rm src/lib/db/schema/embeddings.ts
rm src/lib/db/schema/resources.ts
rm src/lib/db/schema/admin.ts
```

**Step 2: Update barrel export**

Edit `src/lib/db/schema/index.ts` — remove the 3 dead exports. Result should be:

```ts
/** biome-ignore-all lint/performance/noBarrelFile: Central schema exports for database */

export * from "./auth";

export * from "./storage";
```

**Step 3: Verify no import errors**

Run: `bunx tsc --noEmit 2>&1 | head -30`

Expected: Errors only related to admin-audit.ts (which imports the deleted admin schema). That file is deleted in Task 2.

---

### Task 2: Delete Dead Auth Files

**Files:**
- Delete: `src/lib/auth/admin-audit.ts`

**Step 1: Delete the file**

```bash
rm src/lib/auth/admin-audit.ts
```

**Step 2: Verify no imports of admin-audit remain**

Run: `grep -r "admin-audit" src/ --include="*.ts" --include="*.tsx"`

Expected: Zero matches.

---

### Task 3: Remove API Keys Plugin

**Files:**
- Modify: `src/lib/auth/auth.ts` (lines 14, 429-434)
- Modify: `src/lib/auth/auth-client.ts` (lines 5, 43)

**Step 1: Edit auth.ts — remove apiKey import**

In `src/lib/auth/auth.ts`, change the import block from:

```ts
import {
  admin,
  apiKey,
  lastLoginMethod,
  magicLink,
  openAPI,
  organization,
} from "better-auth/plugins";
```

To:

```ts
import {
  admin,
  lastLoginMethod,
  magicLink,
  openAPI,
  organization,
} from "better-auth/plugins";
```

**Step 2: Edit auth.ts — remove apiKey from plugins array**

Remove these lines from the plugins array:

```ts
      apiKey({
        enableSessionForAPIKeys: true,
        rateLimit: {
          enabled: false,
        },
      }),
```

**Step 3: Edit auth-client.ts — remove apiKeyClient import**

In `src/lib/auth/auth-client.ts`, change:

```ts
import {
  adminClient,
  apiKeyClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
```

To:

```ts
import {
  adminClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
```

**Step 4: Edit auth-client.ts — remove apiKeyClient() from plugins array**

Remove this line from the plugins array:

```ts
    apiKeyClient(),
```

**Step 5: Type check**

Run: `bunx tsc --noEmit 2>&1 | head -30`

Expected: No errors related to apiKey or admin-audit.

---

### Task 4: Delete pgvector Script and Package.json Reference

**Files:**
- Delete: `scripts/setup-vector-extension.ts`
- Modify: `package.json` (remove db:setup-vector script)

**Step 1: Delete the script**

```bash
rm scripts/setup-vector-extension.ts
```

**Step 2: Remove the script from package.json**

Remove this line from the `"scripts"` section of `package.json`:

```json
"db:setup-vector": "bun --env-file=.env run ./scripts/setup-vector-extension.ts",
```

---

### Task 5: Update Test Infrastructure

**Files:**
- Modify: `docker-compose.test.yml` (change pgvector image to standard postgres)
- Modify: `src/lib/db/rls.test.ts` (remove vector extension setup)

**Step 1: Change test DB image**

In `docker-compose.test.yml`, change:

```yaml
    image: pgvector/pgvector:pg16
```

To:

```yaml
    image: postgres:16-alpine
```

**Step 2: Remove vector extension from RLS test**

In `src/lib/db/rls.test.ts`, remove this line (around line 156):

```ts
    await testPool.query("CREATE EXTENSION IF NOT EXISTS vector;");
```

And remove the comment above it:

```ts
    // Enable vector extension before pushing schema
```

---

### Task 6: Delete Admin Audit Migration

**Files:**
- Delete: `src/lib/db/migrations/0002_admin_audit_log.sql`

**Step 1: Delete the migration file**

```bash
rm src/lib/db/migrations/0002_admin_audit_log.sql
```

**Step 2: Verify journal doesn't reference it**

Read `src/lib/db/migrations/meta/_journal.json` and confirm this migration is either not listed or can be safely removed from the entries array.

---

### Task 7: Clean Initial Migration (0000)

**Files:**
- Modify: `src/lib/db/migrations/0000_lush_shinko_yamashiro.sql`

**Step 1: Remove embeddings, resources, and apikey DDL**

Remove these sections from the migration file:

1. The `CREATE TABLE "apikey"` block (the full table definition)
2. The `CREATE TABLE "embeddings"` block
3. The `CREATE TABLE "resources"` block
4. The `ALTER TABLE "embeddings" ADD CONSTRAINT` foreign key line
5. The `ALTER TABLE "apikey" ADD CONSTRAINT` foreign key line
6. The `CREATE INDEX "embeddingIndex"` line
7. The `CREATE INDEX "apikey_key_idx"` line
8. The `CREATE INDEX "apikey_userId_idx"` line

**Important:** Leave all other tables (user, session, account, verification, organization, member, invitation, passkey, twoFactor, file, subscription) intact.

---

### Task 8: Clean Migration Snapshots

**Files:**
- Modify: `src/lib/db/migrations/meta/0000_snapshot.json`
- Modify: `src/lib/db/migrations/meta/0001_snapshot.json`
- Modify: `src/lib/db/migrations/meta/0002_snapshot.json`

**Step 1: Remove dead table definitions from each snapshot**

In each snapshot JSON file, remove the full table definition objects for:
- `"public.embeddings"`
- `"public.resources"`
- `"public.apikey"`
- `"public.admin_audit_log"` (only in 0002)

These are large JSON blocks inside the `"tables"` object. Also remove any related entries in `"foreignKeys"` and `"indexes"` sections.

**Step 2: Validate JSON**

Run: `bun -e "for (const f of ['0000','0001','0002']) { JSON.parse(await Bun.file('src/lib/db/migrations/meta/' + f + '_snapshot.json').text()); console.log(f + ' OK') }"`

Expected: All three print "OK" (valid JSON).

---

### Task 9: Generate Drop-Tables Migration

**Step 1: Create a new SQL migration file**

Create `src/lib/db/migrations/0003_drop_dead_tables.sql`:

```sql
DROP TABLE IF EXISTS "embeddings" CASCADE;
DROP TABLE IF EXISTS "resources" CASCADE;
DROP TABLE IF EXISTS "apikey" CASCADE;
DROP TABLE IF EXISTS "admin_audit_log" CASCADE;
DROP EXTENSION IF EXISTS vector;
```

**Step 2: Update the migration journal**

Add an entry for the new migration in `src/lib/db/migrations/meta/_journal.json`.

**Alternative:** Instead of manual migration, run `bun run db:generate` after schema changes to let Drizzle auto-generate the migration. This is safer and keeps the journal consistent.

---

### Task 10: Verify Everything Works

**Step 1: Type check**

Run: `bunx tsc --noEmit`

Expected: No errors.

**Step 2: Lint check**

Run: `bun x ultracite check`

Expected: No new errors from our changes.

**Step 3: Dev server**

Run: `bun dev`

Expected: Server starts without import-protection warnings for embeddings/resources/apikey/admin_audit. The existing warnings for `env.server` may persist (separate issue).

**Step 4: Verify tests still pass**

Run: `bun test`

Expected: All existing tests pass. RLS test should work with `postgres:16-alpine` image.

---

## Post-Cleanup

After all tasks verified, return to CLI getting-started wizard design. The CLI scope is now simpler:
- No pgvector setup step
- No API Keys configuration
- No admin audit migration
- Cleaner env var list
