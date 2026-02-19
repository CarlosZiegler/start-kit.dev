import type { PlanLimits, PlanName } from "../payment/types";

// Re-export for backwards compatibility
export type { PlanLimits, PlanName } from "../payment/types";

export type Plan = {
  name: PlanName;
  displayName: string;
  description: string;
  priceId: string | undefined;
  annualPriceId?: string | undefined;
  price: {
    monthly: number;
    annual: number;
  };
  limits: PlanLimits;
  features: string[];
  highlighted?: boolean;
  freeTrial?: {
    days: number;
  };
};

/**
 * Creates the Stripe plans configuration.
 * Plans are customizable via environment variables for price IDs.
 */
export function createStripePlans(): Plan[] {
  return [
    {
      name: "free",
      displayName: "Free",
      description: "Get started with the basics",
      priceId: undefined, // Free plan doesn't need Stripe checkout
      price: {
        monthly: 0,
        annual: 0,
      },
      limits: {
        projects: 1,
        storage: 1,
        apiCalls: 1000,
      },
      features: [
        "1 project",
        "1 GB storage",
        "1,000 API calls/month",
        "Community support",
      ],
    },
    {
      name: "starter",
      displayName: "Starter",
      description: "Perfect for individuals and small projects",
      priceId: "price_1SflbD4Twqr22QlfbaTM8Pru",
      price: {
        monthly: 9,
        annual: 90,
      },
      limits: {
        projects: 3,
        storage: 5,
        apiCalls: 10_000,
      },
      features: [
        "Up to 3 projects",
        "5 GB storage",
        "10,000 API calls/month",
        "Email support",
        "Basic analytics",
      ],
    },
    {
      name: "pro",
      displayName: "Pro",
      description: "For growing teams and businesses",
      priceId: "price_1SflbZ4Twqr22Qlf4I3OFLxT",
      price: {
        monthly: 29,
        annual: 290,
      },
      limits: {
        projects: 10,
        storage: 50,
        apiCalls: 100_000,
      },
      features: [
        "Up to 10 projects",
        "50 GB storage",
        "100,000 API calls/month",
        "Priority support",
        "Advanced analytics",
        "Team collaboration",
        "Custom integrations",
      ],
      highlighted: true,
      freeTrial: {
        days: 14,
      },
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      description: "For large organizations with custom needs",
      priceId: "price_1Sflbt4Twqr22Qlfp4oZnlW0",
      price: {
        monthly: 99,
        annual: 990,
      },
      limits: {
        projects: -1, // unlimited
        storage: -1, // unlimited
        apiCalls: -1, // unlimited
      },
      features: [
        "Unlimited projects",
        "Unlimited storage",
        "Unlimited API calls",
        "24/7 dedicated support",
        "Custom analytics",
        "SSO & SAML",
        "SLA guarantee",
        "Custom contracts",
      ],
    },
  ];
}

/** Client-side plan type (without sensitive price IDs) */
export type ClientPlan = Omit<Plan, "priceId" | "annualPriceId">;

/**
 * Client-side plan data derived from server plans (without sensitive price IDs).
 * This eliminates duplication between server and client plan definitions.
 */
export const PLANS_CLIENT: ClientPlan[] = createStripePlans().map(
  ({ priceId, annualPriceId, ...clientPlan }) => clientPlan
);
