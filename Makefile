COMPOSE_FILE ?= docker-compose.yml
COMPOSE      := docker compose -f $(COMPOSE_FILE)
APP          := $(COMPOSE) exec app
FRONT        := $(COMPOSE) exec frontend

.PHONY: help up down stop restart build \
        logs logs-front ps \
        shell front-shell \
        artisan npm \
	migrate fresh seed-products seed-reviews seed-fake test \
        install key \
        front-dev front-build

# ─── Default ───────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  make up                   Start all services"
	@echo "  make down                 Stop & remove containers"
	@echo "  make restart              Restart all services"
	@echo "  make build                Rebuild app image"
	@echo "  make logs                 Follow all logs"
	@echo "  make logs-front           Follow frontend (Vite) logs"
	@echo "  make ps                   List running containers"
	@echo "  make shell                Shell into app container"
	@echo "  make front-shell          Shell into frontend container"
	@echo "  make artisan cmd=\"...\"    Run php artisan <cmd>"
	@echo "  make npm cmd=\"...\"        Run npm <cmd> in frontend"
	@echo "  make migrate              Run migrations"
	@echo "  make fresh                Fresh migrate + seed"
	@echo "  make seed-products        Seed only products (with variants)"
	@echo "  make seed-reviews         Seed only reviews"
	@echo "  make seed-fake            Seed products + reviews"
	@echo "  make test                 Run test suite"
	@echo "  make install              Composer install"
	@echo "  make key                  Generate app key"
	@echo "  make front-dev            Follow Vite dev server logs"
	@echo "  make front-build          Build frontend for production"
	@echo ""
	@echo "  Override compose file:  make <target> COMPOSE_FILE=docker-compose.dev.yml"
	@echo ""

# ─── Containers ────────────────────────────────────────────────────────────────
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

# ─── Logs / Status ─────────────────────────────────────────────────────────────
logs:
	$(COMPOSE) logs -f --tail=200

logs-front:
	$(COMPOSE) logs -f --tail=200 frontend

ps:
	$(COMPOSE) ps

# ─── Shells ────────────────────────────────────────────────────────────────────
shell:
	$(APP) sh

front-shell:
	$(FRONT) sh

# ─── Laravel ───────────────────────────────────────────────────────────────────
artisan:
	$(APP) php artisan $(cmd)

migrate:
	$(APP) php artisan migrate

fresh:
	$(APP) php artisan migrate:fresh --seed

seed-products:
	$(APP) php artisan db:seed --class=ProductSeeder

seed-reviews:
	$(APP) php artisan db:seed --class=ReviewSeeder

seed-fake:
	$(APP) php artisan db:seed --class=ProductSeeder
	$(APP) php artisan db:seed --class=ReviewSeeder

test:
	$(APP) php artisan test

install:
	$(APP) composer install

key:
	$(APP) php artisan key:generate

# ─── Frontend ──────────────────────────────────────────────────────────────────
npm:
	$(FRONT) npm $(cmd)

front-dev:
	$(COMPOSE) logs -f --tail=200 frontend

front-build:
	$(FRONT) npm run build
