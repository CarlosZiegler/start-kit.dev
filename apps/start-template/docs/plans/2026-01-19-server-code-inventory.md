# Server-Only Code Inventory

Files containing server-only code that should NOT be imported by client components.

## Database

| File | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Drizzle ORM database connection using Bun SQL |
| `src/lib/db/secure-client.ts` | RLS-secured database client wrapper |
| `src/lib/db/rls.ts` | Row-level security helpers and transaction wrappers |

## Authentication

| File | Purpose |
|------|---------|
| `src/lib/auth/auth.ts` | Better Auth server instance with all plugins (Stripe, email, etc.) |
| `src/lib/auth/auth-server-fn.ts` | TanStack server functions for auth middleware |
| `src/lib/auth/email-helpers.ts` | Server-side email sending via Resend |

## Environment & Config

| File | Purpose |
|------|---------|
| `src/lib/env.server.ts` | All server environment variables (DATABASE_URL, API keys, secrets) |

## External Services

| File | Purpose |
|------|---------|
| `src/lib/resend.ts` | Resend email client initialization |
| `src/lib/storage/index.ts` | Bun S3 client for file storage |
| `src/lib/chat/stream-context.ts` | Redis client for resumable streams |

## oRPC Server

| File | Purpose |
|------|---------|
| `src/orpc/orpc-server.ts` | oRPC context factory, middleware, and procedure definitions |
| `src/orpc/index.ts` | Router definition combining all routes |
| `src/orpc/routes/profile.ts` | Profile CRUD procedures |
| `src/orpc/routes/storage.ts` | File upload/download procedures |
| `src/orpc/routes/organization.ts` | Organization management procedures |
| `src/orpc/routes/dashboard.ts` | Dashboard data procedures |

## API Routes (Server Handlers)

| File | Purpose |
|------|---------|
| `src/routes/api/rpc.$.ts` | oRPC HTTP endpoint handler |
| `src/routes/api/auth/$.ts` | Better Auth HTTP endpoint handler |
| `src/routes/api/storage/$.ts` | File download streaming endpoint |
| `src/routes/api/chat/index.ts` | Chat streaming endpoint |
| `src/routes/api/chat/resume.ts` | Stream resume endpoint |

## Client-Safe Files (for reference)

These are fine to import from client code:

| File | Purpose |
|------|---------|
| `src/lib/auth/auth-client.ts` | Browser auth client |
| `src/lib/env.client.ts` | Vite VITE_ prefixed env vars |
| `src/orpc/orpc-client.ts` | oRPC client with TanStack Query |
| `src/lib/chat/resumable-connection.ts` | Client-side SSE parsing |
| `src/lib/chat/use-resumable-chat.ts` | React hook for resumable chat |
| `src/lib/db/schema/*` | Drizzle schema definitions (types only) |
