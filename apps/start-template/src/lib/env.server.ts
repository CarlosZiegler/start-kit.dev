/** biome-ignore-all lint/style/useNamingConvention: Environment variables often use snake_case */
import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

config();

export const env = createEnv({
	server: {
		// Database
		DATABASE_URL: z.url(),
		// Email Service
		RESEND_API_KEY: z.string(),
		RESEND_FROM_EMAIL: z.string().optional(),
		// Auth
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
		BETTER_AUTH_BASE_URL: z.url().default("http://localhost:3000"),
		BETTER_AUTH_TRUSTED_ORIGINS: z
			.string()
			.optional()
			.default("localhost:3000"),
		// Sign-up control — set to "true" to disable new account creation
		BETTER_AUTH_DISABLE_SIGN_UP: z.coerce.boolean().default(false),
		BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
		// Vercel deployment trust domains
		VERCEL_URL: z.string().optional(),
		VERCEL_BRANCH_URL: z.string().optional(),
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
		// AI
		OPENAI_API_KEY: z.string().optional(),
		ANTHROPIC_API_KEY: z.string().optional(),
		GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
		// Stripe configuration
		STRIPE_SECRET_KEY: z.string().optional(),
		STRIPE_WEBHOOK_SECRET: z.string().optional(),
		// Storage configuration
		STORAGE_PROVIDER: z
			.enum([
				"s3",
				"cloudflare-r2",
				"seaweedfs",
				"digitalocean-spaces",
				"google-cloud-storage",
				"supabase-storage",
			])
			.default("s3"),
		S3_ACCESS_KEY_ID: z.string(),
		S3_SECRET_ACCESS_KEY: z.string(),
		S3_REGION: z.string().default("us-east-1"),
		S3_ENDPOINT: z.string().optional(),
		S3_BUCKET: z.string(),
		// DEBUG
		DRIZZLE_QUERY_LOGGER_ENABLED: z.coerce.boolean().default(false),

		// Redis (optional - for resumable chat streams)
		REDIS_URL: z.url().optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
