import { ORPCError } from "@orpc/server";
import { and, count, eq, or } from "drizzle-orm";
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

      const [fileRecord] = await context.db
        .select()
        .from(file)
        .where(eq(file.id, input.fileId))
        .limit(1);

      if (!fileRecord) {
        throw new ORPCError("NOT_FOUND", { message: "File not found" });
      }

      if (
        fileRecord.userId !== session.user.id &&
        fileRecord.organizationId !== session.session.activeOrganizationId
      ) {
        throw new ORPCError("FORBIDDEN", { message: "Unauthorized to delete this file" });
      }

      await Promise.all([
        storage.delete(fileRecord.key),
        context.db.delete(file).where(eq(file.id, input.fileId)),
      ]);

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

      const [fileRecord] = await context.db
        .select()
        .from(file)
        .where(eq(file.key, input.key))
        .limit(1);

      if (!fileRecord) {
        throw new ORPCError("NOT_FOUND", { message: "File not found" });
      }

      if (
        fileRecord.userId !== session.user.id &&
        fileRecord.organizationId !== session.session.activeOrganizationId
      ) {
        throw new ORPCError("FORBIDDEN", { message: "Unauthorized to access this file" });
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

      // Show user's personal files OR their active org's files (matching RLS OR logic)
      const ownershipCondition = session.session.activeOrganizationId
        ? or(
            eq(file.userId, session.user.id),
            eq(file.organizationId, session.session.activeOrganizationId)
          )
        : eq(file.userId, session.user.id);

      const conditions = input.purpose
        ? and(ownershipCondition, eq(file.purpose, input.purpose))
        : ownershipCondition;

      const [files, [totalResult]] = await Promise.all([
        context.db
          .select()
          .from(file)
          .where(conditions)
          .limit(input.limit)
          .orderBy(file.createdAt),
        context.db
          .select({ count: count() })
          .from(file)
          .where(conditions),
      ]);

      return {
        files,
        total: totalResult.count,
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

      // Scope listing to current user or active organization prefix
      const prefix = session.session.activeOrganizationId
        ? `${session.session.activeOrganizationId}/`
        : `${session.user.id}/`;

      const result = await storage.list({ prefix, limit: input.limit });

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
