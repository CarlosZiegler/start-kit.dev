import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { CheckIcon, GlobeIcon, MessageSquareIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { AttachmentData } from "@/components/ai-elements/attachments";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
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
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

// biome-ignore lint/suspicious/noExplicitAny: TanStack Router route group path requires type assertion
export const Route = createFileRoute("/(dashboard)/chat/" as any)({
  component: RouteComponent,
});

type ChatProvider = "openai" | "anthropic" | "gemini";

type ModelOption = {
  provider: ChatProvider;
  model: string;
  label: string;
  chefSlug: string;
  providers: string[];
};

const MODELS: ModelOption[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    label: "GPT-4o",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    label: "GPT-4o Mini",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    label: "Claude 4 Sonnet",
    chefSlug: "anthropic",
    providers: ["anthropic"],
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
    chefSlug: "anthropic",
    providers: ["anthropic"],
  },
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    chefSlug: "google",
    providers: ["google"],
  },
];

const MODEL_GROUPS = ["OpenAI", "Anthropic", "Google"] as const;

const MODEL_GROUP_MAP: Record<string, ChatProvider> = {
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "gemini",
};

const SUGGESTIONS = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
];

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: AttachmentData;
  onRemove: (id: string) => void;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [onRemove, attachment.id]);

  return (
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

function RouteComponent() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(false);

  const { messages, sendMessage, status, stop } = useChat({
    id: "chat-main",
    resume: true,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        provider: selectedModel.provider,
        model: selectedModel.model,
      }),
      prepareReconnectToStreamRequest: ({ id }) => ({
        api: `/api/chat/resume?chatId=${id}`,
      }),
    }),
  });

  const isGenerating = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      if (!hasText || isGenerating) {
        return;
      }
      sendMessage({ text: message.text });
      setText("");
    },
    [isGenerating, sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (isGenerating) return;
      sendMessage({ text: suggestion });
    },
    [isGenerating, sendMessage],
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleAudioRecorded = useCallback(async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Transcription failed");
    }

    const data = await response.json();
    return data.text as string;
  }, []);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const toggleWebSearch = useCallback(() => {
    setUseWebSearch((prev) => !prev);
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    const found = MODELS.find((m) => m.model === modelId);
    if (found) {
      setSelectedModel(found);
    }
    setModelSelectorOpen(false);
  }, []);

  const isSubmitDisabled = useMemo(
    () => !text.trim() || isGenerating,
    [text, isGenerating],
  );

  return (
    <div className="relative mx-auto flex h-[calc(100vh-9rem)] w-full max-w-5xl flex-col divide-y overflow-hidden">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="px-4 py-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Start a conversation with your selected AI model."
              icon={<MessageSquareIcon className="size-10" />}
              title="No messages yet"
            />
          ) : (
            <>
              {messages.map((message) => {
                const sourceParts = message.parts.filter(
                  (p) => p.type === "source-url",
                );

                return (
                  <Message from={message.role} key={message.id}>
                    <div>
                      {sourceParts.length > 0 && (
                        <Sources>
                          <SourcesTrigger count={sourceParts.length} />
                          <SourcesContent>
                            {sourceParts.map((part) => {
                              if (part.type !== "source-url") return null;
                              return (
                                <Source
                                  href={part.url}
                                  key={part.sourceId}
                                  title={part.title}
                                />
                              );
                            })}
                          </SourcesContent>
                        </Sources>
                      )}
                      <MessageContent>
                        {message.parts.map((part) => {
                          if (part.type === "reasoning") {
                            return (
                              <Reasoning
                                isStreaming={
                                  isGenerating &&
                                  message.id ===
                                    messages[messages.length - 1]?.id
                                }
                                key={`${message.id}-reasoning`}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>
                                  {part.text}
                                </ReasoningContent>
                              </Reasoning>
                            );
                          }

                          if (part.type === "text") {
                            if (!part.text) return null;
                            return (
                              <MessageResponse key={`${message.id}-text`}>
                                {part.text}
                              </MessageResponse>
                            );
                          }

                          return null;
                        })}
                      </MessageContent>
                    </div>
                  </Message>
                );
              })}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer className="text-sm">
                      Thinking...
                    </Shimmer>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid shrink-0 gap-4 pt-4">
        {messages.length === 0 && (
          <Suggestions className="px-4">
            {SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={handleTextChange}
                placeholder="Type your message..."
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onAudioRecorded={handleAudioRecorded}
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
                <PromptInputButton
                  onClick={toggleWebSearch}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger
                    render={
                      <PromptInputButton>
                        <ModelSelectorLogo
                          provider={selectedModel.chefSlug}
                        />
                        <ModelSelectorName>
                          {selectedModel.label}
                        </ModelSelectorName>
                      </PromptInputButton>
                    }
                  />
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>
                        No models found.
                      </ModelSelectorEmpty>
                      {MODEL_GROUPS.map((group) => (
                        <ModelSelectorGroup heading={group} key={group}>
                          {MODELS.filter(
                            (m) => m.provider === MODEL_GROUP_MAP[group],
                          ).map((m) => (
                            <ModelSelectorItem
                              key={m.model}
                              onSelect={() => handleModelSelect(m.model)}
                              value={m.model}
                            >
                              <ModelSelectorLogo provider={m.chefSlug} />
                              <ModelSelectorName>
                                {m.label}
                              </ModelSelectorName>
                              <ModelSelectorLogoGroup>
                                {m.providers.map((provider) => (
                                  <ModelSelectorLogo
                                    key={provider}
                                    provider={provider}
                                  />
                                ))}
                              </ModelSelectorLogoGroup>
                              {selectedModel.model === m.model ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isSubmitDisabled}
                onStop={stop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
