# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase (server, client, utilities)
- JavaScript (ESNext/ES2022) - Runtime target via Vite

**Secondary:**
- CSS/PostCSS 8.5.6 - Styling with Tailwind integration
- SQL - PostgreSQL via Drizzle ORM

## Runtime

**Environment:**
- Bun 1.x (primary) - Lightning-fast JavaScript runtime
- Node.js compatible (fallback support)

**Package Manager:**
- Bun - Native package manager and runtime
- Lockfile: `bun.lock` (present)

## Frameworks

**Core UI:**
- React 19.2.4 - UI components and component framework
- TanStack Start 1.159.5 - Full-stack React metaframework
- TanStack React Router 1.159.5 - Client-side routing and code splitting
- TanStack React Query 5.90.20 - Server state management
- React Hook Form 7.71.1 - Form state management
- React DOM 19.2.4 - React rendering

**Backend/RPC:**
- ORPC 1.13.4 - End-to-end type-safe RPC framework
  - @orpc/server 1.13.4 - RPC server
  - @orpc/client 1.13.4 - RPC client
  - @orpc/react 1.13.4 - React integration
  - @orpc/tanstack-query 1.13.4 - TanStack Query integration
- Elysia 1.4.24 - Lightweight Bun web framework
- Nitro 3.0.1-alpha.2 - Server engine for SSR and serverless

**UI Component Libraries:**
- Radix UI 1.4.3 - Headless UI primitives
- Base UI 1.1.0 - Unstyled React components
- Lucide React 0.563.0 - Icon library
- Recharts 3.7.0 - React charting library
- Embla Carousel React 8.6.0 - Carousel/slider component
- React DayPicker 9.13.2 - Date picker component
- React Syntax Highlighter 16.1.0 - Code highlighting

**Styling & Layout:**
- TailwindCSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for Tailwind
- @tailwindcss/postcss 4.1.18 - PostCSS plugin for Tailwind
- PostCSS 8.5.6 - CSS transformation tool
- Class Variance Authority 0.7.1 - Type-safe variant patterns
- clsx 2.1.1 - Class name utility
- tailwind-merge 3.4.0 - Tailwind class merging

**Animation & Motion:**
- Framer Motion 12.34.0 - Production-ready animation library
- Motion 12.34.0 - Modern animation primitives

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Accessible drag-and-drop
- @dnd-kit/sortable 10.0.0 - Sortable component
- @dnd-kit/modifiers 9.0.0 - Drag modifiers
- @dnd-kit/utilities 3.2.2 - Utility functions

**Internationalization (i18n):**
- i18next 25.8.4 - i18n framework
- react-i18next 16.5.4 - React binding for i18next
- i18next-browser-languagedetector 8.2.0 - Browser language detection
- i18next-resources-to-backend 1.2.1 - Async resources loading

**Authentication:**
- Better Auth 1.4.18 - Authentication framework
  - @better-auth/passkey 1.4.18 - Passkey/WebAuthn support
  - @better-auth/stripe 1.4.18 - Stripe integration plugin
- Drizzle Adapter - ORM integration for Better Auth

**Data Fetching & AI:**
- AI SDK 6.0.79 - Unified AI provider library
- @ai-sdk/openai 3.0.26 - OpenAI provider
- @tanstack/ai 0.4.2 - TanStack AI integration
- @tanstack/ai-react 0.5.2 - React AI hooks
- @tanstack/ai-openai 0.4.0 - OpenAI provider
- @tanstack/ai-anthropic 0.4.2 - Anthropic provider
- @tanstack/ai-gemini 0.4.1 - Google Gemini provider

**Database & ORM:**
- PostgreSQL - Primary database (via Drizzle)
- Drizzle ORM 0.45.1 - Type-safe SQL query builder
- Drizzle Kit 0.31.9 - Schema migrations
- @tanstack/db 0.5.25 - TanStack DB utilities
- @tanstack/react-db 0.1.69 - React DB hooks
- Drizzle Zod 0.8.3 - Zod schema generation from Drizzle
- pg 8.18.0 - PostgreSQL client

**File Storage:**
- S3Client (Bun native) - S3-compatible file storage
- Support for multiple providers: S3, Cloudflare R2, SeaweedFS, DigitalOcean Spaces, Google Cloud Storage, Supabase Storage

**Validation & Serialization:**
- Zod 4.3.6 - TypeScript-first schema validation
- @orpc/zod 1.13.4 - Zod integration for ORPC
- @orpc/json-schema 1.13.4 - JSON Schema generation
- @t3-oss/env-core 0.13.10 - Environment variable validation

**Payments & Billing:**
- Stripe 20.3.1 - Payment processing
- @stripe/react-stripe-js - React Stripe integration

**Email:**
- Resend 6.9.2 - Transactional email service
- @react-email/components 1.0.7 - React email components
- @react-email/render 2.0.4 - Email rendering
- React Email 5.2.8 - Email development

**State Management & Utilities:**
- Jotai 2.17.1 - Primitive and flexible state management
- @vercel/analytics 1.6.1 - Analytics integration
- Sonner 2.0.7 - Toast notifications

**Caching & Real-time:**
- @upstash/redis 1.36.2 - Serverless Redis client
- @upstash/ratelimit 2.0.8 - Rate limiting service

