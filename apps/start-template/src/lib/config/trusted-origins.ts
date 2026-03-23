import { env } from "../env.server";

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, "");

/**
 * Build the list of trusted origins for CORS and Better-Auth.
 *
 * Sources:
 * 1. BETTER_AUTH_BASE_URL (always included)
 * 2. localhost:3000 and localhost:3001 (development)
 * 3. Vercel preview deployment URLs (auto-detected from VERCEL_* env vars)
 * 4. BETTER_AUTH_TRUSTED_ORIGINS (comma-separated custom origins)
 *
 * To add ngrok, preview deploys, or other dev origins:
 *   BETTER_AUTH_TRUSTED_ORIGINS="https://*.ngrok-free.dev,https://my-preview.vercel.app"
 */
export function getTrustedOrigins(): string[] {
	const vercelOrigins = [
		env.VERCEL_URL,
		env.VERCEL_BRANCH_URL,
		env.VERCEL_PROJECT_PRODUCTION_URL,
	]
		.filter((value): value is string => Boolean(value))
		.map((value) => value.replace(/^https?:\/\//, ""))
		.map((value) => `https://${value}`);

	const customOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS
		? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
				.map((origin) => origin.trim())
				.filter(Boolean)
		: [];

	return [
		env.BETTER_AUTH_BASE_URL,
		"http://localhost:3000",
		"http://localhost:3001",
		...vercelOrigins,
		...customOrigins,
	]
		.map(normalizeOrigin)
		.filter((origin, index, list) => list.indexOf(origin) === index);
}

/**
 * Check if an origin is trusted. Supports wildcard patterns (e.g. "https://*.vercel.app").
 */
export function isOriginTrusted(
	origin: string,
	trustedOrigins: string[],
): boolean {
	return trustedOrigins.some((allowed) => {
		if (allowed.includes("*")) {
			const escaped = allowed
				.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
				.replace(/\*/g, "[^/]+");
			return new RegExp(`^${escaped}$`).test(origin);
		}
		return allowed === origin;
	});
}
