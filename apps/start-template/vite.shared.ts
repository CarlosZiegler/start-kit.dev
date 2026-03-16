import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { postgres } from "vite-plugin-db";
import tsConfigPaths from "vite-tsconfig-paths";
import { reflectPolyfillPlugin } from "./plugins/vite-reflect";

config();

const manualChunksMap: Record<string, string[]> = {
	"vendor-ai": [
		"@ai-sdk/react",
		"@ai-sdk/anthropic",
		"@ai-sdk/openai",
		"@ai-sdk/google",
		"ai",
	],
	"vendor-dnd": [
		"@dnd-kit/core",
		"@dnd-kit/sortable",
		"@dnd-kit/modifiers",
		"@dnd-kit/utilities",
	],
	"vendor-charts": ["recharts"],
};

function manualChunks(moduleId: string): string | undefined {
	for (const [chunkName, packages] of Object.entries(manualChunksMap)) {
		if (packages.some((pkg) => moduleId.includes(`node_modules/${pkg}`))) {
			return chunkName;
		}
	}
	return undefined;
}

type RuntimeOptions = {
	runtime: "node" | "bun";
};

export function createViteConfig({ runtime }: RuntimeOptions) {
	const isBun = runtime === "bun";

	return defineConfig({
		optimizeDeps: {
			entries: ["src/**/*.{js,jsx,ts,tsx}"],
			exclude: ["bun"],
		},
		server: {
			port: 3000,
		},
		...(isBun ? { preview: { host: "127.0.0.1" } } : {}),
		ssr: {
			external: ["bun"],
		},
		build: {
			chunkSizeWarningLimit: isBun ? 300 : 500,
			rollupOptions: {
				output: {
					manualChunks,
				},
				external: ["bun"],
			},
		},
		resolve: {
			tsconfigPaths: true,
		},
		plugins: [
			reflectPolyfillPlugin(),
			devtools(),
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
				...(isBun
					? {
							spa: {
								enabled: true,
								prerender: {
									enabled: true,
									crawlLinks: true,
								},
							},
							pages: [
								{
									path: "/",
								},
								{
									path: "/sign-in",
								},
								{
									path: "/sign-up",
								},
							],
						}
					: {}),
			}),
			...(isBun
				? []
				: [
						nitro({
							vercel: {
								functions: {
									runtime: "bun1.x",
								},
							},
						}),
					]),
			viteReact(),
		],
	});
}