**Other Utilities:**
- UUID 13.0.0 - UUID generation
- CUID2 3.3.0 - Collision-resistant IDs
- Nanoid 5.1.6 - Tiny, secure, URL-friendly unique string ID
- Date-fns 4.1.0 - Date utility library
- JSON Render (@json-render) 0.5.2 - Dynamic JSON to React rendering
- Shiki 3.22.0 - Syntax highlighter
- React Dropzone 15.0.0 - File drop zone component
- React QR Code 2.0.18 - QR code generation
- React Resizable Panels 4.6.2 - Resizable panel layouts
- Vaul 1.1.2 - Drawer component
- cmdk 1.1.1 - Command/CMD palette
- Input OTP 1.4.2 - OTP input component
- Use Stick to Bottom 1.1.3 - Sticky scroll behavior
- UA Parser 2.0.9 - User agent parsing
- MCP Handler 1.0.7 - Model Context Protocol handler
- @vercel/mcp-adapter 1.0.0 - Vercel MCP adapter
- Streamdown 2.2.0 - Stream utilities
- Resumable Stream 2.2.10 - Resumable streaming
- Tokenlens 1.3.1 - Token counting
- XY Flow 12.10.0 - Node-based UI library

## Testing & Development

**Testing Framework:**
- Vitest 4.0.18 - Unit and integration testing
- JSDOM 28.0.0 - DOM implementation for tests
- @vitest/ui 4.0.18 - Test UI dashboard
- @vitest/coverage-v8 4.0.18 - Code coverage (V8 provider)
- @testing-library/react 16.3.2 - React component testing
- @testing-library/jest-dom 6.9.1 - Extended matchers
- @testing-library/user-event 14.6.1 - User event simulation

**Build & Dev Tools:**
- Vite 8.0.0-beta.13 - Next-generation frontend tooling
- @vitejs/plugin-react 5.1.4 - Fast Refresh and SWC compilation
- vite-plugin-db 0.6.1 - Vite plugin for database integration
- @vitejs/devtools 0.0.0-alpha.31 - Vite DevTools
- Rollup plugins:
  - @rollup/plugin-babel 6.1.0 - Babel compiler
  - @rollup/plugin-commonjs 29.0.0 - CommonJS module support
  - @rollup/plugin-terser 0.4.4 - Minification
  - rollup-plugin-postcss 4.0.2 - PostCSS processing
  - rollup-plugin-polyfill-node 0.13.0 - Node polyfills

**Linting & Formatting:**
- Biome 2.3.14 - All-in-one formatter and linter (Rust-based)
  - @biomejs/biome 2.3.14 - Core package
- Ultracite 7.1.5 - Zero-config Biome preset
- Oxlint 1.46.0 - JavaScript/TypeScript linter
- Oxfmt 0.31.0 - Formatter
- TypeScript 5.9.3 - Type checking
  - @types/node 25.2.3 - Node types
  - @types/react 19.2.13 - React types
  - @types/react-dom 19.2.3 - React DOM types
  - @types/bun 1.3.9 - Bun runtime types
  - @types/pg 8.16.0 - PostgreSQL types
  - @types/react-syntax-highlighter 15.5.13 - Syntax highlighter types

**Code Compilation:**
- babel-plugin-react-compiler 1.0.0 - React compiler plugin for optimization

**DevTools & Debugging:**
- @tanstack/react-devtools 0.9.5 - TanStack DevTools
- @tanstack/react-query-devtools 5.91.3 - React Query DevTools
- @tanstack/react-router-devtools 1.159.5 - React Router DevTools
- @tanstack/react-ai-devtools 0.2.6 - AI/Chat DevTools

**Other Dev Tools:**
- Husky 9.1.7 - Git hooks
- tsx 4.21.0 - TypeScript executor for Node.js
- Dotenv CLI 11.0.0 - Environment variable loading
- Glob 13.0.2 - File globbing
- Picocolors 1.1.1 - Colored terminal output

## Configuration

**Environment:**
- `.env` file required for server configuration
- `.env.example` provided as template
- Validation via @t3-oss/env-core with Zod
- Environment variables loaded automatically in development

**Key Configuration Files:**
- `tsconfig.json` - TypeScript compiler options (strict mode, ES2022 target)
- `vite.config.ts` - Vite bundler and dev server config
- `vite.bun.config.ts` - Bun-specific Vite configuration
- `drizzle.config.ts` - Drizzle ORM schema and migration config
- `vitest.config.ts` - Test runner configuration
- `biome.jsonc` - Biome linter/formatter config (extends ultracite presets)
- `tailwind.config.mjs` - TailwindCSS configuration
- `postcss.config.ts` - PostCSS configuration
- `.oxlintrc.json` - Oxlint configuration
- `.oxfmtrc.jsonc` - Oxfmt configuration

**Build Outputs:**
- Client: `.output/client/` or `dist/client/`
- Server: `.output/server/` or `dist/server/`

## Platform Requirements

**Development:**
- Bun 1.x (recommended) - Faster than Node.js for this project
- Node.js 20+ (fallback, not optimal)
- PostgreSQL 12+ - Database server
- Docker (optional) - For containerized deployment

**Production:**
- Bun 1.x runtime (primary)
- Node.js 18+ (fallback)
- PostgreSQL database
- S3-compatible object storage (AWS S3, Cloudflare R2, SeaweedFS, etc.)
- Redis (optional, for resumable chat streams)
- Vercel (supported deployment via Nitro)

**Databases:**
- PostgreSQL - Primary relational database
- Row-level security (RLS) - Implemented via Drizzle
- Vector extensions - Optional (for embeddings)

---

*Stack analysis: 2026-02-11*
