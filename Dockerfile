FROM oven/bun:1.4-alpine AS base
WORKDIR /app

# Install dependencies (cached layer)
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Runtime image
FROM base AS runtime
LABEL org.opencontainers.image.title="flock" \
      org.opencontainers.image.description="Self-hosted dashboard for running a flock of Telegram bots" \
      org.opencontainers.image.source="https://github.com/andikadevs/flock" \
      org.opencontainers.image.authors="Andika Dwi Saputra <hello@andikadevs.space>" \
      org.opencontainers.image.licenses="MIT"
ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/flock.sqlite
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json bunfig.toml ./
COPY src ./src

# The SQLite database lives on a volume, owned by the unprivileged `bun` user.
RUN mkdir -p /app/data && chown bun:bun /app/data
VOLUME /app/data
USER bun

EXPOSE 3000
# The sign-in options endpoint is public, so it doubles as a health check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null "http://127.0.0.1:${PORT:-3000}/api/session/options" || exit 1
CMD ["bun", "src/index.ts"]
