import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  generateId,
  streamText,
  type UIMessage,
} from "ai";
import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";
import { saveChat } from "@/lib/chat/chat-store";
import { getStreamContext } from "@/lib/chat/stream-context";

type ChatProvider = "openai" | "anthropic" | "gemini";

type ChatRequestBody = {
  id?: string;
  message?: UIMessage;
  messages?: UIMessage[];
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

          const chatId = body.id ?? generateId();
          const provider = normalizeProvider(body.provider);
          const modelId = body.model?.trim() || DEFAULT_MODELS[provider];
          const model = getModel(provider, modelId);

          const messages = body.messages ?? [];

          const result = streamText({
            model,
            messages: await convertToModelMessages(messages),
          });

          const streamContext = await getStreamContext();

          return result.toUIMessageStreamResponse({
            sendReasoning: true,
            sendSources: true,
            originalMessages: messages,
            generateMessageId: generateId,
            onFinish: async ({ messages: finalMessages }) => {
              await saveChat({
                id: chatId,
                userId: session.user.id,
                messages: finalMessages,
                activeStreamId: null,
              });
            },
            ...(streamContext
              ? {
                  consumeSseStream: async ({ stream }) => {
                    const streamId = generateId();
                    await streamContext.createNewResumableStream(
                      streamId,
                      () => stream
                    );
                    await saveChat({
                      id: chatId,
                      userId: session.user.id,
                      activeStreamId: streamId,
                    });
                  },
                }
              : {}),
          });
        } catch (error: unknown) {
          console.error(error);
          const message =
            process.env.NODE_ENV === "production"
              ? "An error occurred"
              : error instanceof Error
                ? error.message
                : "An error occurred";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
