import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";
import { getStreamContext } from "@/lib/chat/stream-context";

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const [session, body, streamContext] = await Promise.all([
            auth.api.getSession({ headers: request.headers }),
            request.json() as Promise<{ messages: unknown[]; conversationId?: string }>,
            getStreamContext(),
          ]);

          if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const { messages, conversationId } = body;
          const abortController = new AbortController();
          const streamId = crypto.randomUUID();

          const createBaseStream = () => {
            const baseStream = chat({
              adapter: openaiText("gpt-5-mini"),
              messages,
              conversationId,
            });
            return toServerSentEventsStream(baseStream, abortController);
          };

          let responseStream: ReadableStream<Uint8Array>;

          if (streamContext) {
            // Wrap with resumable stream for persistence
            const resumable = await streamContext.createNewResumableStream(
              streamId,
              () => {
                // Convert Uint8Array stream to string stream for resumable-stream
                const baseStream = createBaseStream();
                const decoder = new TextDecoder();
                return baseStream.pipeThrough(
                  new TransformStream<Uint8Array, string>({
                    transform(chunk, controller) {
                      controller.enqueue(
                        decoder.decode(chunk, { stream: true })
                      );
                    },
                  })
                );
              }
            );

            if (resumable) {
              // Convert back to Uint8Array for Response
              const encoder = new TextEncoder();
              responseStream = resumable.pipeThrough(
                new TransformStream<string, Uint8Array>({
                  transform(chunk, controller) {
                    controller.enqueue(encoder.encode(chunk));
                  },
                })
              );
            } else {
              // Stream already completed
              responseStream = createBaseStream();
            }
          } else {
            // No Redis, use base stream directly
            responseStream = createBaseStream();
          }

          return new Response(responseStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "X-Stream-Id": streamContext ? streamId : "",
              "X-Conversation-Id": conversationId ?? "",
            },
          });
        } catch (error: unknown) {
          console.error(error);
          const message =
            error instanceof Error ? error.message : "An error occurred";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
