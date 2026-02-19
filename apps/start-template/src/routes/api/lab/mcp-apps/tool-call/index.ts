import { createFileRoute } from "@tanstack/react-router";

import type {
  ToolCallRequest,
  ToolCallResponse,
} from "@/features/lab/mcp-apps/mcp-apps.types";

const tools = {
  echo: async (args: Record<string, unknown> | undefined) => ({ args }),
  getTime: async () => ({ now: new Date().toISOString() }),
  add: async (args: Record<string, unknown> | undefined) => {
    const a = Number(args?.a);
    const b = Number(args?.b);
    if (!(Number.isFinite(a) && Number.isFinite(b))) {
      throw new Error("add expects numeric arguments: { a, b }");
    }
    return { a, b, sum: a + b };
  },
} satisfies Record<
  string,
  (args: Record<string, unknown> | undefined) => Promise<unknown>
>;

export const Route = createFileRoute("/api/lab/mcp-apps/tool-call/")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request
          .json()
          .catch(() => null)) as ToolCallRequest | null;

        const name = body?.name;
        if (!name || typeof name !== "string") {
          return Response.json(
            {
              name: "",
              ok: false,
              error: "Missing tool name",
            } satisfies ToolCallResponse,
            { status: 400 }
          );
        }

        const tool = (tools as Record<string, any>)[name];
        if (typeof tool !== "function") {
          return Response.json(
            {
              name,
              ok: false,
              error: `Unknown tool: ${name}`,
            } satisfies ToolCallResponse,
            { status: 404 }
          );
        }

        try {
          const result = await tool(body.arguments);
          return Response.json({
            name,
            ok: true,
            result,
          } satisfies ToolCallResponse);
        } catch (error: unknown) {
          return Response.json(
            {
              name,
              ok: false,
              error: error instanceof Error ? error.message : "Tool failed",
            } satisfies ToolCallResponse,
            { status: 500 }
          );
        }
      },
    },
  },
});
