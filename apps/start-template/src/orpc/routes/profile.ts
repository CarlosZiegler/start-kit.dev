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

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

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

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      // Delete old avatar records from DB (keep files in S3 for potential recovery)
      await context.db
        .delete(file)
        .where(
          and(eq(file.userId, session.user.id), eq(file.purpose, "avatar"))
        );

      // Upload new avatar
      const result = await storage.uploadFile(input.file, {
        userId: session.user.id,
        purpose: "avatar",
        fileName: input.file.name,
      });

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

      // Use presigned S3 URL
      const url = await storage.getUrl(result.key);

      const [updatedUser] = await context.db
        .update(user)
        .set({
          image: fileRecord.id,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id))
        .returning();

      return {
        success: true,
        imageId: fileRecord.id,
        imageUrl: url,
        user: updatedUser,
      };
    }),

  removeAvatar: protectedProcedure.handler(async ({ context }) => {
    const { session } = context;

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const [avatarFile] = await context.db
      .select()
      .from(file)
      .where(and(eq(file.userId, session.user.id), eq(file.purpose, "avatar")))
      .limit(1);

    if (avatarFile) {
      await storage.delete(avatarFile.key);
      await context.db.delete(file).where(eq(file.id, avatarFile.id));
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
        throw new Error("User ID is required");
      }

      // First get the user to find their avatar reference
      const [targetUser] = await context.db
        .select({ id: user.id, image: user.image })
        .from(user)
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (!targetUser?.image) {
        return { imageUrl: null, imageId: null };
      }

      // Then get the file metadata by ID
      const [avatarFile] = await context.db
        .select()
        .from(file)
        .where(eq(file.id, targetUser.image))
        .limit(1);

      let imageUrl: string | null = null;

      if (avatarFile) {
        // Use presigned S3 URL
        imageUrl = await storage.getUrl(avatarFile.key);
      }

      return {
        imageUrl,
        imageId: avatarFile?.id ?? null,
      };
    }),
});
