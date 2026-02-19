Ultracite + TanStack Start app for auth-first SaaS boilerplate. Fast, typed, accessible.

**Highlights**

- React 19 + TanStack Start (React Router + SSR) + Vite
- Auth via Better Auth (organizations, passkeys, 2FA)
- AI: TanStack AI + OpenAI/Google/Anthropic integrations
- oRPC + TanStack Query (query/mutation utils + queryKey helpers)
- Payments: Stripe integration
- Storage: S3-compatible providers (AWS, R2, SeaweedFS, etc.)
- Testing: Vitest + Testing Library
- Forms: React Hook Form + Zod + shadcn/ui wrappers
- DB: Postgres + Drizzle ORM (auth schema only)
- i18n: i18next + react-i18next
- Styling: Tailwind v4 + shadcn/ui (Base-UI) + cva
- Tooling: Ultracite (oxlint + oxfmt), Bun, Vite

[CarlosZiegler/start-template](https://github.com/CarlosZiegler/start-template)

**Approach**

- Type-safety end-to-end (zod, Drizzle, orpc, Better Auth types)
- Server calls via oRPC; React Query drives cache/invalidations
- Auth flows call `authClient` directly inside routes/components
- UI from `src/components/ui/*` (shadcn) with a11y baked-in
- Forms: `<Controller />` + `<Field />`; `data-invalid` + `aria-invalid` always
- Errors: throw in mutationFn; surface via `toast`/UI; no `console`

**Features**

- **AI Chat**: Streaming chat interface with TanStack AI, OpenAI/Google provider support
- **Internationalization**: i18next + react-i18next; locales `src/lib/intl`; switcher `src/components/language-switch.tsx`
- **Organizations**: create/edit, slug check, logo; invite/accept; role-based permissions (owner/admin/member)
- **Permissions System**: Fine-grained access control for organization management
- **Security**: 2FA (TOTP), Passkeys (WebAuthn), sessions view, email verification, change password
- **Profile**: avatar upload/remove; name/email update
- **Forms**: RHF + Zod + a11y wrappers; OTP input UI
- **DnD**: Drag-and-drop with @dnd-kit
- **Charts**: Data visualization with Recharts
- **Flow Diagrams**: Interactive node-based UI with XY Flow
- **Payments**: Stripe integration for subscriptions and one-time payments
- **Storage System**: S3-compatible object storage (AWS, R2, SeaweedFS, Cloudflare R2)
- **Testing**: Comprehensive suite with Vitest and React Testing Library

**Visuals (Mermaid)**

```mermaid
flowchart TD
  A[Client: TanStack Router] -->|auth tokens| B[Better Auth server routes]
  B -->|session/org| C[Postgres via Drizzle]
  A -->|orpc| D[oRPC server handlers]
  D --> C
  A -->|AI prompt| E[TanStack AI + OpenAI/Google]
  A -->|forms| F[React Hook Form + Zod validators]
```

```mermaid
sequenceDiagram
  participant User
  participant UI as Dashboard UI
  participant Auth as Better Auth
  participant DB as Postgres/Drizzle
  User->>UI: Submit login (password/passkey)
  UI->>Auth: authClient.signIn()
  Auth->>DB: verify credentials + org membership
  DB-->>Auth: session + active org
  Auth-->>UI: session token + org context
  UI->>UI: cache via TanStack Query
  UI-->>User: redirect to dashboard with role-aware data
```

**Use Cases**

- SaaS dashboard with org-level roles, member invites, and billing-ready skeleton.
- AI copilots inside authenticated dashboards (per-org context, persisted sessions).
- Secure profile management (avatar, email, password, passkeys, 2FA) with audit-friendly sessions.
- Multi-tenant API surface via oRPC + React Query, ready for OpenAPI emission.
- Internationalized app shell with locale switcher and Tailwind v4 styling primitives.

**Stack (libs actually used)**

- Routing/SSR: `@tanstack/react-router`, `@tanstack/react-start`
- Data: `@tanstack/react-query`
- AI: `@tanstack/ai`, `@tanstack/ai-openai`, `@tanstack/ai-react`
- RPC: `@orpc/client`, `@orpc/server`, `@orpc/tanstack-query`, `@orpc/zod`, `@orpc/openapi`
- Auth: `better-auth`, `@better-auth/passkey`
- Payments: `@better-auth/stripe`, `stripe`
- DB: `drizzle-orm`, `pg`, `drizzle-kit`
- Forms/validation: `react-hook-form`, `@hookform/resolvers`, `zod`
- UI: `tailwindcss`, `class-variance-authority`, `lucide-react`, `@base-ui/react`, shadcn components (Base-UI)
- DnD: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
- Charts: `recharts`
- Flow: `@xyflow/react`
- Testing: `vitest`, `@testing-library/react`, `jsdom`
- i18n: `i18next`, `react-i18next`
- Email: `@react-email/*`, `resend`
- Misc: `sonner`, `date-fns`, `uuid`, `motion`
- Tooling: `vite`, `@vitejs/plugin-react`, `ultracite`, `oxlint`, `typescript`, `bun`

**File Structure (key)**

- `src/routes/**` TanStack Start routes (auth, dashboard, api)
- `src/features/**` Feature modules (auth, organizations, settings)
- `src/components/ui/**` shadcn primitives + field/form wrappers
- `src/components/guards/**` Permission guards for conditional rendering
- `src/lib/auth/auth-client.ts` Better Auth client + plugins
- `src/lib/hooks/**` Shared hooks (permissions, etc)
- `src/orpc/**` oRPC client/server utils; `orpc` query utils
- `src/lib/db/**` Drizzle config, migrations, schema
- `src/lib/validations/**` Zod schemas
- `src/lib/auth/**` Better Auth config + permissions system

- Root docs: `forms.mdc`, `requests.orpc-auth.mdc`

**DB Layer (auth schema only)**

- user: id, name, email(unique), emailVerified, image, createdAt, updatedAt, twoFactorEnabled, role, banned, banReason, banExpires
- session: id, expiresAt, token(unique), ipAddress, userAgent, userId(fk user), impersonatedBy, activeOrganizationId
- account: id, accountId, providerId, userId(fk), tokens, scopes, password, timestamps
- verification: id, identifier, value, expiresAt, timestamps
- two_factor: id, secret, backupCodes, userId(fk)
- apikey: id, name, prefix/start/key, userId(fk), rate limit fields, perms, metadata, timestamps, enabled flags
- passkey: id, name, publicKey, userId(fk), credentialID, counter, deviceType, backedUp, transports, aaguid, createdAt
- oauth_application: id, name, icon, metadata, clientId/secret, redirectURLs, type, disabled, userId(fk), timestamps
- oauth_access_token: id, access/refresh tokens (+expires), clientId(fk), userId(fk), scopes, timestamps
- oauth_consent: id, clientId(fk), userId(fk), scopes, consentGiven, timestamps
- organization: id, name, slug(unique), logo, metadata, createdAt
- member: id, organizationId(fk), userId(fk), role(default member), createdAt

- invitation: id, organizationId(fk), email, role, status, expiresAt, inviterId(fk)

**Auth Flows**

- Credentials/social/passkey sign-in; sign-up; email OTP; 2FA TOTP
- Org membership/invitations/roles via Better Auth org API

**Permissions System**

Organization roles with Better Auth access control:

- **Owner**: Full control (create, read, update, delete all resources)
  - Manage organization settings
  - Invite/remove members, update roles

Implementation:

- `src/lib/auth/permissions.ts` - Role definitions & helper functions
- `src/lib/hooks/use-organization-permissions.ts` - React hook for checking permissions
- `src/components/guards/permission-guard.tsx` - Component for conditional rendering
- Usage: `<PermissionGuard permission="canInvite"><Button>Invite</Button></PermissionGuard>`

Permission helpers:

- `canManageOrganization(role)` - Edit organization settings (Owner, Admin only)
- `canDeleteOrganization(role)` - Delete organization (Owner only)
- `canInviteMembers(role)` - Invite new members (Owner, Admin only)
- `canRemoveMembers(role)` - Remove members (Owner, Admin only)
- `canUpdateMemberRoles(role)` - Change member roles (Owner, Admin only)

**Requests**

- Auth: direct `authClient.*` calls inside TanStack Query mutations; throw on `result.error`
- orpc: `orpc.*.*.mutationOptions()`; queries via `.queryOptions()` or `.queryKey()`
- Invalidate: `queryClient.invalidateQueries({ queryKey: orpc.todos.getAll.queryKey() })` or factory `.queryKey`

**Forms**

- RHF + Zod; `<Controller />` + `<Field />`; a11y: `data-invalid` + `aria-invalid`

**A11y + Quality**

- [Ultracite](https://www.ultracite.ai) with [oxlint provider](https://www.ultracite.ai/providers/oxlint) enforces strict a11y/style rules
- Zero-config linting and formatting via oxc toolchain

**Getting Started**

1. **Prerequisites**
   - [Bun](https://bun.sh) installed
   - [Neon](https://neon.tech) account for Postgres database

2. **Database Setup**
   - EITHER set `DATABASE_URL` yourself (Neon dashboard → connection string starting with `postgresql://`)
   - OR just run `bun dev`: the `vite-plugin-db` Neon helper will prompt to create/claim a Neon database and write `DATABASE_URL` for you (dev only). For CI/production you still need to provide the connection string yourself.

3. **Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `BETTER_AUTH_SECRET` - Generate: `openssl rand -base64 32`
   - `BETTER_AUTH_BASE_URL` - Usually `http://localhost:3000` in local dev
   - `VITE_BETTER_AUTH_BASE_URL` - Usually `http://localhost:3000` in local dev
   - `BETTER_AUTH_TRUSTED_ORIGINS` - Optional comma-separated trusted origins (use this to allow preview/staging/custom domains in Better Auth origin checks)
   - `RESEND_API_KEY` - From https://resend.com/api-keys (auth emails)
   - `OPENAI_API_KEY` - OpenAI API key (optional, for AI chat)
   - `ANTHROPIC_API_KEY` - Anthropic API key (optional)
   - `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI key (optional)
   - `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` - Required storage vars
   - `S3_ENDPOINT` - Required for local SeaweedFS (e.g. `http://localhost:8333`)
   - `STRIPE_PUBLISHABLE_KEY` - Stripe public key (for payments)
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

4. **Install Dependencies**

   ```bash
   bun install
   ```

5. **Initial Database Setup**

   ```bash
   # Start dev server first (creates DB if needed)
   bun dev

   # Stop server (Ctrl+C), then setup vector extension
   bun run db:setup-vector

   # Push schema to database
   bun run db:push
   ```

6. **Start Development**

   ```bash
   bun dev
   ```

   Visit http://localhost:3000
   - Register new user account
   - Check email for verification (if RESEND_API_KEY configured)
   - Login with credentials

#### Better Auth trusted domains

If authentication works locally but fails on preview/staging, configure trusted origins in your environment:

- Add `BETTER_AUTH_TRUSTED_ORIGINS` as a comma-separated list of allowed origins
- Vercel preview deployments are also auto-added from `VERCEL_URL` / `VERCEL_BRANCH_URL` / `VERCEL_PROJECT_PRODUCTION_URL` when present
- Keep values as full origins (scheme + host, e.g. `https://your-preview-domain`)
- Configure this per environment (Development / Preview / Production) in your hosting platform

### Troubleshooting (local)

If `GET /` returns `500` with `HTTPError` in local dev:

1. Confirm required env vars are set in `.env`:
   - `BETTER_AUTH_SECRET`
   - `RESEND_API_KEY`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
2. Start local infra (SeaweedFS + Redis):
   ```bash
   docker compose up -d seaweedfs redis
   ```
3. Enable vector extension and push DB schema:
   ```bash
   bun run db:setup-vector
   bun run db:push
   ```
4. Restart dev server:
   ```bash
   bun dev
   ```

**Development Scripts**

- `bun dev` - Start dev server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun run db:push` - Push schema changes
- `bun run db:generate` - Generate migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:setup-vector` - Setup pgvector extension
- `bun run email:dev` - Preview emails (port 5555)
- `bun run auth:generate` - Regenerate Better Auth schema
- `bun run add-ui-components` - Add new shadcn/ui components
- `bun run tsc` - Type check without emitting
- `bun test` - Run unit and component tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Generate coverage report
- `bun run storage:migrate` - Migrate base64 images to object storage

## Storage System

Flexible object storage using strategy pattern with Bun's native S3 API.

### Supported Providers

**S3-Compatible Storage** (single strategy, multiple providers):

- AWS S3 - Production-grade object storage
- Cloudflare R2 - Zero egress fees, global edge network
- SeaweedFS - Self-hosted S3-compatible storage (recommended over MinIO)
- DigitalOcean Spaces - Affordable S3-compatible storage
- Google Cloud Storage - Google's cloud storage with S3 API
- Supabase Storage - Supabase's S3-compatible storage
- Any S3-compatible service

### Quick Start

1. Choose your provider and set environment variables in `.env`

**For AWS S3**:

```bash
STORAGE_PROVIDER=s3
S3_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
S3_BUCKET=my-app-bucket
S3_REGION=us-east-1
```

**For Cloudflare R2**:

```bash
STORAGE_PROVIDER=s3
S3_ACCESS_KEY_ID=your_r2_token
S3_SECRET_ACCESS_KEY=your_r2_secret
S3_BUCKET=my-app-bucket
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
```

**For SeaweedFS** (recommended for self-hosted):

```bash
STORAGE_PROVIDER=seaweedfs
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=my-app-bucket
S3_ENDPOINT=http://localhost:8333
```

> **Why SeaweedFS over MinIO?** In December 2025, MinIO's open-source Community Edition entered maintenance mode - no new features, selective security patches, and no community contributions accepted. SeaweedFS provides an actively developed, S3-compatible alternative with the same API compatibility.

**For DigitalOcean Spaces**:

```bash
STORAGE_PROVIDER=s3
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=my-app-bucket
S3_REGION=nyc3
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

**For Google Cloud Storage**:

```bash
STORAGE_PROVIDER=s3
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=my-app-bucket
S3_ENDPOINT=https://storage.googleapis.com
```

2. Run migration to create the database table:

```bash
bun run db:push
```

3. (Optional) Migrate existing base64 images to storage:

```bash
bun run storage:migrate
```

### Usage Examples

#### Server-Side Upload (oRPC)

```typescript
import { orpc } from "@/lib/orpc-client";

// Upload file from server
const result = await orpc.storage.upload.mutate({
  file: fileObject,
  purpose: "avatar",
  organizationId: "org_123", // optional
});

// Result: { key, url, fileId, size, mimeType }
console.log("Uploaded:", result.url);
```

#### Direct Client Upload (Presigned URL)

```typescript
import { orpc } from "@/lib/orpc-client";

// 1. Request presigned URL
const presigned = await orpc.storage.presignUpload.mutate({
  fileName: "photo.jpg",
  purpose: "avatar",
  expiresIn: 3600, // 1 hour
});

// 2. Upload directly from client (bypasses server)
await fetch(presigned.url, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});

// 3. Notify server that upload completed
await orpc.storage.presignCallback.mutate({
  key: presigned.key,
  mimeType: file.type,
  size: file.size,
  purpose: "avatar",
});
```

#### Get File URL

```typescript
const { url } = await orpc.storage.getUrl.query({
  key: "avatar/user_123/abc123.jpg",
  expiresIn: 3600,
});
```

#### Delete File

```typescript
await orpc.storage.delete.mutate({
  fileId: "file_123",
});
```

#### List Files

```typescript
const { files, total } = await orpc.storage.list.query({
  purpose: "avatar",
  limit: 10,
});
```

#### Direct Storage API (Server-Side)

```typescript
import { storage } from "@/lib/storage";

// Upload
const result = await storage.upload("uploads/avatar.jpg", buffer, {
  contentType: "image/jpeg",
  metadata: { userId: "user_123", organizationId: "org_456" },
});

// Get URL
const url = await storage.getUrl("uploads/avatar.jpg", 3600);

// Presign for client upload
const presignedUrl = await storage.presign("uploads/new-file.jpg", 3600, "PUT");

// Delete
await storage.delete("uploads/avatar.jpg");

// Check existence
const exists = await storage.exists("uploads/avatar.jpg");

// List files
const { files, isTruncated } = await storage.list("uploads/", 100);
```

### Configuration

All storage configuration is done via environment variables:

| Variable                  | Required      | Default | Description                             |
| ------------------------- | ------------- | ------- | --------------------------------------- |
| `S3_BUCKET`               | S3            | -       | Bucket name                             |
| `S3_SESSION_TOKEN`        | S3 (optional) | -       | Session token for temporary credentials |
| `S3_VIRTUAL_HOSTED_STYLE` | S3 (optional) | `false` | Use virtual hosted-style URLs           |

### Features

- **Single S3 Strategy**: Works with ALL S3-compatible providers via configuration
- **Presigned URLs**: Enable direct client uploads (reduces server load & bandwidth)
- **Type-Safe**: Full TypeScript support with Zod validation
- **Multi-tenant**: Organization-aware storage with ownership checks
- **Metadata Tracking**: Store file metadata in database for fast queries
- **Error Handling**: Comprehensive error handling with retry logic (3 attempts)
- **File Validation**: 5MB max size, image file types (JPEG, PNG, GIF, WebP, SVG)
- **Migration Path**: Migrate existing base64 images to object storage

### Allowed File Types

Supported MIME types:

- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`
- `image/svg`

Max file size: 5MB per file

### Provider-Specific Setup

#### AWS S3

1. Create S3 bucket in AWS Console
2. Configure CORS policy (if needed for direct uploads)
3. Set bucket policy for public/private access as needed
4. Create IAM user with programmatic access
5. Attach policy with `s3:*` permissions on your bucket
6. Copy credentials to `.env`

#### Cloudflare R2

1. Create R2 bucket in Cloudflare Dashboard
2. Go to "Manage R2 API Tokens"
3. Create API token with "Object Read & Write" permissions
4. Copy account ID, access key, and secret to `.env`
5. Set `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`

#### SeaweedFS (Self-Hosted, Recommended)

SeaweedFS is the recommended self-hosted S3-compatible storage. MinIO Community Edition entered maintenance mode in December 2025.

1. Start SeaweedFS: `docker compose up -d seaweedfs`
2. Filer UI at `http://localhost:8888` for file browsing
3. Master UI at `http://localhost:9333` for cluster status
4. S3 API at `http://localhost:8333`
5. Update `.env`:
   ```bash
   STORAGE_PROVIDER=seaweedfs
   S3_ENDPOINT=http://localhost:8333
   ```

#### DigitalOcean Spaces

1. Create Space in DigitalOcean Control Panel
2. Go to Settings → API Keys
3. Generate Spaces Access Key
4. Copy credentials and region to `.env`
5. Set `S3_ENDPOINT=https://<region>.digitaloceanspaces.com`

#### Google Cloud Storage (S3 Interoperability)

1. Enable Interoperability Access in GCP Console
2. Create HMAC key
3. Copy access key and secret to `.env`
4. Set `S3_ENDPOINT=https://storage.googleapis.com`

### Testing

Test the storage system:

```typescript
import { storage } from "@/lib/storage";

// Test upload
const result = await storage.upload("test.txt", Buffer.from("Hello World"), {
  contentType: "text/plain",
});

// Test download
const data = await storage.download("test.txt");
console.log(data.toString()); // "Hello World"

// Test URL
const url = await storage.getUrl("test.txt");
console.log(url);

// Test deletion
await storage.delete("test.txt");
```

### Performance

- Bun's native S3 API is faster than AWS SDK for Node.js
- Zero-copy operations for file transfers
- Memory-efficient streaming for large files
- Presigned URLs eliminate proxy bandwidth

### Security

- Server-side uploads enforce ownership checks
- Presigned URLs are temporary and scoped to single files
- Credentials never exposed to client
- CORS policies restrict direct upload origins
- File metadata tracks user/organization ownership

### Troubleshooting

**Issue**: `ERR_S3_MISSING_CREDENTIALS`

- **Solution**: Ensure `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` are set in `.env`

**Issue**: `ERR_S3_INVALID_ENDPOINT`

- **Solution**: Verify `S3_ENDPOINT` format. For custom providers, include protocol (https://)

**Issue**: Presigned URL 403 error

- **Solution**: Check bucket permissions, ensure IAM policy allows `s3:PutObject`

**Issue**: File upload exceeds 5MB

- **Solution**: Resize image or use multipart upload (not implemented yet)

**Deployment**

- Vercel (Bun):
  - Install command: `bun install --frozen-lockfile`
  - Build command: `bun run bun:build` (uses `vite.bun.config.ts`)
  - Output: `dist` + root `backend.ts` entry; set `BUN_VERSION` env if needed.
  - Env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, optional `OPENAI_API_KEY` and any provider secrets you use.
  - Start command (if required): `bun run backend.ts`
- Docker:
  - Multi-stage Bun image (`deps` → `build` → `prod-deps` → `runner`), runs as non-root `bun`, serves `dist` via `backend.ts` on port 3000.
  - Build: `bun run docker:build` (or `docker build -t tanstack-start-app .`).
  - Run: `docker run -p 3000:3000 --env-file .env tanstack-start-app`.
  - Same env vars as above; image sets `NODE_ENV=production`.
