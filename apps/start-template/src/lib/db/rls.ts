import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * RLS policy helpers for Postgres.
 *
 * The app sets `request.user_id` and `request.org_id` per-request via `set_config(...)`.
 * Policies use these session settings to scope reads/writes.
 */

const requestUserId = sql`nullif(current_setting('request.user_id', true), '')::uuid`;
const requestOrgId = sql`nullif(current_setting('request.org_id', true), '')::uuid`;

export const authUserId = (userIdColumn: AnyPgColumn): SQL =>
  sql`${requestUserId} = ${userIdColumn}`;

export const authOrgId = (orgIdColumn: AnyPgColumn): SQL =>
  sql`${requestOrgId} = ${orgIdColumn}`;

export const authOrgOrUser = (
  userIdColumn: AnyPgColumn,
  orgIdColumn: AnyPgColumn
): SQL =>
  sql`(${requestOrgId} = ${orgIdColumn} OR (${requestOrgId} IS NULL AND ${orgIdColumn} IS NULL AND ${requestUserId} = ${userIdColumn}))`;
