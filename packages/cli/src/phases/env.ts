import { isCancel, log, select, spinner, text } from "@clack/prompts";

import { generateSecret, readEnvFile, writeEnvFile } from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";

const DUMMY_VALUES: Record<string, string> = {
  RESEND_API_KEY: "re_dummy_replace_me",
  S3_ACCESS_KEY_ID: "dummy_replace_me",
  S3_SECRET_ACCESS_KEY: "dummy_replace_me",
  S3_BUCKET: "dummy-bucket",
};

type EnvContext = {
  envVars: Record<string, string>;
  placeholders: string[];
  state: SetupState;
};

function setupCoreVars(ctx: EnvContext): void {
  if (
    !ctx.envVars.BETTER_AUTH_SECRET ||
    ctx.envVars.BETTER_AUTH_SECRET.includes("haha")
  ) {
    ctx.envVars.BETTER_AUTH_SECRET = generateSecret();
    log.success("BETTER_AUTH_SECRET — auto-generated");
  } else {
    log.info("BETTER_AUTH_SECRET — keeping existing value");
  }

  ctx.envVars.BETTER_AUTH_BASE_URL =
    ctx.envVars.BETTER_AUTH_BASE_URL ?? "http://localhost:3000";
  ctx.envVars.VITE_BETTER_AUTH_BASE_URL =
    ctx.envVars.VITE_BETTER_AUTH_BASE_URL ?? "http://localhost:3000";
}

async function setupEmail(ctx: EnvContext, enabled: boolean): Promise<void> {
  if (enabled) {
    const resendKey = await text({
      message:
        "RESEND_API_KEY (get one at resend.com, or Enter for placeholder):",
      placeholder: "re_xxxxxxxxxxxx",
      initialValue: ctx.envVars.RESEND_API_KEY,
    });
    if (isCancel(resendKey)) {
      process.exit(0);
    }

    if (!resendKey || resendKey === DUMMY_VALUES.RESEND_API_KEY) {
      ctx.envVars.RESEND_API_KEY = DUMMY_VALUES.RESEND_API_KEY;
      ctx.placeholders.push("RESEND_API_KEY");
      log.warn("Using placeholder — emails will fail until you add a real key");
    } else {
      ctx.envVars.RESEND_API_KEY = resendKey;
    }

    const domain = ctx.state.branding?.domain ?? "yourdomain.com";
    const appName = ctx.state.branding?.appName ?? "App";
    ctx.envVars.RESEND_FROM_EMAIL =
      ctx.envVars.RESEND_FROM_EMAIL ?? `${appName} <noreply@${domain}>`;
    return;
  }

  ctx.envVars.RESEND_API_KEY =
    ctx.envVars.RESEND_API_KEY ?? DUMMY_VALUES.RESEND_API_KEY;
  if (ctx.envVars.RESEND_API_KEY === DUMMY_VALUES.RESEND_API_KEY) {
    ctx.placeholders.push("RESEND_API_KEY");
  }
}

async function setupStorageCredentials(ctx: EnvContext): Promise<void> {
  const accessKey = await text({
    message: "S3_ACCESS_KEY_ID:",
    initialValue: ctx.envVars.S3_ACCESS_KEY_ID,
  });
  if (isCancel(accessKey)) {
    process.exit(0);
  }
  ctx.envVars.S3_ACCESS_KEY_ID = accessKey;

  const secretKey = await text({
    message: "S3_SECRET_ACCESS_KEY:",
    initialValue: ctx.envVars.S3_SECRET_ACCESS_KEY,
  });
  if (isCancel(secretKey)) {
    process.exit(0);
  }
  ctx.envVars.S3_SECRET_ACCESS_KEY = secretKey;

  const bucket = await text({
    message: "S3_BUCKET:",
    initialValue: ctx.envVars.S3_BUCKET ?? "app-assets",
  });
  if (isCancel(bucket)) {
    process.exit(0);
  }
  ctx.envVars.S3_BUCKET = bucket;

  const endpoint = await text({
    message: "S3_ENDPOINT (optional, Enter to skip):",
    initialValue: ctx.envVars.S3_ENDPOINT,
  });
  if (isCancel(endpoint)) {
    process.exit(0);
  }
  if (endpoint) {
    ctx.envVars.S3_ENDPOINT = endpoint;
  }

  ctx.envVars.S3_REGION = ctx.envVars.S3_REGION ?? "us-east-1";
  ctx.envVars.STORAGE_PROVIDER = ctx.envVars.STORAGE_PROVIDER ?? "s3";
}

