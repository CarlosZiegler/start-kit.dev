import { defineConfig } from "drizzle-kit";

import { env } from "@/lib/env.server";

export default defineConfig({
  schema: "./src/lib/db/schema",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
