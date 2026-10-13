FROM node:24-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
ENV NITRO_PRESET=node-server
RUN pnpm build

# Package the independently maintained workspace frontends into the same
# public delivery image for path-based hosting on a single domain.
FROM node:24-alpine AS admin-build
WORKDIR /workspace/admin
# The workspace build needs TypeScript/Vite devDependencies. Keep production
# mode for the final runtime image only.
ENV NODE_ENV=development
COPY apps/admin/package*.json ./
RUN npm ci --include=dev --ignore-scripts --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000 --fetch-timeout=600000 || \
    npm install --include=dev --ignore-scripts --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000 --fetch-timeout=600000
COPY apps/admin/ ./
RUN npm run build

FROM node:24-alpine AS portal-build
WORKDIR /workspace/portal
ENV NODE_ENV=development
# Portal has identical dependencies to admin; reuse node_modules to avoid duplicate downloads and network timeouts
COPY --from=admin-build /workspace/admin/node_modules ./node_modules
COPY apps/portal/package*.json ./
COPY apps/portal/ ./
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
# Nitro serves these immutable static bundles from the same origin while the
# workspaces remain independently developed and independently buildable.
COPY --from=admin-build /workspace/admin/dist /app/.output/public/admin
COPY --from=portal-build /workspace/portal/dist /app/.output/public/portal
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node",".output/server/index.mjs"]
