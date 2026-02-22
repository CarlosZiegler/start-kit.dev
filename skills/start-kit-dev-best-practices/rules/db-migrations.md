# db-migrations: Use the Correct Migration Workflow

## Priority: MEDIUM

## Explanation

Drizzle Kit manages database migrations. Use `db:push` for development (fast schema sync) and `db:generate` + `db:migrate` for production (versioned migrations). Migrations output to `src/lib/db/migrations/`.

## Bad Example

```bash
# Wrong: using db:push in production
bun run db:push  # Directly modifies production database without migration files
```

## Good Example

```bash
# Development workflow — fast iteration
bun run db:push           # Push schema changes directly to dev DB
bun run db:studio         # Open Drizzle Studio to inspect data

# Production workflow — versioned migrations
bun run db:generate       # Generate SQL migration files
bun run db:migrate        # Apply migrations to database

# Auth schema regeneration (after Better-Auth plugin changes)
bun run auth:generate     # Regenerate auth schema from Better-Auth config
```

## Good Example: Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Context

- `db:push` — Development only. Syncs schema to DB without migration files
- `db:generate` — Creates versioned SQL migration files in `src/lib/db/migrations/`
- `db:studio` — Opens Drizzle Studio UI for database inspection
- `auth:generate` — Regenerates Better-Auth schema (run after adding/removing auth plugins)
- Always generate migrations before deploying to production
- Review generated SQL before applying to production databases
- RLS policies in schema are included in generated migrations
