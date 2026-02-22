# int-payments-stripe: Integrate Stripe Payments Correctly

## Priority: MEDIUM

## Explanation

Stripe integration uses Better-Auth's Stripe plugin for subscription management. Plans are configured in `src/lib/stripe/plans.config.ts`, and lifecycle hooks handle subscription events. The plugin auto-creates Stripe customers on user signup.

## Bad Example

```typescript
// Wrong: manually managing Stripe customers and subscriptions
import Stripe from "stripe";

app.post("/create-checkout", async (req) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    customer_email: req.body.email,
    // Manual, no sync with auth system
  });
});
```

## Good Example: Plan Configuration

```typescript
// src/lib/stripe/plans.config.ts
export function createStripePlans() {
  return [
    {
      name: "free",
      displayName: "Free",
      priceId: { monthly: null, annual: null },
      limits: { projects: 1, storage: 100, apiCalls: 1000 },
      features: ["1 Project", "100MB Storage"],
    },
    {
      name: "starter",
      priceId: {
        monthly: env.STRIPE_STARTER_MONTHLY_PRICE_ID,
        annual: env.STRIPE_STARTER_ANNUAL_PRICE_ID,
      },
      price: { monthly: 9, annual: 90 },
      limits: { projects: 5, storage: 1000, apiCalls: 10000 },
    },
    {
      name: "pro",
      priceId: { monthly: env.STRIPE_PRO_MONTHLY_PRICE_ID, annual: env.STRIPE_PRO_ANNUAL_PRICE_ID },
      price: { monthly: 29, annual: 290 },
      freeTrial: { days: 14 },
    },
    // enterprise...
  ];
}
```

## Good Example: Better-Auth Stripe Plugin

```typescript
// In src/lib/auth/auth.ts — Stripe plugin config
stripe({
  stripeClient,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  createCustomerOnSignUp: true,
  subscription: {
    enabled: true,
    plans: createStripePlans(),
    requirePaymentMethod: true,
    authorization: async ({ session, plan }) => {
      // Custom authorization before plan changes
      return true;
    },
  },
  onSubscriptionComplete: async ({ subscription, session }) => {
    // Handle successful subscription
  },
  onSubscriptionCancel: async ({ subscription }) => {
    // Handle cancellation
  },
}),
```

## Context

- Plan config: `src/lib/stripe/plans.config.ts`
- Plan utilities: `src/lib/stripe/plan.utils.ts` (deprecated → use `@/lib/payment/plan.utils`)
- Better-Auth Stripe plugin handles: customer creation, checkout, webhooks, subscription sync
- Client uses `authClient.stripe` for subscription operations
- Stripe webhook endpoint is handled by Better-Auth automatically
- Plans: Free, Starter ($9/mo), Pro ($29/mo), Enterprise ($99/mo)
- Free trial supported via `freeTrial: { days: 14 }` on plan config
- Always use env vars for Stripe price IDs — never hardcode
