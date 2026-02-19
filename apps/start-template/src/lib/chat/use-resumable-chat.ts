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

const connection = () =>
  stream((messages, data) => {
    const conversationId = data?.conversationId ?? crypto.randomUUID();

    // Return async generator directly (not a Promise)
    return (async function* () {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, conversationId, ...data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      yield* parseSSEResponse(response, conversationId);
    })();
  });

export function useResumableChat() {
  const [isResuming, setIsResuming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const chat = useChat({ connection: connection() });
  const messagesRef = useRef<UIMessage[]>(chat.messages);

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
        for await (const chunk of resumeStream(
          "/api/chat",
          controller.signal
        )) {
          if (chunk.type === "content" && chunk.delta) {
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
                      { ...textPart, content: textPart.content + chunk.delta },
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
    isInitialized,
    isResuming,
    isStreaming: chat.isLoading || isResuming,
    clearChat,
  };
}
