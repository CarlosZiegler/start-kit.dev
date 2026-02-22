---
name: start-kit-dev-best-practices
description: Use when adding features, routes, components, API endpoints, database schemas, or modifying any part of the start-kit.dev SaaS starter. Covers project-specific architecture, conventions, and patterns for oRPC, Better-Auth, Drizzle RLS, shadcn/ui, Stripe, and feature modules.
---

# start-kit.dev Best Practices

Comprehensive guide for developing within the start-kit.dev full-stack TypeScript SaaS starter. Covers project-specific architecture, patterns, and conventions across all layers.

## When to Apply

- Adding new features or feature modules
- Creating new oRPC procedures or routes
- Adding UI components or forms
- Modifying database schemas or RLS policies
- Working with authentication, permissions, or RBAC
- Integrating Stripe payments, S3 storage, or email
- Writing tests
- Adding i18n translations

## Rule Categories by Priority

| Priority | Category | Rules | Impact |
|----------|----------|-------|--------|
| CRITICAL | Architecture | 4 rules | oRPC procedures, middleware, feature modules, file organization |
| CRITICAL | Database | 3 rules | Drizzle schemas, RLS policies, migrations |
| CRITICAL | Authentication | 3 rules | Better-Auth config, route protection, RBAC |
| HIGH | UI & Components | 3 rules | shadcn/ui patterns, forms, data grid |
| HIGH | API & Data Fetching | 2 rules | oRPC endpoints, React Query patterns |
| MEDIUM | Integrations | 2 rules | Stripe payments, S3 storage |
| MEDIUM | Testing & i18n | 2 rules | Vitest patterns, i18next conventions |

## Quick Reference

### Architecture (Prefix: `arch-`)

- `arch-orpc-procedures` — oRPC procedure chain: public, protected, protectedRls
- `arch-middleware-chain` — Middleware ordering, timing, auth, RLS context
- `arch-feature-modules` — Feature module structure with co-located logic
- `arch-file-organization` — Naming conventions, path aliases, import ordering

### Database (Prefix: `db-`)

- `db-schema-patterns` — Drizzle schema conventions and drizzle-zod integration
- `db-rls-policies` — Row-level security with withRls() and PostgreSQL policies
- `db-migrations` — Migration workflow with drizzle-kit

### Authentication (Prefix: `auth-`)

- `auth-better-auth` — Better-Auth server config, plugins, session queries
- `auth-route-protection` — beforeLoad + loader pattern for protected routes
- `auth-rbac` — RBAC roles, permissions, and can* helper functions

### UI & Components (Prefix: `ui-`)

- `ui-component-patterns` — shadcn/ui with data-slot, CVA, cn(), Base UI primitives
- `ui-forms` — React Hook Form + Zod + Controller + Field components
- `ui-data-grid` — DataGridEnhanced with server-side pagination

### API & Data Fetching (Prefix: `api-`)

- `api-adding-endpoints` — How to add new oRPC routes end-to-end
- `api-query-patterns` — React Query with oRPC queryOptions and mutations

### Integrations (Prefix: `int-`)

- `int-payments-stripe` — Stripe plans, webhooks, Better-Auth Stripe plugin
- `int-storage-s3` — S3-compatible storage with Bun S3Client

### Testing & i18n (Prefix: `test-` / `i18n-`)

- `test-patterns` — Vitest conventions, mocking, co-located tests
- `i18n-patterns` — i18next key conventions and SSR language detection

## How to Use

Each rule file in the `rules/` directory contains:
1. **Explanation** — Why this pattern matters in this project
2. **Bad Example** — Anti-pattern to avoid
3. **Good Example** — Pattern used in the actual codebase
4. **Context** — When to apply or skip this rule

## Relationship to TanStack Skills

This skill covers **project-specific patterns**. For generic TanStack ecosystem guidance, use:
- `tanstack-query-best-practices` — Query keys, caching, mutations
- `tanstack-router-best-practices` — Type-safe routing, loaders, search params
- `tanstack-start-best-practices` — Server functions, SSR, middleware
- `tanstack-integration-best-practices` — Query + Router + Start integration

## Full Reference

See individual rule files in `rules/` directory for detailed guidance and code examples.
