# Codebase Concerns

**Analysis Date:** 2026-02-21

## Tech Debt

**Email Template Implementation:**
- Issue: Verify email template uses plain React Email components instead of proper template structure
- Files: `apps/start-template/src/components/emails/verify-email.tsx`
- Impact: Email formatting is minimal; lacks proper branding, styling consistency, and may not render well across email clients
- Fix approach: Replace plain `<Text>` and `<Button>` with structured email components using React Email's layout system, add proper styling with inline CSS, test across major email clients

**Pagination Backend Mismatch:**
- Issue: Frontend counts invitations client-side without backend returning total count, causing pagination inconsistency
- Files: `apps/start-template/src/routes/(dashboard)/organizations/invitations/index.tsx` (line 71)
- Impact: Pagination logic relies on array length instead of server-returned total; will break when backend implements server-side pagination or filtering
- Fix approach: Update backend oRPC endpoint to return `{ data: Invitation[], total: number }` structure, update frontend to use `total` from response

**Schema Validation Gaps:**
- Issue: Chat route accepts `z.any()` for messages validation instead of properly typed schema
- Files: `apps/start-template/src/orpc/routes/chat.ts` (line 30)
- Impact: No runtime validation of message structure; can store malformed data; unclear what fields are required
- Fix approach: Create strict Zod schema for message objects with proper typing for all message variants (text, code, etc.)

**Unsafe HTML Rendering:**
- Issue: Dynamic CSS generation using `dangerouslySetInnerHTML` in chart and schema display components
- Files:
  - `apps/start-template/src/components/ui/chart.tsx` (line 83)
  - `apps/start-template/src/components/ai-elements/schema-display.tsx`
- Impact: Potential XSS vulnerability if config keys or paths aren't sanitized; CSS injection possible
- Fix approach: Use CSS-in-JS (Tailwind classes or styled components) instead of dynamic string generation; if inline styles are required, sanitize input values

## Known Bugs

**Invitations Total Count:**
- Symptoms: Pagination indicator shows wrong total count on organizations invitations page
- Files: `apps/start-template/src/routes/(dashboard)/organizations/invitations/index.tsx`
- Trigger: Visit `/organizations/invitations/` with multiple pending invitations
- Workaround: None - pagination will show incorrect count but items display correctly

## Security Considerations

