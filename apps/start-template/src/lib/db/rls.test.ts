import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";
import type { RlsSession } from "@/lib/db/secure-client";

const execAsync = promisify(exec);

const TEST_DATABASE_URL = "postgresql://test:test@localhost:5433/test";
const RLS_DATABASE_URL =
  "postgresql://rls_test_user:rls_test_pass@localhost:5433/test";

// Test actors
const TEST_USER_A = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "User A",
  email: "usera@test.com",
};

const TEST_USER_B = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "User B",
  email: "userb@test.com",
};

const TEST_ORG = {
  id: "33333333-3333-3333-3333-333333333333",
  name: "Test Org",
  slug: "test-org",
};

// RLS sessions
const sessionA: RlsSession = {
  user: { id: TEST_USER_A.id },
  session: { activeOrganizationId: null },
};

const sessionAWithOrg: RlsSession = {
  user: { id: TEST_USER_A.id },
  session: { activeOrganizationId: TEST_ORG.id },
};

const sessionB: RlsSession = {
  user: { id: TEST_USER_B.id },
  session: { activeOrganizationId: null },
};

// DB instances
let testPool: pg.Pool;
let rlsPool: pg.Pool;
let testDb: ReturnType<typeof drizzle<typeof schema>>;
let rlsDb: ReturnType<typeof drizzle<typeof schema>>;

// Test-specific withRls using non-superuser connection
const testWithRls = async <T>(
  session: RlsSession,
  fn: (tx: typeof rlsDb) => Promise<T>
): Promise<T> =>
  await rlsDb.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('request.user_id', ${session.user.id}, true);`
    );
    await tx.execute(
      sql`select set_config('request.org_id', ${
        session.session.activeOrganizationId ?? ""
      }, true);`
    );
    return await fn(tx as typeof rlsDb);
  });

async function seedTestData() {
  const now = new Date();

  await testDb.insert(schema.user).values([
    {
      ...TEST_USER_A,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      ...TEST_USER_B,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await testDb.insert(schema.organization).values({
    ...TEST_ORG,
    createdAt: now,
  });

  await testDb.insert(schema.member).values({
    id: "44444444-4444-4444-4444-444444444444",
    organizationId: TEST_ORG.id,
    userId: TEST_USER_A.id,
    role: "member",
    createdAt: now,
  });
}

async function cleanupTestData() {
  await testDb.delete(schema.file);
  await testDb.delete(schema.member);
  await testDb.delete(schema.organization);
  await testDb.delete(schema.user);
}

async function createNonSuperuserRole() {
  await testPool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_test_user') THEN
        CREATE ROLE rls_test_user WITH LOGIN PASSWORD 'rls_test_pass' NOSUPERUSER;
      END IF;
    END
    $$;

    GRANT USAGE ON SCHEMA public TO rls_test_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_test_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rls_test_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rls_test_user;
  `);
}

async function applyRlsPolicies() {
  const fixSqlPath = join(process.cwd(), "scripts", "fix_rls_policies.sql");
  const fixSql = readFileSync(fixSqlPath, "utf-8");

  await testPool.query(`
    ALTER TABLE file ENABLE ROW LEVEL SECURITY;
    ALTER TABLE file FORCE ROW LEVEL SECURITY;
  `);

  await testPool.query(fixSql);
}

