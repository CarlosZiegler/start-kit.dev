# Changelog

All notable changes to `create-start-kit-dev` will be documented in this file.

## [0.1.7] - 2026-02-22

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
