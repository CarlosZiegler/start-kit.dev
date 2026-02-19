type Chunk = {
  type: string;
  delta?: string;
  content?: string;
};

/**
 * Converts TanStack AI stream to raw text stream.
 * Extracts delta content from StreamChunk and outputs plain text.
 * Compatible with useUIStream from @json-render/react.
 */
export function toTextStream(
  stream: AsyncIterable<Chunk>,
  abortController?: AbortController
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (abortController?.signal.aborted) {
            break;
          }

          if (chunk.type === "content" && chunk.delta) {
            controller.enqueue(encoder.encode(chunk.delta));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      abortController?.abort();
    },
  });
}
