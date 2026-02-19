import type { TFunction } from "i18next";

import type { Subscription } from "@/features/payment/stripe/stripe.factory.queries";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "incomplete"
  | "past_due"
  | "unpaid";

export type ActiveSubscriptionProps = {
  subscription: Subscription;
  currentPlan: { name: string; description: string } | undefined;
  t: TFunction;
};

export function getStatusLabel(
  status: SubscriptionStatus,
  t: TFunction
): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: t("SUBSCRIPTION_STATUS_ACTIVE"),
    trialing: t("SUBSCRIPTION_STATUS_TRIALING"),
    canceled: t("SUBSCRIPTION_STATUS_CANCELED"),
    incomplete: t("SUBSCRIPTION_STATUS_INCOMPLETE"),
    past_due: t("SUBSCRIPTION_STATUS_PAST_DUE"),
    unpaid: t("SUBSCRIPTION_STATUS_UNPAID"),
  };
  return statusMap[status] ?? status;
}

export function getStatusVariant(
  status: SubscriptionStatus
): "default" | "secondary" | "destructive" | "outline" {
  const variantMap: Record<
    SubscriptionStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    trialing: "secondary",
    canceled: "destructive",
    incomplete: "outline",
    past_due: "destructive",
    unpaid: "destructive",
  };
  return variantMap[status] ?? "outline";
}
