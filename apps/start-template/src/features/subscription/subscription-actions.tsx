import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import type { Subscription } from "@/features/payment/stripe/stripe.factory.queries";
import { useSubscriptionContext } from "@/providers/subscription-provider";

type SubscriptionActionsProps = {
  subscription: Subscription;
};

export function SubscriptionActions({
  subscription,
}: SubscriptionActionsProps) {
  const { t } = useTranslation();
  const subscriptionContext = useSubscriptionContext();

  const hasCancelRestore =
    subscriptionContext.cancelSubscription !== undefined &&
    subscriptionContext.restoreSubscription !== undefined;

  return (
    <>
      <Button
        disabled={subscriptionContext.isPending}
        onClick={() => subscriptionContext.openBillingPortal()}
        variant="outline"
      >
        {subscriptionContext.isPending ? (
          <Loader2Icon className="mr-2 size-4 animate-spin" />
        ) : (
          <ExternalLinkIcon className="mr-2 size-4" />
        )}
        {t("SUBSCRIPTION_MANAGE_BILLING")}
      </Button>

      {hasCancelRestore && (
        <>
          {subscription.cancelAtPeriodEnd || subscription.cancelAt ? (
            <Button
              disabled={subscriptionContext.isPending}
              onClick={() =>
                subscriptionContext.restoreSubscription?.({
                  subscriptionId: subscription.id,
                })
              }
              variant="default"
            >
              {subscriptionContext.isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              {t("SUBSCRIPTION_RESTORE")}
            </Button>
          ) : (
            <Button
              disabled={subscriptionContext.isPending}
              onClick={() =>
                subscriptionContext.cancelSubscription?.({
                  subscriptionId: subscription.id,
                  returnUrl: "/settings/billing",
                })
              }
              variant="destructive"
            >
              {subscriptionContext.isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              {t("SUBSCRIPTION_CANCEL")}
            </Button>
          )}
        </>
      )}
    </>
  );
}
