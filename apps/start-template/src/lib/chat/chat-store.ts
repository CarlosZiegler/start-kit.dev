import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { chat } from "@/lib/db/schema";

export async function readChat(id: string) {
  const [result] = await db
    .select()
    .from(chat)
    .where(eq(chat.id, id))
    .limit(1);

  return result ?? null;
}

export async function saveChat({
  id,
  userId,
  messages,
  activeStreamId,
  title,
}: {
  id: string;
  userId: string;
  messages?: unknown[];
  activeStreamId?: string | null;
  title?: string | null;
}) {
  const existing = await db
    .select({ id: chat.id })
    .from(chat)
    .where(eq(chat.id, id))
    .limit(1);

  if (existing.length > 0) {
    const updates: Record<string, unknown> = {};
    if (messages !== undefined) updates.messages = messages;
    if (activeStreamId !== undefined) updates.activeStreamId = activeStreamId;
    if (title !== undefined) updates.title = title;

    await db.update(chat).set(updates).where(eq(chat.id, id));
  } else {
    await db.insert(chat).values({
      id,
      userId,
      messages: messages ?? [],
      activeStreamId: activeStreamId ?? null,
      title: title ?? null,
    });
  }
}
