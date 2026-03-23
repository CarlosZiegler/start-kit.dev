/** biome-ignore-all lint/suspicious/useAwait: <explanation> */
import { passkey } from "@better-auth/passkey";
import { customAlphabet } from "nanoid";
import pino from "pino";

const generateId = customAlphabet(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
);

const log = pino({ level: "info" });

import { createServerOnlyFn } from "@tanstack/react-start";
import {
	type AuthContext,
	betterAuth,
	type Session,
	type User,
} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	admin,
	lastLoginMethod,
	magicLink,
	openAPI,
	organization,
} from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { twoFactor } from "better-auth/plugins/two-factor";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";

import ResetPasswordEmail from "@/components/emails/reset-password-email";
import SendMagicLinkEmail from "@/components/emails/send-magic-link-email";
import SendVerificationOtp from "@/components/emails/send-verification-otp";

import VerifyEmail from "@/components/emails/verify-email";
import WelcomeEmail from "@/components/emails/welcome-email";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";

import { APP_CONFIG } from "../config/app.config";
import { getTrustedOrigins } from "../config/trusted-origins";

import { env } from "../env.server";

import { createStripePlugin } from "./auth-stripe";
import { getOTPEmailConfig } from "./email-config";
import { sendEmailSafely } from "./email-helpers";
import {
	ac,
	admin as adminRole,
	member as memberRole,
	owner as ownerRole,
	superAdmin as superAdminRole,
	user as userRole,
} from "./permissions";

const trustedOrigins = getTrustedOrigins();

const getAuthConfig = createServerOnlyFn(() =>
	betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		baseURL: env.BETTER_AUTH_BASE_URL,
		experimental: {
			joins: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		basePath: "/api/auth",
		trustedOrigins,
		onAPIError: {
			onError: (error: unknown, ctx: AuthContext) => {
				console.error("onAPIError", error, ctx);
			},
		},

		rateLimit: {
			enabled: true,
			window: 60, // 1 minute window
			max: 100, // 100 requests per minute
			storage: "memory", // Consider "database" for distributed deployments
			modelName: "rateLimit",
		},
		// https://www.better-auth.com/docs/concepts/session-management#session-caching
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60, // 5 minutes
			},
		},
		user: {
			deleteUser: {
				enabled: true,
			},
		},
		logger: {
			level: "info",
		},
		telemetry: {
			enabled: true,
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user: User) => {
						const baseName = user.name || user.email || "organization";
						const orgName = baseName.toLowerCase().replace(/\s+/g, "-");
						const slug = `${orgName}-${user.id.slice(0, 8)}`;
						const now = new Date();
						const orgId = generateId(32);
						const memberId = generateId(32);

						try {
							await db.insert(schema.organization).values({
								id: orgId,
								name: orgName,
								slug,
								createdAt: now,
							});

							await db.insert(schema.member).values({
								id: memberId,
								organizationId: orgId,
								userId: user.id,
								role: "owner",
								createdAt: now,
							});
						} catch (error) {
							log.error(
								{ error, userId: user.id },
								"Failed to create default organization during sign-up",
							);
						}

						await sendEmailSafely({
							to: user.email,
							subject: `Welcome to ${APP_CONFIG.name}`,
							text: `Welcome to ${APP_CONFIG.name}`,
							template: WelcomeEmail({ username: user.name || user.email }),
							errorContext: "welcome email",
						});
					},
				},
			},
			session: {
				create: {
					before: async (session: Session) => {
						const orgData = await db.query.member.findFirst({
							where: eq(schema.member.userId, session.userId),
						});
						return {
							data: {
								...session,
								...(orgData?.organizationId && {
									activeOrganizationId: orgData?.organizationId,
								}),
							},
						};
					},
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: env.BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION,
			disableSignUp: env.BETTER_AUTH_DISABLE_SIGN_UP,
			async sendResetPassword({
				url,
				user,
			}: {
				url: string;
				user: User;
				token: string;
			}) {
				await sendEmailSafely({
					to: user.email,
					subject: "Reset your password",
					text: "Reset your password",
					template: ResetPasswordEmail({
						resetLink: url,
						username: user.email,
					}),
					errorContext: "reset password email",
				});
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({
				url,
				user,
			}: {
				url: string;
				user: User;
			}) => {
				await sendEmailSafely({
					to: user.email,
					subject: "Verify your email",
					text: "Verify your email",
					template: VerifyEmail({ url, username: user.email }),
					errorContext: "verification email",
				});
			},
		},

		plugins: [
			...(process.env.NODE_ENV !== "production" ? [openAPI()] : []),
			lastLoginMethod(),
			twoFactor(),
			passkey(),
			admin({
				defaultRole: "user",
				adminRoles: ["admin", "owner", "super_admin"],
				ac,
				roles: {
					user: userRole,
					admin: adminRole,
					owner: ownerRole,
					super_admin: superAdminRole,
				},
			}),
			organization({
				ac,
				roles: {
					owner: ownerRole,
					admin: adminRole,
					member: memberRole,
				},
				allowUserToCreateOrganization: true,
			}),
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					const config = getOTPEmailConfig(type);
					await sendEmailSafely({
						to: email,
						subject: config.subject,
						text: config.text,
						template: SendVerificationOtp({ username: email, otp }),
						errorContext: "verification OTP",
					});
				},
			}),
			magicLink({
				sendMagicLink: async ({ email, token, url }) => {
					await sendEmailSafely({
						to: email,
						subject: "Magic Link",
						text: "Magic Link",
						template: SendMagicLinkEmail({ username: email, url, token }),
						errorContext: "magic link",
					});
				},
			}),
			tanstackStartCookies(),
			...(env.STRIPE_WEBHOOK_SECRET ? [createStripePlugin()] : []),
		],
	}),
);

export const auth = getAuthConfig();
