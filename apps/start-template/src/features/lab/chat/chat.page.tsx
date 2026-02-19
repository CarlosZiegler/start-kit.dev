"use client";

import { MessageCircleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { useResumableChat } from "@/lib/chat/use-resumable-chat";

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
];

export function ChatPage() {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const { messages, sendMessage, isStreaming, isInitialized, clearChat } =
    useResumableChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }
    sendMessage(message.text);
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const status = isStreaming ? "streaming" : "ready";

  const isChatLoading =
    status === "streaming" &&
    messages.at(-1)?.role === "assistant" &&
    !messages.at(-1)?.parts?.some((p) => p.type === "text");

  return (
    <div className="relative mx-auto size-full h-[calc(100vh-100px)] max-w-4xl p-6">
      <div className="flex h-full flex-col">
        {messages.length > 0 && (
          <div className="flex justify-end pb-2">
            <Button onClick={clearChat} size="sm" variant="ghost">
              <Trash2Icon className="size-4" />
              Clear
            </Button>
          </div>
        )}
        <Conversation>
          <ConversationContent>
            {isInitialized && messages.length === 0 ? (
              <ConversationEmptyState
                description={t("CHAT_EMPTY_DESC")}
                icon={<MessageCircleIcon className="size-12" />}
                title={t("CHAT_EMPTY_TITLE")}
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, idx) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={`${message.id}-${idx}`}>
                            {part.content}
                          </MessageResponse>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {isChatLoading && <Loader className="self-start" />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="grid shrink-0 gap-4 pt-4">
          {isInitialized && messages.length === 0 && (
            <Suggestions className="px-4">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
          )}
          <div className="w-full px-4 pb-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  disabled={isStreaming}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t("CHAT_PLACEHOLDER")}
                  value={text}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit
                  disabled={!text.trim() || isStreaming}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
