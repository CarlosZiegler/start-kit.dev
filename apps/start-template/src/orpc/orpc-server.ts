import { ORPCError, onError, os, ValidationError } from "@orpc/server";
import * as z from "zod";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { type RlsSession, withRls } from "@/lib/db/secure-client";

export const createORPCContext = async ({ headers }: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers,
  });

  return {
    db,
    rls: async <T>(fn: (tx: typeof db) => Promise<T>) => {
      if (!session?.user) {
        throw new ORPCError("UNAUTHORIZED");
      }
      return await withRls(session as RlsSession, fn);
    },
    session,
    auth,
    headers,
  };
};

const timingMiddleware = os.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.info(`\t[RPC] /${path.join("/")} executed after ${end - start}ms`);
  return result;
});

const errorMiddleware = (error: Error) => {
  console.error("ORPC Error protectedProcedure", error);
  if (
    error instanceof ORPCError &&
    error.code === "BAD_REQUEST" &&
    error.cause instanceof ValidationError
  ) {
    // If you only use Zod you can safely cast to ZodIssue[]
    const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);

    throw new ORPCError("INPUT_VALIDATION_FAILED", {
      status: 422,
      message: z.prettifyError(zodError),
      data: z.flattenError(zodError),
      cause: error.cause,
    });
  }

  if (
    error instanceof ORPCError &&
    error.code === "INTERNAL_SERVER_ERROR" &&
    error.cause instanceof ValidationError
  ) {
    throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
      cause: error.cause,
    });
  }

  if (error instanceof ORPCError) {
    throw error;
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: error.message,
    status: 500,
    cause: error,
  });
};

export type Context = Awaited<ReturnType<typeof createORPCContext>>;
export const orpc = os.$context<Context>();

const requireAuth = orpc.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return await next({
    context: {
      session: context.session,
    },
  });
});
export const publicProcedure = orpc
  .$context<Context>()
  .use(onError(errorMiddleware))
  .use(timingMiddleware);

export const protectedProcedure = publicProcedure
  .use(onError(errorMiddleware))
  .use(requireAuth);

const withRlsMiddleware = orpc.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return await withRls(context.session as RlsSession, async (rlsDb) => {
    return await next({
      context: {
        db: rlsDb,
      },
    });
  });
});

/**
 * Use this for routes that query tables protected by Postgres RLS policies.
 * It runs the handler inside a transaction, sets `request.user_id/org_id`,
 * and provides an RLS-scoped `db` for the handler.
 */
export const protectedRlsProcedure = protectedProcedure.use(withRlsMiddleware);