function setSeaweedfsDefaults(ctx: EnvContext): void {
  ctx.envVars.STORAGE_PROVIDER = "seaweedfs";
  ctx.envVars.S3_ENDPOINT = "http://localhost:8333";
  ctx.envVars.S3_ACCESS_KEY_ID = "minioadmin";
  ctx.envVars.S3_SECRET_ACCESS_KEY = "minioadmin";
  ctx.envVars.S3_BUCKET = "app-assets";
  ctx.envVars.S3_REGION = "us-east-1";
  if (ctx.state.infra) {
    ctx.state.infra.seaweedfs = true;
  } else {
    ctx.state.infra = { seaweedfs: true, redis: false };
  }
}

function setStorageDummies(ctx: EnvContext): void {
  ctx.envVars.STORAGE_PROVIDER = ctx.envVars.STORAGE_PROVIDER ?? "s3";
  ctx.envVars.S3_ACCESS_KEY_ID = DUMMY_VALUES.S3_ACCESS_KEY_ID;
  ctx.envVars.S3_SECRET_ACCESS_KEY = DUMMY_VALUES.S3_SECRET_ACCESS_KEY;
  ctx.envVars.S3_BUCKET = DUMMY_VALUES.S3_BUCKET;
  ctx.envVars.S3_REGION = "us-east-1";
  ctx.placeholders.push(
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_BUCKET"
  );
  log.warn("Using placeholders — file uploads will fail until configured");
}

async function setupStorage(ctx: EnvContext, enabled: boolean): Promise<void> {
  if (!enabled) {
    ctx.envVars.STORAGE_PROVIDER = ctx.envVars.STORAGE_PROVIDER ?? "s3";
    ctx.envVars.S3_ACCESS_KEY_ID =
      ctx.envVars.S3_ACCESS_KEY_ID ?? DUMMY_VALUES.S3_ACCESS_KEY_ID;
    ctx.envVars.S3_SECRET_ACCESS_KEY =
      ctx.envVars.S3_SECRET_ACCESS_KEY ?? DUMMY_VALUES.S3_SECRET_ACCESS_KEY;
    ctx.envVars.S3_BUCKET = ctx.envVars.S3_BUCKET ?? DUMMY_VALUES.S3_BUCKET;
    ctx.envVars.S3_REGION = ctx.envVars.S3_REGION ?? "us-east-1";
    if (ctx.envVars.S3_ACCESS_KEY_ID === DUMMY_VALUES.S3_ACCESS_KEY_ID) {
      ctx.placeholders.push(
        "S3_ACCESS_KEY_ID",
        "S3_SECRET_ACCESS_KEY",
        "S3_BUCKET"
      );
    }
    return;
  }

  const storageChoice = await select({
    message: "Do you have S3-compatible storage credentials?",
    options: [
      {
        value: "dummy",
        label: "No, use placeholder values",
        hint: "storage calls will fail gracefully",
      },
      {
        value: "credentials",
        label: "Yes, I have credentials (S3, R2, Minio, etc.)",
      },
      { value: "seaweedfs", label: "Start SeaweedFS via Docker (local S3)" },
    ],
  });
  if (isCancel(storageChoice)) {
    process.exit(0);
  }

  if (storageChoice === "credentials") {
    await setupStorageCredentials(ctx);
  } else if (storageChoice === "seaweedfs") {
    setSeaweedfsDefaults(ctx);
  } else {
    setStorageDummies(ctx);
  }
}

