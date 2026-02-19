import { CreditCardIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSubscriptionContext } from "@/providers/subscription-provider";

import { SubscriptionActions } from "./subscription-actions";
import { SubscriptionActivePlan } from "./subscription-active-plan";
import { SubscriptionFreePlan } from "./subscription-free-plan";
import { SubscriptionPlanDialog } from "./subscription-plan-dialog";

function SubscriptionLoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

type SubscriptionActiveStateProps = {
  subscription: ReturnType<typeof useSubscriptionContext>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  changePlanLabel: string;
};

function SubscriptionActiveState({
  subscription,
  isModalOpen,
  setIsModalOpen,
  changePlanLabel,
}: SubscriptionActiveStateProps) {
  if (!subscription.activeSubscription) {
    return null;
  }

  return (
    <>
      <SubscriptionActivePlan
        currentPlan={subscription.currentPlan}
        subscription={subscription.activeSubscription}
      />
      <Separator />
      <div className="flex flex-wrap gap-3">
        <SubscriptionActions subscription={subscription.activeSubscription} />
        <SubscriptionPlanDialog
          buttonLabel={changePlanLabel}
          currentPlanName={subscription.currentPlan?.name}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </>
  );
}

type SubscriptionFreeStateProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  viewPlansLabel: string;
};

function SubscriptionFreeState({
  isModalOpen,
  setIsModalOpen,
  viewPlansLabel,
}: SubscriptionFreeStateProps) {
  return (
    <>
      <SubscriptionFreePlan />
      <SubscriptionPlanDialog
        buttonLabel={viewPlansLabel}
        buttonVariant="default"
        currentPlanName="free"
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

export function SubscriptionSection() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const subscription = useSubscriptionContext();

  function renderContent(): React.ReactNode {
    if (subscription.isLoading) {
      return <SubscriptionLoadingState />;
    }

    if (subscription.activeSubscription) {
      return (
        <SubscriptionActiveState
          changePlanLabel={t("SUBSCRIPTION_CHANGE_PLAN")}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          subscription={subscription}
        />
      );
    }

    return (
      <SubscriptionFreeState
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        viewPlansLabel={t("SUBSCRIPTION_VIEW_PLANS")}
      />
    );
  }

  return (
    <div className="space-y-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            {t("SUBSCRIPTION_TITLE")}
          </CardTitle>
          <CardDescription>{t("SUBSCRIPTION_DESCRIPTION")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
