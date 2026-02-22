# db-schema-patterns: Follow Drizzle Schema Conventions

## Priority: CRITICAL

## Explanation

Database schemas live in `src/lib/db/schema/` using Drizzle ORM with PostgreSQL. Tables use `pgTable()`, names are camelCase in code (auto-converted to snake_case in the database), and relations are explicitly defined for query navigation.

## Bad Example

```typescript
// Wrong: snake_case table name in code, no relations, missing indexes
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user_files = pgTable("user_files", {
  id: text("id").primaryKey(),
  user_id: text("user_id"),  // No reference
  file_name: text("file_name"),
});
```

## Good Example

```typescript
// src/lib/db/schema/storage.ts — actual project pattern
import { index, pgPolicy, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user, organization } from "./auth";

export const file = pgTable(
  "file",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    bucket: text("bucket").notNull(),
    endpoint: text("endpoint"),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    purpose: text("purpose"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("file_key_idx").on(table.key),
    index("file_user_id_idx").on(table.userId),
    index("file_organization_id_idx").on(table.organizationId),
    index("file_purpose_idx").on(table.purpose),
    index("file_created_at_idx").on(table.createdAt),
  ]
);
```

## Good Example: Relations

```typescript
// Always define relations for ORM query navigation
import { relations } from "drizzle-orm";

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
```

## Good Example: Schema Barrel Export

```typescript
// src/lib/db/schema/index.ts — export all schemas
export * from "./auth";
export * from "./chat";
export * from "./storage";
```

## Context

- All schemas live in `src/lib/db/schema/` with barrel export from `index.ts`
- Table names: camelCase in code → auto snake_case in PostgreSQL
- Column names: camelCase in code, explicit `("snake_case")` in column definition
- Use `$defaultFn()` for generated IDs (crypto.randomUUID or nanoid)
- Always define relations for query builder support
- Add indexes for frequently queried columns
- Use `.references()` with `onDelete: "cascade"` for foreign keys
- Drizzle config: `src/lib/db/schema` as schema path, `src/lib/db/migrations` for output
