COMPOSE_FILE ?= docker-compose.yml
COMPOSE = docker compose -f $(COMPOSE_FILE)

.PHONY: help up down stop restart build logs logs-front ps shell front-shell artisan migrate fresh test install key npm front-build front-dev

help:
	@echo "Usage: make <target> [COMPOSE_FILE=docker-compose.dev.yml]"
	@echo ""
	@echo "Targets:"
	@echo "  up        Start services in detached mode"
	@echo "  down      Stop and remove containers"
	@echo "  stop      Stop running containers"
	@echo "  restart   Restart all services"
	@echo "  build     Build/rebuild app image"
	@echo "  logs      Follow logs for all services"
	@echo "  logs-front Follow logs for frontend service"
	@echo "  ps        Show running services"
	@echo "  shell     Open shell in app container"
	@echo "  front-shell Open shell in frontend container"
	@echo "  artisan   Run artisan command (cmd=\"...\")"
	@echo "  npm       Run npm command in frontend (cmd=\"...\")"
	@echo "  front-dev Start vite dev server in frontend container"
	@echo "  front-build Build frontend assets"
	@echo "  migrate   Run database migrations"
	@echo "  fresh     Fresh migrate with seed"
	@echo "  test      Run Laravel test suite"
	@echo "  install   Composer install in app"
	@echo "  key       Generate app key"

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

restart:
	$(COMPOSE) restart

build:
	$(COMPOSE) build app

logs:
	$(COMPOSE) logs -f --tail=200

logs-front:
	$(COMPOSE) logs -f --tail=200 frontend

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec app sh

front-shell:
	$(COMPOSE) exec frontend sh

artisan:
	$(COMPOSE) exec app php artisan $(cmd)

npm:
	$(COMPOSE) exec frontend npm $(cmd)

front-dev:
	$(COMPOSE) exec frontend npm run dev -- --host 0.0.0.0 --port $${VITE_PORT:-5173}

front-build:
	$(COMPOSE) exec frontend npm run build

migrate:
	$(COMPOSE) exec app php artisan migrate

fresh:
	$(COMPOSE) exec app php artisan migrate:fresh --seed

test:
	$(COMPOSE) exec app php artisan test

install:
	$(COMPOSE) exec app composer install

key:
	$(COMPOSE) exec app php artisan key:generate
