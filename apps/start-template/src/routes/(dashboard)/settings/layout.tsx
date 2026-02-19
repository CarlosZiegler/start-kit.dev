import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SubscriptionProvider } from "@/providers/subscription-provider";

export const Route = createFileRoute("/(dashboard)/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full">
      <SubscriptionProvider>
        <Outlet />
      </SubscriptionProvider>
    </div>
  );
}
