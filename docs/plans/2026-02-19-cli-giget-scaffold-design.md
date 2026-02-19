# CLI Scaffold: Replace git clone with giget

## Problem

`packages/cli/src/phases/scaffold.ts` clones from a separate repo (`CarlosZiegler/start-template.git`) that's stale. The template now lives at `apps/start-template/` inside the `CarlosZiegler/start-kit.dev` monorepo.

## Decision

Use **giget** to download `apps/start-template/` from the monorepo. giget handles GitHub tarball download, subdirectory extraction, and caching in one call.

### Why giget over alternatives

| Approach | Verdict |
|----------|---------|
| git sparse checkout | Requires git on user machine, complex multi-step commands |
| Raw GitHub tarball (shadcn-style) | 50-80 lines reimplementing what giget does |
| Embedded templates (create-better-t-stack) | Overkill for single template, adds build complexity |
| **giget** | 1 function call, 15KB dep, battle-tested (Nuxt/Nitro), caching built-in |

## Design

### Template URI

```
gh:CarlosZiegler/start-kit.dev/apps/start-template#main
```

### Changed files

- `packages/cli/src/phases/scaffold.ts` — replace `cloneRepo()` with giget `downloadTemplate()`
- `packages/cli/package.json` — add `giget` dependency

### New scaffold flow

1. Prompt for project name (unchanged)
2. `downloadTemplate("gh:CarlosZiegler/start-kit.dev/apps/start-template#main", { dir: targetDir })`
3. `git init` in target dir
4. `bun install`
5. Remove `.setup-state.json`

### What's removed

- `REPO_URL` constant
- `exec("git clone --depth 1 ...")` call
- `exec("rm -rf .git")` call (giget doesn't create a `.git` dir)
