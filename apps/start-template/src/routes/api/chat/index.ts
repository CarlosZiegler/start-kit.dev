import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { createOpenaiChat } from "@tanstack/ai-openai";
import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";
import { getStreamContext } from "@/lib/chat/stream-context";

type ChatProvider = "openai" | "anthropic" | "gemini";

type ChatRequestBody = {
  messages: unknown[];
  conversationId?: string;
  provider?: ChatProvider;
  model?: string;
  data?: {
    provider?: ChatProvider;
    model?: string;
  };
};

const DEFAULT_PROVIDER: ChatProvider = "openai";

const DEFAULT_MODELS: Record<ChatProvider, string> = {
  openai: "gpt-5-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash",
};

function normalizeProvider(provider?: string): ChatProvider {
  if (provider === "anthropic" || provider === "gemini") {
    return provider;
  }
  return "openai";
}

function createAdapter(provider: ChatProvider, model?: string) {
  const selectedModel = model?.trim() || DEFAULT_MODELS[provider];

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required for provider 'anthropic'");
    }
    return createAnthropicChat(
      selectedModel as Parameters<typeof createAnthropicChat>[0],
      apiKey
    );
  }

  if (provider === "gemini") {
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) is required for provider 'gemini'"
      );
    }
    return createGeminiChat(
      selectedModel as Parameters<typeof createGeminiChat>[0],
      apiKey
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for provider 'openai'");
  }

  return createOpenaiChat(
    selectedModel as Parameters<typeof createOpenaiChat>[0],
    apiKey
  );
}

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const [session, body, streamContext] = await Promise.all([
            auth.api.getSession({ headers: request.headers }),
            request.json() as Promise<ChatRequestBody>,
            getStreamContext(),
          ]);

          if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const { messages, conversationId } = body;
          const provider = normalizeProvider(
            body.provider ?? body.data?.provider ?? DEFAULT_PROVIDER
          );
          const model = body.model ?? body.data?.model;

          const abortController = new AbortController();
          const streamId = crypto.randomUUID();

          const createBaseStream = () => {
            const baseStream = chat({
              adapter: createAdapter(provider, model),
              messages: messages as any,
              conversationId,
            });
            return toServerSentEventsStream(baseStream, abortController);
          };

          let responseStream: ReadableStream<Uint8Array>;

          if (streamContext) {
            const resumable = await streamContext.createNewResumableStream(
              streamId,
              () => {
                const baseStream = createBaseStream();
                const decoder = new TextDecoder();
                return baseStream.pipeThrough(
                  new TransformStream<Uint8Array, string>({
                    transform(chunk, controller) {
                      controller.enqueue(decoder.decode(chunk, { stream: true }));
                    },
                  })
                );
              }
            );

            if (resumable) {
              const encoder = new TextEncoder();
              responseStream = resumable.pipeThrough(
                new TransformStream<string, Uint8Array>({
                  transform(chunk, controller) {
                    controller.enqueue(encoder.encode(chunk));
                  },
                })
              );
            } else {
              responseStream = createBaseStream();
            }
          } else {
            responseStream = createBaseStream();
          }

          return new Response(responseStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "X-Stream-Id": streamContext ? streamId : "",
              "X-Conversation-Id": conversationId ?? "",
              "X-AI-Provider": provider,
              "X-AI-Model": model ?? DEFAULT_MODELS[provider],
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
