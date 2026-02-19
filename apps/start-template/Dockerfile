FROM oven/bun:1 AS base
WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (including dev) for building
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the application
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run bun:build

# Install only production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

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