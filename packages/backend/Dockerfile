# ─── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /workspace

COPY package*.json turbo.json ./
COPY packages/backend/package*.json ./packages/backend/

# --ignore-scripts évite d'exécuter husky (devDep) via le script "prepare" du workspace
RUN npm ci --ignore-scripts

COPY packages/backend ./packages/backend

RUN cd packages/backend && npx prisma generate
RUN npm run build -w packages/backend

# ─── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /workspace

ENV NODE_ENV=production

# Patcher tous les packages Alpine pour éliminer les CVEs connus avant de copier le code
RUN apk upgrade --no-cache

COPY package*.json turbo.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma

# Installer les deps de prod + régénérer le client Prisma, puis passer la propriété
# au user "node" (uid 1000, intégré à l'image) avant de changer d'utilisateur.
RUN npm ci --omit=dev --ignore-scripts && \
    cd packages/backend && npx prisma generate && \
    chown -R node:node /workspace

COPY --from=builder --chown=node:node /workspace/packages/backend/dist \
     ./packages/backend/dist

USER node

WORKDIR /workspace/packages/backend

EXPOSE 3000

# Appliquer les migrations en attente puis démarrer
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
