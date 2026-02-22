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

export default defineConfig({
	optimizeDeps: {
		entries: ["src/**/*.{js,jsx,ts,tsx}"],
		exclude: ["bun"],
	},
	server: {
		port: 3000,
	},
	ssr: {
		external: ["bun"],
	},
	build: {
		chunkSizeWarningLimit: 500, // Set limit to 500 KB
		rollupOptions: {
			output: {
				minify: true,
			},
			external: ["bun"],
		},
	},
	plugins: [
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
