FROM oven/bun:1.3.9 AS base
WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (including dev) for building
FROM base AS deps
COPY package.json ./
RUN bun install

# Build the application
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy env vars for prerender — the server handler validates these at import
# time but prerender only generates static HTML shells, no real connections.
# Real values are injected at runtime via docker run --env-file .env
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=build-secret-placeholder-minimum-32chars! \
    RESEND_API_KEY=re_build_placeholder \
    S3_ACCESS_KEY_ID=build-placeholder \
    S3_SECRET_ACCESS_KEY=build-placeholder \
    S3_BUCKET=build-placeholder
RUN bun run bun:build

# Install only production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json ./
RUN bun install --production

# Final runtime image
FROM base AS runner
WORKDIR /app
USER bun
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend.ts ./backend.ts
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
ENTRYPOINT ["bun", "run", "backend.ts"]