import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig } from "vite";
import { postgres } from "vite-plugin-db";
import tsConfigPaths from "vite-tsconfig-paths";

config();

export default defineConfig({
  optimizeDeps: {
    entries: ["src/**/*.{js,jsx,ts,tsx}"],
    exclude: [
      "katex",
      "pdfjs",
      "pdf-parse",
      "qrcode.react",
      "react-to-print",
      "@hookform/resolvers/zod",
      "@tanstack/react-pacer",
      "@tanstack/react-table",
      "@tanstack/react-virtual",
      "react-day-picker",
      "react-day-picker/locale",
      "react-hook-form",
      "react-countdown",
      "react-json-view-lite",
      "vaul",
      "html2canvas-pro",
      "bun",
    ],
  },
  server: {
    port: 3000,
  },
  ssr: {
    external: ["bun"],
    noExternal: [
      "streamdown",
      "@upstash/realtime",
      "@/lib/storage",
      "@/lib/storage/strategies",
    ],
  },
  build: {
    chunkSizeWarningLimit: 300, // Set limit to 1000 KB
    rollupOptions: {
      output: {
        minify: true,
      },
      external: ["bun", "nitro-internal-pollyfills"],
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
      srcDirectory: "src",
      router: {
        routeToken: "layout",
      },
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
    }),

    viteReact(),
  ],
});
