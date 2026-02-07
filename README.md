# LifeUp

Plateforme de gamification de la vie quotidienne. Complétez des tâches réelles, gagnez de l'XP, montez de niveau et débloquez votre classe de personnage RPG.

## Stack technique

| Service | Technologie |
|---------|-------------|
| Backend | NestJS (TypeScript) |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Mobile | React Native + Expo |
| Web Admin | Next.js |
| Monorepo | npm workspaces + Turborepo |

## Prérequis

- **Node.js** >= 20
- **npm** >= 10
- **Docker** et **Docker Compose**

## Installation

```bash
# Cloner le repo
git clone https://github.com/Lukasambry/LifeUp.git
cd LifeUp

# Installer les dépendances
npm install

# Lancer PostgreSQL et Redis
docker compose up -d

# Configurer le backend
cp packages/backend/.env.example packages/backend/.env
```

Mettre à jour `packages/backend/.env` avec les valeurs locales :

```
DATABASE_URL="postgresql://lifeup:lifeup_password@localhost:5435/lifeup_db?schema=public"
REDIS_URL="redis://localhost:6380"
```

```bash
# Appliquer les migrations et le seed
npx prisma migrate dev --schema packages/backend/prisma/schema.prisma
npx prisma db seed --schema packages/backend/prisma/schema.prisma
```

## Commandes

### Développement

```bash
# Lancer le backend en mode watch
npm run start:dev -w packages/backend

# Lancer l'app mobile (Expo)
npm run start -w packages/mobile

# Lancer le web admin
npm run dev -w packages/web-admin
```

### Turborepo (tous les packages)

```bash
npm run build    # Build tous les packages
npm run lint     # Lint tous les packages
npm run test     # Tests tous les packages
```

### Backend uniquement

```bash
npm run test -w packages/backend          # Tests unitaires
npm run test:cov -w packages/backend      # Tests avec couverture
npm run test:e2e -w packages/backend      # Tests E2E
```

### Prisma

```bash
# Générer le client Prisma
npx prisma generate --schema packages/backend/prisma/schema.prisma

# Créer une migration
npx prisma migrate dev --name nom_migration --schema packages/backend/prisma/schema.prisma

# Ouvrir Prisma Studio
npx prisma studio --schema packages/backend/prisma/schema.prisma
```

## Structure du projet

```
LifeUp/
├── packages/
│   ├── backend/       # API NestJS + Prisma
│   ├── mobile/        # App React Native (Expo)
│   ├── web-admin/     # Dashboard admin (Next.js)
│   └── shared/        # Types et constantes partagés
├── docker-compose.yaml
├── turbo.json
└── package.json
```

## Git hooks

Un pre-commit hook (Husky + lint-staged) lint automatiquement les fichiers stagés avant chaque commit.

## Licence

Projet universitaire ESGI 5IW1 — 2026.
