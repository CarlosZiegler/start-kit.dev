# CLI Scaffold: giget Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `git clone` in `packages/cli/src/phases/scaffold.ts` with `giget` to download `apps/start-template/` from the monorepo.

**Architecture:** Use giget's `downloadTemplate()` to fetch the subdirectory from `gh:CarlosZiegler/start-kit.dev/apps/start-template#main`. Remove git clone logic and the stale `REPO_URL` constant.

**Tech Stack:** giget, Bun, @clack/prompts

**Design doc:** `docs/plans/2026-02-19-cli-giget-scaffold-design.md`

---

### Task 1: Add giget dependency

**Files:**
- Modify: `packages/cli/package.json`

**Step 1: Add giget to dependencies**

In `packages/cli/package.json`, add `"giget"` to the `dependencies` object:

```json
"dependencies": {
  "@clack/prompts": "^1.0.1",
  "giget": "^2.0.0",
  "picocolors": "^1.1.1"
}
```

**Step 2: Install**

```bash
cd packages/cli && bun install
```

Expected: Resolves giget and its dependencies.

**Step 3: Commit**

```bash
git add packages/cli/package.json bun.lockb
git commit -m "chore: add giget dependency to CLI package"
```

---

### Task 2: Replace cloneRepo with giget downloadTemplate

**Files:**
- Modify: `packages/cli/src/phases/scaffold.ts`

**Step 1: Rewrite scaffold.ts**

Replace the entire file with:

```ts
import { existsSync } from "node:fs";
import { isCancel, log, spinner, text } from "@clack/prompts";
import { downloadTemplate } from "giget";

import { exec } from "../lib/helpers";
import { isValidAppName, toKebabCase } from "../lib/validators";

const TEMPLATE_URI = "gh:CarlosZiegler/start-kit.dev/apps/start-template#main";

async function fetchTemplate(targetDir: string): Promise<void> {
  const s = spinner();
  s.start("Downloading template...");

  try {
    await downloadTemplate(TEMPLATE_URI, {
      dir: targetDir,
      force: false,
    });
    s.stop("Template downloaded");
  } catch (error) {
    s.stop("Download failed");
    log.error(String(error));
    process.exit(1);
  }

  await exec(`git -C "${targetDir}" init`);
}

async function installDeps(targetDir: string): Promise<void> {
  const s = spinner();
  s.start("Installing dependencies...");

  const result = await exec(`cd "${targetDir}" && bun install`);

  if (result.exitCode !== 0) {
    s.stop("Install failed");
    log.error(result.stderr);
    log.info(`Try manually: cd ${targetDir} && bun install`);
    process.exit(1);
  }

  s.stop("Dependencies installed");
}

export async function runScaffold(projectNameArg?: string): Promise<string> {
  let projectName = projectNameArg;

  if (!projectName) {
    const name = await text({
      message: "What's your project name?",
      placeholder: "my-saas-app",
      validate: (v) => {
        if (!isValidAppName(v)) {
          return "Name must be 2-50 characters";
        }
      },
    });
    if (isCancel(name)) {
      process.exit(0);
    }
    projectName = name;
  }

  const dirName = toKebabCase(projectName);
  const targetDir = `${process.cwd()}/${dirName}`;

  if (existsSync(targetDir)) {
    log.error(`Directory "${dirName}" already exists.`);
    process.exit(1);
  }

  log.info(`Creating project in ./${dirName}`);

  await fetchTemplate(targetDir);
  await installDeps(targetDir);

  // Remove the state file if it exists from the template
  await exec(`rm -f "${targetDir}/.setup-state.json"`);

  log.success(`Project created in ./${dirName}`);

  return targetDir;
}
```

Key changes:
- `import { downloadTemplate } from "giget"` replaces git clone
- `REPO_URL` → `TEMPLATE_URI` with giget URI format
- `cloneRepo()` → `fetchTemplate()` using `downloadTemplate()`
- No more `rm -rf .git` (giget doesn't create one)
- `installDeps()` and `runScaffold()` unchanged

**Step 2: Rebuild and verify**

```bash
cd packages/cli && bun run build
```

Expected: tsdown builds successfully, `dist/index.mjs` produced.

**Step 3: Smoke test**

```bash
bun packages/cli/dist/index.mjs
```

Expected: Prints usage info (doesn't crash on import).

**Step 4: Commit**

```bash
git add packages/cli/src/phases/scaffold.ts
git commit -m "feat: replace git clone with giget for template download"
```

---

## Summary

After both tasks:
- `packages/cli` uses giget to download `apps/start-template/` from the monorepo
- No git required on user's machine for scaffolding
- Template always fetched from latest `main` branch
- Caching built-in via giget