describe("RLS Enforcement", () => {
  beforeAll(async () => {
    // Start test container
    await execAsync("docker compose -f docker-compose.test.yml up -d --wait");

    // Create superuser connection
    testPool = new pg.Pool({ connectionString: TEST_DATABASE_URL });
    testDb = drizzle(testPool, { schema });

    // Push schema
    await execAsync("bunx drizzle-kit push --config drizzle.config.test.ts");

    // Create non-superuser role
    await createNonSuperuserRole();

    // Apply RLS policies
    await applyRlsPolicies();

    // Create non-superuser connection for RLS tests
    rlsPool = new pg.Pool({ connectionString: RLS_DATABASE_URL });
    rlsDb = drizzle(rlsPool, { schema });

    // Seed test data
    await seedTestData();
  }, 120_000);

  afterAll(async () => {
    await cleanupTestData();
    await rlsPool.end();
    await testPool.end();
    await execAsync("docker compose -f docker-compose.test.yml down -v");
  });

  describe("file table (authOrgOrUser)", () => {
    const FILE_A_PERSONAL = {
      id: "file-a-personal",
      key: "uploads/a/personal.pdf",
      provider: "s3",
      size: 1024,
      mimeType: "application/pdf",
      fileName: "personal.pdf",
      userId: TEST_USER_A.id,
      organizationId: null,
      purpose: "document",
    };

    const FILE_A_ORG = {
      id: "file-a-org",
      key: "uploads/org/shared.pdf",
      provider: "s3",
      size: 2048,
      mimeType: "application/pdf",
      fileName: "shared.pdf",
      userId: TEST_USER_A.id,
      organizationId: TEST_ORG.id,
      purpose: "document",
    };

    const FILE_B_PERSONAL = {
      id: "file-b-personal",
      key: "uploads/b/private.pdf",
      provider: "s3",
      size: 512,
      mimeType: "application/pdf",
      fileName: "private.pdf",
      userId: TEST_USER_B.id,
      organizationId: null,
      purpose: "document",
    };

    beforeAll(async () => {
      await testDb
        .insert(schema.file)
        .values([FILE_A_PERSONAL, FILE_A_ORG, FILE_B_PERSONAL]);
    });

    afterAll(async () => {
      await testDb.delete(schema.file);
    });

    it("User A without org context sees only personal files", async () => {
      const result = await testWithRls(sessionA, async (tx) => {
        return await tx.select().from(schema.file);
      });

      expect(result).toHaveLength(1);
      expect(result.at(0)?.id).toBe(FILE_A_PERSONAL.id);
    });

    it("User A with org context sees org files", async () => {
      const result = await testWithRls(sessionAWithOrg, async (tx) => {
        return await tx.select().from(schema.file);
      });

      expect(result).toHaveLength(1);
      expect(result.at(0)?.id).toBe(FILE_A_ORG.id);
    });

    it("User B sees only own personal files", async () => {
      const result = await testWithRls(sessionB, async (tx) => {
        return await tx.select().from(schema.file);
      });

      expect(result).toHaveLength(1);
      expect(result.at(0)?.id).toBe(FILE_B_PERSONAL.id);
    });

    it("User A cannot see User B's files", async () => {
      const result = await testWithRls(sessionA, async (tx) => {
        return await tx
          .select()
          .from(schema.file)
          .where(sql`id = ${FILE_B_PERSONAL.id}`);
      });

      expect(result).toHaveLength(0);
    });

    it("User A cannot update User B's files", async () => {
      const result = await testWithRls(sessionA, async (tx) => {
        return await tx
          .update(schema.file)
          .set({ fileName: "hacked.pdf" })
          .where(sql`id = ${FILE_B_PERSONAL.id}`)
          .returning();
      });

      expect(result).toHaveLength(0);
    });

    it("User A can update own personal files", async () => {
      const result = await testWithRls(sessionA, async (tx) => {
        return await tx
          .update(schema.file)
          .set({ fileName: "updated.pdf" })
          .where(sql`id = ${FILE_A_PERSONAL.id}`)
          .returning();
      });

      expect(result).toHaveLength(1);

      // Restore
      await testDb
        .update(schema.file)
        .set({ fileName: "personal.pdf" })
        .where(sql`id = ${FILE_A_PERSONAL.id}`);
    });

    it("User A cannot delete User B's files", async () => {
      const result = await testWithRls(sessionA, async (tx) => {
        return await tx
          .delete(schema.file)
          .where(sql`id = ${FILE_B_PERSONAL.id}`)
          .returning();
      });

      expect(result).toHaveLength(0);
    });

    it("User with wrong org cannot access org files", async () => {
      const sessionBWithWrongOrg: RlsSession = {
        user: { id: TEST_USER_B.id },
        session: {
          activeOrganizationId: "99999999-9999-9999-9999-999999999999",
        },
      };

      const result = await testWithRls(sessionBWithWrongOrg, async (tx) => {
        return await tx
          .select()
          .from(schema.file)
          .where(sql`id = ${FILE_A_ORG.id}`);
      });

      expect(result).toHaveLength(0);
    });

    it("RLS does NOT verify org membership (app layer responsibility)", async () => {
      // RLS can only check session.org_id matches file.organization_id
      // Membership verification is handled by better-auth at app layer
      const sessionBWithOrg: RlsSession = {
        user: { id: TEST_USER_B.id },
        session: { activeOrganizationId: TEST_ORG.id },
      };

      const result = await testWithRls(sessionBWithOrg, async (tx) => {
        return await tx.select().from(schema.file);
      });

      // User B CAN see org files if session has org_id set
      // App layer must prevent unauthorized org_id setting
      expect(result).toHaveLength(1);
      expect(result.at(0)?.id).toBe(FILE_A_ORG.id);
    });
  });
});
