import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPlanDisplayName } from "@/lib/stripe/plan.utils";

export function SubscriptionFreePlan() {
  const { t } = useTranslation();
  const getDisplayName = (planName: string) => getPlanDisplayName(planName, t);

  return (
    <>
      {/* Current Plan - Free */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{getDisplayName("free")} Plan</h3>
          <p className="text-muted-foreground text-sm">{t("PLAN_FREE_DESC")}</p>
        </div>
        <Badge variant="secondary">{t("SUBSCRIPTION_STATUS_ACTIVE")}</Badge>
      </div>

      <Separator />

      {/* Upgrade prompt */}
      <div className="py-4 text-center">
        <p className="mb-4 text-muted-foreground text-sm">
          {t("SUBSCRIPTION_NO_ACTIVE_DESC")}
        </p>
      </div>
    </>
  );
}
