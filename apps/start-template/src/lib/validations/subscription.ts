import { z } from "zod";

/**
 * Schema for upgrading to a subscription plan
 */
export const upgradePlanSchema = z.object({
  plan: z.enum(["free", "starter", "pro", "enterprise"], {
    error: "Please select a valid plan",
  }),
  annual: z.boolean().optional().default(false),
  referenceId: z.string().optional(),
  seats: z.number().int().positive().optional(),
});

/**
 * Schema for canceling a subscription
 */
export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  reason: z.string().optional(),
});

/**
 * Schema for restoring a canceled subscription
 */
export const restoreSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

/**
 * Schema for billing portal request
 */
export const billingPortalSchema = z.object({
  referenceId: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

// Type exports
export type UpgradePlanFormData = z.infer<typeof upgradePlanSchema>;
export type CancelSubscriptionFormData = z.infer<
  typeof cancelSubscriptionSchema
>;
export type RestoreSubscriptionFormData = z.infer<
  typeof restoreSubscriptionSchema
>;
export type BillingPortalFormData = z.infer<typeof billingPortalSchema>;
