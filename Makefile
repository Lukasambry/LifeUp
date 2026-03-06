.DEFAULT_GOAL := help
.PHONY: help dev dev-down staging staging-down prod prod-down \
        test lint build \
        db-reset db-migrate db-migrate-docker db-reset-docker \
        logs logs-backend logs-web-admin \
        clean

IMAGE_TAG ?= latest

help:
	@echo ""
	@echo "  LifeUp — commandes disponibles"
	@echo ""
	@echo "  Environnements Docker"
	@echo "    make dev              Démarre le stack dev avec hot reload"
	@echo "    make dev-down         Arrête le stack dev"
	@echo "    make staging          Démarre le stack staging (images ghcr.io)"
	@echo "    make staging-down     Arrête le stack staging"
	@echo "    make prod             Démarre le stack production"
	@echo "    make prod-down        Arrête le stack production"
	@echo ""
	@echo "  Développement local (sans Docker pour le code)"
	@echo "    make test             Exécute les tests"
	@echo "    make lint             Exécute le linter"
	@echo "    make build            Compile tous les packages"
	@echo ""
	@echo "  Base de données"
	@echo "    make db-reset         Reset DB + réapplique toutes les migrations (local)"
	@echo "    make db-migrate       Applique les migrations en attente (local)"
	@echo "    make db-reset-docker  Reset DB via le conteneur backend dev"
	@echo "    make db-migrate-docker  Migrations via le conteneur backend dev"
	@echo ""
	@echo "  Utilitaires"
	@echo "    make logs             Logs du stack dev (tous les services)"
	@echo "    make logs-backend     Logs du backend uniquement"
	@echo "    make logs-web-admin   Logs du web-admin uniquement"
	@echo "    make clean            Supprime les volumes et images inutilisés"
	@echo ""


dev:
	docker compose -f compose.dev.yml up

dev-detach:
	docker compose -f compose.dev.yml up -d

dev-down:
	docker compose -f compose.dev.yml down

staging:
	docker compose -f compose.staging.yml up -d

staging-down:
	docker compose -f compose.staging.yml down

prod:
	docker compose -f compose.prod.yml up -d

prod-down:
	docker compose -f compose.prod.yml down


test:
	npm run test

lint:
	npm run lint

build:
	npm run build


db-reset:
	cd packages/backend && npx prisma migrate reset --force

db-migrate:
	cd packages/backend && npx prisma migrate deploy


db-reset-docker:
	docker compose -f compose.dev.yml exec backend \
		sh -c "cd /workspace/packages/backend && npx prisma migrate reset --force"

db-migrate-docker:
	docker compose -f compose.dev.yml exec backend \
		sh -c "cd /workspace/packages/backend && npx prisma migrate deploy"

logs:
	docker compose -f compose.dev.yml logs -f

logs-backend:
	docker compose -f compose.dev.yml logs -f backend

logs-web-admin:
	docker compose -f compose.dev.yml logs -f web-admin


clean:
	docker compose -f compose.dev.yml down -v --remove-orphans
	docker image prune -f
