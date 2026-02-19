# Getting Started CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive CLI wizard (`bunx start-template init`) that guides users through project setup with 5 phased steps, resume support, and dummy-safe defaults.

**Architecture:** Single `cli/` directory with `@clack/prompts` for UX. Phase router in `index.ts` dispatches to phase modules. State persisted in `.setup-state.json` for resume. Each phase is a standalone async function that reads/writes state.

**Tech Stack:** Bun, @clack/prompts, child_process (for `bunx get-db`), dotenv (for .env reading/writing)

---

### Task 1: Install Dependency + Scaffold CLI Directory

**Files:**
- Modify: `package.json` (add dep + bin entry)
- Create: `cli/index.ts`

**Step 1: Install @clack/prompts**

Run: `bun add @clack/prompts`

**Step 2: Add bin entry to package.json**

Add to the top level of `package.json`:

```json
"bin": {
  "start-template": "./cli/index.ts"
}
```

**Step 3: Create cli/index.ts stub**

Create `cli/index.ts`:

```ts
#!/usr/bin/env bun

import { intro, outro, log } from "@clack/prompts";

intro("Start Kit Setup");
log.info("CLI scaffold working!");
outro("Done");
```

**Step 4: Verify it runs**

Run: `bun ./cli/index.ts`

Expected: Shows "Start Kit Setup" header, "CLI scaffold working!", "Done".

---

### Task 2: State Management

**Files:**
- Create: `cli/lib/state.ts`

**Step 1: Create state module**

Create `cli/lib/state.ts`:

```ts
import { existsSync } from "node:fs";

const STATE_FILE = ".setup-state.json";

type Phase = "branding" | "features" | "database" | "env" | "infra";

type SetupState = {
  version: number;
  completedPhases: Phase[];
  branding?: {
    appName: string;
    description: string;
    domain: string;
  };
  features?: {
    stripe: boolean;
    ai: boolean;
    storage: boolean;
    redis: boolean;
    email: boolean;
  };
  database?: {
    provider: "instagres" | "own";
    migrated: boolean;
  };
  env?: {
    placeholders: string[];
    written: boolean;
  };
  infra?: {
    seaweedfs: boolean;
    redis: boolean;
  };
};

const DEFAULT_STATE: SetupState = {
  version: 1,
  completedPhases: [],
};

function getStatePath(): string {
  return `${process.cwd()}/${STATE_FILE}`;
}

export function loadState(): SetupState {
  const path = getStatePath();
  if (!existsSync(path)) {
    return { ...DEFAULT_STATE };
  }
  const raw = Bun.file(path);
  // Bun.file().json() is async, use readFileSync for simplicity
  const content = require("node:fs").readFileSync(path, "utf-8");
  return JSON.parse(content) as SetupState;
}

export async function saveState(state: SetupState): Promise<void> {
  await Bun.write(getStatePath(), JSON.stringify(state, null, 2));
}

export function isPhaseCompleted(state: SetupState, phase: Phase): boolean {
  return state.completedPhases.includes(phase);
}

export function markPhaseCompleted(state: SetupState, phase: Phase): SetupState {
  if (!state.completedPhases.includes(phase)) {
    state.completedPhases.push(phase);
  }
  return state;
}

export type { SetupState, Phase };
```

**Step 2: Verify it compiles**

Run: `bun build --no-bundle cli/lib/state.ts --outdir /tmp/cli-check 2>&1 | tail -5`

Expected: No errors.

---

### Task 3: Validators + Helpers

**Files:**
- Create: `cli/lib/validators.ts`
- Create: `cli/lib/helpers.ts`

**Step 1: Create validators**

Create `cli/lib/validators.ts`:

