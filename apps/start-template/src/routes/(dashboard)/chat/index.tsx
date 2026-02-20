import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Badge } from "@/components/ui/badge";
import {
  type ChatProvider,
  useResumableChat,
} from "@/lib/chat/use-resumable-chat";

export const Route = createFileRoute("/(dashboard)/chat/" as any)({
  component: RouteComponent,
});

type ModelOption = {
  provider: ChatProvider;
  label: string;
  model: string;
};

const MODELS: ModelOption[] = [
  { provider: "openai", model: "gpt-5-mini", label: "GPT-5 Mini" },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
  },
  { provider: "gemini", model: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

function RouteComponent() {
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const chat = useResumableChat();

  const selectedLabel = useMemo(() => {
    const found = MODELS.find(
      (item) =>
        item.provider === chat.runtime.provider && item.model === chat.runtime.model
    );
    return found?.label ?? `${chat.runtime.provider} · ${chat.runtime.model}`;
  }, [chat.runtime.model, chat.runtime.provider]);

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl">AI Chat</h1>
          <p className="text-muted-foreground text-sm">
            TanStack AI streaming with resumable chat.
          </p>
        </div>

        <ModelSelector onOpenChange={setModelPickerOpen} open={modelPickerOpen}>
          <ModelSelectorTrigger className="inline-flex items-center justify-start rounded-md border px-3 py-2 text-sm">
            {selectedLabel}
          </ModelSelectorTrigger>

          <ModelSelectorContent title="Select model">
            <ModelSelectorInput placeholder="Search model..." />
            <ModelSelectorList>
              <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
              <ModelSelectorGroup heading="Models">
                {MODELS.map((item) => (
                  <ModelSelectorItem
                    key={`${item.provider}:${item.model}`}
                    onSelect={() => {
                      chat.setRuntime({
                        provider: item.provider,
                        model: item.model,
                      });
                      setModelPickerOpen(false);
                    }}
                    value={`${item.label} ${item.provider} ${item.model}`}
                  >
                    <ModelSelectorLogo provider={item.provider} />
                    <ModelSelectorName>{item.label}</ModelSelectorName>
                    <span className="text-muted-foreground text-xs">
                      {item.provider}
                    </span>
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            </ModelSelectorList>
          </ModelSelectorContent>
        </ModelSelector>
      </div>

      <Conversation className="min-h-0 flex-1 rounded-xl border">
        <ConversationContent className="px-4 py-3">
          {chat.messages.length === 0 ? (
            <ConversationEmptyState
              description="Start a conversation with your selected provider."
              icon={<MessageSquareIcon className="size-10" />}
              title="No messages yet"
            />
          ) : (
            chat.messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    if (part.type !== "text") {
                      return null;
                    }

                    const text =
                      (part as any).content ?? (part as any).text ?? "";

                    if (!text) {
                      return null;
                    }

                    return (
                      <MessageResponse key={`${message.id}-${index}`}>
                        {text}
                      </MessageResponse>
                    );
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="w-full"
        onSubmit={async ({ text }) => {
          if (!text.trim() || chat.isStreaming) {
            return;
          }

          await (chat.sendMessage as any)(text, {
            data: {
              provider: chat.runtime.provider,
              model: chat.runtime.model,
            },
          });
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea placeholder="Type your message..." />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <Badge className="capitalize" variant="secondary">
              {chat.runtime.provider}
            </Badge>
            <Badge variant="outline">{chat.runtime.model}</Badge>
          </PromptInputTools>

          <PromptInputSubmit
            disabled={chat.isStreaming}
            status={chat.isStreaming ? "streaming" : "ready"}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
