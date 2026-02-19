export type PlanName = "free" | "starter" | "pro" | "enterprise";

export type PlanLimits = {
  projects: number;
  storage: number; // in GB
  apiCalls: number; // per month, -1 for unlimited
};

export type BasePlan = {
  name: PlanName;
  displayName: string;
  description: string;
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