```ts
export function isValidDomain(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value);
}

export function isValidPostgresUrl(value: string): boolean {
  return value.startsWith("postgresql://") || value.startsWith("postgres://");
}

export function isValidRedisUrl(value: string): boolean {
  return value.startsWith("redis://") || value.startsWith("rediss://");
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidAppName(value: string): boolean {
  return value.length >= 2 && value.length <= 50;
}

export function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

**Step 2: Create helpers**

Create `cli/lib/helpers.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Update a JSON file's fields without losing formatting
 */
export function updateJsonFile(
  path: string,
  updates: Record<string, unknown>
): void {
  const content = readFileSync(path, "utf-8");
  const json = JSON.parse(content);
  for (const [key, value] of Object.entries(updates)) {
    json[key] = value;
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

/**
 * Update APP_CONFIG in app.config.ts
 */
export function updateAppConfig(
  path: string,
  name: string,
  description: string
): void {
  let content = readFileSync(path, "utf-8");
  content = content.replace(
    /name:\s*"[^"]*"/,
    `name: "${name}"`
  );
  content = content.replace(
    /description:\s*"[^"]*"/,
    `description: "${description}"`
  );
  writeFileSync(path, content);
}

/**
 * Write .env file from key-value pairs
 */
export function writeEnvFile(
  path: string,
  vars: Record<string, string>,
  comments?: Record<string, string>
): void {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(vars)) {
    if (comments?.[key]) {
      lines.push(`# ${comments[key]}`);
    }
    // Quote values with spaces
    const formatted = value.includes(" ") ? `"${value}"` : value;
    lines.push(`${key}=${formatted}`);
    lines.push("");
  }
  writeFileSync(path, lines.join("\n"));
}

/**
 * Read existing .env file into key-value pairs
 */
