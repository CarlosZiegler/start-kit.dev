# External Integrations

**Analysis Date:** 2026-02-21

## APIs & External Services

**AI Models:**
- OpenAI - GPT-4o, GPT-4o-mini models for chat
  - SDK/Client: `@ai-sdk/openai` (via unified AI SDK)
  - Auth: `OPENAI_API_KEY` (environment variable)
  - Usage: `src/routes/api/chat/index.ts` - Multi-provider chat endpoint

- Anthropic - Claude models (default: claude-3-5-haiku-latest)
  - SDK/Client: `@ai-sdk/anthropic` (via unified AI SDK)
  - Auth: `ANTHROPIC_API_KEY`
  - Usage: `src/routes/api/chat/index.ts` - Supports all Claude variants

- Google - Gemini models (2.0-flash)
  - SDK/Client: `@ai-sdk/google` (via unified AI SDK)
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY`
  - Usage: `src/routes/api/chat/index.ts` - Stream-based chat responses

**Payment Processing:**
- Stripe - Payment gateway and subscriptions
  - SDK/Client: `stripe` (JS SDK) + `@better-auth/stripe` (plugin)
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Config: `src/lib/stripe/plans.config.ts` - Plan definitions with Stripe price IDs
  - Integration: Better-Auth plugin at `src/lib/auth/auth.ts` (lines 63-96)
  - Features: Subscription management, webhook events, checkout sessions
  - Plans: Free, Starter ($9/mo), Pro ($29/mo, highlighted), Enterprise ($99/mo)
  - API Version: 2025-12-15.clover
  - Webhook Events Handled:
    - `checkout.session.completed` - Checkout success
    - `customer.subscription.updated` - Subscription changes
    - `customer.subscription.deleted` - Subscription cancellation
  - Usage: `src/features/payment/stripe/`, `src/features/subscription/`

**Email Service:**
- Resend - Transactional email delivery
  - SDK/Client: `resend` (Resend SDK)
  - Auth: `RESEND_API_KEY`
  - From Email: `RESEND_FROM_EMAIL` (optional, defaults to noreply@example.com)
  - Integration: `src/lib/resend.ts` - Email sending with React Email templates
  - Features: HTML + plain text rendering via `@react-email/render`
  - Email Templates: `src/components/emails/` - Verification, password reset, magic link, OTP, subscription notifications
  - Usage: Better-Auth email hooks at `src/lib/auth/email-helpers.ts`

## Data Storage

**Databases:**
- PostgreSQL (primary)
  - Connection: `DATABASE_URL` (environment variable)
  - Client: Drizzle ORM with Bun's native S3Client for SQL execution
  - Dialect: `postgresql`
  - ORM: `drizzle-orm` 0.45.1 + `drizzle-zod` for validation
  - Schema Location: `src/lib/db/schema/`
    - `auth.ts` - User, session, account, verification token tables (Better-Auth schema)
    - `chat.ts` - Chat history and messages
    - `storage.ts` - File metadata and storage references
  - Migrations: Managed via Drizzle Kit (`src/lib/db/migrations/`)
  - Row-Level Security (RLS): Postgres RLS policies via `withRls()` middleware at `src/orpc/routes/`
  - Commands: `bun run db:push`, `bun run db:generate`, `bun run db:studio`

**File Storage:**
- S3-Compatible Services (configurable)
  - Provider: `STORAGE_PROVIDER` (enum: s3, cloudflare-r2, seaweedfs, digitalocean-spaces, google-cloud-storage, supabase-storage)
  - Default: AWS S3
  - Client: Bun's native `S3Client`
  - Config Variables:
    - `S3_ACCESS_KEY_ID` - Access key for S3-compatible service
    - `S3_SECRET_ACCESS_KEY` - Secret key
    - `S3_BUCKET` - Bucket name (auto-lowercased)
    - `S3_REGION` - Region (default: us-east-1)
    - `S3_ENDPOINT` - Custom endpoint (optional, for non-AWS services)
  - Implementation: `src/lib/storage/index.ts` - Upload, download, delete, presign, list operations
  - Features: Presigned URLs (default 24h expiry), retry with backoff, file validation
  - Database: File metadata tracked in `storage` table at `src/lib/db/schema/storage.ts`
  - Endpoints: `src/routes/api/storage/$.ts` - REST API for file operations
  - Usage: Profile avatars, document uploads via `src/orpc/routes/storage.ts`

**Caching & Rate Limiting:**
- Upstash Redis (optional)
  - Connection: `REDIS_URL` (optional environment variable)
  - Client: `@upstash/redis` 1.36.2
  - Rate Limiting: `@upstash/ratelimit` 2.0.8
  - Usage: Resumable chat streams and rate limit checks
  - Note: Only activated if `REDIS_URL` is set

## Authentication & Identity

**Auth Provider:**
- Better-Auth 1.4.18 (custom implementation)
  - Server Config: `src/lib/auth/auth.ts` - Full implementation with plugins
  - Client: `src/lib/auth/auth-client.ts` - Client-side API wrapper
  - Session Verification: `BETTER_AUTH_SECRET` (environment variable)
  - Base URL: `BETTER_AUTH_BASE_URL` (default: http://localhost:3000)
  - Trusted Origins: `BETTER_AUTH_TRUSTED_ORIGINS` (optional, CORS control)
  - Database Adapter: Drizzle ORM adapter (`better-auth/adapters/drizzle`)
  - Schema Location: `src/lib/db/schema/auth.ts` (auto-generated via `auth:generate` command)

**Auth Plugins Enabled:**
- **Organization** - Multi-organization support with invitations and roles
- **2FA** - Two-factor authentication (TOTP)
- **Email OTP** - One-time password via email
- **Passkeys** - WebAuthn passkey authentication (`@better-auth/passkey`)
  - Requires Reflect.getMetadata polyfill (added in `vite.config.ts` lines 14-42)
- **Magic Link** - Passwordless email link authentication
- **Last Login Method** - Track user's last login method
- **Admin** - Admin role and access control
- **Stripe** - Automatic customer creation on signup, subscription management

**Social & OAuth:**
- Email-based auth (verification via Resend)
- Magic link sign-in (via Resend)
- Passkey authentication (WebAuthn)
- No third-party OAuth detected (social providers not configured)

**Roles & Permissions:**
- Default Roles: `user`, `admin`, `owner`, `super_admin`
- Implementation: `src/lib/auth/permissions.ts` - Access control via Better-Auth plugins
- RBAC: Built on Better-Auth access control API
- Usage: Enforced in oRPC protected procedures

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry/LogRocket integration

**Logs:**
- Pino 10.3.1 - Structured JSON logging at `src/lib/auth/auth.ts`
  - Level: info
  - Stripe webhook events logged with metadata: event type, ID, timestamp, subscription details
- Console: Application uses toast notifications (sonner) for user-facing errors
- No console logging in production code (enforced by Biome linter)

**Analytics:**
- @vercel/analytics 1.6.1 - Web vitals tracking (Vercel-hosted only)

**Observability Tools:**
- @tanstack/devtools-vite - TanStack devtools for debugging
- @tanstack/react-devtools - React devtools for client inspection
- @tanstack/react-query-devtools - React Query inspection
- @tanstack/react-router-devtools - Router debugging
- drizzle-kit studio (`bun run db:studio`) - Database GUI
- Vitest UI (`bun run test:ui`) - Test debugging UI

## CI/CD & Deployment

**Hosting:**
- Vercel (native support)
  - Configured in `vite.config.ts` lines 93-98 - Nitro Vercel preset with Bun 1.x runtime
  - Automatic deployment from git pushes
  - Production URL: `VERCEL_PROJECT_PRODUCTION_URL` (environment variable)
  - Preview URLs: `VERCEL_URL`, `VERCEL_BRANCH_URL`

**CI Pipeline:**
- Not detected in repository - No GitHub Actions workflows configured

**Build & Deployment:**
- Bun as build runtime
- Vite for bundling
- Nitro for serverless functions
- Docker support: `docker:build`, `docker:run` commands in package.json
- S3 upload: `bun run upload:s3` command available

## Environment Configuration

**Required env vars (server-side):**
```
DATABASE_URL              # PostgreSQL connection string
RESEND_API_KEY           # Email service API key
BETTER_AUTH_SECRET       # Session encryption secret
STRIPE_SECRET_KEY        # Stripe API secret (optional if payments disabled)
STRIPE_WEBHOOK_SECRET    # Stripe webhook signing secret (optional)
S3_ACCESS_KEY_ID         # Storage provider access key
S3_SECRET_ACCESS_KEY     # Storage provider secret key
S3_BUCKET                # Storage bucket name
```

**Optional env vars:**
```
ANTHROPIC_API_KEY        # Claude API key
OPENAI_API_KEY          # OpenAI API key
GOOGLE_GENERATIVE_AI_API_KEY  # Gemini API key
REDIS_URL               # Redis connection (for rate limiting)
S3_REGION               # S3 region (default: us-east-1)
S3_ENDPOINT             # Custom S3 endpoint (for non-AWS)
STORAGE_PROVIDER        # Storage type (default: s3)
RESEND_FROM_EMAIL       # Custom from email
BETTER_AUTH_BASE_URL    # Auth base URL (default: http://localhost:3000)
BETTER_AUTH_TRUSTED_ORIGINS  # CORS trusted origins
DRIZZLE_QUERY_LOGGER_ENABLED  # Enable query logging
VERCEL_*                # Vercel deployment environment variables
```

**Secrets location:**
- `.env` file (local development, not committed)
- Environment variables in deployment platform (Vercel)
- No .env.example file detected

## Webhooks & Callbacks

**Incoming:**
- **Stripe Webhooks** - `src/lib/auth/auth.ts` (lines 76-92)
  - Endpoint: Integrated into Better-Auth Stripe plugin
  - Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
  - Verification: HMAC signature verification via `STRIPE_WEBHOOK_SECRET`
  - Handler: `onEvent` callback logs and processes subscription events

- **Chat API** - `src/routes/api/chat/index.ts`
  - POST `/api/chat/` - Streaming text responses from AI models
  - Request body: messages, provider (openai/anthropic/gemini), model ID
  - Response: Server-sent events (SSE) for streamed AI responses
  - Auth: Session verification required

**Outgoing:**
- **Email Webhooks** - Not configured (Resend handles bounce/complaint tracking server-side)
- **Stripe Customer Webhooks** - Automatically created for subscription events
- No custom webhook implementations detected

---

*Integration audit: 2026-02-21*
