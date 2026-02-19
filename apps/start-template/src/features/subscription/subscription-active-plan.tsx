import { format } from "date-fns";
import { AlertTriangleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Subscription } from "@/features/payment/stripe/stripe.factory.queries";
import { getPlanDisplayName } from "@/lib/payment/plan.utils";

import {
  getStatusLabel,
  getStatusVariant,
  type SubscriptionStatus,
} from "./subscription.types";

type SubscriptionActivePlanProps = {
  subscription: Subscription;
  currentPlan: { name: string; description: string } | undefined;
};

export function SubscriptionActivePlan({
  subscription,
  currentPlan,
}: SubscriptionActivePlanProps) {
  const { t } = useTranslation();
  const getDisplayName = (planName: string) => getPlanDisplayName(planName, t);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">
            {getDisplayName(subscription.plan)}{" "}
            {t("PLAN_STARTER").includes("Plan") ? "" : "Plan"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {currentPlan?.description}
          </p>
        </div>
        <Badge
          variant={getStatusVariant(subscription.status as SubscriptionStatus)}
        >
          {getStatusLabel(subscription.status as SubscriptionStatus, t)}
        </Badge>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        {subscription.periodStart && (
          <div>
            <p className="text-muted-foreground text-sm">
              {t("SUBSCRIPTION_CURRENT_PERIOD")}
            </p>
            <p className="font-medium">
              {format(new Date(subscription.periodStart), "MMM d, yyyy")} -{" "}
              {subscription.periodEnd
                ? format(new Date(subscription.periodEnd), "MMM d, yyyy")
                : "Ongoing"}
            </p>
          </div>
        )}

        {subscription.status === "trialing" && subscription.trialEnd && (
          <div>
            <p className="text-muted-foreground text-sm">
              {t("SUBSCRIPTION_TRIAL_ENDS")}
            </p>
            <p className="font-medium">
              {format(new Date(subscription.trialEnd), "MMM d, yyyy")}
            </p>
          </div>
        )}
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive text-sm">
              {t("SUBSCRIPTION_ENDING")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("SUBSCRIPTION_ENDING_DESC")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
