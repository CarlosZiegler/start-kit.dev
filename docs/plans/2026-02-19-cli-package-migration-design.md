# CLI Package Migration Design

**Date:** 2026-02-19
**Package:** `@start-kit/cli`
**Build tool:** tsdown (Rolldown + Oxc)

## Context

The CLI currently lives at `apps/start-template/cli/` and runs as raw `.ts` via Bun's bin field. We're extracting it into `packages/cli/` as a standalone npm-publishable package.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Bun-only | CLI uses Bun.spawn, Bun.write, bun:SQL, bun:RedisClient |
| Package name | `@start-kit/cli` | Scoped, clean namespace |
| Bin name | `start-kit` | `bunx @start-kit/cli create my-app` |
| Build tool | tsdown | Fastest, built-in shebang/CLI support, future-proof (successor to tsup) |
| Coupling | Standalone | Clones from GitHub, no monorepo imports from apps/start-template |

## Alternatives Considered

- **tsup**: Battle-tested but maintenance mode. Nearly identical config. Safe fallback.
- **Vite library mode**: No shebang support, manual externals, verbose config. Not suited for CLIs.
- **Rsbuild/Rslib**: App-focused (Rsbuild) / library-focused (Rslib). No CLI tool support.

## Package Structure

```
packages/cli/
  src/
    index.ts              # #!/usr/bin/env bun entry
    lib/
      helpers.ts
      state.ts
      validators.ts
    phases/
      branding.ts
      database.ts
      env.ts
      features.ts
      infra.ts
      scaffold.ts
    templates/
      env.template.ts
  tsdown.config.ts
  package.json
  tsconfig.json
```

## package.json

```json
{
  "name": "@start-kit/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": { "start-kit": "./dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch"
  },
  "dependencies": {
    "@clack/prompts": "^1.0.1",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "tsdown": "^0.20.0",
    "@types/bun": "^1.3.9",
    "typescript": "^5.9.0"
  },
  "engines": { "bun": ">=1.0.0" }
}
```

## tsdown.config.ts

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: "esm",
  platform: "node",
  clean: true,
});
```

## Migration Steps (high-level)

1. Create `packages/cli/` with package.json, tsdown.config.ts, tsconfig.json
2. Move `apps/start-template/cli/*` to `packages/cli/src/`
3. Remove `cli/` folder and `bin` field from `apps/start-template/package.json`
4. Update turbo.json build outputs for CLI package
5. Install deps, verify build
6. Test: `bunx ./packages/cli/dist/index.js create test-app`