async function setupStripe(ctx: EnvContext): Promise<void> {
  const stripeSecret = await text({
    message: "STRIPE_SECRET_KEY (Enter to skip):",
    placeholder: "sk_test_xxxxx",
    initialValue: ctx.envVars.STRIPE_SECRET_KEY,
  });
  if (isCancel(stripeSecret)) {
    process.exit(0);
  }

  if (!stripeSecret) {
    log.info("Stripe skipped — payments feature will be disabled");
    return;
  }

  ctx.envVars.STRIPE_SECRET_KEY = stripeSecret;

  const webhookSecret = await text({
    message: "STRIPE_WEBHOOK_SECRET:",
    placeholder: "whsec_xxxxx",
    initialValue: ctx.envVars.STRIPE_WEBHOOK_SECRET,
  });
  if (isCancel(webhookSecret)) {
    process.exit(0);
  }
  if (webhookSecret) {
    ctx.envVars.STRIPE_WEBHOOK_SECRET = webhookSecret;
  }

  const publishableKey = await text({
    message: "STRIPE_PUBLISHABLE_KEY (for client):",
    placeholder: "pk_test_xxxxx",
    initialValue: ctx.envVars.STRIPE_PUBLISHABLE_KEY,
  });
  if (isCancel(publishableKey)) {
    process.exit(0);
  }
  if (publishableKey) {
    ctx.envVars.STRIPE_PUBLISHABLE_KEY = publishableKey;
    ctx.envVars.VITE_STRIPE_ENABLED = "true";
  }
}

async function setupAI(ctx: EnvContext): Promise<void> {
  const openai = await text({
    message: "OpenAI API key (optional, Enter to skip):",
    placeholder: "sk-proj-xxxxx",
    initialValue: ctx.envVars.OPENAI_API_KEY,
  });
  if (isCancel(openai)) {
    process.exit(0);
  }
  if (openai) {
    ctx.envVars.OPENAI_API_KEY = openai;
  }

  const anthropic = await text({
    message: "Anthropic API key (optional, Enter to skip):",
    initialValue: ctx.envVars.ANTHROPIC_API_KEY,
  });
  if (isCancel(anthropic)) {
    process.exit(0);
  }
  if (anthropic) {
    ctx.envVars.ANTHROPIC_API_KEY = anthropic;
  }
}

async function setupRedis(ctx: EnvContext): Promise<void> {
  const redisChoice = await select({
    message: "Do you have an external Redis?",
    options: [
      {
        value: "skip",
        label: "No, skip",
        hint: "chat won't have resumable streams",
      },
      { value: "url", label: "Yes, I have a Redis URL" },
      { value: "docker", label: "Start Redis via Docker" },
    ],
  });
  if (isCancel(redisChoice)) {
    process.exit(0);
  }

  if (redisChoice === "url") {
    const redisUrl = await text({
      message: "REDIS_URL:",
      placeholder: "redis://localhost:6379",
      initialValue: ctx.envVars.REDIS_URL,
    });
    if (isCancel(redisUrl)) {
      process.exit(0);
    }
    if (redisUrl) {
      ctx.envVars.REDIS_URL = redisUrl;
    }
  } else if (redisChoice === "docker") {
    ctx.envVars.REDIS_URL = "redis://localhost:6379";
    if (ctx.state.infra) {
      ctx.state.infra.redis = true;
    } else {
      ctx.state.infra = { seaweedfs: false, redis: true };
    }
  }
}

export async function runEnv(state: SetupState): Promise<SetupState> {
  const features = state.features ?? {
    stripe: false,
    ai: false,
    storage: false,
    redis: false,
    email: false,
  };

  const ctx: EnvContext = {
    envVars: { ...readEnvFile(".env") },
    placeholders: [],
    state,
  };

  setupCoreVars(ctx);
  await setupEmail(ctx, features.email);
  await setupStorage(ctx, features.storage);

  if (features.stripe) {
    await setupStripe(ctx);
  }
  if (features.ai) {
    await setupAI(ctx);
  }
  if (features.redis) {
    await setupRedis(ctx);
  }

  // Write .env
  const s = spinner();
  s.start("Writing .env file...");
  writeEnvFile(".env", ctx.envVars);
  s.stop(`.env written (${Object.keys(ctx.envVars).length} variables)`);

  if (ctx.placeholders.length > 0) {
    log.warn(`${ctx.placeholders.length} placeholders need real values later:`);
    for (const p of ctx.placeholders) {
      log.warn(`  \u2022 ${p}`);
    }
  }

  state.env = { placeholders: ctx.placeholders, written: true };
  markPhaseCompleted(state, "env");
  await saveState(state);

  return state;
}
