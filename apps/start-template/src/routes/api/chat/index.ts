import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { createFileRoute } from "@tanstack/react-router";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

import { auth } from "@/lib/auth/auth";
import { getStreamContext } from "@/lib/chat/stream-context";

type ChatProvider = "openai" | "anthropic" | "gemini";

type ChatRequestBody = {
  id?: string;
  messages: UIMessage[];
  provider?: ChatProvider;
  model?: string;
};

const DEFAULT_MODELS: Record<ChatProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash",
};

function getModel(provider: ChatProvider, modelId: string) {
  switch (provider) {
    case "anthropic":
      return anthropic(modelId);
    case "gemini":
      return google(modelId);
    default:
      return openai(modelId);
  }
}

function normalizeProvider(provider?: string): ChatProvider {
  if (provider === "anthropic" || provider === "gemini") {
    return provider;
  }
  return "openai";
}

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const [session, body] = await Promise.all([
            auth.api.getSession({ headers: request.headers }),
            request.json() as Promise<ChatRequestBody>,
          ]);

          if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const { messages, id: chatId } = body;
          const provider = normalizeProvider(body.provider);
          const modelId = body.model?.trim() || DEFAULT_MODELS[provider];
          const model = getModel(provider, modelId);

          const streamContext = await getStreamContext();
          const streamId = chatId ?? crypto.randomUUID();

          const result = streamText({
            model,
            messages: await convertToModelMessages(messages),
          });

          if (streamContext) {
            const response = result.toUIMessageStreamResponse({
              sendReasoning: true,
              sendSources: true,
            });

            // Wrap with resumable stream
            const resumable = await streamContext.createNewResumableStream(
              streamId,
              () => {
                if (!response.body) {
                  throw new Error("Response body is null");
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                return new ReadableStream<string>({
                  async pull(controller) {
                    const { done, value } = await reader.read();
                    if (done) {
                      controller.close();
                      return;
                    }
                    controller.enqueue(decoder.decode(value, { stream: true }));
                  },
                });
              }
            );

            if (resumable) {
              const encoder = new TextEncoder();
              const responseStream = resumable.pipeThrough(
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
                  "X-AI-Provider": provider,
                  "X-AI-Model": modelId,
                },
              });
            }
          }

          // Fallback: no Redis / no resumable stream context
          return result.toUIMessageStreamResponse({
            sendReasoning: true,
            sendSources: true,
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
