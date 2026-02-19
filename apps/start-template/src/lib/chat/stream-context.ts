import { RedisClient } from "bun";
import {
  createResumableStreamContext,
  type Publisher,
  type Subscriber,
} from "resumable-stream/generic";

import { env } from "@/lib/env.server";

let streamContextInstance: ReturnType<
  typeof createResumableStreamContext
> | null = null;

/**
 * Create Bun Redis adapter for resumable-stream Publisher interface
 */
function createPublisher(redis: RedisClient): Publisher {
  return {
    connect: async () => {
      // Bun Redis connects on first command, no-op here
    },
    publish: async (channel: string, message: string) => {
      const result = await redis.publish(channel, message);
      return result;
    },
    set: async (key: string, value: string, options?: { EX?: number }) => {
      if (options?.EX) {
        // Use SETEX for atomic set with expiry
        await redis.send("SETEX", [key, options.EX.toString(), value]);
        return "OK";
      }
      await redis.set(key, value);
      return "OK";
    },
    get: async (key: string) => {
      const result = await redis.get(key);
      return result;
    },
    incr: async (key: string) => {
      const result = await redis.send("INCR", [key]);
      return result as number;
    },
  };
}

/**
 * Create Bun Redis adapter for resumable-stream Subscriber interface
 */
function createSubscriber(redis: RedisClient): Subscriber {
  return {
    connect: async () => {
      // Bun Redis connects on first command, no-op here
    },
    subscribe: async (channel: string, callback: (message: string) => void) => {
      await redis.subscribe(channel, (message) => {
        callback(message);
      });
    },
    unsubscribe: async (channel: string) => {
      await redis.unsubscribe(channel);
    },
  };
}

/**
 * Get or create the resumable stream context.
 * Returns null if Redis is not configured.
 */
export async function getStreamContext() {
  if (streamContextInstance) {
    return streamContextInstance;
  }

  const redisUrl = env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    const publisherClient = new RedisClient(redisUrl);
    await publisherClient.connect();

    const subscriberClient = await publisherClient.duplicate();

    streamContextInstance = createResumableStreamContext({
      waitUntil: null,
      publisher: createPublisher(publisherClient),
      subscriber: createSubscriber(subscriberClient),
    });

    return streamContextInstance;
  } catch (error) {
    console.warn("[ResumableStream] Failed to initialize:", error);
    return null;
  }
}
