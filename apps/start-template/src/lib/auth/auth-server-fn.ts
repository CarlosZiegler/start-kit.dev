import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return next({
      context: { session },
    });
  }
);

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => context.session);

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  });

  return session;
});
