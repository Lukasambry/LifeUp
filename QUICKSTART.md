# Quick Start Guide

## 🚀 Get Started in 2 Minutes

```bash
# 1. Clone and initialize
git clone <your-repo>
cd LifeUp
make init

# 2. Done! Access your app
open http://lifeup.localhost
```

## 📍 URLs

| Service | URL |
|---------|-----|
| Frontend | http://lifeup.localhost |
| Backend API | http://api.lifeup.localhost |
| Database Admin | http://adminer.lifeup.localhost |
| Traefik Dashboard | http://traefik.lifeup.localhost |

## 🔧 Most Used Commands

```bash
# Start/Stop
make local          # Start all services
make local-stop     # Stop services
make local-restart  # Restart services

# View Logs
make logs           # All logs
make logs-backend   # Backend only
make logs-frontend  # Frontend only

# Database
make db-migrate     # Run migrations
make db-seed        # Seed database
make db-backup      # Backup database

# Development
make shell-backend  # Open backend shell
make build          # Rebuild images

# Help
make help           # Show all commands
```

## 📂 Project Structure

```
LifeUp/
├── backend/         # NestJS API (Onion Architecture)
│   ├── src/
│   │   ├── domain/         # Business entities & logic
│   │   ├── application/    # Use cases & DTOs
│   │   ├── infrastructure/ # Prisma, DB, repos
│   │   └── presentation/   # Controllers, pipes
│   └── prisma/
├── frontend/        # Next.js 15 + Tailwind 4
│   ├── app/         # Pages (App Router)
│   ├── components/  # React components
│   └── lib/         # Utils & API client
├── traefik/         # Reverse proxy config
├── Makefile         # All commands
└── docker-compose.* # Container orchestration
```

## 🎯 Common Tasks

### Add a New Feature

1. **Domain**: Create entity in `backend/src/domain/entities/`
2. **Application**: Add use case in `backend/src/application/use-cases/`
3. **Infrastructure**: Implement in `backend/src/infrastructure/repositories/`
4. **Presentation**: Add controller in `backend/src/presentation/controllers/`
5. **Frontend**: Create page/component in `frontend/app/` or `frontend/components/`

### Run Database Migration

```bash
# Inside container
make db-migrate-create name=add_users_table
make db-migrate

# Or manually
make shell-backend
npx prisma migrate dev --name add_users_table
```

### View Database

**Option 1: Adminer (Web)**
- Open http://adminer.lifeup.localhost
- System: `PostgreSQL`
- Server: `postgres`
- Username: `postgres`
- Password: `postgres`
- Database: `lifeup`

**Option 2: Prisma Studio**
```bash
make db-studio
```

**Option 3: psql CLI**
```bash
make shell-postgres
```

### Access Container Shell

```bash
make shell-backend   # NestJS container
make shell-frontend  # Next.js container
make shell-postgres  # PostgreSQL
```

## 🐛 Troubleshooting

### Can't access *.localhost?

Add to `/etc/hosts`:
```
127.0.0.1 lifeup.localhost api.lifeup.localhost adminer.lifeup.localhost traefik.lifeup.localhost
```

### Port 80 already in use?

```bash
sudo lsof -i :80
sudo systemctl stop apache2  # or nginx
```

### Database connection failed?

```bash
make logs-postgres   # Check postgres logs
make health          # Check service health
```

### Hot reload not working?

```bash
make rebuild         # Rebuild images
make local-restart   # Restart services
```

### Start fresh?

```bash
make clean           # Remove everything
make init            # Reinitialize
```

## 📚 Documentation

- **[README.md](README.md)** - Project overview
- **[DOCKER.md](DOCKER.md)** - Complete Docker guide
- **[CLAUDE.md](CLAUDE.md)** - Architecture & development guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture patterns

## 🔑 Default Credentials

**PostgreSQL (Local)**
- Host: `postgres`
- Port: `5432`
- Database: `lifeup`
- User: `postgres`
- Password: `postgres`

## 🌐 Environments

| Environment | File | Domain |
|------------|------|--------|
| Local | `docker-compose.local.yml` | `*.lifeup.localhost` |
| Dev | `docker-compose.dev.yml` | `*.dev.yourdomain.com` |
| Prod | `docker-compose.prod.yml` | `*.yourdomain.com` |

## 💡 Tips

- Use `make help` to see all available commands
- Logs are your friend: `make logs`
- Backend changes auto-reload in development
- Frontend changes auto-reload in development
- Use Adminer for quick database inspection
- Check Traefik dashboard for routing issues
- Database is persisted in Docker volume

## 🚢 Deploy to Production

```bash
# 1. Setup environment
cp .env.prod.example .env.prod
nano .env.prod  # Update with production values

# 2. Deploy
ENV=prod make up

# 3. Run migrations
ENV=prod make db-migrate
```

See [DOCKER.md](DOCKER.md) for detailed deployment instructions.
