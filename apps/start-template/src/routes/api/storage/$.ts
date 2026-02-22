import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { file } from "@/lib/db/schema";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/api/storage/$")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { _splat: string };
      }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const key = decodeURIComponent(params._splat);

        try {
          const [metadata] = await db
            .select()
            .from(file)
            .where(eq(file.key, key))
            .limit(1);

          if (!metadata) {
            return new Response("File not found", { status: 404 });
          }

          // Verify file ownership
          if (
            metadata.userId !== session.user.id &&
            metadata.organizationId !==
              session.session?.activeOrganizationId
          ) {
            return new Response("Forbidden", { status: 403 });
          }

          const fileData = await storage.download(key);

          // Create a proper copy of the data to avoid buffer view issues
          const dataArray = new Uint8Array(fileData.data);

          return new Response(dataArray, {
            status: 200,
            headers: {
              "Content-Type": metadata.mimeType,
              "Content-Length": String(dataArray.length),
              "Cache-Control": "public, max-age=86400",
            },
          });
        } catch (error) {
          console.error("Failed to serve file:", error);
          return new Response("Failed to load file", { status: 500 });
        }
      },
    },
  },
});
