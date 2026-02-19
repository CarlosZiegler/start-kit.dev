"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  JsonRpcRequest,
  JsonRpcResponse,
  ModelContextUpdate,
  ToolCallRequest,
  ToolCallResponse,
} from "./mcp-apps.types";

type HostEvent =
  | { type: "rpc:request"; request: JsonRpcRequest }
  | { type: "rpc:response"; response: JsonRpcResponse }
  | { type: "tool:called"; tool: ToolCallRequest; response: ToolCallResponse }
  | { type: "context:updated"; update: ModelContextUpdate };

interface UseJsonRpcHostOptions {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isJsonRpcRequest = (value: unknown): value is JsonRpcRequest => {
  if (!isObject(value)) {
    return false;
  }
  return (
    value.jsonrpc === "2.0" &&
    (typeof value.id === "string" || typeof value.id === "number") &&
    typeof value.method === "string"
  );
};

export function useJsonRpcHost({ iframeRef }: UseJsonRpcHostOptions) {
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [modelContext, setModelContext] = useState<ModelContextUpdate[]>([]);

  const appendEvent = useCallback((event: HostEvent) => {
    setEvents((prev) => {
      const next = [...prev, event];
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
  }, []);

  const postResponse = useCallback(
    (response: JsonRpcResponse) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) {
        return;
      }
      win.postMessage(response, "*");
      appendEvent({ type: "rpc:response", response });
    },
    [appendEvent, iframeRef]
  );

  const callTool = useCallback(async (tool: ToolCallRequest) => {
    const res = await fetch("/api/lab/mcp-apps/tool-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tool),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        name: tool.name,
        ok: false,
        error: `HTTP ${res.status}${text ? `: ${text}` : ""}`,
      } satisfies ToolCallResponse;
    }

    return (await res.json()) as ToolCallResponse;
  }, []);

  const handlers = useMemo(
    () => ({
      async callServerTool(params: unknown) {
        const tool = params as ToolCallRequest;
        const response = await callTool(tool);
        appendEvent({ type: "tool:called", tool, response });
        return response;
      },
      updateModelContext(params: unknown) {
        const update = params as ModelContextUpdate;
        setModelContext((prev) => [...prev, update]);
        appendEvent({ type: "context:updated", update });
        return { ok: true };
      },
      ping() {
        return { ok: true, ts: Date.now() };
      },
    }),
    [appendEvent, callTool]
  );

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const iframeWin = iframeRef.current?.contentWindow;
      if (!iframeWin || event.source !== iframeWin) {
        return;
      }

      if (!isJsonRpcRequest(event.data)) {
        return;
      }

      const request = event.data;
      appendEvent({ type: "rpc:request", request });

      try {
        const handler = (handlersRef.current as Record<string, unknown>)[
          request.method
        ];
        if (typeof handler !== "function") {
          postResponse({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32_601,
              message: `Method not found: ${request.method}`,
            },
          });
          return;
        }

        const result = await handler(request.params);
        postResponse({ jsonrpc: "2.0", id: request.id, result });
      } catch (error: unknown) {
        postResponse({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32_000,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [appendEvent, iframeRef, postResponse]);

  const clear = useCallback(() => {
    setEvents([]);
    setModelContext([]);
  }, []);

  return {
    events,
    modelContext,
    clear,
  };
}
