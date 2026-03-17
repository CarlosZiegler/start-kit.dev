# Changelog

All notable changes to `create-start-kit-dev` will be documented in this file.

## [0.1.12] - 2026-03-17

### Changed

- Updated dependencies to latest versions

## [0.1.11] - 2026-03-10

### Fixed

- Fix cross-platform template extraction: add fallback that downloads the full repo when `giget` subdirectory extraction fails (Windows tar path bug)
- Fix CI test workflow: add missing `create` subcommand to scaffold test commands

### Added

- `--skip-setup` flag for `create` command to skip dependency installation and interactive wizard (useful for CI testing)

## [0.1.10] - 2026-03-09

### Fixed

- Fix template extraction on Windows where `giget` tar extraction with subdirectory templates can place files at the drive root instead of the target directory
- Add `fixExtraction()` post-extraction step that detects and corrects nested directory structures (e.g., `targetDir/apps/start-template/`) by moving files up to the expected location
- Add validation after extraction to verify `package.json` exists in the target directory, with helpful error messages on failure

### Changed

- Updated CLI dependencies to latest versions

## [0.1.9] - 2026-02-23

### Fixed

- Fix Windows compatibility: replace `sh -c` shell execution with `Bun.spawn` argv arrays and `cwd` option
- Fix `cd dir && bun install` failing on Windows by using direct process spawning with `cwd`
- Fix `rm -f` file deletion on Windows by using Node.js `rmSync`
- Fix potential stdout/stderr pipe deadlock by draining both streams concurrently with `Promise.all`
- Use `path.resolve` / `path.join` for all file path operations instead of string concatenation with `/`

### Added

- `cwd` option support in `exec()` helper for cross-platform directory targeting
- Error handling with try/catch in `exec()` returning exit code 127 on spawn failure
- Unit tests for `exec()` helper (command execution, cwd support, non-zero exit codes)

## [0.1.8] - 2026-02-22

### Added

- Theme customization flags for `create` command: `--theme`, `--base-color`, `--radius`, `--font`
- 21 built-in color themes (neutral, stone, zinc, gray, amber, blue, cyan, emerald, fuchsia, green, indigo, lime, orange, pink, purple, red, rose, sky, teal, violet, yellow)
- 4 base colors, 5 radius presets, 3 font options (Inter, Geist Sans, System)
- Generated `app.css` includes full CSS variable blocks, `@theme inline`, `@layer base`, and marquee utilities
- Graceful fallback to defaults for invalid flag values with warning messages
- Unit tests for theme parsing and CSS generation (24 tests)

### Changed

- `create` command now skips `--` prefixed args when detecting project name
- Updated usage help to document theme options

## [0.1.6] - 2026-02-19

### Fixed

- Fix `db:push` failing during setup: write placeholder env vars before running drizzle-kit so `env.server.ts` validation passes
- Add `--force` flag to `drizzle-kit push` to skip interactive confirmation prompts in non-TTY context
- Run `drizzle-kit push` directly instead of via `bun run db:push` to control env loading
- Fix TypeScript error in database validate callback

## [0.1.5] - 2026-02-19

### Added

- `publishConfig` with explicit `latest` tag and public access
- `CHANGELOG.md` documenting all versions

## [0.1.4] - 2026-02-19

### Fixed

- Fix database connection test using correct Bun SQL tagged template literal API (`sql.query()` does not exist on Bun's `SQL` class)
- Make `testDbConnection` and `sql.close()` properly async

## [0.1.3] - 2026-02-19

### Changed

- Rename CLI package to `create-start-kit-dev`

## [0.1.2] - 2026-02-19

### Changed

- Clean up and enhance markdown files for AI context

## [0.1.1] - 2026-02-19

### Changed

- Minor fixes and improvements

## [0.1.0] - 2026-02-19

### Added

- Initial release
- Interactive setup wizard with 5 resumable phases: Branding, Features, Database, Environment, Infrastructure
- Template scaffolding via `giget` from GitHub
- Instagres (pg.new) integration for instant Neon PostgreSQL databases
- Database connection testing with Bun native SQL
- Environment file generation with feature-specific variables
- Docker service management (SeaweedFS, Redis)
- State persistence for resumable setup (`.setup-state.json`)
