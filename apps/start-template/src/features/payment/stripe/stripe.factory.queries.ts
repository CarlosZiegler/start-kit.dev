import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  list: (referenceId?: string) =>
    [...subscriptionKeys.all, "list", referenceId] as const,
};

// Type for subscription data
export type Subscription = {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  periodStart?: Date | string | null;
  periodEnd?: Date | string | null;
  cancelAt?: Date | string | number | null;
  cancelAtPeriodEnd?: boolean | null;
  seats?: number | null;
  trialStart?: Date | string | null;
  trialEnd?: Date | string | null;
};

// Get subscription client (only available when Stripe plugin is enabled)

export const subscriptionsListOptions = (referenceId?: string) =>
  queryOptions({
    queryKey: subscriptionKeys.list(referenceId),
    queryFn: async () => {
      const result = await authClient.subscription.list({
        query: {
          referenceId,
        },
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to fetch subscriptions",
          {
            cause: result.error,
          }
        );
      }

      return result.data;
    },
    staleTime: 30_000,
  });
