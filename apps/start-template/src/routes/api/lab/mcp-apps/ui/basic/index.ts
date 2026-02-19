import { createFileRoute } from "@tanstack/react-router";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>MCP App (Sandbox)</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 0; padding: 16px; }
      .card { border: 1px solid rgba(127,127,127,.35); border-radius: 12px; padding: 14px; }
      .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      button { padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(127,127,127,.45); background: transparent; cursor: pointer; }
      button:hover { opacity: .9; }
      input { padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(127,127,127,.45); background: transparent; }
      pre { margin: 12px 0 0; padding: 12px; border-radius: 12px; background: rgba(127,127,127,.12); overflow: auto; max-height: 280px; }
      .muted { opacity: .75; font-size: 12px; }
      .title { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
      .spacer { height: 10px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">MCP App UI (simulated)</div>
      <div class="muted">This UI runs inside an iframe and talks to the host via JSON-RPC over postMessage.</div>

      <div class="spacer"></div>

      <div class="row">
        <button id="ping">Ping host</button>
        <button id="time">Call tool: getTime</button>
        <button id="echo">Call tool: echo</button>
      </div>

      <div class="spacer"></div>

      <div class="row">
        <input id="a" placeholder="a" value="2" size="6" />
        <input id="b" placeholder="b" value="3" size="6" />
        <button id="add">Call tool: add</button>
      </div>

      <div class="spacer"></div>

      <div class="row">
        <button id="ctx">updateModelContext</button>
      </div>

      <pre id="out">(no output yet)</pre>
    </div>

    <script>
      const out = document.getElementById('out');
      const log = (obj) => {
        out.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
      };

      let rpcId = 0;
      const pending = new Map();

      function rpc(method, params) {
        const id = ++rpcId;
        const msg = { jsonrpc: '2.0', id, method, params };
        window.parent.postMessage(msg, '*');
        return new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
          setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              reject(new Error('RPC timeout'));
            }
          }, 15000);
        });
      }

      window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || data.jsonrpc !== '2.0') return;
        if (data.id == null) return;

        const p = pending.get(data.id);
        if (!p) return;
        pending.delete(data.id);

        if (data.error) p.reject(new Error(data.error.message || 'RPC error'));
        else p.resolve(data.result);
      });

      document.getElementById('ping').addEventListener('click', async () => {
        try {
          log(await rpc('ping'));
        } catch (e) {
          log(String(e));
        }
      });

      document.getElementById('time').addEventListener('click', async () => {
        try {
          log(await rpc('callServerTool', { name: 'getTime' }));
        } catch (e) {
          log(String(e));
        }
      });

      document.getElementById('echo').addEventListener('click', async () => {
        try {
          log(await rpc('callServerTool', { name: 'echo', arguments: { hello: 'world', n: 1 } }));
        } catch (e) {
          log(String(e));
        }
      });

      document.getElementById('add').addEventListener('click', async () => {
        try {
          const a = Number(document.getElementById('a').value);
          const b = Number(document.getElementById('b').value);
          log(await rpc('callServerTool', { name: 'add', arguments: { a, b } }));
        } catch (e) {
          log(String(e));
        }
      });

      document.getElementById('ctx').addEventListener('click', async () => {
        try {
          const payload = {
            content: [{ type: 'text', text: 'User clicked updateModelContext from the iframe UI' }]
          };
          log(await rpc('updateModelContext', payload));
        } catch (e) {
          log(String(e));
        }
      });
    </script>
  </body>
</html>`;

export const Route = createFileRoute("/api/lab/mcp-apps/ui/basic/")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
