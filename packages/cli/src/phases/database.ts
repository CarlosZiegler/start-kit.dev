import { confirm, isCancel, log, select, spinner, text } from "@clack/prompts";

import {
  exec,
  generateSecret,
  readEnvFile,
  testDbConnection,
  writeEnvFile,
} from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";
import { isValidPostgresUrl } from "../lib/validators";

// Minimum env vars required by env.server.ts for drizzle.config.ts to load
const ENV_PLACEHOLDERS: Record<string, string> = {
  RESEND_API_KEY: "re_dummy_replace_me",
  S3_ACCESS_KEY_ID: "dummy_replace_me",
  S3_SECRET_ACCESS_KEY: "dummy_replace_me",
  S3_BUCKET: "dummy-bucket",
};

export async function runDatabase(state: SetupState): Promise<SetupState> {
  const dbChoice = await select({
    message: "Do you already have a PostgreSQL database?",
    options: [
      {
        value: "own",
        label: "Yes, I have a connection URL",
      },
      {
        value: "instagres",
        label: "No, create one instantly with Instagres (pg.new)",
        hint: "free 72h, claim to keep",
      },
    ],
  });
  if (isCancel(dbChoice)) {
    process.exit(0);
  }

  let databaseUrl: string;

  if (dbChoice === "instagres") {
    const s = spinner();
    s.start("Creating instant Neon database via Instagres...");

    const result = await exec(
      "bunx get-db --yes --env .env --key DATABASE_URL"
    );

    if (result.exitCode !== 0) {
      s.stop("Failed to create database");
      log.error(`get-db failed: ${result.stderr}`);
      log.info("You can try manually: npx get-db --yes");
      log.info(
        "Or provide your own DATABASE_URL and re-run: bunx create-start-kit-dev init --step database"
      );
      process.exit(1);
    }

    s.stop("Database created!");

    // Read the URL that get-db wrote to .env
    const envVars = readEnvFile(".env");
    databaseUrl = envVars.DATABASE_URL ?? "";

    if (!databaseUrl) {
      log.error(
        "DATABASE_URL not found in .env after get-db. Check .env manually."
      );
      process.exit(1);
    }

    log.success("DATABASE_URL written to .env");
    log.warn("This database expires in 72 hours.");
    log.info("Claim it at https://neon.tech or run: npx get-db claim");
  } else {
    const url = await text({
      message: "Enter your DATABASE_URL:",
      placeholder: "postgresql://user:pass@host:5432/mydb",
      validate: (v = "") => {
        if (!isValidPostgresUrl(v)) {
          return "Must start with postgresql:// or postgres://";
        }
      },
    });
    if (isCancel(url)) {
      process.exit(0);
    }
    databaseUrl = url;
  }

  // Test connection
  const s = spinner();
  s.start("Testing database connection...");

  const test = await testDbConnection(databaseUrl);

  if (!test.ok) {
    s.stop("Connection failed");
    log.error(`Could not connect: ${test.error}`);
    log.info("Check your DATABASE_URL and try again.");
    process.exit(1);
  }

  s.stop("Connected to PostgreSQL");

  // Run migrations
  const shouldMigrate = await confirm({
    message: "Run database migrations now?",
    initialValue: true,
  });
  if (isCancel(shouldMigrate)) {
    process.exit(0);
  }

  if (shouldMigrate) {
    const ms = spinner();
    ms.start("Pushing schema to database...");

    // Ensure DATABASE_URL + required placeholders are in .env so
    // drizzle.config.ts can load (it imports env.server.ts which
    // validates all required vars at import time)
    const envVars = readEnvFile(".env");
    envVars.DATABASE_URL = envVars.DATABASE_URL || databaseUrl;
    envVars.BETTER_AUTH_SECRET =
      envVars.BETTER_AUTH_SECRET || generateSecret();
    for (const [key, value] of Object.entries(ENV_PLACEHOLDERS)) {
      envVars[key] = envVars[key] || value;
    }
    writeEnvFile(".env", envVars);

    // Use --force to skip interactive confirmation prompts
    const migrateResult = await exec(
      "bun --env-file=.env drizzle-kit push --force"
    );

    if (migrateResult.exitCode !== 0) {
      ms.stop("Schema push failed");
      log.error(migrateResult.stderr);
      log.info("You can push later with: bun run db:push");
    } else {
      ms.stop("Schema pushed to database!");
    }
  }

  state.database = {
    provider: dbChoice as "instagres" | "own",
    migrated: shouldMigrate === true,
  };
  markPhaseCompleted(state, "database");
  await saveState(state);

  return state;
}
