import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: {
      include: [/\.css$/],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/__tests__/**",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "dist/",
        ".output/",
        "coverage/",
      ],
    },
    include: [
      "src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/*.test.ts",
    ],
  },
});
