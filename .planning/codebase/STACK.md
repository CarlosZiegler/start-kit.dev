# Technology Stack

**Analysis Date:** 2026-02-21

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code, shared across apps and packages
- JavaScript/JSX - React components with TypeScript extension (.tsx)

**Secondary:**
- SQL - PostgreSQL database queries via Drizzle ORM
- CSS - Tailwind CSS v4 for styling

## Runtime

**Environment:**
- Bun 1.3.4 - Package manager and JavaScript runtime (monorepo uses Bun workspaces)
- Node.js >= 18 - Fallback runtime option

**Package Manager:**
- Bun 1.3.4 - Primary package manager for all development
- Lockfile: Implicit (Bun manages lock files internally)

## Frameworks

**Core Frontend:**
- React 19.2.4 - UI framework with functional components
- TanStack React Start 1.161.3 - Full-stack React framework with file-based routing
- TanStack React Router 1.161.3 - File-based routing system
- Vite 7.3.1 - Build tool and dev server

**Core Backend:**
- Elysia 1.4.25 - Bun-native HTTP server framework
- Nitro 3.0.1-alpha.2 - Universal server engine for serverless deployment

**API & RPC:**
- oRPC 1.13.5 - Type-safe RPC framework (full stack)
  - Includes: `@orpc/server`, `@orpc/client`, `@orpc/react`, `@orpc/zod`, `@orpc/tanstack-query`
- Better-Auth 1.4.18 - Authentication framework with plugins
  - Plugins: passkey, stripe, organization, admin, 2FA, email-OTP, last-login-method

**Data Management:**
- React Query 5.90.21 - Async state management (via `@tanstack/react-query`)
- Drizzle ORM 0.45.1 - Type-safe SQL ORM for PostgreSQL
- Drizzle-Zod 0.8.3 - Schema validation bridge between Drizzle and Zod

**AI Integration:**
- AI SDK 6.0.97 - Unified interface for AI models (`ai` package)
- `@ai-sdk/anthropic` 3.0.46 - Anthropic Claude models
- `@ai-sdk/openai` 3.0.30 - OpenAI GPT models
- `@ai-sdk/google` 3.0.30 - Google Gemini models
- `@ai-sdk/react` 3.0.99 - React hooks for AI SDK

**Testing:**
- Vitest 4.0.18 - Unit/integration test runner
- @vitest/ui 4.0.18 - Visual test UI
- @vitest/coverage-v8 4.0.18 - Code coverage reporting
- @testing-library/react 16.3.2 - Component testing utilities

**Build & Dev Tools:**
- Turbo 2.8.10 - Monorepo build orchestrator
- Tailwind CSS 4.2.0 - Utility-first CSS framework with vite plugin
- Biome 2.4.4 - Linter, formatter, and code quality tool
- PostCSS 8.5.6 - CSS transformation pipeline

**Forms & Validation:**
- React Hook Form 7.71.2 - Form state management
- @hookform/resolvers 5.2.2 - Validation framework integration
- Zod 4.3.6 - TypeScript-first schema validation

## Key Dependencies

**Critical:**
- `@tanstack/react-start` 1.161.3 - Full-stack framework, core abstraction layer
- `@tanstack/react-router` 1.161.3 - Routing system replacing Next.js
- `@tanstack/react-query` 5.90.21 - Server state sync, essential for data flow
- Drizzle ORM 0.45.1 - Database abstraction, type-safe SQL
- Better-Auth 1.4.18 - Authentication system with multi-plugin architecture
- AI SDK (all providers) - Multi-provider LLM abstraction

**UI Components:**
- @base-ui/react 1.2.0 - Unstyled accessible primitives (replaces shadcn base)
- radix-ui 1.4.3 - Accessible component primitives
- lucide-react 0.575.0 - Icon library (primary)
- @tabler/icons-react 3.37.1 - Secondary icon library
- @remixicon/react 4.9.0 - Tertiary icon library
- framer-motion 12.34.3 - Animation library
- motion 12.34.3 - Motion components library
- sonner 2.0.7 - Toast notification system
- cmdk 1.1.1 - Command palette/menu component
- embla-carousel-react 8.6.0 - Carousel component
- vaul 1.1.2 - Dialog/drawer primitives

**Data Visualization & Tables:**
- @tanstack/react-table 8.21.3 - Headless table library
- recharts 3.7.0 - React charting library
- @xyflow/react 12.10.1 - Node-based workflow diagram library

**Payment & Subscription:**
- stripe 20.3.1 - Stripe API client (JavaScript SDK)
- @better-auth/stripe 1.4.18 - Better-Auth Stripe integration plugin

**Email & Messaging:**
- resend 6.9.2 - Email API client
- @react-email/components 1.0.8 - React email template components
- @react-email/render 2.0.4 - Email template rendering

