# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**Payment Processing:**
- Stripe - Payment and subscription management
  - SDK/Client: `stripe` v20.3.1
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - Webhook: `STRIPE_WEBHOOK_SECRET`
  - Integration: `@better-auth/stripe` plugin for subscription management
  - Files: `src/lib/auth/auth.ts`, `src/lib/stripe/`

**Email Delivery:**
- Resend - Transactional email service
  - SDK/Client: `resend` v6.9.2
  - Auth: `RESEND_API_KEY`
  - Config: `RESEND_FROM_EMAIL` (sender email address)
  - Integration: `src/lib/resend.ts` - Centralized email sending
  - Components: `src/components/emails/` - React email templates
  - Files: `src/lib/resend.ts`

**AI & Language Models:**
- OpenAI - GPT models and completions
  - SDK/Client: `ai` v6.0.79, `@ai-sdk/openai` v3.0.26, `@tanstack/ai-openai` v0.4.0
  - Auth: `OPENAI_API_KEY`
  - Files: `src/lib/chat/`, AI chat integration throughout

- Anthropic (Claude) - Alternative LLM provider
  - SDK/Client: `@tanstack/ai-anthropic` v0.4.2
  - Auth: `ANTHROPIC_API_KEY`
  - Files: `src/lib/chat/`

- Google Gemini - Alternative LLM provider
  - SDK/Client: `@tanstack/ai-gemini` v0.4.1
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`
  - Files: `src/lib/chat/`

**Rate Limiting & Caching:**
- Upstash Redis - Serverless Redis for rate limiting and caching
  - SDK/Client: `@upstash/redis` v1.36.2, `@upstash/ratelimit` v2.0.8
  - Config: `REDIS_URL` (optional - for resumable chat streams)
  - Files: `src/lib/chat/stream-context.ts`

**Analytics:**
- Vercel Analytics - Application performance monitoring
  - SDK/Client: `@vercel/analytics` v1.6.1
  - Integration: `src/components/cookie-consent.tsx`
  - No auth key required (Vercel integration)

## Data Storage

**Databases:**
- PostgreSQL (primary)
  - Connection: `DATABASE_URL`
  - Client: Drizzle ORM v0.45.1
  - Setup: `src/lib/db/index.ts`
  - Migrations: `src/lib/db/migrations/` (managed by Drizzle Kit)
  - Schema: `src/lib/db/schema/` - Drizzle schema definitions
  - Security: Row-level security (RLS) via `src/lib/db/rls.ts`
  - Testing: `src/lib/db/rls.test.ts` for RLS validation

**File Storage:**
- S3-compatible Object Storage (primary)
  - Provider options: AWS S3, Cloudflare R2, SeaweedFS, DigitalOcean Spaces, Google Cloud Storage, Supabase Storage
  - Configuration:
    - `STORAGE_PROVIDER` - Storage backend type (default: "s3")
    - `S3_ACCESS_KEY_ID` - Access credentials
    - `S3_SECRET_ACCESS_KEY` - Access credentials
    - `S3_REGION` - Region (default: "us-east-1")
    - `S3_BUCKET` - Bucket name
    - `S3_ENDPOINT` - Custom endpoint (optional, for S3-compatible services)
  - Client: Bun native `S3Client`
  - Implementation: `src/lib/storage/index.ts`
  - Features: Upload, download, delete, presigned URLs, listing
  - Files: `src/lib/storage/`

**Caching:**
- Redis (optional) - For resumable chat streams
  - Connection: `REDIS_URL` (optional)
  - Client: `@upstash/redis` v1.36.2
  - Usage: `src/lib/chat/stream-context.ts` for resumable connections

## Authentication & Identity

**Auth Provider:**
- Better Auth v1.4.18 - Full-featured authentication framework
  - Implementation: `src/lib/auth/auth.ts` - Server auth config
  - Client: `src/lib/auth/auth-client.ts` - Client-side auth
  - Server functions: `src/lib/auth/auth-server-fn.ts`
  - Secret: `BETTER_AUTH_SECRET` (encryption key)
  - Base URL: `BETTER_AUTH_BASE_URL` (default: http://localhost:3000)
  - Features:
    - Email/password authentication
    - Magic links (`better-auth/plugins/magic-link`)
    - Email OTP (`better-auth/plugins/email-otp`)
    - Two-factor authentication (`better-auth/plugins/two-factor`)
    - Passkeys/WebAuthn (`@better-auth/passkey`)
    - Stripe subscription integration (`@better-auth/stripe`)
    - Organization/team support (`better-auth/plugins/organization`)
    - Admin functionality (`better-auth/plugins/admin`)
    - API keys (`better-auth/plugins/apiKey`)
    - Session tracking (`better-auth/plugins/lastLoginMethod`)
    - OpenAPI generation (`better-auth/plugins/openAPI`)
  - Database adapter: Drizzle ORM adapter
  - Schema: `src/lib/db/schema/auth.ts` (auto-generated)
  - Routes: `src/routes/api/auth/$.ts` - Auth API endpoints

**Session Management:**
- Better Auth with TanStack Start cookies adapter
  - Files: `src/lib/auth/auth.ts` (tanstackStartCookies integration)

## Monitoring & Observability

**Error Tracking:**
- None configured (not detected in codebase)

**Logs:**
- Pino v10.3.1 - Structured JSON logging
  - Configuration: `backend.ts` - Production server logging
  - Usage: Console-based logging throughout codebase
  - Query logging: Drizzle Query Logger (optional, via `DRIZZLE_QUERY_LOGGER_ENABLED`)

## CI/CD & Deployment

**Hosting:**
- Vercel (supported) - via Nitro adapter
- Self-hosted - Docker support via `Dockerfile` and `docker-compose`
- Bun runtime - Primary execution environment

**CI Pipeline:**
- GitHub Actions (configured in `.github/`)
- Git hooks: Husky 9.1.7

**Containerization:**
- Docker - Build and deployment
  - Config: `Dockerfile`, `.dockerignore`
  - Commands:
    - `npm run docker:build` - Build container
    - `npm run docker:run` - Run container
    - `npm run docker:storage` - Run with storage

## Environment Configuration

**Required env vars (server-side):**
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`)
- `BETTER_AUTH_SECRET` - Auth encryption key (random string)
- `RESEND_API_KEY` - Resend email API key
- `S3_ACCESS_KEY_ID` - Object storage access key
- `S3_SECRET_ACCESS_KEY` - Object storage secret key
- `S3_BUCKET` - Storage bucket name

