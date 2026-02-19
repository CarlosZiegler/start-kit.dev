import { createFileRoute } from "@tanstack/react-router";

import { getStreamContext } from "@/lib/chat/stream-context";

export const Route = createFileRoute("/api/chat/resume")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const streamId = url.searchParams.get("streamId");
        const skipChars = Number.parseInt(
          url.searchParams.get("skipChars") ?? "0",
          10
        );

        if (!streamId) {
          return new Response(JSON.stringify({ error: "Missing streamId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const streamContext = await getStreamContext();
        if (!streamContext) {
          return new Response(null, { status: 204 });
        }

        const streamStatus = await streamContext.hasExistingStream(streamId);
        if (streamStatus === null) {
          // Stream doesn't exist
          return new Response(null, { status: 204 });
        }

        if (streamStatus === "DONE") {
          // Stream completed, nothing more to resume
          return new Response(null, { status: 204 });
        }

        // Resume the stream from the specified character offset
        const resumedStream = await streamContext.resumeExistingStream(
          streamId,
          skipChars
        );

        if (!resumedStream) {
          return new Response(null, { status: 204 });
        }

        // Convert string stream to Uint8Array for Response
        const encoder = new TextEncoder();
        const responseStream = resumedStream.pipeThrough(
          new TransformStream<string, Uint8Array>({
            transform(chunk, controller) {
              controller.enqueue(encoder.encode(chunk));
            },
          })
        );

        return new Response(responseStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Stream-Id": streamId,
          },
        });
      },
    },
  },
});
