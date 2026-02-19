# MCP Apps Sandbox Lab

This lab is a small **in-app simulator** inspired by the MCP Apps extension.

It renders a UI resource inside a sandboxed iframe and communicates with the host
page via **JSON-RPC 2.0 over `postMessage`**.

## Why

- Experiment with agentic UI patterns without depending on a specific MCP client
  (Claude/ChatGPT/VSCode).
- Keep the demo isolated and easy to remove.

## Endpoints

- `GET /api/lab/mcp-apps/ui/basic` — HTML UI resource rendered inside the iframe.
- `POST /api/lab/mcp-apps/tool-call` — simple tool-call endpoint used by the host.

## Security note

The iframe is sandboxed with `allow-scripts` only. The UI communicates with the host
instead of calling backend APIs directly.
