import { createContext, type ReactNode, useContext } from "react";

import { useStripeSubscription } from "@/features/payment/stripe/use-stripe-subscription";

type SubscriptionContextValue = ReturnType<typeof useStripeSubscription>;

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

type SubscriptionProviderProps = {
  children: ReactNode;
  referenceId?: string;
};

export function SubscriptionProvider({
  children,
  referenceId,
}: SubscriptionProviderProps) {
  const subscription = useStripeSubscription(referenceId);

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within SubscriptionProvider"
    );
  }
  return context;
}
