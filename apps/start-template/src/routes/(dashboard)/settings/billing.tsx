import { createFileRoute } from "@tanstack/react-router";

import { SettingsContent } from "@/features/settings/settings.page.section";

export const Route = createFileRoute("/(dashboard)/settings/billing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SettingsContent id="billing" />;
}
