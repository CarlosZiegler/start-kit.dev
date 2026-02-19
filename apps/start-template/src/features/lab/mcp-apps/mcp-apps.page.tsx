"use client";

import { ExternalLink, RefreshCcw, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useJsonRpcHost } from "./use-json-rpc-host";

export function McpAppsLabPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { events, modelContext, clear } = useJsonRpcHost({ iframeRef });

  const [reloadKey, setReloadKey] = useState(0);

  const uiUrl = "/api/lab/mcp-apps/ui/basic";

  const eventLog = useMemo(() => {
    return events
      .slice()
      .reverse()
      .map((e, idx) => {
        if (e.type === "rpc:request") {
          return {
            key: `r-${idx}`,
            title: `→ ${e.request.method}`,
            payload: e.request,
          };
        }
        if (e.type === "rpc:response") {
          return {
            key: `s-${idx}`,
            title: `← response (id=${String(e.response.id)})`,
            payload: e.response,
          };
        }
        if (e.type === "tool:called") {
          return {
            key: `t-${idx}`,
            title: `tool: ${e.tool.name} (${e.response.ok ? "ok" : "error"})`,
            payload: { tool: e.tool, response: e.response },
          };
        }
        return {
          key: `c-${idx}`,
          title: "context: updated",
          payload: e.update,
        };
      });
  }, [events]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-semibold text-lg">MCP Apps (Sandbox Host)</h1>
          <p className="text-muted-foreground text-sm">
            An MCP Apps simulator inside the Lab: the UI runs in a sandboxed
            iframe and communicates with the host via JSON-RPC (postMessage).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setReloadKey((k) => k + 1)} variant="outline">
            <RefreshCcw data-icon="inline-start" />
            Reload iframe
          </Button>
          <Button onClick={clear} variant="outline">
            <Trash2 data-icon="inline-start" />
            Clear logs
          </Button>
          <a
            className={buttonVariants({
              variant: "secondary",
              size: "default",
            })}
            href={uiUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink data-icon="inline-start" />
            Open UI resource
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">Rendered App (iframe)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              // key forces reload without fiddling with refs
              className="h-[640px] w-full rounded-b-md bg-background"
              key={reloadKey}
              ref={iframeRef}
              sandbox="allow-scripts"
              src={uiUrl}
              title="mcp-app-sandbox"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">Host Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div>
              <div className="mb-2 font-medium text-sm">
                Model context updates
              </div>
              <div className="max-h-[180px] overflow-auto rounded border bg-muted/30 p-3">
                {modelContext.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No updates yet.
                  </p>
                ) : (
                  <pre className="text-xs">
                    {JSON.stringify(modelContext, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 font-medium text-sm">
                JSON-RPC / Tool log
              </div>
              <div className="max-h-[360px] overflow-auto rounded border bg-muted/30 p-3">
                {eventLog.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No events yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {eventLog.map((item) => (
                      <div key={item.key}>
                        <div className="font-medium text-xs">{item.title}</div>
                        <pre className="wrap-break-word mt-1 whitespace-pre-wrap text-muted-foreground text-xs">
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
