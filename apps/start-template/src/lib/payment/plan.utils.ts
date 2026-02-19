import type { TFunction } from "i18next";

import type { PlanName } from "./types";

/**
 * Get the translated display name for a plan.
 */
export function getPlanDisplayName(planName: string, t: TFunction): string {
  const planMap: Record<string, string> = {
    free: t("PLAN_FREE"),
    starter: t("PLAN_STARTER"),
    pro: t("PLAN_PRO"),
    enterprise: t("PLAN_ENTERPRISE"),
  };
  return planMap[planName] ?? planName;
}

/**
 * Get the translated description for a plan.
 */
export function getPlanDescription(planName: string, t: TFunction): string {
  const descMap: Record<string, string> = {
    free: t("PLAN_FREE_DESC"),
    starter: t("PLAN_STARTER_DESC"),
    pro: t("PLAN_PRO_DESC"),
    enterprise: t("PLAN_ENTERPRISE_DESC"),
  };
  return descMap[planName] ?? "";
}

/**
 * Find a plan by name from a plans list.
 */
export function findPlanByName<T extends { name: PlanName | string }>(
  plans: T[],
  planName: string | undefined
): T | undefined {
  if (!planName) {
    return undefined;
  }
  return plans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
}

/**
 * Check if a plan name represents the free tier.
 */
export function isFreePlan(planName: string | undefined): boolean {
  return !planName || planName.toLowerCase() === "free";
}

/**
 * Get the user's current plan name from their subscription.
 * Returns "free" if no subscription exists.
 */
export function getUserPlanName(
  subscription: { plan: string } | null | undefined
): string {
  return subscription?.plan ?? "free";
}
