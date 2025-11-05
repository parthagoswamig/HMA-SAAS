# syntax=docker/dockerfile:1

# Install dependencies in a clean layer
FROM node:18-alpine AS deps
WORKDIR /app

# Copy root manifests to leverage npm workspaces
COPY package.json package-lock.json ./
# Copy workspace manifest so npm can resolve the web workspace
COPY apps/web/package.json ./apps/web/package.json

# Install all workspaces dependencies (prefer clean, reproducible installs)
RUN npm ci

# Build the web app
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Bring in node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules
# Copy the full monorepo (needed for Next build if it imports from shared code)
COPY . .

# Build the web workspace
RUN npm --workspace web run build

# Run the built app
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built output and runtime deps
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
# Start the web workspace; Next honors PORT env var or -p from package script
CMD ["npm", "--workspace", "web", "run", "start"]
