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
    {
      key: "BETTER_AUTH_TRUSTED_ORIGINS",
      comment: "Optional comma-separated extra origins",
      required: false,
    },

    // Email
    { key: "RESEND_API_KEY", required: true, feature: "email" },
    { key: "RESEND_FROM_EMAIL", required: false, feature: "email" },

    // AI
    { key: "OPENAI_API_KEY", required: false, feature: "ai" },
    { key: "ANTHROPIC_API_KEY", required: false, feature: "ai" },
    { key: "GOOGLE_GENERATIVE_AI_API_KEY", required: false, feature: "ai" },

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
    {
      key: "REDIS_URL",
      comment: "Optional - for resumable chat streams",
      required: false,
      feature: "redis",
    },
  ];

  return defs.filter((d) => !d.feature || features[d.feature]);
}
