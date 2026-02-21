import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";
import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";

export const Route = createFileRoute("/api/transcribe/")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const [session, formData] = await Promise.all([
            auth.api.getSession({ headers: request.headers }),
            request.formData(),
          ]);

          if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const audioFile = formData.get("audio");

          if (!audioFile || !(audioFile instanceof Blob)) {
            return new Response(
              JSON.stringify({ error: "No audio file provided" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const audioData = new Uint8Array(await audioFile.arrayBuffer());

          const result = await transcribe({
            model: openai.transcription("whisper-1"),
            audio: audioData,
          });

          return new Response(JSON.stringify({ text: result.text }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: unknown) {
          console.error("Transcription error:", error);
          const message =
            error instanceof Error ? error.message : "Transcription failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
