import { createFileRoute } from "@tanstack/react-router";

import { ChatPage } from "@/features/lab/chat/chat.page";

export const Route = createFileRoute("/(dashboard)/lab/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatPage />;
}
