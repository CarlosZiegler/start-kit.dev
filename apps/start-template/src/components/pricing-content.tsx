import { Link } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth-client";
import {
  getPlanDescription,
  getPlanDisplayName,
} from "@/lib/stripe/plan.utils";
import { PLANS_CLIENT, type PlanName } from "@/lib/stripe/plans.config";
import { cn } from "@/lib/utils";
import { useSubscriptionContext } from "@/providers/subscription-provider";

type PricingContentProps = {
  currentPlanName?: string;
};

type ClientPlan = (typeof PLANS_CLIENT)[number];

type PlanCardProps = {
  annual: boolean;
  currentPlanName?: string;
  getPlanDescription: (planName: string) => string;
  getPlanDisplayName: (planName: string) => string;
  isAuthenticated: boolean;
  isPending: boolean;
  pendingPlanName?: PlanName;
  plan: ClientPlan;
  t: ReturnType<typeof useTranslation>["t"];
  onSelectPlan: (planName: PlanName) => void;
};

function getTopBarClassName({
  isCurrentPlan,
  isHighlighted,
}: {
  isCurrentPlan: boolean;
  isHighlighted: boolean;
}) {
  if (isCurrentPlan) {
    return "bg-emerald-500";
  }

  if (isHighlighted) {
    return "bg-primary";
  }

  return null;
}

function getButtonVariant({
  isCurrentPlan,
  isHighlighted,
}: {
  isCurrentPlan: boolean;
  isHighlighted: boolean;
}) {
  if (isCurrentPlan) {
    return "outline";
  }

  if (isHighlighted) {
    return "default";
  }

  return "outline";
}

