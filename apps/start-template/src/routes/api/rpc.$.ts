import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { createFileRoute } from "@tanstack/react-router";
import { Elysia } from "elysia";

import { router } from "@/orpc";
import { createORPCContext } from "@/orpc/orpc-server";

const handler = new RPCHandler(router, {
  plugins: [
    new CORSPlugin({
      origin: "*",
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      credentials: true,
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const app = new Elysia({ prefix: "/api/rpc" }).all(
  "*",
  async ({ request }) => {
    const { response } = await handler.handle(request, {
      prefix: "/api/rpc",
      context: await createORPCContext({
        headers: request.headers,
      }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  },
  {
    parse: "none", // Prevent "body already used" error
  }
);

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
    },
  },
});
