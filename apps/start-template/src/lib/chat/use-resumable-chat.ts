import { stream, type UIMessage, useChat } from "@tanstack/ai-react";
import { useEffect, useRef, useState } from "react";

import {
  clearMessages,
  getSavedMessages,
  hasActiveStream,
  parseSSEResponse,
  resumeStream,
  saveMessages,
} from "./resumable-connection";

export type ChatProvider = "openai" | "anthropic" | "gemini";

export type ChatRuntimeOptions = {
  provider: ChatProvider;
  model: string;
};

const DEFAULT_CHAT_RUNTIME: ChatRuntimeOptions = {
  provider: "openai",
  model: "gpt-5-mini",
};

const connection = (getRuntime: () => ChatRuntimeOptions) =>
  stream((messages, data) => {
    const conversationId = data?.conversationId ?? crypto.randomUUID();

    const provider =
      (data?.provider as ChatProvider | undefined) ?? getRuntime().provider;
    const model = (data?.model as string | undefined) ?? getRuntime().model;

    return (async function* () {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          conversationId,
          ...data,
          provider,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      yield* parseSSEResponse(response, conversationId);
    })();
  });

export function useResumableChat(initialRuntime?: Partial<ChatRuntimeOptions>) {
  const [isResuming, setIsResuming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [runtime, setRuntime] = useState<ChatRuntimeOptions>({
    ...DEFAULT_CHAT_RUNTIME,
    ...initialRuntime,
  });

  const runtimeRef = useRef(runtime);
  const chat = useChat({ connection: connection(() => runtimeRef.current) });
  const messagesRef = useRef<UIMessage[]>(chat.messages);

  useEffect(() => {
    runtimeRef.current = runtime;
  }, [runtime]);

  // Sync messages to storage and ref
  useEffect(() => {
    messagesRef.current = chat.messages;
    if (chat.messages.length > 0) {
      saveMessages(chat.messages);
    }
  }, [chat.messages]);

  // Restore + resume on mount
  useEffect(() => {
    const saved = getSavedMessages();
    if (saved?.length) {
      chat.setMessages(saved);
      messagesRef.current = saved;
    }
    setIsInitialized(true);

    if (!hasActiveStream()) {
      return;
    }

    const controller = new AbortController();
    setIsResuming(true);

    (async () => {
      try {
        for await (const chunk of resumeStream("/api/chat", controller.signal)) {
          const normalized = chunk as { type?: string; delta?: string };

          if (normalized.type === "content" && normalized.delta) {
            const current = [...messagesRef.current];
            const last = current.at(-1);
            if (last?.role === "assistant") {
              const textPart = last.parts.find((p) => p.type === "text");
              if (textPart?.type === "text") {
                const updated = [
                  ...current.slice(0, -1),
                  {
                    ...last,
                    parts: [
                      { ...textPart, content: textPart.content + normalized.delta },
                    ],
                  },
                ];
                messagesRef.current = updated;
                chat.setMessages(updated);
              }
            }
          }
        }
      } catch {
        // Resume failed
      } finally {
        setIsResuming(false);
      }
    })();

    return () => controller.abort();
  }, [chat.setMessages]);

  const clearChat = () => {
    chat.setMessages([]);
    clearMessages();
  };

  return {
    ...chat,
    runtime,
    setRuntime,
    setProvider: (provider: ChatProvider) =>
      setRuntime((prev) => ({ ...prev, provider })),
    setModel: (model: string) => setRuntime((prev) => ({ ...prev, model })),
    isInitialized,
    isResuming,
    isStreaming: chat.isLoading || isResuming,
    clearChat,
  };
}
