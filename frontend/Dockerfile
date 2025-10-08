# Multi-stage build for Next.js
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Development stage
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
