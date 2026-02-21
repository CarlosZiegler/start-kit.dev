"use client";

import { CheckIcon, ClipboardIcon, LinkIcon, TerminalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { ThemeConfig } from "./themes.types";
import { buildCliCommand, buildShareUrl } from "./themes.search-params";
import { generateCssVars } from "./themes.utils";

function CopyButton({
  label,
  icon: Icon,
  getText,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getText: () => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={handleCopy}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <Icon className="size-3.5" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function ThemeActions({ config }: { config: ThemeConfig }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        label="Copy CSS"
        icon={ClipboardIcon}
        getText={() => generateCssVars(config)}
      />
      <CopyButton
        label="Copy CLI"
        icon={TerminalIcon}
        getText={() => buildCliCommand(config)}
      />
      <CopyButton
        label="Share URL"
        icon={LinkIcon}
        getText={() => buildShareUrl(config)}
      />
    </div>
  );
}
