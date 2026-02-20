/** biome-ignore-all lint/suspicious/useAwait: <explanation> */
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import pino from "pino";

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
import Stripe from "stripe";

import ResetPasswordEmail from "@/components/emails/reset-password-email";
import SendMagicLinkEmail from "@/components/emails/send-magic-link-email";
import SendVerificationOtp from "@/components/emails/send-verification-otp";
import { SubscriptionCancellationEmail } from "@/components/emails/subscription-cancellation-email";
import { SubscriptionConfirmationEmail } from "@/components/emails/subscription-confirmation-email";
import { SubscriptionUpgradeEmail } from "@/components/emails/subscription-upgrade-email";
import VerifyEmail from "@/components/emails/verify-email";
import WelcomeEmail from "@/components/emails/welcome-email";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";

import { APP_CONFIG } from "../config/app.config";
import { formatDate } from "../date-utils";
import { env } from "../env.server";
import { findPlanByName } from "../stripe/plan.utils";
import { createStripePlans, PLANS_CLIENT } from "../stripe/plans.config";
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

// Initialize Stripe client
const stripeClient = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

// Create Stripe plugin configuration
function createStripePlugin() {
  if (!(stripeClient && env.STRIPE_WEBHOOK_SECRET)) {
    throw new Error(
      "Stripe configuration missing. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET."
    );
  }

  const plans = createStripePlans();

  return stripe({
    stripeClient,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    createCustomerOnSignUp: true,
    onEvent: async (event) => {
      log.info({ type: event.type, id: event.id, created: new Date(event.created * 1000).toISOString() }, "Stripe webhook event received");

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        log.info({ sessionId: session.id, customerId: session.customer, subscriptionId: session.subscription, metadata: session.metadata }, "Stripe checkout session completed");
      }

      if (event.type === "customer.subscription.updated") {
        const sub = event.data.object;
        log.info({ subscriptionId: sub.id, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end, cancelAt: sub.cancel_at, canceledAt: sub.canceled_at }, "Stripe subscription updated");
      }

      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;
        log.info({ subscriptionId: sub.id, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end }, "Stripe subscription deleted");
      }
    },
    subscription: {
      enabled: true,
      plans: plans
        .filter((plan) => plan.priceId !== undefined)
        .map((plan) => ({
          name: plan.name,
          priceId: plan.priceId ?? "",
          limits: plan.limits,
          ...(plan.freeTrial && { freeTrial: plan.freeTrial }),
        })),
      authorizeReference: async ({ user, referenceId, action }) => {
        // For user-based subscriptions, only the user themselves can manage
        if (referenceId === user.id) {
          return true;
        }

        // For organization-based subscriptions, check membership
        if (
          action === "upgrade-subscription" ||
          action === "cancel-subscription" ||
          action === "restore-subscription"
        ) {
          const membership = await db.query.member.findFirst({
            where: eq(schema.member.userId, user.id),
          });
          // Only owners can manage organization subscriptions
          return (
            membership?.organizationId === referenceId &&
            membership?.role === "owner"
          );
        }

        // For listing, allow any org member
        if (action === "list-subscription") {
          const membership = await db.query.member.findFirst({
            where: eq(schema.member.userId, user.id),
          });
          return membership?.organizationId === referenceId;
        }

        return false;
      },
      // Lifecycle hooks for subscription events
      onSubscriptionComplete: async ({
        subscription,
        plan,
        stripeSubscription,
      }) => {
        log.info({ subscriptionId: subscription.id, plan: plan?.name, status: stripeSubscription.status }, "Stripe subscription complete");

        const user = await db.query.user.findFirst({
          where: eq(schema.user.id, subscription.referenceId),
        });

        if (user) {
          const planDetails = findPlanByName(PLANS_CLIENT, plan?.name);
          const amount =
            planDetails?.price.monthly === 0
              ? "Free"
              : `$${planDetails?.price.monthly}/month`;

          await sendEmailSafely({
            to: user.email,
            subject: "Subscription Confirmed",
            text: "Your subscription has been confirmed",
            template: SubscriptionConfirmationEmail({
              username: user.name || user.email,
              planName: planDetails?.name || plan?.name || "Unknown",
              amount,
              billingDate: "Your next billing date",
            }),
            errorContext: "subscription confirmation email",
          });
        }
      },
      onSubscriptionUpdate: async ({ subscription }) => {
        log.info({ subscriptionId: subscription.id, plan: subscription.plan, status: subscription.status }, "Stripe subscription updated");

        const user = await db.query.user.findFirst({
          where: eq(schema.user.id, subscription.referenceId),
        });

        if (user) {
          const planDetails = findPlanByName(PLANS_CLIENT, subscription.plan);

          await sendEmailSafely({
            to: user.email,
            subject: "Subscription Updated",
            text: "Your subscription has been updated",
            template: SubscriptionUpgradeEmail({
              username: user.name || user.email,
              previousPlan: "Previous Plan",
              newPlan: planDetails?.name || subscription.plan,
              amount: `$${planDetails?.price.monthly}/month`,
              effectiveDate: formatDate(new Date(), "medium"),
            }),
            errorContext: "subscription update email",
          });
        }
      },
      onSubscriptionCancel: async ({
        subscription,
        stripeSubscription,
        cancellationDetails,
      }) => {
        log.info({ subscriptionId: subscription.id, reason: cancellationDetails?.reason, cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end, cancelAt: stripeSubscription.cancel_at }, "Stripe subscription canceled");

        const user = await db.query.user.findFirst({
          where: eq(schema.user.id, subscription.referenceId),
        });

        if (user) {
          const planDetails = findPlanByName(PLANS_CLIENT, subscription.plan);

          await sendEmailSafely({
            to: user.email,
            subject: "Subscription Canceled",
            text: "Your subscription has been canceled",
            template: SubscriptionCancellationEmail({
              username: user.name || user.email,
              planName: planDetails?.name || subscription.plan,
              cancelDate: formatDate(new Date(), "medium"),
              reason: cancellationDetails?.reason || undefined,
            }),
            errorContext: "cancellation email",
          });
        }
      },
      onSubscriptionDeleted: async ({ subscription, stripeSubscription }) => {
        log.info({ subscriptionId: subscription.id, stripeSubscriptionId: stripeSubscription.id, status: stripeSubscription.status }, "Stripe subscription deleted");
      },
      onSubscriptionCreated: async ({
        subscription,
        stripeSubscription,
        plan,
      }) => {
        log.info({ subscriptionId: subscription.id, stripeSubscriptionId: stripeSubscription.id, plan: plan?.name }, "Stripe subscription created");
      },
    },
  });
}

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, "");

const vercelOrigins = [
  env.VERCEL_URL,
  env.VERCEL_BRANCH_URL,
  env.VERCEL_PROJECT_PRODUCTION_URL,
]
  .filter((value): value is string => Boolean(value))
  .map((value) => value.replace(/^https?:\/\//, ""))
  .map((value) => "https://" + value);

const trustedOrigins = [
  env.BETTER_AUTH_BASE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.start-kit.dev",
  "https://start-template-sepia.vercel.app",
  "https://*.zieglers-projects.vercel.app",
  "https://*.carlos-ricardo-zieglers-projects.vercel.app",
  "https://*.ngrok-free.dev",
  ...vercelOrigins,
  ...(env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
]
  .map(normalizeOrigin)
  .filter((origin, index, list) => list.indexOf(origin) === index);

const getAuthConfig = createServerOnlyFn(() =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    baseURL: env.BETTER_AUTH_BASE_URL,
    // advanced: {
    //   database: { generateId: "uuid" },
    // },
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
      requireEmailVerification: false,
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
      openAPI(),
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
      ...(stripeClient && env.STRIPE_WEBHOOK_SECRET
        ? [createStripePlugin()]
        : []),
    ],
  })
);

export const auth = getAuthConfig();