function getButtonLabel({
  getPlanDisplayName,
  isCurrentPlan,
  isFreePlan,
  isPending,
  pendingPlanName,
  planName,
  t,
}: {
  getPlanDisplayName: (planName: string) => string;
  isCurrentPlan: boolean;
  isFreePlan: boolean;
  isPending: boolean;
  pendingPlanName?: PlanName;
  planName: PlanName;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (isCurrentPlan) {
    return t("PRICING_CURRENT_PLAN");
  }

  if (isPending && pendingPlanName === planName) {
    return t("PRICING_PROCESSING");
  }

  if (isFreePlan) {
    return t("PRICING_GET_STARTED");
  }

  return t("PRICING_GET_PLAN", { plan: getPlanDisplayName(planName) });
}

// biome-ignore lint: UI-only component
function PlanCard({
  annual,
  currentPlanName,
  getPlanDescription,
  getPlanDisplayName,
  isAuthenticated,
  isPending,
  pendingPlanName,
  plan,
  t,
  onSelectPlan,
}: PlanCardProps) {
  const isFreePlan = plan.name === "free";
  const isCurrentPlan = plan.name === currentPlanName;
  const isHighlighted = plan.highlighted === true;

  const topBarClassName = getTopBarClassName({
    isCurrentPlan,
    isHighlighted,
  });

  const buttonLabel = getButtonLabel({
    getPlanDisplayName,
    isCurrentPlan,
    isFreePlan,
    isPending,
    pendingPlanName,
    planName: plan.name,
    t,
  });

  const buttonVariant = getButtonVariant({
    isCurrentPlan,
    isHighlighted,
  });

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden border-2 p-5 transition-all duration-200",
        isHighlighted ? "z-10 border-primary shadow-lg" : "border-border",
        isCurrentPlan && "border-emerald-500 shadow-emerald-500/10 shadow-lg"
      )}
    >
      {topBarClassName && (
        <div className={cn("absolute inset-x-0 top-0 h-1", topBarClassName)} />
      )}

      {isCurrentPlan && (
        <Badge className="absolute top-3 right-3 bg-emerald-600 text-white hover:bg-emerald-600">
          {t("PRICING_CURRENT_PLAN")}
        </Badge>
      )}

      {isHighlighted && (
        <Badge className="absolute top-3 right-3" variant="default">
          {t("PRICING_MOST_POPULAR")}
        </Badge>
      )}

      <CardHeader className="p-0 pb-4">
        <CardTitle className="font-bold text-xl">
          {getPlanDisplayName(plan.name)}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-10 text-sm">
          {getPlanDescription(plan.name)}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0 pb-6">
        {/* Price */}
        <div className="mb-6">
          {plan.price.monthly === 0 ? (
            <span className="font-extrabold text-4xl">{t("PLAN_FREE")}</span>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-4xl">
                $
                {annual
                  ? Math.floor(plan.price.annual / 12)
                  : plan.price.monthly}
              </span>
              <span className="font-medium text-muted-foreground text-sm">
                /{t("PRICING_PER_MONTH")}
              </span>
            </div>
          )}
          {annual && plan.price.annual > 0 && (
            <p className="mt-1 text-muted-foreground text-xs">
              {t("PRICING_BILLED_ANNUALLY", {
                amount: plan.price.annual,
              })}
            </p>
          )}
        </div>

        {/* Trial Badge - compact */}
        {plan.freeTrial && (
          <div className="mb-4">
            <Badge className="font-normal text-xs" variant="secondary">
              {t("PRICING_FREE_TRIAL_DAYS", {
                days: plan.freeTrial.days,
              })}
            </Badge>
          </div>
        )}

        {/* Features - compact list */}
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li className="flex items-start gap-2.5 text-sm" key={feature}>
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground leading-tight">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto p-0 pt-4">
        {isAuthenticated ? (
          <Button
            className={cn(
              "w-full font-semibold",
              isCurrentPlan &&
                "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
            )}
            disabled={isCurrentPlan || (!isFreePlan && isPending)}
            onClick={() => onSelectPlan(plan.name)}
            size="lg"
            variant={buttonVariant}
          >
            {buttonLabel}
          </Button>
        ) : (
          <Button
            className="w-full font-semibold"
            size="lg"
            variant={plan.highlighted ? "default" : "outline"}
          >
            <Link to="/sign-in">
              {isFreePlan
                ? t("PRICING_SIGN_UP_FREE")
                : t("PRICING_SIGN_IN_TO_SUBSCRIBE")}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function PricingContent({ currentPlanName }: PricingContentProps) {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(false);
  const [pendingPlanName, setPendingPlanName] = useState<PlanName>();
  const { data: session } = authClient.useSession();
  const subscription = useSubscriptionContext();

  const handleSelectPlan = (planName: PlanName) => {
    if (!session?.user) {
      toast.error(t("PRICING_SIGN_IN_REQUIRED"));
      return;
    }

    // Free plan doesn't need checkout - users are on free by default
    if (planName === "free") {
      toast.info(t("PRICING_FREE_PLAN_INFO"));
      return;
    }

    setPendingPlanName(planName);

    subscription.upgradePlan({
      plan: planName,
      annual,
      successUrl: "/settings/billing",
      cancelUrl: "/settings/billing",
      subscriptionId: subscription.activeSubscription?.stripeSubscriptionId,
    });
  };

  // Use shared plan utils with translation function
  const getDisplayName = (planName: string) => getPlanDisplayName(planName, t);
  const getDescription = (planName: string) => getPlanDescription(planName, t);

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl tracking-tight">
          {t("PRICING_TITLE")}
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          {t("PRICING_DESCRIPTION")}
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-sm",
              annual ? "text-muted-foreground" : "font-medium"
            )}
          >
            {t("PRICING_MONTHLY")}
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span
            className={cn(
              "text-sm",
              annual ? "font-medium" : "text-muted-foreground"
            )}
          >
            {t("PRICING_ANNUAL")}
            <Badge className="ml-2" variant="secondary">
              {t("PRICING_SAVE_PERCENT")}
            </Badge>
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 px-2">
        {PLANS_CLIENT.map((plan) => (
          <PlanCard
            annual={annual}
            currentPlanName={currentPlanName}
            getPlanDescription={getDescription}
            getPlanDisplayName={getDisplayName}
            isAuthenticated={!!session?.user}
            isPending={subscription.isPending}
            key={plan.name}
            onSelectPlan={handleSelectPlan}
            pendingPlanName={pendingPlanName}
            plan={plan}
            t={t}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          {t("PRICING_FOOTER_INFO")}
          <br />
          {t("PRICING_CUSTOM_PLAN")}{" "}
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="mailto:support@example.com"
          >
            {t("PRICING_CONTACT_US")}
          </a>
        </p>
      </div>
    </div>
  );
}
