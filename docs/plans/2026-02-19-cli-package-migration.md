# CLI Package Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract `apps/start-template/cli/` into `packages/cli/` as `@start-kit/cli`, a standalone npm-publishable Bun CLI built with tsdown.

**Architecture:** Move all CLI source files into `packages/cli/src/`, add tsdown build config, wire into Turborepo. No code changes — just relocation and build setup.

**Tech Stack:** tsdown (Rolldown + Oxc), Bun, TypeScript, @clack/prompts

**Design doc:** `docs/plans/2026-02-19-cli-package-migration-design.md`

---

### Task 1: Create package scaffold

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/tsdown.config.ts`

**Step 1: Create `packages/cli/package.json`**

```json
{
  "name": "@start-kit/cli",
  "version": "0.1.0",
  "description": "CLI for scaffolding and configuring Start Kit projects",
  "type": "module",
  "bin": {
    "start-kit": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch"
  },
  "dependencies": {
    "@clack/prompts": "^1.0.1",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "@types/bun": "^1.3.9",
    "tsdown": "^0.20.0",
    "typescript": "^5.9.0"
  },
  "engines": {
    "bun": ">=1.0.0"
  }
}
```

**Step 2: Create `packages/cli/tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["bun-types"],
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "outDir": "dist",
    "noEmit": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*.ts"]
}
```

**Step 3: Create `packages/cli/tsdown.config.ts`**

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: "esm",
  platform: "node",
  clean: true,
});
```

**Step 4: Commit**

```bash
git add packages/cli/package.json packages/cli/tsconfig.json packages/cli/tsdown.config.ts
git commit -m "chore: scaffold packages/cli with tsdown config"
```

---

### Task 2: Move CLI source files

**Files:**
- Move: `apps/start-template/cli/*` → `packages/cli/src/*`

**Step 1: Copy files preserving directory structure**

```bash
mkdir -p packages/cli/src/lib packages/cli/src/phases packages/cli/src/templates
cp apps/start-template/cli/index.ts packages/cli/src/index.ts
cp apps/start-template/cli/lib/helpers.ts packages/cli/src/lib/helpers.ts
cp apps/start-template/cli/lib/state.ts packages/cli/src/lib/state.ts
cp apps/start-template/cli/lib/validators.ts packages/cli/src/lib/validators.ts
cp apps/start-template/cli/phases/branding.ts packages/cli/src/phases/branding.ts
cp apps/start-template/cli/phases/database.ts packages/cli/src/phases/database.ts
cp apps/start-template/cli/phases/env.ts packages/cli/src/phases/env.ts
cp apps/start-template/cli/phases/features.ts packages/cli/src/phases/features.ts
cp apps/start-template/cli/phases/infra.ts packages/cli/src/phases/infra.ts
cp apps/start-template/cli/phases/scaffold.ts packages/cli/src/phases/scaffold.ts
cp apps/start-template/cli/templates/env.template.ts packages/cli/src/templates/env.template.ts
```

**Step 2: Verify all imports still resolve**

All imports in the CLI use relative paths (`./lib/state`, `../lib/helpers`, etc.). Since the internal folder structure is preserved (`src/` mirrors old `cli/`), all relative imports remain valid. No changes needed.

Spot-check: `packages/cli/src/index.ts` imports from `./lib/state` and `./phases/*` — these paths exist under `packages/cli/src/`.

**Step 3: Commit**

```bash
git add packages/cli/src/
git commit -m "chore: copy CLI source files to packages/cli/src"
```

---

### Task 3: Remove CLI from apps/start-template

**Files:**
- Delete: `apps/start-template/cli/` (entire directory)
- Modify: `apps/start-template/package.json` — remove `bin` field

**Step 1: Delete the old CLI directory**

```bash
rm -rf apps/start-template/cli
```

**Step 2: Remove `bin` field from `apps/start-template/package.json`**

Remove this block from `apps/start-template/package.json`:

