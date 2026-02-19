import type { StreamChunk, UIMessage } from "@tanstack/ai";

const STREAM_STORAGE_KEY = "chat:active-stream";
const MESSAGES_STORAGE_KEY = "chat:messages";

interface ActiveStream {
  charOffset: number; // Character offset for resumable-stream
  conversationId: string;
  streamId: string;
}

function getActiveStream(): ActiveStream | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(STREAM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setActiveStream(data: ActiveStream): void {
  try {
    sessionStorage.setItem(STREAM_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable
  }
}

function clearActiveStream(): void {
  try {
    sessionStorage.removeItem(STREAM_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

function updateStreamCharOffset(charOffset: number): void {
  const active = getActiveStream();
  if (active) {
    setActiveStream({ ...active, charOffset });
  }
}

/**
 * Save messages to sessionStorage for persistence across page refreshes.
 */
export function saveMessages(messages: UIMessage[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage unavailable or quota exceeded
  }
}

/**
 * Get saved messages from sessionStorage.
 */
export function getSavedMessages(): UIMessage[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear all saved messages from sessionStorage.
 */
export function clearMessages(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(MESSAGES_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

/**
 * Parse SSE response into StreamChunk async iterable.
 * Tracks character offset in sessionStorage for resume capability.
 */
export async function* parseSSEResponse(
  response: Response,
  conversationId: string
): AsyncIterable<StreamChunk> {
  const streamId = response.headers.get("X-Stream-Id");
  if (streamId) {
    setActiveStream({ streamId, conversationId, charOffset: 0 });
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let totalChars = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Stream ended normally (server closed connection)
        clearActiveStream();
        break;
      }

      const text = decoder.decode(value, { stream: true });
      totalChars += text.length;
      updateStreamCharOffset(totalChars);

      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            // Stream completed successfully
            clearActiveStream();
            return;
          }
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
          } catch {
            // Invalid JSON, skip
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
    // DON'T clear active stream here - only clear on successful completion
    // This preserves the stream info for resume after page refresh
  }
}

/**
 * Check if there's an active stream that can be resumed.
 */
export function hasActiveStream(): boolean {
  return getActiveStream() !== null;
}

/**
 * Resume an active stream from the last known character offset.
 */
export async function* resumeStream(
  baseUrl: string,
  abortSignal?: AbortSignal
): AsyncIterable<StreamChunk> {
  const active = getActiveStream();
  if (!active) {
    return;
  }

  const url = `${baseUrl}/resume?streamId=${encodeURIComponent(active.streamId)}&skipChars=${active.charOffset}`;
  const response = await fetch(url, { method: "GET", signal: abortSignal });

  if (response.status === 204) {
    clearActiveStream();
    return;
  }

  if (!response.ok) {
    clearActiveStream();
    throw new Error(`Resume failed: ${response.status}`);
  }

  yield* parseSSEResponse(response, active.conversationId);
}
