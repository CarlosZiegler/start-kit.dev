import { useState } from "react";

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [copied, setCopied] = useState(false);

  const copy = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) {
      return;
    }

    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);

        if (onCopy) {
          onCopy();
        }

        setTimeout(() => {
          setCopied(false);
        }, timeout);
      },
      () => {
        // Silently handle copy errors
      }
    );
  };

  return { copied, copy };
}