**Optional AI API Keys:**
- Risk: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` marked as optional in environment validation but used without fallback
- Files: `apps/start-template/src/lib/env.server.ts`
- Current mitigation: Runtime validation via Zod
- Recommendations:
  - Document which API keys are required vs. optional
  - Add runtime checks in chat route before attempting to use unprovided APIs
  - Return clear error messages if user selects a model without corresponding API key configured

**Email OTP Delivery:**
- Risk: Email-based authentication relies on Resend service; no fallback mechanism
- Files: `apps/start-template/src/lib/auth/auth.ts`, `apps/start-template/src/lib/resend.ts`
- Current mitigation: Environment variable validation
- Recommendations:
  - Add retry logic with exponential backoff for failed email sends
  - Log failed OTP sends for debugging
  - Consider fallback SMS delivery or alternative channels

**Stripe Configuration Errors:**
- Risk: Stripe plugin throws on missing configuration but doesn't validate webhook signature properly
- Files: `apps/start-template/src/lib/auth/auth.ts` (lines 64-67)
- Current mitigation: Error thrown at initialization
- Recommendations:
  - Validate webhook signature in all stripe event handlers
  - Add idempotency checks for webhook handlers (duplicate deliveries)
  - Implement webhook event logging for audit trail

## Performance Bottlenecks

**Large Prompt Input Component:**
- Problem: `prompt-input.tsx` is 1337 lines, likely containing multiple concerns
- Files: `apps/start-template/src/components/ai-elements/prompt-input.tsx`
- Cause: Monolithic component handling file attachments, command autocomplete, clipboard events, and multiple UI states in single file
- Improvement path:
  - Extract attachment handling into separate hook (`usePromptAttachments`)
  - Extract command logic into separate component (`PromptCommand`)
  - Extract textarea logic into separate component or hook
  - Consider extracting keyboard handlers into custom hook

**Complex Chat Route:**
- Problem: Chat index route is 457 lines managing message streaming, model selection, web search toggle, and multiple UI rendering branches
- Files: `apps/start-template/src/routes/(dashboard)/chat/index.tsx`
- Cause: Business logic mixed with UI rendering; conditional rendering for multiple message part types
- Improvement path:
  - Extract message rendering into separate component file
  - Extract model selector logic into custom hook
  - Use `<Suspense>` boundaries for lazy message parts
  - Consider extracting search UI into separate component

**Data Grid Enhanced Component:**
- Problem: `data-grid-enhanced.tsx` is 749 lines with inline type definitions and complex DOM tree
- Files: `apps/start-template/src/components/ui/data-grid-enhanced.tsx`
- Cause: Wrapper around React Table with custom styling and layout
- Improvement path:
  - Extract column header rendering logic
  - Extract pagination control into separate component
  - Extract toolbar into separate component
  - Consider using composition pattern instead of single monolithic component

**Sidebar Component Complexity:**
- Problem: `sidebar.tsx` is 725 lines with many nested conditionals
- Files: `apps/start-template/src/components/ui/sidebar.tsx`
- Cause: Base UI primitive with full feature set including collision detection, responsive behavior
- Improvement path: Acceptable as base UI component - monitor if it grows further; consider extracting sidebar menu logic into separate component

## Fragile Areas

**RLS (Row-Level Security) Policies:**
- Files: `apps/start-template/src/lib/db/rls.test.ts`
- Why fragile: PostgreSQL RLS policies must be kept in sync with application authorization logic; manual SQL configuration prone to inconsistency
- Safe modification:
  - Always update both schema policy AND test cases
  - Test with non-superuser connection to verify policies work
  - Run full RLS test suite before deployment
- Test coverage: RLS policies have dedicated test file; good coverage for auth, organization, and storage tables

**Better-Auth Plugin Chain:**
- Files: `apps/start-template/src/lib/auth/auth.ts`
- Why fragile: Multiple plugins (stripe, passkey, organization, 2FA, magic link) with interdependencies; plugin order matters
- Safe modification:
  - Document plugin dependencies and initialization order
  - Test authentication flows after any plugin changes
  - Verify Stripe webhook events still fire correctly after updates
- Test coverage: Auth has permission tests but not full auth flow tests

**oRPC Middleware Chain:**
- Files: `apps/start-template/src/orpc/orpc-server.ts`
- Why fragile: `publicProcedure → protectedProcedure → protectedRlsProcedure` chain; middleware order critical for security
- Safe modification:
  - Never reorder middleware without testing authorization
  - Verify RLS context is set before data queries
  - Test with both authenticated and unauthenticated requests
- Test coverage: Permission and RLS tests exist; missing integration tests for oRPC routes

**Chat State Management:**
- Files: `apps/start-template/src/routes/(dashboard)/chat/index.tsx`
- Why fragile: Uses `useChat()` from AI SDK with manual state management for selectedModel, useWebSearch, attachments
- Safe modification:
  - Document state synchronization between useChat and local state
  - Test message persistence when switching models
  - Verify attachments are preserved during streaming
- Test coverage: No tests for chat functionality; high risk area for regressions

## Scaling Limits

**Database Invitations Pagination:**
- Current capacity: All invitations loaded into memory client-side
- Limit: Will degrade when users have >1000 invitations (memory, rendering slowdown)
- Scaling path:
  - Implement server-side pagination in `userInvitationsOptions()` query
  - Return `{ data: Invitation[], total: number }` from backend
  - Update frontend to use pagination state
  - Add indices on `invitations.userId, invitations.status` for query optimization

**AI Chat History Storage:**
- Current capacity: All messages stored as JSON array in single `chat.messages` column
- Limit: Large conversations (>10k messages) will cause slow queries and memory issues
- Scaling path:
  - Create separate `chat_messages` table with indexed `chatId` FK
  - Migrate existing data from JSON array to normalized table
  - Implement pagination/cursor-based loading for messages
  - Add archival strategy for old conversations

**Sidebar Route Generation:**
- Current capacity: RouteTree generated at build time; static at runtime
- Limit: Dynamic route creation not supported; new routes require rebuild
- Scaling path: If dynamic routing needed, consider route configuration file instead of code generation

## Dependencies at Risk

**Nitro (Pre-Release Version):**
- Risk: `nitro@3.0.1-alpha.2` is alpha version; breaking changes possible in minor updates
- Impact: Production deployments may break on dependency updates
- Migration plan:
  - Pin to specific alpha version; don't use `^` or `~`
  - Monitor Nitro releases for stable v3.0.0
  - Test thoroughly before upgrading
  - Consider alternative: Elysia is already used for server runtime

**Vite Overrides:**
- Risk: `package.json` overrides `vite` to `8.0.0-beta.15` which is pre-release
- Impact: Build tool instability; potential breaking changes
- Migration plan:
  - Upgrade to stable Vite 8.0.0 when available
  - Test build output thoroughly
  - Remove override from package.json

**React 19 (New):**
- Risk: React 19.2.4 is recent; ecosystem integration may lag
- Impact: Third-party libraries may not be fully compatible; refs as props is new paradigm
- Migration plan:
  - Audit dependencies for React 19 compatibility
  - Test form libraries, UI components thoroughly
  - Monitor third-party library releases for React 19 support

**oRPC (Actively Developed):**
- Risk: oRPC 1.13.5 is rapidly evolving; API surface may change
- Impact: Major version updates could require refactoring
- Migration plan:
  - Pin to specific version; don't use `^`
  - Read CHANGELOG before updating
  - Run full integration test suite after updates

## Missing Critical Features

**Offline Support:**
- Problem: No service worker or offline capability for chat functionality
- Blocks: Chat messages lost if network disconnects; no draft preservation
- Priority: Medium - affects usability but not core feature

**Audit Logging:**
- Problem: No audit trail for sensitive operations (organization changes, permission updates, Stripe events)
- Blocks: Compliance audits, security incident investigation
- Priority: High - required for production deployment with sensitive data

**Rate Limiting:**
- Problem: Upstash Redis imported but not integrated into oRPC routes
- Blocks: API abuse protection; chat spam prevention
- Priority: High - production security requirement

**Data Export:**
- Problem: No way for users to export their data (GDPR requirement)
- Blocks: GDPR/regulatory compliance
- Priority: Critical - legal requirement for EU users

**Conversation Search:**
- Problem: Chat history not searchable; all messages must be loaded
- Blocks: Finding past conversations at scale
- Priority: Medium - usability for power users

## Test Coverage Gaps

**UI Components:**
- What's not tested: All AI elements (Message, CodeBlock, StackTrace, etc.), data grid components, form components
- Files: `apps/start-template/src/components/ai-elements/*`, `apps/start-template/src/components/ui/*`
- Risk: Visual regressions, accessibility issues, event handler bugs go undetected
- Priority: High - 57+ UI components with no tests

**Features Module:**
- What's not tested: Organizations CRUD, invitations flow, settings updates, subscription management
- Files: `apps/start-template/src/features/organizations/*`, `apps/start-template/src/features/settings/*`, `apps/start-template/src/features/payment/*`
- Risk: Business logic bugs in user-facing features
- Priority: High - core app functionality

**oRPC Endpoints:**
- What's not tested: Chat save/read/list, storage operations, dashboard queries
- Files: `apps/start-template/src/orpc/routes/chat.ts`, `apps/start-template/src/orpc/routes/storage.ts`, `apps/start-template/src/orpc/routes/dashboard.ts`
- Risk: Data corruption, authorization bypasses, null reference errors in server code
- Priority: High - backend data operations

**Email System:**
- What's not tested: Email templates render correctly, SMTP delivery, OTP generation
- Files: `apps/start-template/src/components/emails/*`, `apps/start-template/src/lib/auth/email-helpers.ts`
- Risk: Users don't receive emails, templating errors, broken verification links
- Priority: Medium - affects user experience but not core chat functionality

**Routes and Navigation:**
- What's not tested: Route guards, protected route access, redirect logic
- Files: `apps/start-template/src/routes/**/*`, `apps/start-template/src/router.tsx`
- Risk: Unauthorized access, incorrect redirects, broken deep links
- Priority: Medium - security and navigation critical

---

*Concerns audit: 2026-02-21*
