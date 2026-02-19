import type { Subscription } from "@/features/stripe/stripe.factory.queries";

/**
 * Find the active subscription from a list of subscriptions.
 * Returns subscription with status "active" or "trialing".
 */
export function getActiveSubscription(
  subscriptions: Subscription[] | undefined
) {
  return subscriptions?.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );
}

/**
 * Check if a plan name represents the free tier.
 */
export function isFreePlan(planName: string | undefined): boolean {
  return !planName || planName.toLowerCase() === "free";
}

/**
 * Get the user's current plan name from their active subscription.
 * Returns "free" if no active subscription exists.
 */
export function getUserPlanName(
  activeSubscription: Subscription | undefined
): string {
  return activeSubscription?.plan ?? "free";
}
