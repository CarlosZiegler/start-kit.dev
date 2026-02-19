import { createFileRoute } from "@tanstack/react-router";

import { BlockGeneratorPage } from "@/features/lab/block-generator/block-generator.page";

export const Route = createFileRoute("/(dashboard)/lab/block-generator/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BlockGeneratorPage />;
}
