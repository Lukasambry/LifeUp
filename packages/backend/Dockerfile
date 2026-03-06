FROM node:22-alpine AS builder

WORKDIR /workspace

COPY package*.json turbo.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm ci --ignore-scripts

COPY packages/backend ./packages/backend

RUN cd packages/backend && npx prisma generate
RUN npm run build -w packages/backend

FROM node:22-alpine AS runner

WORKDIR /workspace

ENV NODE_ENV=production

RUN apk upgrade --no-cache

COPY package*.json turbo.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma


RUN npm ci --omit=dev --ignore-scripts && \
    cd packages/backend && npx prisma generate && \
    chown -R node:node /workspace

COPY --from=builder --chown=node:node /workspace/packages/backend/dist \
     ./packages/backend/dist

USER node

WORKDIR /workspace/packages/backend

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
