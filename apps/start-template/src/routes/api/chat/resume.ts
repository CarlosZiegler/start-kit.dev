import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { createFileRoute } from "@tanstack/react-router";

import { readChat } from "@/lib/chat/chat-store";
import { getStreamContext } from "@/lib/chat/stream-context";

export const Route = createFileRoute("/api/chat/resume")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const chatId = url.searchParams.get("chatId");

        if (!chatId) {
          return new Response(JSON.stringify({ error: "Missing chatId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const chatData = await readChat(chatId);
        if (!chatData?.activeStreamId) {
          return new Response(null, { status: 204 });
        }

        const streamContext = await getStreamContext();
        if (!streamContext) {
          return new Response(null, { status: 204 });
        }

        const resumedStream = await streamContext.resumeExistingStream(
          chatData.activeStreamId
        );

        if (!resumedStream) {
          return new Response(null, { status: 204 });
        }

        return new Response(resumedStream, {
          headers: UI_MESSAGE_STREAM_HEADERS,
        });
      },
    },
  },
});
