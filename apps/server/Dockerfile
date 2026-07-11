# Build context is the repo root (workspace packages are needed at runtime).
# Build:  docker build -f apps/server/Dockerfile -t hangouthub-server .
FROM oven/bun:1.3.11

WORKDIR /app

# Manifests first for better layer caching.
COPY package.json bun.lock turbo.json tsconfig.json bts.jsonc ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages ./packages
COPY apps ./apps

RUN bun install --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 3000

# Bun runs the TypeScript entry directly and resolves the workspace packages.
CMD ["bun", "run", "apps/server/src/index.ts"]
