# Start Kit

Production-ready SaaS starter built with TanStack Start, React 19, and Bun.

## Quick Start

```bash
bunx create-start-kit-dev create my-app
```

The interactive CLI walks you through branding, features, database, environment, and infrastructure setup.

## What's Included

- **Auth** — Better Auth with organizations, passkeys, 2FA, session management
- **Database** — Drizzle ORM + PostgreSQL with row-level security
- **API** — oRPC for end-to-end type-safe RPC with Zod validation
- **AI** — AI SDK with OpenAI, Anthropic, and Google providers
- **Payments** — Stripe subscriptions and billing
- **UI** — Tailwind CSS v4 + shadcn/ui (Base UI) + 57 accessible components
- **Storage** — S3-compatible object storage (AWS, R2, SeaweedFS, etc.)
- **Email** — React Email templates + Resend
- **i18n** — i18next with browser language detection
- **Testing** — Vitest + React Testing Library

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Bun |
| Framework | TanStack Start (React Router + SSR) |
| Frontend | React 19, Tailwind CSS v4, Framer Motion |
| Backend | Elysia, oRPC, Drizzle ORM |
| Database | PostgreSQL |
| Auth | Better Auth (orgs, passkeys, 2FA) |
| AI | AI SDK (OpenAI, Anthropic, Google) |
| Payments | Stripe |
| Storage | S3-compatible (AWS, Cloudflare R2, SeaweedFS) |
| Testing | Vitest, React Testing Library |
| Code Quality | Ultracite (Biome), TypeScript |

## Project Structure

```
start-kit.dev/
  apps/
    start-template/    # The SaaS template app
  packages/
    cli/               # create-start-kit-dev CLI
```

Turborepo monorepo managed with Bun workspaces.

## Development

```bash
bun install
bun run dev
```

## Links

- [CLI docs](packages/cli/README.md)
- [Template docs](apps/start-template/README.md)
- [Issues](https://github.com/CarlosZiegler/start-kit.dev/issues)

## License

MIT
