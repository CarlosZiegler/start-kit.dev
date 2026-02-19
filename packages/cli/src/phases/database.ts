import { confirm, isCancel, log, select, spinner, text } from "@clack/prompts";

import {
  exec,
  readEnvFile,
  testDbConnection,
  writeEnvFile,
} from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";
import { isValidPostgresUrl } from "../lib/validators";

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
        "Or provide your own DATABASE_URL and re-run: bunx @start-kit/cli init --step database"
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
      validate: (v) => {
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
    ms.start("Running migrations...");

    // Ensure DATABASE_URL is in .env for drizzle-kit
    const envVars = readEnvFile(".env");
    if (!envVars.DATABASE_URL) {
      envVars.DATABASE_URL = databaseUrl;
      writeEnvFile(".env", envVars);
    }

    const migrateResult = await exec("bun run db:push");

    if (migrateResult.exitCode !== 0) {
      ms.stop("Migration failed");
      log.error(migrateResult.stderr);
      log.info("You can run migrations later with: bun run db:push");
    } else {
      ms.stop("Migrations applied!");
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