export function readEnvFile(path: string): Record<string, string> {
  try {
    const content = readFileSync(path, "utf-8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex);
          let value = trimmed.slice(eqIndex + 1);
          // Remove surrounding quotes
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          result[key] = value;
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Generate a random base64 secret
 */
export function generateSecret(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Run a shell command and return stdout
 */
export async function exec(
  command: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["sh", "-c", command], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

/**
 * Test a postgres connection
 */
export async function testDbConnection(
  url: string
): Promise<{ ok: boolean; error?: string; version?: string }> {
  try {
    const { SQL } = await import("bun");
    const sql = new SQL(url);
    const result = sql.query("SELECT version()").get() as { version: string };
    sql.close();
    return { ok: true, version: result.version };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
```

---

### Task 4: Phase 1 — Branding

**Files:**
- Create: `cli/phases/branding.ts`

**Step 1: Implement branding phase**

Create `cli/phases/branding.ts`:

```ts
import { text, log, spinner } from "@clack/prompts";
import { isCancel } from "@clack/prompts";

import { updateAppConfig, updateJsonFile } from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";
import { isValidAppName, isValidDomain, toKebabCase } from "../lib/validators";

export async function runBranding(state: SetupState): Promise<SetupState> {
  const appName = await text({
    message: "What's your app name?",
    placeholder: "My SaaS App",
    initialValue: state.branding?.appName,
    validate: (v) => {
      if (!isValidAppName(v)) return "Name must be 2-50 characters";
    },
  });
  if (isCancel(appName)) process.exit(0);

  const description = await text({
    message: "Short description?",
    placeholder: "A platform for managing widgets",
    initialValue: state.branding?.description,
  });
  if (isCancel(description)) process.exit(0);

  const domain = await text({
    message: "What's your domain? (for emails, auth origins)",
    placeholder: "mysaasapp.com",
    initialValue: state.branding?.domain,
    validate: (v) => {
      if (v && !isValidDomain(v)) return "Enter a valid domain (e.g. myapp.com)";
    },
  });
  if (isCancel(domain)) process.exit(0);

  const s = spinner();
  s.start("Updating files...");

  const kebabName = toKebabCase(appName);

  // Update package.json
  updateJsonFile("package.json", { name: kebabName });

  // Update app.config.ts
  updateAppConfig(
    "src/lib/config/app.config.ts",
    appName,
    description
  );

  s.stop("Files updated");

  log.success(`package.json → name: "${kebabName}"`);
  log.success(`app.config.ts → name: "${appName}"`);

  state.branding = { appName, description, domain: domain || "" };
  markPhaseCompleted(state, "branding");
  await saveState(state);

  return state;
}
```

---

### Task 5: Phase 2 — Features

**Files:**
- Create: `cli/phases/features.ts`

**Step 1: Implement features phase**

Create `cli/phases/features.ts`:

```ts
import { multiselect, log } from "@clack/prompts";
import { isCancel } from "@clack/prompts";

import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";

const FEATURE_OPTIONS = [
  { value: "stripe", label: "Stripe", hint: "payments & subscriptions" },
  { value: "ai", label: "AI Chat", hint: "OpenAI / Anthropic / Gemini" },
  { value: "storage", label: "Storage", hint: "S3 / SeaweedFS / R2 / Minio" },
  { value: "redis", label: "Redis", hint: "resumable chat streams" },
  { value: "email", label: "Email", hint: "Resend — transactional emails" },
] as const;

export async function runFeatures(state: SetupState): Promise<SetupState> {
  const selected = await multiselect({
    message: "Which features do you want to enable?",
    options: FEATURE_OPTIONS.map((f) => ({
      value: f.value,
      label: `${f.label} (${f.hint})`,
    })),
    initialValues: state.features
      ? Object.entries(state.features)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [],
    required: false,
  });
  if (isCancel(selected)) process.exit(0);

  const features = {
    stripe: selected.includes("stripe"),
    ai: selected.includes("ai"),
    storage: selected.includes("storage"),
    redis: selected.includes("redis"),
    email: selected.includes("email"),
  };

  const enabled = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (enabled.length > 0) {
    log.success(`Enabled: ${enabled.join(", ")}`);
  } else {
    log.info("No optional features selected — core app only");
  }

  state.features = features;
  markPhaseCompleted(state, "features");
  await saveState(state);

  return state;
}
```

---

### Task 6: Phase 3 — Database

**Files:**
- Create: `cli/phases/database.ts`

**Step 1: Implement database phase**

Create `cli/phases/database.ts`:

```ts
import { select, text, confirm, log, spinner } from "@clack/prompts";
import { isCancel } from "@clack/prompts";

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
  if (isCancel(dbChoice)) process.exit(0);

  let databaseUrl: string;

  if (dbChoice === "instagres") {
    const s = spinner();
    s.start("Creating instant Neon database via Instagres...");

    const result = await exec("bunx get-db --yes --env .env --key DATABASE_URL");

    if (result.exitCode !== 0) {
      s.stop("Failed to create database");
      log.error(`get-db failed: ${result.stderr}`);
      log.info("You can try manually: npx get-db --yes");
      log.info("Or provide your own DATABASE_URL and re-run: bunx start-template init --step database");
      process.exit(1);
    }

    s.stop("Database created!");

    // Read the URL that get-db wrote to .env
    const envVars = readEnvFile(".env");
    databaseUrl = envVars.DATABASE_URL ?? "";

    if (!databaseUrl) {
      log.error("DATABASE_URL not found in .env after get-db. Check .env manually.");
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
    if (isCancel(url)) process.exit(0);
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

  s.stop(`Connected to PostgreSQL`);

  // Run migrations
  const shouldMigrate = await confirm({
    message: "Run database migrations now?",
    initialValue: true,
  });
  if (isCancel(shouldMigrate)) process.exit(0);

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
```

---

### Task 7: Phase 4 — Environment

**Files:**
- Create: `cli/phases/env.ts`
- Create: `cli/templates/env.template.ts`

**Step 1: Create env template generator**

Create `cli/templates/env.template.ts`:

```ts
type FeatureFlags = {
  stripe: boolean;
  ai: boolean;
  storage: boolean;
  redis: boolean;
  email: boolean;
};

type EnvVarDef = {
  key: string;
  comment?: string;
  required: boolean;
  feature?: keyof FeatureFlags;
};

/**
 * All env vars grouped by category.
 * Only vars whose feature is enabled (or has no feature) are included.
 */
export function getEnvVarDefs(features: FeatureFlags): EnvVarDef[] {
  const defs: EnvVarDef[] = [
    // Core (always)
    { key: "BETTER_AUTH_SECRET", required: true },
    { key: "BETTER_AUTH_BASE_URL", required: true },
    { key: "VITE_BETTER_AUTH_BASE_URL", required: true },
    { key: "BETTER_AUTH_TRUSTED_ORIGINS", comment: "Optional comma-separated extra origins", required: false },

    // Email
    { key: "RESEND_API_KEY", required: true, feature: "email" },
    { key: "RESEND_FROM_EMAIL", required: false, feature: "email" },

    // AI
    { key: "OPENAI_API_KEY", required: false, feature: "ai" },
    { key: "ANTHROPIC_API_KEY", required: false, feature: "ai" },

    // Stripe
    { key: "STRIPE_SECRET_KEY", required: false, feature: "stripe" },
    { key: "STRIPE_WEBHOOK_SECRET", required: false, feature: "stripe" },
    { key: "STRIPE_PUBLISHABLE_KEY", required: false, feature: "stripe" },
    { key: "VITE_STRIPE_ENABLED", required: false, feature: "stripe" },

    // Storage
    { key: "STORAGE_PROVIDER", required: true, feature: "storage" },
    { key: "S3_ACCESS_KEY_ID", required: true, feature: "storage" },
    { key: "S3_SECRET_ACCESS_KEY", required: true, feature: "storage" },
    { key: "S3_BUCKET", required: true, feature: "storage" },
    { key: "S3_REGION", required: false, feature: "storage" },
    { key: "S3_ENDPOINT", required: false, feature: "storage" },

    // Redis
    { key: "REDIS_URL", comment: "Optional - for resumable chat streams", required: false, feature: "redis" },
  ];

  return defs.filter((d) => !d.feature || features[d.feature]);
}
```

**Step 2: Implement env phase**

Create `cli/phases/env.ts`:

```ts
import { text, select, log, spinner } from "@clack/prompts";
import { isCancel } from "@clack/prompts";

import {
  generateSecret,
  readEnvFile,
  writeEnvFile,
} from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";
import { getEnvVarDefs } from "../templates/env.template";

const DUMMY_VALUES: Record<string, string> = {
  RESEND_API_KEY: "re_dummy_replace_me",
  S3_ACCESS_KEY_ID: "dummy_replace_me",
  S3_SECRET_ACCESS_KEY: "dummy_replace_me",
  S3_BUCKET: "dummy-bucket",
};

export async function runEnv(state: SetupState): Promise<SetupState> {
  const features = state.features ?? {
    stripe: false,
    ai: false,
    storage: false,
    redis: false,
    email: false,
  };

  // Read existing .env (may have DATABASE_URL from Phase 3)
  const existing = readEnvFile(".env");
  const envVars: Record<string, string> = { ...existing };
  const placeholders: string[] = [];

  // --- Core vars (always set) ---

  // BETTER_AUTH_SECRET
  if (!envVars.BETTER_AUTH_SECRET || envVars.BETTER_AUTH_SECRET.includes("haha")) {
    const secret = generateSecret();
    envVars.BETTER_AUTH_SECRET = secret;
    log.success("BETTER_AUTH_SECRET — auto-generated");
  } else {
    log.info("BETTER_AUTH_SECRET — keeping existing value");
  }

  // BETTER_AUTH_BASE_URL
  envVars.BETTER_AUTH_BASE_URL = envVars.BETTER_AUTH_BASE_URL ?? "http://localhost:3000";
  envVars.VITE_BETTER_AUTH_BASE_URL = envVars.VITE_BETTER_AUTH_BASE_URL ?? "http://localhost:3000";

  // --- Email (Resend) ---
  if (features.email) {
    const resendKey = await text({
      message: "RESEND_API_KEY (get one at resend.com, or Enter for placeholder):",
      placeholder: "re_xxxxxxxxxxxx",
      initialValue: envVars.RESEND_API_KEY,
    });
    if (isCancel(resendKey)) process.exit(0);

    if (!resendKey || resendKey === DUMMY_VALUES.RESEND_API_KEY) {
      envVars.RESEND_API_KEY = DUMMY_VALUES.RESEND_API_KEY;
      placeholders.push("RESEND_API_KEY");
      log.warn("Using placeholder — emails will fail until you add a real key");
    } else {
      envVars.RESEND_API_KEY = resendKey;
    }

    // Set from email using branding domain
    const domain = state.branding?.domain ?? "yourdomain.com";
    const appName = state.branding?.appName ?? "App";
    envVars.RESEND_FROM_EMAIL = envVars.RESEND_FROM_EMAIL ?? `${appName} <noreply@${domain}>`;
  } else {
    // Email is required by Zod, use dummy
    envVars.RESEND_API_KEY = envVars.RESEND_API_KEY ?? DUMMY_VALUES.RESEND_API_KEY;
    if (envVars.RESEND_API_KEY === DUMMY_VALUES.RESEND_API_KEY) {
      placeholders.push("RESEND_API_KEY");
    }
  }

  // --- Storage ---
  if (features.storage) {
    const storageChoice = await select({
      message: "Do you have S3-compatible storage credentials?",
      options: [
        { value: "dummy", label: "No, use placeholder values", hint: "storage calls will fail gracefully" },
        { value: "credentials", label: "Yes, I have credentials (S3, R2, Minio, etc.)" },
        { value: "seaweedfs", label: "Start SeaweedFS via Docker (local S3)" },
      ],
    });
    if (isCancel(storageChoice)) process.exit(0);

    if (storageChoice === "credentials") {
      const accessKey = await text({ message: "S3_ACCESS_KEY_ID:", initialValue: envVars.S3_ACCESS_KEY_ID });
      if (isCancel(accessKey)) process.exit(0);
      envVars.S3_ACCESS_KEY_ID = accessKey;

      const secretKey = await text({ message: "S3_SECRET_ACCESS_KEY:", initialValue: envVars.S3_SECRET_ACCESS_KEY });
      if (isCancel(secretKey)) process.exit(0);
      envVars.S3_SECRET_ACCESS_KEY = secretKey;

      const bucket = await text({ message: "S3_BUCKET:", initialValue: envVars.S3_BUCKET ?? "app-assets" });
      if (isCancel(bucket)) process.exit(0);
      envVars.S3_BUCKET = bucket;

      const endpoint = await text({ message: "S3_ENDPOINT (optional, Enter to skip):", initialValue: envVars.S3_ENDPOINT });
      if (isCancel(endpoint)) process.exit(0);
      if (endpoint) envVars.S3_ENDPOINT = endpoint;

      envVars.S3_REGION = envVars.S3_REGION ?? "us-east-1";
      envVars.STORAGE_PROVIDER = envVars.STORAGE_PROVIDER ?? "s3";
    } else if (storageChoice === "seaweedfs") {
      envVars.STORAGE_PROVIDER = "seaweedfs";
      envVars.S3_ENDPOINT = "http://localhost:8333";
      envVars.S3_ACCESS_KEY_ID = "minioadmin";
      envVars.S3_SECRET_ACCESS_KEY = "minioadmin";
      envVars.S3_BUCKET = "app-assets";
      envVars.S3_REGION = "us-east-1";
      // Mark for Phase 5 to start Docker
      if (state.infra) {
        state.infra.seaweedfs = true;
      } else {
        state.infra = { seaweedfs: true, redis: false };
      }
    } else {
      envVars.STORAGE_PROVIDER = envVars.STORAGE_PROVIDER ?? "s3";
      envVars.S3_ACCESS_KEY_ID = DUMMY_VALUES.S3_ACCESS_KEY_ID;
      envVars.S3_SECRET_ACCESS_KEY = DUMMY_VALUES.S3_SECRET_ACCESS_KEY;
      envVars.S3_BUCKET = DUMMY_VALUES.S3_BUCKET;
      envVars.S3_REGION = "us-east-1";
      placeholders.push("S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET");
      log.warn("Using placeholders — file uploads will fail until configured");
    }
  } else {
    // Storage is required by Zod, use dummy
    envVars.STORAGE_PROVIDER = envVars.STORAGE_PROVIDER ?? "s3";
    envVars.S3_ACCESS_KEY_ID = envVars.S3_ACCESS_KEY_ID ?? DUMMY_VALUES.S3_ACCESS_KEY_ID;
    envVars.S3_SECRET_ACCESS_KEY = envVars.S3_SECRET_ACCESS_KEY ?? DUMMY_VALUES.S3_SECRET_ACCESS_KEY;
    envVars.S3_BUCKET = envVars.S3_BUCKET ?? DUMMY_VALUES.S3_BUCKET;
    envVars.S3_REGION = envVars.S3_REGION ?? "us-east-1";
    if (envVars.S3_ACCESS_KEY_ID === DUMMY_VALUES.S3_ACCESS_KEY_ID) {
      placeholders.push("S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET");
    }
  }

  // --- Stripe ---
  if (features.stripe) {
    const stripeSecret = await text({
      message: "STRIPE_SECRET_KEY (Enter to skip):",
      placeholder: "sk_test_xxxxx",
      initialValue: envVars.STRIPE_SECRET_KEY,
    });
    if (isCancel(stripeSecret)) process.exit(0);

    if (stripeSecret) {
      envVars.STRIPE_SECRET_KEY = stripeSecret;

      const webhookSecret = await text({
        message: "STRIPE_WEBHOOK_SECRET:",
        placeholder: "whsec_xxxxx",
        initialValue: envVars.STRIPE_WEBHOOK_SECRET,
      });
      if (isCancel(webhookSecret)) process.exit(0);
      if (webhookSecret) envVars.STRIPE_WEBHOOK_SECRET = webhookSecret;

      const publishableKey = await text({
        message: "STRIPE_PUBLISHABLE_KEY (for client):",
        placeholder: "pk_test_xxxxx",
        initialValue: envVars.STRIPE_PUBLISHABLE_KEY,
      });
      if (isCancel(publishableKey)) process.exit(0);
      if (publishableKey) {
        envVars.STRIPE_PUBLISHABLE_KEY = publishableKey;
        envVars.VITE_STRIPE_ENABLED = "true";
      }
    } else {
      log.info("Stripe skipped — payments feature will be disabled");
    }
  }

  // --- AI ---
  if (features.ai) {
    const openai = await text({
      message: "OpenAI API key (optional, Enter to skip):",
      placeholder: "sk-proj-xxxxx",
      initialValue: envVars.OPENAI_API_KEY,
    });
    if (isCancel(openai)) process.exit(0);
    if (openai) envVars.OPENAI_API_KEY = openai;

    const anthropic = await text({
      message: "Anthropic API key (optional, Enter to skip):",
      initialValue: envVars.ANTHROPIC_API_KEY,
    });
    if (isCancel(anthropic)) process.exit(0);
    if (anthropic) envVars.ANTHROPIC_API_KEY = anthropic;
  }

  // --- Redis ---
  if (features.redis) {
    const redisChoice = await select({
      message: "Do you have an external Redis?",
      options: [
        { value: "skip", label: "No, skip", hint: "chat won't have resumable streams" },
        { value: "url", label: "Yes, I have a Redis URL" },
        { value: "docker", label: "Start Redis via Docker" },
      ],
    });
    if (isCancel(redisChoice)) process.exit(0);

    if (redisChoice === "url") {
      const redisUrl = await text({
        message: "REDIS_URL:",
        placeholder: "redis://localhost:6379",
        initialValue: envVars.REDIS_URL,
      });
      if (isCancel(redisUrl)) process.exit(0);
      if (redisUrl) envVars.REDIS_URL = redisUrl;
    } else if (redisChoice === "docker") {
      envVars.REDIS_URL = "redis://localhost:6379";
      if (state.infra) {
        state.infra.redis = true;
      } else {
        state.infra = { seaweedfs: false, redis: true };
      }
    }
  }

  // --- Write .env ---
  const s = spinner();
  s.start("Writing .env file...");
  writeEnvFile(".env", envVars);
  s.stop(`.env written (${Object.keys(envVars).length} variables)`);

  if (placeholders.length > 0) {
    log.warn(`${placeholders.length} placeholders need real values later:`);
    for (const p of placeholders) {
      log.warn(`  • ${p}`);
    }
  }

  state.env = { placeholders, written: true };
  markPhaseCompleted(state, "env");
  await saveState(state);

  return state;
}
```

---

### Task 8: Phase 5 — Infrastructure

**Files:**
- Create: `cli/phases/infra.ts`

**Step 1: Implement infra phase**

Create `cli/phases/infra.ts`:

```ts
import { log, spinner } from "@clack/prompts";

import { exec, readEnvFile, testDbConnection } from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";

export async function runInfra(state: SetupState): Promise<SetupState> {
  const needsSeaweedfs = state.infra?.seaweedfs ?? false;
  const needsRedis = state.infra?.redis ?? false;

  if (!needsSeaweedfs && !needsRedis) {
    log.info("No Docker services needed!");
    log.info("Your setup uses external services or placeholders.");
  } else {
    // Start Docker services
    if (needsSeaweedfs) {
      const s = spinner();
      s.start("Starting SeaweedFS (local S3)...");
      const result = await exec("docker compose up -d seaweedfs");
      if (result.exitCode !== 0) {
        s.stop("Failed to start SeaweedFS");
        log.error(result.stderr);
        log.info("Make sure Docker is running, then try: docker compose up -d seaweedfs");
      } else {
        s.stop("SeaweedFS running on localhost:8333");
      }
    }

    if (needsRedis) {
      const s = spinner();
      s.start("Starting Redis...");
      const result = await exec("docker compose up -d redis");
      if (result.exitCode !== 0) {
        s.stop("Failed to start Redis");
        log.error(result.stderr);
        log.info("Make sure Docker is running, then try: docker compose up -d redis");
      } else {
        s.stop("Redis running on localhost:6379");
      }
    }
  }

  // Final health checks
  const checks = spinner();
  checks.start("Running final checks...");

  const envVars = readEnvFile(".env");
  const results: string[] = [];

  // DB check
  if (envVars.DATABASE_URL) {
    const db = await testDbConnection(envVars.DATABASE_URL);
    results.push(db.ok ? "Database — connected" : `Database — failed: ${db.error}`);
  }

  // Redis check (if configured)
  if (envVars.REDIS_URL) {
    try {
      const { RedisClient } = await import("bun");
      const redis = new RedisClient(envVars.REDIS_URL);
      await redis.connect();
      await redis.disconnect();
      results.push("Redis — connected");
    } catch {
      results.push("Redis — not reachable (will use fallback)");
    }
  }

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
```

---

### Task 9: Main Entry Point — Phase Router

**Files:**
- Modify: `cli/index.ts` (replace stub)

**Step 1: Implement the phase router**

Replace `cli/index.ts` with:

```ts
#!/usr/bin/env bun

import { intro, outro, select, log } from "@clack/prompts";
import { isCancel } from "@clack/prompts";

import { runBranding } from "./phases/branding";
import { runDatabase } from "./phases/database";
import { runEnv } from "./phases/env";
import { runFeatures } from "./phases/features";
import { runInfra } from "./phases/infra";
import { isPhaseCompleted, loadState, type Phase } from "./lib/state";

const PHASES: { key: Phase; label: string; run: (state: ReturnType<typeof loadState>) => Promise<ReturnType<typeof loadState>> }[] = [
  { key: "branding", label: "Branding", run: runBranding },
  { key: "features", label: "Features", run: runFeatures },
  { key: "database", label: "Database", run: runDatabase },
  { key: "env", label: "Environment", run: runEnv },
  { key: "infra", label: "Infrastructure", run: runInfra },
];

async function main() {
  const args = process.argv.slice(2);
  const command = args.at(0);

  if (command !== "init") {
    console.log("Usage: bunx start-template init [--step <phase>]");
    console.log("Phases: branding, features, database, env, infra");
    process.exit(0);
  }

  // Check for --step flag
  const stepIndex = args.indexOf("--step");
  const targetStep = stepIndex >= 0 ? (args.at(stepIndex + 1) as Phase) : undefined;

  intro("Start Kit Setup");

  let state = loadState();

  // Single phase mode
  if (targetStep) {
    const phase = PHASES.find((p) => p.key === targetStep);
    if (!phase) {
      log.error(`Unknown phase: ${targetStep}`);
      log.info(`Available: ${PHASES.map((p) => p.key).join(", ")}`);
      process.exit(1);
    }
    state = await phase.run(state);
    outro(`Phase "${phase.label}" complete!`);
    return;
  }

  // Full wizard mode
  const hasProgress = state.completedPhases.length > 0;

  // Show status
  for (const phase of PHASES) {
    const done = isPhaseCompleted(state, phase.key);
    const icon = done ? "\u2713" : "\u25CB";
    log.info(`${icon} ${phase.label}${done ? " (completed)" : ""}`);
  }

  let startFrom = 0;

  if (hasProgress) {
    const firstIncomplete = PHASES.findIndex(
      (p) => !isPhaseCompleted(state, p.key)
    );

    const choice = await select({
      message: "What would you like to do?",
      options: [
        ...(firstIncomplete >= 0
          ? [
              {
                value: "continue",
                label: `Continue from ${PHASES[firstIncomplete].label}`,
              },
            ]
          : []),
        { value: "start-over", label: "Start over" },
        { value: "jump", label: "Jump to a specific phase" },
      ],
    });
    if (isCancel(choice)) process.exit(0);

    if (choice === "continue") {
      startFrom = firstIncomplete;
    } else if (choice === "start-over") {
      state = { version: 1, completedPhases: [] };
      startFrom = 0;
    } else {
      const jumpTo = await select({
        message: "Which phase?",
        options: PHASES.map((p, i) => ({
          value: i,
          label: p.label,
          hint: isPhaseCompleted(state, p.key) ? "completed" : undefined,
        })),
      });
      if (isCancel(jumpTo)) process.exit(0);
      startFrom = jumpTo as number;
    }
  }

  // Run phases sequentially
  for (let i = startFrom; i < PHASES.length; i++) {
    const phase = PHASES[i];
    log.step(`Phase ${i + 1}/${PHASES.length}: ${phase.label}`);
    state = await phase.run(state);
  }

  outro("Setup complete! Run `bun dev` to start your app.");
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
```

---

### Task 10: End-to-End Test

**Step 1: Verify CLI runs**

Run: `bun ./cli/index.ts init --step branding`

Expected: Shows branding prompts, writes to package.json and app.config.ts.

**Step 2: Verify full wizard**

Run: `bun ./cli/index.ts init`

Expected: Shows all 5 phases sequentially with progress indicators.

**Step 3: Verify resume**

Run `bun ./cli/index.ts init` again after completing some phases.

Expected: Detects `.setup-state.json`, offers to continue from where you left off.

**Step 4: Verify bin entry works**

Run: `bunx ./cli/index.ts init`

Expected: Same behavior as `bun ./cli/index.ts init`.

---
