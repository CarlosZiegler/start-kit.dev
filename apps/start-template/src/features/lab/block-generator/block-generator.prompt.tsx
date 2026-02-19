"use client";

import { ArrowDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
  {
    label: "Login form",
    prompt:
      "Modern login form with email/password fields, social login buttons, forgot password link, and a subtle gradient card background",
  },
  {
    label: "Pricing card",
    prompt:
      "Premium pricing card with popular badge, feature list with checkmarks, monthly/yearly toggle hint, and call-to-action button",
  },
  {
    label: "User profile",
    prompt:
      "User profile card with large avatar, name, role badge, bio text, stats row (followers/posts/likes), and edit profile button",
  },
  {
    label: "Contact form",
    prompt:
      "Contact form with floating labels, name/email/subject/message fields, character counter, and animated submit button",
  },
];

type BlockGeneratorPromptProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  error: Error | null;
};

export function BlockGeneratorPrompt({
  onGenerate,
  isGenerating,
  error,
}: BlockGeneratorPromptProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input with submit button */}
      <div className="relative">
        <Textarea
          className="min-h-[60px] resize-none pr-14 text-base"
          disabled={isGenerating}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("LAB_BLOCK_GENERATOR_PLACEHOLDER")}
          rows={2}
          value={prompt}
        />
        <Button
          className="absolute right-2 bottom-2 size-10 rounded-full p-0"
          disabled={!prompt.trim() || isGenerating}
          onClick={handleSubmit}
          size="icon"
          type="button"
        >
          {isGenerating ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ArrowDown className="size-5" />
          )}
        </Button>
      </div>

      {/* Suggestions */}
      <p className="text-center text-muted-foreground text-sm">
        {t("LAB_SUGGESTIONS")}{" "}
        {SUGGESTIONS.map((s, i) => (
          <span key={s.label}>
            <button
              className="text-foreground underline underline-offset-2 hover:no-underline"
              onClick={() => {
                setPrompt(s.prompt);
                onGenerate(s.prompt);
              }}
              type="button"
            >
              {`"${s.label}"`}
            </button>
            {i < SUGGESTIONS.length - 1 && " or "}
          </span>
        ))}
      </p>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
