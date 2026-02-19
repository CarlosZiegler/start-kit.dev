import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  billingPortalOptions,
  cancelSubscriptionOptions,
  restoreSubscriptionOptions,
  upgradeSubscriptionOptions,
} from "@/features/payment/stripe/stripe.factory.mutations";
import {
  subscriptionKeys,
  subscriptionsListOptions,
} from "@/features/payment/stripe/stripe.factory.queries";
import { authClient } from "@/lib/auth/auth-client";
import { findPlanByName } from "@/lib/stripe/plan.utils";
import { PLANS_CLIENT } from "@/lib/stripe/plans.config";
import { getActiveSubscription } from "@/lib/stripe/subscription.utils";

export function useSubscription(referenceId?: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const refId = referenceId ?? session?.user?.id;

  const subscriptionsQuery = useQuery({
    ...subscriptionsListOptions(refId),
    enabled: !!session?.user && !!refId,
  });

  const upgradeMutation = useMutation({
    ...upgradeSubscriptionOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("SUBSCRIPTION_UPGRADE_FAILED"));
    },
  });

  const cancelMutation = useMutation({
    ...cancelSubscriptionOptions(),
    onSuccess: () => {
      toast.success(t("SUBSCRIPTION_CANCELED"));
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("SUBSCRIPTION_CANCEL_FAILED"));
    },
  });

  const restoreMutation = useMutation({
    ...restoreSubscriptionOptions(),
    onSuccess: () => {
      toast.success(t("SUBSCRIPTION_RESTORED"));
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("SUBSCRIPTION_RESTORE_FAILED"));
    },
  });

  const billingPortalMutation = useMutation({
    ...billingPortalOptions(),
    onError: (error: Error) => {
      toast.error(error.message || t("SUBSCRIPTION_BILLING_PORTAL_FAILED"));
    },
  });

  const subscriptions = subscriptionsQuery.data ?? [];
  const activeSubscription = getActiveSubscription(subscriptions);
  const currentPlan = findPlanByName(PLANS_CLIENT, activeSubscription?.plan);

  return {
    subscriptions,
    activeSubscription,
    currentPlan,
    isLoading: subscriptionsQuery.isLoading,
    isPending:
      upgradeMutation.isPending ||
      cancelMutation.isPending ||
      restoreMutation.isPending,
    upgradePlan: upgradeMutation.mutate,
    cancelSubscription: cancelMutation.mutate,
    restoreSubscription: restoreMutation.mutate,
    openBillingPortal: billingPortalMutation.mutate,
    canCancel: activeSubscription && !activeSubscription.cancelAtPeriodEnd,
    canRestore: activeSubscription?.cancelAtPeriodEnd,
    canUpgrade: true,
    referenceId: refId,
  };
}
