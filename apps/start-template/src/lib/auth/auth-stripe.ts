/** biome-ignore-all lint/suspicious/useAwait: <explanation> */
import { stripe } from "@better-auth/stripe";
import pino from "pino";

const log = pino({ level: "info" });

import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { SubscriptionCancellationEmail } from "@/components/emails/subscription-cancellation-email";
import { SubscriptionConfirmationEmail } from "@/components/emails/subscription-confirmation-email";
import { SubscriptionUpgradeEmail } from "@/components/emails/subscription-upgrade-email";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";

import { formatDate } from "../date-utils";
import { env } from "../env.server";
import { findPlanByName } from "../stripe/plan.utils";
import { createStripePlans, PLANS_CLIENT } from "../stripe/plans.config";
import { sendEmailSafely } from "./email-helpers";

// Initialize Stripe client
const stripeClient = env.STRIPE_SECRET_KEY
	? new Stripe(env.STRIPE_SECRET_KEY, {
			apiVersion: "2026-01-28.clover",
		})
	: null;

// Create Stripe plugin configuration
export function createStripePlugin() {
	if (!(stripeClient && env.STRIPE_WEBHOOK_SECRET)) {
		throw new Error(
			"Stripe configuration missing. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
		);
	}

	const plans = createStripePlans();

	return stripe({
		stripeClient,
		stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
		createCustomerOnSignUp: true,
		onEvent: async (event) => {
			log.info(
				{
					type: event.type,
					id: event.id,
					created: new Date(event.created * 1000).toISOString(),
				},
				"Stripe webhook event received",
			);

			if (event.type === "checkout.session.completed") {
				const session = event.data.object;
				log.info(
					{
						sessionId: session.id,
						customerId: session.customer,
						subscriptionId: session.subscription,
						metadata: session.metadata,
					},
					"Stripe checkout session completed",
				);
			}

			if (event.type === "customer.subscription.updated") {
				const sub = event.data.object;
				log.info(
					{
						subscriptionId: sub.id,
						status: sub.status,
						cancelAtPeriodEnd: sub.cancel_at_period_end,
						cancelAt: sub.cancel_at,
						canceledAt: sub.canceled_at,
					},
					"Stripe subscription updated",
				);
			}

			if (event.type === "customer.subscription.deleted") {
				const sub = event.data.object;
				log.info(
					{
						subscriptionId: sub.id,
						status: sub.status,
						cancelAtPeriodEnd: sub.cancel_at_period_end,
					},
					"Stripe subscription deleted",
				);
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
				log.info(
					{
						subscriptionId: subscription.id,
						plan: plan?.name,
						status: stripeSubscription.status,
					},
					"Stripe subscription complete",
				);

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
				log.info(
					{
						subscriptionId: subscription.id,
						plan: subscription.plan,
						status: subscription.status,
					},
					"Stripe subscription updated",
				);

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
				log.info(
					{
						subscriptionId: subscription.id,
						reason: cancellationDetails?.reason,
						cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
						cancelAt: stripeSubscription.cancel_at,
					},
					"Stripe subscription canceled",
				);

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
				log.info(
					{
						subscriptionId: subscription.id,
						stripeSubscriptionId: stripeSubscription.id,
						status: stripeSubscription.status,
					},
					"Stripe subscription deleted",
				);
			},
			onSubscriptionCreated: async ({
				subscription,
				stripeSubscription,
				plan,
			}) => {
				log.info(
					{
						subscriptionId: subscription.id,
						stripeSubscriptionId: stripeSubscription.id,
						plan: plan?.name,
					},
					"Stripe subscription created",
				);
			},
		},
	});
}
