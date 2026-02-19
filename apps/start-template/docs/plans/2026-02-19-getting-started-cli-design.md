# Getting Started CLI — Design

## Summary

Interactive CLI wizard (`bunx start-template init`) that guides new users through project setup with phased steps, resume support, and graceful defaults. Uses `@clack/prompts` for UX. Inspired by OpenClaw's onboarding wizard.

## Architecture

**Entry point**: `cli/index.ts` — registered as `bin` in `package.json`

**Invocation**:
```bash
bunx start-template init            # Full wizard (all phases)
bunx start-template init --step branding    # Single phase
bunx start-template init --step database    # Single phase
```

**File structure**:
```
cli/
  index.ts              # Entry + arg parsing + phase router
  phases/
    branding.ts         # App name, description, domain
    features.ts         # Feature multiselect
    database.ts         # DB connection (own URL vs Instagres)
    env.ts              # Guided env prompts per feature
    infra.ts            # Docker services (only what's needed)
  lib/
    state.ts            # Read/write .setup-state.json
    validators.ts       # URL, API key format validators
    helpers.ts          # File editing (update JSON, update TS const)
  templates/
    env.template.ts     # .env generator based on enabled features
```

**State file**: `.setup-state.json` — tracks completed phases, selected features, user choices. Enables resume.

**Dependencies**: `@clack/prompts` (single new dep)

---

## Resume Behavior

First run:
```
┌  Start Kit Setup
│
◆  Welcome! Let's set up your project.
│  5 phases to complete:
│  ○ Branding     ○ Features     ○ Database
│  ○ Environment  ○ Infrastructure
│
◆  Start from the beginning?
│  ● Yes, run all phases
│  ○ Jump to a specific phase
└
```

Subsequent run (with `.setup-state.json`):
```
┌  Start Kit Setup
│
◆  Previous setup detected!
│  ✓ Branding     ✓ Features     ○ Database
│  ○ Environment  ○ Infrastructure
│
◆  What would you like to do?
│  ● Continue from Database
│  ○ Start over
│  ○ Jump to a specific phase
└
```

---

## Phase 1 — Branding

```
◆  What's your app name?
│  My SaaS App
│
◆  Short description?
│  A platform for managing widgets
│
◆  What's your domain? (for emails, auth origins)
│  mysaasapp.com
│
◇  Updating files...
│  ✓ package.json → name: "my-saas-app"
│  ✓ src/lib/config/app.config.ts → name, description
│  ✓ .env.example → RESEND_FROM_EMAIL updated
└  Phase 1 complete ✓
```

**Files touched**: `package.json`, `src/lib/config/app.config.ts`, `.env.example`

---

## Phase 2 — Features

```
◆  Which features do you want to enable?
│  ◻ Stripe (payments & subscriptions)
│  ◻ AI Chat (OpenAI / Anthropic / Gemini)
│  ◻ Storage (S3 / SeaweedFS / R2 / Minio)
│  ◻ Redis (resumable chat streams)
│  ◻ Email (Resend — transactional emails)
│
◇  Selected: Stripe, AI Chat, Email
└  Phase 2 complete ✓
```

Selections saved to `.setup-state.json`. Drives Phase 4 (which env vars to prompt) and Phase 5 (which Docker services to offer).

---

## Phase 3 — Database

### User has own database:
```
◆  Do you already have a PostgreSQL database?
│  ● Yes, I have a connection URL
│  ○ No, create one instantly with Instagres (pg.new)
│
◆  Enter your DATABASE_URL:
│  postgresql://user:pass@host:5432/mydb
│
◇  Testing connection...
│  ✓ Connected to PostgreSQL 16.2
│
◆  Run database migrations now?
│  ● Yes
│  ○ No, I'll do it later
│
◇  Running migrations...
│  ✓ 11 tables created
└  Phase 3 complete ✓
```

### User needs a database (Instagres):
```
◆  Do you already have a PostgreSQL database?
│  ○ Yes, I have a connection URL
│  ● No, create one instantly with Instagres (pg.new)
│
◇  Creating instant Neon database...
│  Running: bunx get-db --yes --env .env --key DATABASE_URL
│
│  ✓ Database created!
│  ✓ DATABASE_URL written to .env
│
│  ⚠ This database expires in 72 hours.
│  Claim it at https://neon.tech to keep it permanently.
│  Run: npx get-db claim
│
◆  Run database migrations now?
│  ● Yes
│  ○ No, I'll do it later
│
◇  Running migrations...
│  ✓ 11 tables created
└  Phase 3 complete ✓
```

---

## Phase 4 — Environment

Only prompts env vars for features enabled in Phase 2. Uses dummy/placeholder values when user skips, so the app starts without crashing.

### Env Var Categories

**Always required (auto-handled):**

| Variable | Behavior |
|----------|----------|
| `DATABASE_URL` | From Phase 3 |
| `BETTER_AUTH_SECRET` | Auto-generate `openssl rand -base64 32` |
| `BETTER_AUTH_BASE_URL` | Default `http://localhost:3000` |

**Feature: Email (Resend)**

```
◆  RESEND_API_KEY (get one at resend.com, or Enter for placeholder):
│  [Enter]
│  ⚠ Using placeholder — emails will fail until you add a real key
```

Dummy value: `re_dummy_replace_me` — `sendEmailSafely()` catches errors gracefully.

**Feature: Storage**

```
◆  Do you have S3-compatible storage credentials?
│  ● No, use placeholder values (storage calls will fail gracefully)
│  ○ Yes, I have credentials (S3, R2, Minio, etc.)
│  ○ Start SeaweedFS via Docker (local S3)
```

