import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { chat } from "@/lib/db/schema";

import { orpc, protectedProcedure } from "../orpc-server";

export const chatRouter = orpc.router({
  read: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [result] = await context.db
        .select()
        .from(chat)
        .where(
          and(
            eq(chat.id, input.id),
            eq(chat.userId, context.session.user.id)
          )
        )
        .limit(1);

      return result ?? null;
    }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        messages: z.array(z.record(z.string(), z.unknown())).optional(),
        activeStreamId: z.string().nullable().optional(),
        title: z.string().nullable().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const existing = await context.db
        .select({ id: chat.id })
        .from(chat)
        .where(eq(chat.id, input.id))
        .limit(1);

      if (existing.length > 0) {
        const updates: Record<string, unknown> = {};
        if (input.messages !== undefined) updates.messages = input.messages;
        if (input.activeStreamId !== undefined) updates.activeStreamId = input.activeStreamId;
        if (input.title !== undefined) updates.title = input.title;

        await context.db
          .update(chat)
          .set(updates)
          .where(
            and(
              eq(chat.id, input.id),
              eq(chat.userId, context.session.user.id)
            )
          );
      } else {
        await context.db.insert(chat).values({
          id: input.id,
          userId: context.session.user.id,
          messages: input.messages ?? [],
          activeStreamId: input.activeStreamId ?? null,
          title: input.title ?? null,
        });
      }

      return { success: true };
    }),

  list: protectedProcedure.handler(async ({ context }) => {
    return context.db
      .select({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })
      .from(chat)
      .where(eq(chat.userId, context.session.user.id))
      .orderBy(desc(chat.updatedAt));
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      await context.db
        .delete(chat)
        .where(
          and(
            eq(chat.id, input.id),
            eq(chat.userId, context.session.user.id)
          )
        );
      return { success: true };
    }),
});
