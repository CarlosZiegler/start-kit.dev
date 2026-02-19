import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { file } from "@/lib/db/schema";
import { env } from "@/lib/env.server";
import { storage } from "@/lib/storage";

import { orpc, protectedProcedure } from "../orpc-server";

export const storageRouter = orpc.router({
  upload: protectedProcedure
    .input(
      z.object({
        file: z.instanceof(File),
        purpose: z.string().min(1, "Purpose is required"),
        organizationId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const result = await storage.uploadFile(input.file, {
        userId: session.user.id,
        organizationId: input.organizationId,
        purpose: input.purpose,
        fileName: input.file.name,
      });

      const [fileRecord] = await context.db
        .insert(file)
        .values({
          id: crypto.randomUUID(),
          key: result.key,
          provider: env.STORAGE_PROVIDER,
          bucket: env.S3_BUCKET ?? null,
          size: result.size,
          mimeType: result.contentType ?? input.file.type,
          fileName: input.file.name,
          userId: session.user.id,
          organizationId: input.organizationId ?? null,
          purpose: input.purpose,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const url = await storage.getUrl(result.key, 86_400);

      return {
        key: result.key,
        fileId: fileRecord.id,
        url,
        size: result.size,
        mimeType: result.contentType ?? input.file.type,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const [fileRecord] = await context.db
        .select()
        .from(file)
        .where(eq(file.id, input.fileId))
        .limit(1);

      if (!fileRecord) {
        throw new Error("File not found");
      }

      if (
        fileRecord.userId !== session.user.id &&
        fileRecord.organizationId !== session.session.activeOrganizationId
      ) {
        throw new Error("Unauthorized to delete this file");
      }

      await storage.delete(fileRecord.key);

      await context.db.delete(file).where(eq(file.id, input.fileId));

      return { success: true };
    }),

  getUrl: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1, "Key is required"),
        expiresIn: z.number().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const [fileRecord] = await context.db
        .select()
        .from(file)
        .where(eq(file.key, input.key))
        .limit(1);

      if (!fileRecord) {
        throw new Error("File not found");
      }

      if (
        fileRecord.userId !== session.user.id &&
        fileRecord.organizationId !== session.session.activeOrganizationId
      ) {
        throw new Error("Unauthorized to access this file");
      }

      const url = await storage.getUrl(input.key, input.expiresIn);

      return { url };
    }),

  presignUpload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1, "File name is required"),
        purpose: z.string().min(1, "Purpose is required"),
        expiresIn: z.number().default(3600),
        organizationId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const { key, url } = await storage.presignUpload(
        input.fileName,
        input.purpose,
        session.user.id,
        input.expiresIn,
        input.organizationId
      );

      return {
        key,
        url,
      };
    }),

  presignCallback: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1, "Key is required"),
        mimeType: z.string().min(1, "MIME type is required"),
        size: z.number().min(0, "Size must be positive"),
        purpose: z.string().min(1, "Purpose is required"),
        fileName: z.string().min(1, "File name is required"),
        organizationId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const [fileRecord] = await context.db
        .select()
        .from(file)
        .where(eq(file.key, input.key))
        .limit(1);

      if (fileRecord) {
        return { fileId: fileRecord.id };
      }

      const [newRecord] = await context.db
        .insert(file)
        .values({
          id: crypto.randomUUID(),
          key: input.key,
          provider: env.STORAGE_PROVIDER,
          bucket: env.S3_BUCKET ?? null,
          size: input.size,
          mimeType: input.mimeType,
          fileName: input.fileName,
          userId: session.user.id,
          organizationId: input.organizationId ?? null,
          purpose: input.purpose,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { fileId: newRecord.id };
    }),

  list: protectedProcedure
    .input(
      z.object({
        purpose: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const conditions = [eq(file.userId, session.user.id)];

      if (input.purpose) {
        conditions.push(eq(file.purpose, input.purpose));
      }

      if (session.session.activeOrganizationId) {
        conditions.push(
          eq(file.organizationId, session.session.activeOrganizationId)
        );
      }

      const files = await context.db
        .select()
        .from(file)
        .where(and(...conditions))
        .limit(input.limit)
        .orderBy(file.createdAt);

      return {
        files,
        total: files.length,
      };
    }),

  listBucket: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      /*
       * We want to List from the Bucket directly to verify what is there
       * This is for Debugging purposes only
       */

      const result = await storage.list({ limit: input.limit });

      return {
        files: result.files.map((f) => ({
          ...f,
          id: f.key, // Use key as ID for display
          fileName: f.key.split("/").pop() ?? f.key, // Simple filename extraction
          mimeType: "application/octet-stream", // Unknown type from plain list
          createdAt: f.lastModified,
        })),
        total: result.files.length,
      };
    }),
});
