import { createFileRoute } from "@tanstack/react-router";
import { Elysia } from "elysia";

import { auth } from "@/lib/auth/auth";

const app = new Elysia({ prefix: "/api/auth" }).all("*", ({ request }) =>
  auth.handler(request)
);

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