If placeholder: `S3_ACCESS_KEY_ID=dummy`, `S3_SECRET_ACCESS_KEY=dummy`, `S3_BUCKET=dummy`. S3Client constructor accepts any string — fails only on actual upload/download with clear error.

If credentials: prompt for `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_ENDPOINT` (optional), `S3_REGION` (default us-east-1).

**Feature: Stripe**

```
◆  STRIPE_SECRET_KEY (get from dashboard.stripe.com, or Enter to skip):
│  sk_test_xxxxx
│
◆  STRIPE_WEBHOOK_SECRET:
│  whsec_xxxxx
│
◆  STRIPE_PUBLISHABLE_KEY (for client):
│  pk_test_xxxxx
```

If skipped: env vars omitted entirely. Stripe plugin doesn't register — feature disabled, no crash.

**Feature: AI Chat**

```
◆  OpenAI API key (optional, Enter to skip):
│  sk-proj-xxxxx
│
◆  Anthropic API key (optional, Enter to skip):
│  [skipped]
```

If skipped: env vars omitted. Chat route errors only when called.

**Feature: Redis**

```
◆  Do you have an external Redis?
│  ● No, skip (chat won't have resumable streams)
│  ○ Yes, I have a Redis URL
│  ○ Start Redis via Docker
```

If skipped: `REDIS_URL` omitted. Already optional — chat falls back to non-resumable streams.

### Final output:

```
◇  Writing .env file...
│  ✓ 12 variables written
│  ⚠ 2 placeholders need real values later:
│    • RESEND_API_KEY
│    • S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET
└  Phase 4 complete ✓
```

### Env Var Failure Mode Reference

| Service | Required by Zod? | Dummy-safe? | Failure mode with dummy |
|---------|-----------------|-------------|------------------------|
| DATABASE_URL | Required | No | Crash on startup |
| BETTER_AUTH_SECRET | Required | Yes (any string) | Works fine |
| RESEND_API_KEY | Required | Yes (any string) | Error on email send, caught |
| S3_* credentials | Required | Yes (any string) | Error on S3 call, not on startup |
| STRIPE_* | Optional | N/A | Omit = feature disabled |
| OPENAI/ANTHROPIC | Optional | N/A | Omit = feature disabled |
| REDIS_URL | Optional | N/A | Omit = graceful fallback |

---

## Phase 5 — Infrastructure

Only shows Docker services the user actually needs based on Phase 4 choices.

### Nothing needed:
```
◆  Phase 5: Local Infrastructure
│
│  No Docker services needed! Your setup uses:
│  • Database — remote (Instagres / own URL)
│  • Storage — placeholder values
│  • Redis — not enabled
│
│  ✓ Nothing to start locally.
└  Setup complete!
│
│  Run `bun dev` to start your app.
│  Visit http://localhost:3000
```

### SeaweedFS needed:
```
◆  Phase 5: Local Infrastructure
│
│  Starting SeaweedFS (local S3-compatible storage)...
│
◇  docker compose up -d seaweedfs
│  ✓ SeaweedFS running on localhost:8333
│
│  S3 credentials for SeaweedFS:
│  ✓ S3_ENDPOINT=http://localhost:8333
│  ✓ S3_ACCESS_KEY_ID=minioadmin
│  ✓ S3_SECRET_ACCESS_KEY=minioadmin
└  Phase 5 complete ✓
```

### Redis needed:
```
◇  Starting Redis...
│  docker compose up -d redis
│  ✓ Redis running on localhost:6379
│  ✓ REDIS_URL=redis://localhost:6379
└  Phase 5 complete ✓
```

### Final health checks:
```
◇  Final checks...
│  ✓ Database — connected
│  ✓ Storage — connected (or placeholder)
│  ✓ Redis — connected (or skipped)
│  ✓ All env vars valid
│
│  Setup complete! Run `bun dev` to start.
│  Visit http://localhost:3000
```

---

## .setup-state.json Schema

```json
{
  "version": 1,
  "completedPhases": ["branding", "features", "database"],
  "branding": {
    "appName": "My SaaS App",
    "description": "A platform for managing widgets",
    "domain": "mysaasapp.com"
  },
  "features": {
    "stripe": true,
    "ai": true,
    "storage": false,
    "redis": false,
    "email": true
  },
  "database": {
    "provider": "instagres",
    "migrated": true
  },
  "env": {
    "placeholders": ["RESEND_API_KEY", "S3_ACCESS_KEY_ID"],
    "written": true
  },
  "infra": {
    "seaweedfs": false,
    "redis": false
  }
}
```

---

## package.json bin entry

```json
{
  "bin": {
    "start-template": "./cli/index.ts"
  }
}
```

Bun natively runs `.ts` files as bin entries — no build step needed.

---

## Validation Rules

| Field | Validation |
|-------|-----------|
| App name | 2-50 chars, no special chars except spaces/hyphens |
| Domain | Valid domain format (no protocol prefix) |
| DATABASE_URL | Starts with `postgresql://`, test connection |
| RESEND_API_KEY | Starts with `re_` or dummy value |
| STRIPE_SECRET_KEY | Starts with `sk_test_` or `sk_live_` |
| STRIPE_PUBLISHABLE_KEY | Starts with `pk_test_` or `pk_live_` |
| STRIPE_WEBHOOK_SECRET | Starts with `whsec_` |
| S3_ENDPOINT | Valid URL if provided |
| REDIS_URL | Starts with `redis://` or `rediss://` |

---

## Post-Setup

After CLI completes, the user has:
1. Branded project (name, description, domain)
2. `.env` with all necessary vars (real or placeholder)
3. Database connected + migrated
4. Optional Docker services running
5. `.setup-state.json` for future re-runs

Next step: `bun dev` → working app at localhost:3000.
