.PHONY: help
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Environment detection
ENV ?= local
COMPOSE_FILE := docker-compose.$(ENV).yml

help: ## Show this help message
	@echo "$(BLUE)LifeUp - Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Environment:$(NC) $(ENV)"
	@echo "$(GREEN)Usage:$(NC) make [command] ENV=[local|dev|prod]"

# ==============================================================================
# LOCAL ENVIRONMENT
# ==============================================================================

local: ## Start local environment
	@echo "$(GREEN)Starting local environment...$(NC)"
	@docker-compose -f docker-compose.local.yml up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(BLUE)Frontend:$(NC) http://lifeup.localhost"
	@echo "$(BLUE)Backend:$(NC) http://api.lifeup.localhost"
	@echo "$(BLUE)Adminer:$(NC) http://adminer.lifeup.localhost"
	@echo "$(BLUE)Traefik:$(NC) http://traefik.lifeup.localhost"

local-stop: ## Stop local environment
	@echo "$(YELLOW)Stopping local environment...$(NC)"
	@docker-compose -f docker-compose.local.yml stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

local-down: ## Stop and remove local containers
	@echo "$(RED)Removing local environment...$(NC)"
	@docker-compose -f docker-compose.local.yml down
	@echo "$(GREEN)✓ Containers removed$(NC)"

local-logs: ## Show logs for local environment
	@docker-compose -f docker-compose.local.yml logs -f

local-restart: local-stop local ## Restart local environment

# ==============================================================================
# GENERIC ENVIRONMENT COMMANDS
# ==============================================================================

up: ## Start services (ENV=local|dev|prod)
	@echo "$(GREEN)Starting $(ENV) environment...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Services started$(NC)"

down: ## Stop and remove containers (ENV=local|dev|prod)
	@echo "$(RED)Stopping $(ENV) environment...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✓ Containers removed$(NC)"

stop: ## Stop services (ENV=local|dev|prod)
	@echo "$(YELLOW)Stopping $(ENV) environment...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

start: ## Start stopped services (ENV=local|dev|prod)
	@echo "$(GREEN)Starting $(ENV) services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) start
	@echo "$(GREEN)✓ Services started$(NC)"

restart: stop start ## Restart services (ENV=local|dev|prod)

ps: ## Show running containers
	@docker-compose -f $(COMPOSE_FILE) ps

logs: ## Show logs (ENV=local|dev|prod)
	@docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Show backend logs
	@docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Show frontend logs
	@docker-compose -f $(COMPOSE_FILE) logs -f frontend

logs-postgres: ## Show postgres logs
	@docker-compose -f $(COMPOSE_FILE) logs -f postgres

logs-traefik: ## Show traefik logs
	@docker-compose -f $(COMPOSE_FILE) logs -f traefik

# ==============================================================================
# BUILD COMMANDS
# ==============================================================================

build: ## Build all images (ENV=local|dev|prod)
	@echo "$(BLUE)Building images for $(ENV)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✓ Images built$(NC)"

build-backend: ## Build backend image
	@echo "$(BLUE)Building backend image...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build backend
	@echo "$(GREEN)✓ Backend image built$(NC)"

build-frontend: ## Build frontend image
	@echo "$(BLUE)Building frontend image...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build frontend
	@echo "$(GREEN)✓ Frontend image built$(NC)"

rebuild: ## Rebuild all images without cache
	@echo "$(BLUE)Rebuilding images from scratch...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✓ Images rebuilt$(NC)"

# ==============================================================================
# DATABASE COMMANDS
# ==============================================================================

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm run prisma:migrate
	@echo "$(GREEN)✓ Migrations completed$(NC)"

db-migrate-create: ## Create a new migration (name=migration_name)
	@echo "$(BLUE)Creating migration: $(name)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npx prisma migrate dev --name $(name)
	@echo "$(GREEN)✓ Migration created$(NC)"

db-generate: ## Generate Prisma client
	@echo "$(BLUE)Generating Prisma client...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm run prisma:generate
	@echo "$(GREEN)✓ Prisma client generated$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm run prisma:studio

