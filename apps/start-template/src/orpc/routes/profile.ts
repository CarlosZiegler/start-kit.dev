import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { file, user } from "@/lib/db/schema";
import { env } from "@/lib/env.server";
import { storage } from "@/lib/storage";

import { orpc, protectedProcedure } from "../orpc-server";

export const profileRouter = orpc.router({
  update: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, "Name must be at least 2 characters")
          .max(50, "Name must be less than 50 characters"),
        email: z.string().email("Invalid email address"),
      })
    )
    .handler(async ({ input, context }) => {
      const { session } = context;

      const [updatedUser] = await context.db
        .update(user)
        .set({
          name: input.name,
          email: input.email,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id))
        .returning();

      return { success: true, user: updatedUser };
    }),

  uploadAvatar: protectedProcedure
    .input(z.object({ file: z.instanceof(File) }))
    .handler(async ({ input, context }) => {
      const { session } = context;

      // Upload new avatar first, then delete old (avoids losing avatar if upload fails)
      const result = await storage.uploadFile(input.file, {
        userId: session.user.id,
        purpose: "avatar",
        fileName: input.file.name,
      });

      await context.db
        .delete(file)
        .where(
          and(eq(file.userId, session.user.id), eq(file.purpose, "avatar"))
        );

      const [fileRecord] = await context.db
        .insert(file)
        .values({
          id: crypto.randomUUID(),
          key: result.key,
          provider: "s3",
          bucket: env.S3_BUCKET ?? null,
          size: Number(result.size),
          mimeType: result.contentType ?? input.file.type,
          fileName: input.file.name,
          userId: session.user.id,
          organizationId: null,
          purpose: "avatar",
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Get presigned URL and update user in parallel
      const [url] = await Promise.all([
        storage.getUrl(result.key),
        context.db
          .update(user)
          .set({
            image: fileRecord.id,
            updatedAt: new Date(),
          })
          .where(eq(user.id, session.user.id)),
      ]);

      return {
        success: true,
        imageId: fileRecord.id,
        imageUrl: url,
      };
    }),

  removeAvatar: protectedProcedure.handler(async ({ context }) => {
    const { session } = context;

    const [avatarFile] = await context.db
      .select()
      .from(file)
      .where(and(eq(file.userId, session.user.id), eq(file.purpose, "avatar")))
      .limit(1);

    if (avatarFile) {
      await Promise.all([
        storage.delete(avatarFile.key),
        context.db.delete(file).where(eq(file.id, avatarFile.id)),
      ]);
    }

    await context.db
      .update(user)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return { success: true };
  }),

  getAvatarUrl: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .handler(async ({ input, context }) => {
      const { session } = context;
      const targetUserId = input.userId ?? session?.user?.id;

      if (!targetUserId) {
        throw new ORPCError("BAD_REQUEST", { message: "User ID is required" });
      }

      // Single query with LEFT JOIN to get user and avatar file in one round-trip
      const [result] = await context.db
        .select({
          userId: user.id,
          userImage: user.image,
          fileId: file.id,
          fileKey: file.key,
        })
        .from(user)
        .leftJoin(file, eq(file.id, user.image))
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (!result || !result.fileKey) {
        return { imageUrl: null, imageId: null };
      }

      // Use presigned S3 URL
      const imageUrl = await storage.getUrl(result.fileKey);

      return {
        imageUrl,
        imageId: result.fileId ?? null,
      };
    }),
});
