# Changelog

## 0.1.7

### Fixes

- Disable Vite SSR import protection to resolve false-positive warnings for client env imports (`flags.ts`, `env.client`)
- Remove hydration transition suppression CSS that could interfere with animations

### Chores

- Minor formatting cleanup in client entry

## 0.1.6

### Fixes

- Resolve TypeScript error in database validate callback

### Features

- Adjust migration step

## 0.1.5

### Features

- Rename CLI package to `create-start-kit-dev`
- Cleanup and enhance markdown files for AI tooling

## 0.1.0

### Features

- Initial release with CLI scaffolding and project setup
- TanStack Start template with Better Auth, Drizzle ORM, oRPC, Stripe
- Interactive setup wizard (branding, features, database, env, infra)