**File Storage:**
- S3Client via Bun (native) - S3-compatible object storage
- Supports: AWS S3, Cloudflare R2, Seaweedfs, DigitalOcean Spaces, Google Cloud Storage, Supabase Storage

**Internationalization (i18n):**
- i18next 25.8.13 - i18n framework
- react-i18next 16.5.4 - React bindings
- i18next-browser-languagedetector 8.2.1 - Language auto-detection
- i18next-resources-to-backend 1.2.1 - Backend resource loading

**State Management:**
- jotai 2.18.0 - Atomic state management (minimal alternative to Zustand)

**Utilities:**
- class-variance-authority 0.7.1 - CSS variant management
- clsx 2.1.1 - Conditional CSS class builder
- tailwind-merge 3.5.0 - Tailwind class conflict resolution
- date-fns 4.1.0 - Date manipulation
- nanoid 5.1.6 - Unique ID generation
- uuid 13.0.0 - UUID generation
- @paralleldrive/cuid2 3.3.0 - Collision-resistant IDs
- pino 10.3.1 - Structured JSON logger
- shiki 3.22.0 - Syntax highlighter
- streamdown 2.3.0 - Markdown streaming parser
- @streamdown/code 1.0.3 - Code block rendering
- @streamdown/math 1.0.2 - Math expression rendering
- @streamdown/mermaid 1.0.2 - Mermaid diagram rendering
- @streamdown/cjk 1.0.2 - CJK text handling
- @json-render/core 0.8.0 - JSON rendering core
- @json-render/react 0.8.0 - JSON rendering for React
- react-jsx-parser 2.4.1 - Dynamic JSX parsing

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Headless drag-and-drop library
- @dnd-kit/sortable 10.0.0 - Sortable preset
- @dnd-kit/modifiers 9.0.0 - Modifiers for movement constraints
- @dnd-kit/utilities 3.2.2 - Utility functions

**Authentication Extras:**
- @better-auth/passkey 1.4.18 - WebAuthn passkey plugin
- input-otp 1.4.2 - OTP input component

**Rate Limiting & Caching:**
- @upstash/ratelimit 2.0.8 - Serverless rate limiting
- @upstash/redis 1.36.2 - Redis client for Upstash

**Monitoring & Analytics:**
- @vercel/analytics 1.6.1 - Web vitals and analytics
- @vercel/mcp-adapter 0.3.2 - Model Context Protocol adapter

**Environment & Configuration:**
- @t3-oss/env-core 0.13.10 - Type-safe environment variable validation
- dotenv 17.3.1 - .env file loading
- dotenv-cli 11.0.0 - CLI for dotenv
- tsx 4.21.0 - TypeScript execution wrapper

**CLI & Scaffolding:**
- @clack/prompts 1.0.1 - Terminal prompt utilities
- giget 3.1.2 - Git repo template downloader
- picocolors 1.1.1 - Terminal color library

**Dev Quality:**
- Prettier 3.8.1 - Code formatter
- Husky 9.1.7 - Git hooks framework
- ultracite 7.2.3 - Linter and code quality tool
- Biome 2.4.4 - Linter/formatter (alternative to ESLint/Prettier)

## Configuration

**Environment:**
- `.env` file (not committed) - Server-side secrets and configuration
- `src/lib/env.server.ts` - Zod schema for environment validation with type safety
- Key variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `RESEND_API_KEY`, S3 credentials, `REDIS_URL`

**Build:**
- `vite.config.ts` at `apps/start-template/` - Vite build configuration
  - Uses TanStack Start plugin for SSR
  - Tailwind CSS via Vite plugin
  - PostgreSQL support via `vite-plugin-db`
  - Nitro for serverless
  - Reflect.getMetadata polyfill for passkey support
- `drizzle.config.ts` - Database migration configuration
- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*` → `./src/*`)
- `.npmrc` - npm registry configuration (exists but empty - Bun native)
- Turbo monorepo config in root `package.json`

**Linting & Formatting:**
- Biome 2.4.4 - Primary linter/formatter (via `ultracite` wrapper)
- Prettier 3.8.1 - Secondary formatter option
- ESLint - Not detected (Biome replaces it)

## Platform Requirements

**Development:**
- Bun >= 1.0.0 (primary)
- Node.js >= 18 (fallback)
- PostgreSQL database
- S3-compatible storage (local, AWS, Cloudflare, etc.)
- Stripe account (for payment features)
- Resend account (for email)
- API keys for AI providers (OpenAI, Anthropic, Google)

**Production:**
- Deployment target: Vercel (native support via Nitro + TanStack Start)
- PostgreSQL database (required)
- Object storage provider (S3, R2, Supabase, etc.)
- Email service (Resend)
- Payment processor (Stripe)
- Redis (optional, for rate limiting and resumable streams)

---

*Stack analysis: 2026-02-21*
