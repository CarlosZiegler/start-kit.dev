import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { EnhancedQueryLogger } from "drizzle-query-logger";

import { env } from "@/lib/env.server";

import * as schema from "./schema";

const client = new SQL(env.DATABASE_URL);

export const db = drizzle({
  schema,
  client,
  ...(env.DRIZZLE_QUERY_LOGGER_ENABLED
    ? { logger: new EnhancedQueryLogger() }
    : {}),
});

export type DB = typeof db;
