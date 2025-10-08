# LifeUp

A full-stack TypeScript application built with **Clean/Onion Architecture**, NestJS, Next.js 15, Tailwind CSS 4, and shadcn/ui.

## 🏗️ Architecture

### Backend (NestJS)
Strictly follows **Onion Architecture** with four isolated layers:

1. **Domain Layer** - Pure business logic, framework-agnostic
2. **Application Layer** - Use cases and application services
3. **Infrastructure Layer** - Database, external services, Prisma
4. **Presentation Layer** - REST API controllers

### Frontend (Next.js)
- Next.js 15 with App Router
- Tailwind CSS 4 with design system
- shadcn/ui component library
- Type-safe API client

## 🚀 Getting Started

### Choose Your Setup Method

**🐳 Docker (Recommended)** - Fully containerized with Traefik reverse proxy
```bash
make init
```
Access at: http://lifeup.localhost

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

**💻 Local Development** - Traditional npm setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or Docker)
- npm
- Docker & Docker Compose (for Docker setup)

### Quick Start with Docker

```bash
# 1. Initialize project (first time only)
make init

# 2. Access your application
# Frontend: http://lifeup.localhost
# Backend:  http://api.lifeup.localhost
# Adminer:  http://adminer.lifeup.localhost
# Traefik:  http://traefik.lifeup.localhost

# 3. View logs
make logs

# 4. Stop services
make local-stop
```

### Traditional Local Setup

1. Install backend dependencies
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

2. Install frontend dependencies
```bash
cd frontend
npm install
npm run dev
```

3. Open your browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## 📁 Project Structure

```
LifeUp/
├── backend/
│   ├── src/
│   │   ├── domain/          # Business entities and rules
│   │   ├── application/     # Use cases and DTOs
│   │   ├── infrastructure/  # Database, repositories
│   │   ├── presentation/    # Controllers, pipes, filters
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/
    ├── app/                 # Next.js pages
    ├── components/          # React components
    │   └── ui/             # shadcn/ui components
    ├── lib/                # Utilities and API client
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM for PostgreSQL
- **Zod** - Schema validation
- **TypeScript** - Type safety

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Beautifully designed components
- **TypeScript** - Type safety

## 📝 Development

### Docker Commands (Recommended)

```bash
# Start/Stop
make local                 # Start local environment
make local-stop            # Stop services
make local-restart         # Restart services

# Database
make db-migrate            # Run migrations
make db-generate           # Generate Prisma client
make db-studio             # Open Prisma Studio
make db-seed               # Seed database
make db-backup             # Backup database
make db-restore file=...   # Restore from backup

# Logs
make logs                  # All logs
make logs-backend          # Backend logs only
make logs-frontend         # Frontend logs only

# Shell Access
make shell-backend         # Backend container shell
make shell-frontend        # Frontend container shell
make shell-postgres        # PostgreSQL shell

# Rebuild
make build                 # Build all images
make rebuild               # Rebuild without cache

# See all commands
make help
```

For complete Docker documentation, see [DOCKER.md](DOCKER.md).

### Traditional npm Commands

**Backend:**
```bash
cd backend
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run test               # Run tests
```

**Frontend:**
```bash
cd frontend
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Run ESLint
```

## 🎯 Example: Adding a New Feature

Follow the onion architecture pattern:

1. **Domain** - Create entity and repository interface
2. **Application** - Create use case and DTOs with Zod schemas
3. **Infrastructure** - Implement repository, add Prisma model
4. **Presentation** - Create controller with validation

See `CLAUDE.md` for detailed guidance.

## 📚 Documentation

- `CLAUDE.md` - Comprehensive architecture and development guide
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation

## 🔒 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lifeup?schema=public"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🧪 Testing

Backend includes example tests for the onion architecture layers. Run with:
```bash
cd backend
npm run test
```

## 📦 Deployment

### Backend
Build and deploy the NestJS application:
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
Build and deploy the Next.js application:
```bash
cd frontend
npm run build
npm run start
```

## 🤝 Contributing

1. Follow the onion architecture principles
2. Maintain dependency rules (inner layers never depend on outer layers)
3. Use Zod for all validation
4. Write tests for business logic
5. Keep TypeScript strict mode enabled

## 📄 License

ISC
