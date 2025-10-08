# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Development dependencies stage
FROM base AS deps-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Change ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]

# Development stage
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development

# Install all dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema first
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
