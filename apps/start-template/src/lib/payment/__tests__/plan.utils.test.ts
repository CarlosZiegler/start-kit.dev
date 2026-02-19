import type { TFunction } from "i18next";

import { describe, expect, it, vi } from "vitest";

import {
  findPlanByName,
  getPlanDescription,
  getPlanDisplayName,
  getUserPlanName,
  isFreePlan,
} from "@/lib/payment/plan.utils";

const mockT = vi.fn((key: string) => key) as unknown as TFunction;

describe("plan display behavior", () => {
  it("returns translated plan name for known plans", () => {
    const result = getPlanDisplayName("free", mockT);
    expect(result).toBe("PLAN_FREE");
  });

  it("returns translated plan name for pro plan", () => {
    const result = getPlanDisplayName("pro", mockT);
    expect(result).toBe("PLAN_PRO");
  });

  it("returns original name for unknown plan", () => {
    const result = getPlanDisplayName("custom", mockT);
    expect(result).toBe("custom");
  });
});

describe("plan description behavior", () => {
  it("returns translated description for known plans", () => {
    const result = getPlanDescription("starter", mockT);
    expect(result).toBe("PLAN_STARTER_DESC");
  });

  it("returns empty string for unknown plan", () => {
    const result = getPlanDescription("unknown", mockT);
    expect(result).toBe("");
  });
});

describe("plan lookup behavior", () => {
  const plans = [
    { name: "free", price: 0 },
    { name: "pro", price: 10 },
    { name: "enterprise", price: 100 },
  ];

  it("finds plan by name (case insensitive)", () => {
    const result = findPlanByName(plans, "PRO");
    expect(result).toEqual({ name: "pro", price: 10 });
  });

  it("finds plan with lowercase search", () => {
    const result = findPlanByName(plans, "enterprise");
    expect(result).toEqual({ name: "enterprise", price: 100 });
  });

  it("returns undefined for non-existent plan", () => {
    const result = findPlanByName(plans, "platinum");
    expect(result).toBeUndefined();
  });

  it("returns undefined for undefined plan name", () => {
    const result = findPlanByName(plans, undefined);
    expect(result).toBeUndefined();
  });
});

describe("free plan detection behavior", () => {
  it("identifies free plan explicitly", () => {
    expect(isFreePlan("free")).toBe(true);
  });

  it("identifies free plan case insensitive", () => {
    expect(isFreePlan("FREE")).toBe(true);
    expect(isFreePlan("Free")).toBe(true);
  });

  it("identifies non-free plans", () => {
    expect(isFreePlan("pro")).toBe(false);
    expect(isFreePlan("enterprise")).toBe(false);
    expect(isFreePlan("starter")).toBe(false);
  });

  it("treats undefined as free plan", () => {
    expect(isFreePlan(undefined)).toBe(true);
  });

  it("treats empty string as free plan", () => {
    expect(isFreePlan("")).toBe(true);
  });
});

describe("user plan detection behavior", () => {
  it("returns plan name from active subscription", () => {
    const subscription = { plan: "pro" };
    const result = getUserPlanName(subscription);
    expect(result).toBe("pro");
  });

  it("returns free plan when subscription is null", () => {
    const result = getUserPlanName(null);
    expect(result).toBe("free");
  });

  it("returns free plan when subscription is undefined", () => {
    const result = getUserPlanName(undefined);
    expect(result).toBe("free");
  });
});