```json
  "bin": {
    "start-template": "./cli/index.ts"
  },
```

**Step 3: Verify app still works without CLI**

```bash
cd apps/start-template && bun run build
```

Expected: Build succeeds. The CLI was never imported by the app — it was only referenced via `bin`.

**Step 4: Commit**

```bash
git add apps/start-template/cli apps/start-template/package.json
git commit -m "chore: remove CLI from apps/start-template"
```

---

### Task 4: Update turbo.json for CLI builds

**Files:**
- Modify: `turbo.json`

**Step 1: Add `dist/**` to build outputs**

Current build task only has `.next/**` outputs. Update to also capture `dist/**` for the CLI package:

```json
"build": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": [".next/**", "!.next/cache/**", "dist/**"]
}
```

**Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add dist/** to turbo build outputs for CLI package"
```

---

### Task 5: Install dependencies and build

**Step 1: Install all workspace dependencies**

```bash
bun install
```

Expected: Resolves `packages/cli` workspace, installs tsdown, @clack/prompts, etc.

**Step 2: Build the CLI package**

```bash
cd packages/cli && bun run build
```

Expected: tsdown outputs `packages/cli/dist/index.js` with `#!/usr/bin/env bun` shebang preserved.

**Step 3: Verify the output**

```bash
head -1 packages/cli/dist/index.js
```

Expected: `#!/usr/bin/env bun`

```bash
ls -la packages/cli/dist/index.js
```

Expected: File exists, has executable permission (tsdown sets `chmod +x`).

**Step 4: Commit**

```bash
git add bun.lockb
git commit -m "chore: install CLI package deps and verify build"
```

---

### Task 6: Smoke test the CLI

**Step 1: Test help/usage output**

```bash
bun packages/cli/dist/index.js
```

Expected: Prints usage info (the `showUsage()` output):
```
Usage:
  bunx start-template create [project-name]   Create a new project
  bunx start-template init [--step <phase>]    Setup existing project
```

**Step 2: Test via workspace bin**

```bash
bun run --filter @start-kit/cli build
```

Expected: Build succeeds via Turborepo filter.

**Step 3: If usage text still says `bunx start-template`, update it**

In `packages/cli/src/index.ts`, update the `showUsage()` function references from `bunx start-template` to `bunx @start-kit/cli` (or `start-kit`):

```ts
function showUsage(): void {
  console.log("Usage:");
  console.log(
    "  bunx @start-kit/cli create [project-name]   Create a new project"
  );
  console.log(
    "  bunx @start-kit/cli init [--step <phase>]    Setup existing project"
  );
  console.log("");
  console.log("Phases: branding, features, database, env, infra");
}
```

Also update the hint in `runDatabase` (`packages/cli/src/phases/database.ts:47`):
```ts
"Or provide your own DATABASE_URL and re-run: bunx @start-kit/cli init --step database"
```

And the outro in `runWizard` (`packages/cli/src/index.ts:123`) is fine — it says `bun dev` which is generic.

**Step 4: Rebuild and verify**

```bash
cd packages/cli && bun run build && bun dist/index.js
```

Expected: Updated usage text shows `bunx @start-kit/cli`.

**Step 5: Commit**

```bash
git add packages/cli/src/
git commit -m "feat: update CLI usage text to @start-kit/cli"
```

---

### Task 7: Add .gitignore for dist

**Files:**
- Create: `packages/cli/.gitignore`

**Step 1: Create .gitignore**

```
dist/
node_modules/
```

**Step 2: Commit**

```bash
git add packages/cli/.gitignore
git commit -m "chore: add .gitignore for CLI package dist"
```

---

## Summary

After all tasks:
- `packages/cli/` is a standalone, buildable, publishable package
- `apps/start-template/` no longer contains CLI code
- `bun run build` via Turborepo builds the CLI alongside everything else
- Ready to `npm publish` (or `bun publish`) from `packages/cli/`
