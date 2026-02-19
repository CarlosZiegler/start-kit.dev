import { createFileRoute } from "@tanstack/react-router";

import { McpAppsLabPage } from "@/features/lab/mcp-apps/mcp-apps.page";

export const Route = createFileRoute("/(dashboard)/lab/mcp-apps/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <McpAppsLabPage />;
}
