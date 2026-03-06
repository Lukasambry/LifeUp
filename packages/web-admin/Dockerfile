FROM node:22-alpine AS builder

WORKDIR /workspace

COPY package*.json turbo.json ./
COPY packages/web-admin/package*.json ./packages/web-admin/

RUN npm ci --ignore-scripts

COPY packages/web-admin ./packages/web-admin


ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL

RUN npm run build -w packages/web-admin

FROM node:22-alpine AS runner

RUN apk upgrade --no-cache

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder --chown=node:node /workspace/packages/web-admin/.next/standalone ./
COPY --from=builder --chown=node:node /workspace/packages/web-admin/.next/static \
     ./packages/web-admin/.next/static
COPY --from=builder --chown=node:node /workspace/packages/web-admin/public \
     ./packages/web-admin/public

USER node

EXPOSE 3001

CMD ["node", "packages/web-admin/server.js"]
