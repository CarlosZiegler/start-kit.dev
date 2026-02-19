import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  json,
  pgPolicy,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { authOrgOrUser } from "@/lib/db/rls";

import { organization, user } from "./auth";

export const file = pgTable(
  "file",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    provider: text("provider").notNull(),
    bucket: text("bucket"),
    size: bigint("size", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    fileName: text("file_name").notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    purpose: text("purpose").notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("file_key_idx").on(table.key),
    index("file_userId_idx").on(table.userId),
    index("file_organizationId_idx").on(table.organizationId),
    index("file_purpose_idx").on(table.purpose),
    index("file_created_at_idx").on(table.createdAt),
    pgPolicy("file_select", {
      for: "select",
      using: authOrgOrUser(table.userId, table.organizationId),
    }),
    pgPolicy("file_insert", {
      for: "insert",
      withCheck: authOrgOrUser(table.userId, table.organizationId),
    }),
    pgPolicy("file_update", {
      for: "update",
      using: authOrgOrUser(table.userId, table.organizationId),
    }),
    pgPolicy("file_delete", {
      for: "delete",
      using: authOrgOrUser(table.userId, table.organizationId),
    }),
  ]
);

export const fileRelations = relations(file, ({ one }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
}));