db-seed: ## Seed the database
	@echo "$(BLUE)Seeding database...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm run prisma:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)⚠️  WARNING: This will destroy all database data!$(NC)"
	@echo "$(RED)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5
	@docker-compose -f $(COMPOSE_FILE) exec backend npx prisma migrate reset --force
	@echo "$(GREEN)✓ Database reset$(NC)"

db-backup: ## Backup database to backups/ directory
	@mkdir -p backups
	@echo "$(BLUE)Creating database backup...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres lifeup > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

db-restore: ## Restore database from backup file (file=backups/backup.sql)
	@echo "$(BLUE)Restoring database from $(file)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U postgres lifeup < $(file)
	@echo "$(GREEN)✓ Database restored$(NC)"

# ==============================================================================
# SHELL ACCESS
# ==============================================================================

shell-backend: ## Access backend container shell
	@docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Access frontend container shell
	@docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-postgres: ## Access postgres container shell
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -d lifeup

# ==============================================================================
# CLEANING
# ==============================================================================

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)⚠️  WARNING: This will remove all containers, volumes, and images!$(NC)"
	@echo "$(RED)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5
	@docker-compose -f docker-compose.local.yml down -v
	@docker-compose -f docker-compose.dev.yml down -v
	@docker-compose -f docker-compose.prod.yml down -v
	@docker system prune -af --volumes
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

clean-volumes: ## Remove all volumes (WARNING: destroys data)
	@echo "$(RED)⚠️  WARNING: This will destroy all data!$(NC)"
	@echo "$(RED)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5
	@docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✓ Volumes removed$(NC)"

clean-images: ## Remove all project images
	@echo "$(YELLOW)Removing project images...$(NC)"
	@docker images | grep lifeup | awk '{print $$3}' | xargs -r docker rmi -f
	@echo "$(GREEN)✓ Images removed$(NC)"

# ==============================================================================
# MONITORING & DEBUGGING
# ==============================================================================

stats: ## Show container stats
	@docker stats

inspect-backend: ## Inspect backend container
	@docker-compose -f $(COMPOSE_FILE) exec backend sh -c 'echo "Node: $$(node --version)" && echo "NPM: $$(npm --version)" && echo "Env: $$NODE_ENV"'

inspect-frontend: ## Inspect frontend container
	@docker-compose -f $(COMPOSE_FILE) exec frontend sh -c 'echo "Node: $$(node --version)" && echo "NPM: $$(npm --version)" && echo "Env: $$NODE_ENV"'

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps

# ==============================================================================
# DEVELOPMENT HELPERS
# ==============================================================================

install-backend: ## Install backend dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm install
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

test-backend: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm test

test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm test

lint-backend: ## Run backend linter
	@echo "$(BLUE)Linting backend...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm run lint

lint-frontend: ## Run frontend linter
	@echo "$(BLUE)Linting frontend...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm run lint

# ==============================================================================
# PRODUCTION DEPLOYMENT
# ==============================================================================

deploy-prod: ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	@docker-compose -f docker-compose.prod.yml pull
	@docker-compose -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)✓ Production deployment completed$(NC)"

# ==============================================================================
# QUICK START
# ==============================================================================

init: ## Initialize project (first time setup)
	@echo "$(GREEN)Initializing LifeUp project...$(NC)"
	@cp -n .env.example .env || true
	@cp -n backend/.env.example backend/.env || true
	@echo "$(YELLOW)Please update .env files with your configuration$(NC)"
	@echo "$(BLUE)Building containers...$(NC)"
	@make build ENV=local
	@echo "$(BLUE)Starting services...$(NC)"
	@make up ENV=local
	@echo "$(BLUE)Generating Prisma client...$(NC)"
	@make db-generate ENV=local
	@echo "$(BLUE)Running migrations...$(NC)"
	@make db-migrate ENV=local
	@echo "$(GREEN)✓ Initialization complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Access your application:$(NC)"
	@echo "  Frontend: http://lifeup.localhost"
	@echo "  Backend:  http://api.lifeup.localhost"
	@echo "  Adminer:  http://adminer.lifeup.localhost"
	@echo "  Traefik:  http://traefik.lifeup.localhost"
