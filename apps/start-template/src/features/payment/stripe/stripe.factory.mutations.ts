import { mutationOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import type { PlanName } from "@/lib/stripe/plans.config";

// Upgrade subscription
type UpgradeSubscriptionInput = {
  plan: PlanName;
  annual?: boolean;
  successUrl: string;
  cancelUrl: string;
  referenceId?: string;
  seats?: number;
  subscriptionId?: string | null;
};

export const upgradeSubscriptionOptions = () =>
  mutationOptions({
    mutationFn: async ({
      plan,
      annual,
      successUrl,
      cancelUrl,
      referenceId,
      seats,
      subscriptionId,
    }: UpgradeSubscriptionInput) => {
      const result = await authClient.subscription.upgrade({
        plan,
        annual,
        successUrl,
        cancelUrl,
        referenceId,
        seats,
        subscriptionId: subscriptionId ?? undefined,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to upgrade", {
          cause: result.error,
        });
      }

      return result;
    },
  });

// Cancel subscription
type CancelSubscriptionInput = {
  subscriptionId: string;
  returnUrl: string;
  referenceId?: string;
};

export const cancelSubscriptionOptions = () =>
  mutationOptions({
    mutationFn: async ({
      subscriptionId,
      returnUrl,
      referenceId,
    }: CancelSubscriptionInput) => {
      const result = await authClient.subscription.cancel({
        subscriptionId,
        returnUrl,
        referenceId,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to cancel subscription",
          {
            cause: result.error,
          }
        );
      }

      return result;
    },
  });

// Restore subscription
type RestoreSubscriptionInput = {
  subscriptionId: string;
  referenceId?: string;
};

export const restoreSubscriptionOptions = () =>
  mutationOptions({
    mutationFn: async ({
      subscriptionId,
      referenceId,
    }: RestoreSubscriptionInput) => {
      const result = await authClient.subscription.restore({
        subscriptionId,
        referenceId,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to restore subscription",
          {
            cause: result.error,
          }
        );
      }

      return result;
    },
  });

// Billing portal
type BillingPortalInput = {
  returnUrl?: string;
  referenceId?: string;
};

export const billingPortalOptions = () =>
  mutationOptions({
    mutationFn: async ({ returnUrl, referenceId }: BillingPortalInput) => {
      const result = await authClient.subscription.billingPortal({
        returnUrl,
        referenceId,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to open billing portal",
          {
            cause: result.error,
          }
        );
      }

      // Redirect to billing portal if URL is provided
      if (result.data?.url) {
        window.location.href = result.data.url;
      }

      return result;
    },
  });
