import { log, spinner } from "@clack/prompts";

import { exec, readEnvFile, testDbConnection } from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";

async function startDockerService(
  name: string,
  service: string,
  successMsg: string
): Promise<void> {
  const s = spinner();
  s.start(`Starting ${name}...`);
  const result = await exec(`docker compose up -d ${service}`);
  if (result.exitCode !== 0) {
    s.stop(`Failed to start ${name}`);
    log.error(result.stderr);
    log.info(
      `Make sure Docker is running, then try: docker compose up -d ${service}`
    );
  } else {
    s.stop(successMsg);
  }
}

async function checkDatabase(
  envVars: Record<string, string>
): Promise<string | undefined> {
  if (!envVars.DATABASE_URL) {
    return undefined;
  }
  const db = await testDbConnection(envVars.DATABASE_URL);
  return db.ok ? "Database — connected" : `Database — failed: ${db.error}`;
}

async function checkRedis(
  envVars: Record<string, string>
): Promise<string | undefined> {
  if (!envVars.REDIS_URL) {
    return undefined;
  }
  try {
    const { RedisClient } = await import("bun");
    const redis = new RedisClient(envVars.REDIS_URL);
    await redis.connect();
    await redis.disconnect();
    return "Redis — connected";
  } catch {
    return "Redis — not reachable (will use fallback)";
  }
}

export async function runInfra(state: SetupState): Promise<SetupState> {
  const needsSeaweedfs = state.infra?.seaweedfs ?? false;
  const needsRedis = state.infra?.redis ?? false;

  if (needsSeaweedfs || needsRedis) {
    if (needsSeaweedfs) {
      await startDockerService(
        "SeaweedFS (local S3)",
        "seaweedfs",
        "SeaweedFS running on localhost:8333"
      );
    }
    if (needsRedis) {
      await startDockerService(
        "Redis",
        "redis",
        "Redis running on localhost:6379"
      );
    }
  } else {
    log.info("No Docker services needed!");
    log.info("Your setup uses external services or placeholders.");
  }

  // Final health checks
  const checks = spinner();
  checks.start("Running final checks...");

  const envVars = readEnvFile(".env");
  const results = (
    await Promise.all([checkDatabase(envVars), checkRedis(envVars)])
  ).filter((r): r is string => r !== undefined);

  checks.stop("Health checks complete");

  for (const r of results) {
    if (r.includes("failed") || r.includes("not reachable")) {
      log.warn(r);
    } else {
      log.success(r);
    }
  }

  markPhaseCompleted(state, "infra");
  await saveState(state);

  return state;
}