**Optional env vars (server-side):**
- `RESEND_FROM_EMAIL` - Sender email address (optional override)
- `BETTER_AUTH_BASE_URL` - Auth base URL (default: http://localhost:3000)
- `OPENAI_API_KEY` - OpenAI API key (if using OpenAI)
- `ANTHROPIC_API_KEY` - Anthropic API key (if using Claude)
- `GEMINI_API_KEY` - Google Gemini API key (if using Gemini)
- `STRIPE_SECRET_KEY` - Stripe secret key (if enabling payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (if enabling payments)
- `S3_REGION` - Storage region (default: "us-east-1")
- `S3_ENDPOINT` - Custom storage endpoint (for S3-compatible services)
- `STORAGE_PROVIDER` - Storage backend (default: "s3")
- `REDIS_URL` - Redis connection (optional, for resumable chats)
- `DRIZZLE_QUERY_LOGGER_ENABLED` - Enable query logging (default: false)

**Client-side env vars (prefixed with VITE_):**
- `VITE_APP_TITLE` - Application name
- `VITE_ORGANIZATION_ENABLED` - Enable org/team features
- `VITE_STRIPE_ENABLED` - Enable Stripe payment UI
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key (if using payments)

**Secrets location:**
- `.env` file in project root (gitignored)
- `.env.example` template provided
- Environment variable validation via `src/lib/env.server.ts` using Zod schema

## Webhooks & Callbacks

**Incoming Webhooks:**
- Stripe webhooks - Payment events
  - Endpoint: Handled internally via `@better-auth/stripe` plugin
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Configuration: `src/lib/auth/auth.ts` - `onEvent` handler
  - Secret: `STRIPE_WEBHOOK_SECRET`

**Outgoing Webhooks:**
- None detected in codebase

## RPC & API Routes

**API Routes:**
- `/api/auth/$` - Authentication endpoints (Better Auth)
  - File: `src/routes/api/auth/$.ts`
  - Provider: Better Auth

- `/api/rpc/$` - ORPC RPC endpoints
  - File: `src/routes/api/rpc/$.ts`
  - Provider: ORPC framework
  - Type-safe RPC procedures exposed via TanStack React Query

- `/api/chat` - Chat streaming endpoint
  - Implementation: Chat handler for resumable connections
  - Usage: `src/lib/chat/use-resumable-chat.ts`
  - Features: SSE streaming, resumable streams

**Server Functions:**
- TanStack React Start server functions throughout codebase
  - Files: Various `.server.ts` files and `createServerFn` calls
  - Authentication: Protected via middleware
  - Type-safe: Full TypeScript support

## Database Schema

**Core Tables:**
- Auth tables (auto-generated by Better Auth)
  - File: `src/lib/db/schema/auth.ts` (auto-generated from `src/lib/auth/auth.ts`)
- Users and organizations
- Session management
- Resource/content tables
- Storage metadata

---

*Integration audit: 2026-02-11*
