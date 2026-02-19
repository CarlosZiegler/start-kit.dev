import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export type RlsSession = {
  user: { id: string };
  session: { activeOrganizationId?: string | null };
};

type Db = typeof db;

/**
 * Run a transaction with Postgres RLS context set for the current request.
 *
 * RLS policies read `request.user_id` and `request.org_id` via `current_setting(...)`.
 */
export const withRls = async <T>(
  session: RlsSession,
  fn: (tx: Db) => Promise<T>
): Promise<T> =>
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('request.user_id', ${session.user.id}, true);`
    );
    await tx.execute(
      sql`select set_config('request.org_id', ${
        session.session.activeOrganizationId ?? ""
      }, true);`
    );

    return await fn(tx as Db);
  });
