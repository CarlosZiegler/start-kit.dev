import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";
import { postgres } from "vite-plugin-db";
import tsConfigPaths from "vite-tsconfig-paths";

config();

// Polyfill for Reflect.getMetadata (required by @better-auth/passkey)
const REFLECT_POLYFILL = `
if (typeof Reflect.getMetadata !== "function") {
  const m = new WeakMap();
  const get = (t, p) => m.get(t)?.get(p);
  const set = (t, p) => {
    let a = m.get(t); if (!a) { a = new Map(); m.set(t, a); }
    let b = a.get(p); if (!b) { b = new Map(); a.set(p, b); }
    return b;
  };
  const find = (k, t, p) => { const x = get(t, p); if (x?.has(k)) return x.get(k); const pr = Object.getPrototypeOf(t); return pr ? find(k, pr, p) : undefined; };
  Reflect.getMetadata = (k, t, p) => find(k, t, p);
  Reflect.getOwnMetadata = (k, t, p) => get(t, p)?.get(k);
  Reflect.defineMetadata = (k, v, t, p) => set(t, p).set(k, v);
  Reflect.hasMetadata = (k, t, p) => find(k, t, p) !== undefined;
  Reflect.hasOwnMetadata = (k, t, p) => get(t, p)?.has(k) ?? false;
  Reflect.metadata = (k, v) => (t, p) => set(t, p).set(k, v);
}
`;

function reflectPolyfillPlugin(): Plugin {
	return {
		name: "reflect-polyfill",
		renderChunk(code, chunk) {
			if (chunk.fileName.includes("passkey")) {
				return REFLECT_POLYFILL + code;
			}
			return null;
		},
	};
}

export default defineConfig({
	optimizeDeps: {
		entries: ["src/**/*.{js,jsx,ts,tsx}"],
		exclude: ["bun"],
	},
	server: {
		port: 3000,
		allowedHosts: [".ngrok-free.dev"],
	},
	ssr: {
		external: ["bun"],
		noExternal: [
			"streamdown",
			"@upstash/realtime",
			"@/lib/storage",
			"@json-render/react",
			"@json-render/core",
			"@ai-sdk/react",
		],
	},
	build: {
		chunkSizeWarningLimit: 300, // Set limit to 1000 KB
		rollupOptions: {
			output: {
				minify: true,
			},
			external: ["bun"],
		},
	},
	plugins: [
		reflectPolyfillPlugin(),
		devtools(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		postgres({
			referrer: "start-template",
		}),
		tailwindcss(),
		tanstackStart({
			importProtection: {
				enabled: false,
			},
			srcDirectory: "src",
			router: {
				routeToken: "layout",
			},
		}),
		nitro({
			vercel: {
				functions: {
					runtime: "bun1.x",
				},
			},
		}),

		viteReact(),
	],
});
