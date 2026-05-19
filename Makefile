SHELL := /bin/sh

COMPOSE := docker compose
COMPOSE_FILE := .docker/compose/docker-compose.yml
COMPOSE_PROD_FILE := .docker/compose/docker-compose.prod.yml
DC := $(COMPOSE) -f $(COMPOSE_FILE)
DCP := $(COMPOSE) -f $(COMPOSE_PROD_FILE)
DC_RUN := $(COMPOSE) -f $(COMPOSE_FILE) run --rm
PHP := $(DC) exec -T php
PHP_ROOT := $(DC) exec -T --user root php
NODE := $(DC) exec -T node
PG := $(DC) exec -T postgres

GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

.PHONY: help \
        up down prod-up down-prod restart build rebuild prod-build prune \
        logs prod-logs ps shell root-shell \
        artisan migrate migrate-fresh migrate-refresh seed fresh-seed rollback optimize clear test tinker queue horizon schedule storage-link \
        make-controller make-model make-migration make-seeder make-factory make-request make-resource make-job make-event make-listener make-command make-policy make-mail make-notification \
        composer-install composer-update composer-dump \
        npm-install npm-dev npm-build \
        db-shell db-dump db-restore \
        pint phpstan phpunit \
        permissions-fix cache-clear env-copy

# ─────────────────────────────────────────────────────────────
# Usage & developer shortcuts for team members
# The Makefile keeps docker-compose calls centralized and easy to reuse.
# Run targets from project root.
# Example: make migrate
# Example: make make-controller NAME=UserController
# ─────────────────────────────────────────────────────────────

help:
	@printf "\n$(BLUE)== Developer Makefile ==$(NC)\n"
	@printf "\n$(YELLOW)Docker$(NC)\n"
	@printf "  make up                Start local dev stack\n"
	@printf "  make down              Stop services and remove containers\n"
	@printf "  make restart           Restart running containers\n"
	@printf "  make build             Build app images\n"
	@printf "  make rebuild           Rebuild images without cache\n"
	@printf "  make prod-up           Start production stack\n"
	@printf "  make prod-down         Stop production stack\n"
	@printf "  make logs              Tail logs for the php service\n"
	@printf "  make prod-logs         Tail production logs\n"
	@printf "  make shell             Shell into the php container\n"
	@printf "  make root-shell        Root shell into the php container\n"
	@printf "  make prune             Clean unused docker resources\n"
	@printf "\n$(YELLOW)Laravel$(NC)\n"
	@printf "  make artisan ARGS=...     Run artisan command\n"
	@printf "  make migrate              Run migrations\n"
	@printf "  make migrate-fresh        Reset DB and migrate\n"
	@printf "  make migrate-refresh      Rollback all and migrate fresh\n"
	@printf "  make seed                 Run database seeders\n"
	@printf "  make fresh-seed           Migrate fresh and seed\n"
	@printf "  make rollback            Rollback last migration batch\n"
	@printf "  make optimize             Cache config, routes and views\n"
	@printf "  make clear                Clear compiled caches\n"
	@printf "  make test                 Run tests\n"
	@printf "  make tinker               Open artisan tinker\n"
	@printf "  make queue                Start queue worker\n"
	@printf "  make horizon              Start Laravel Horizon\n"
	@printf "  make schedule             Run scheduled tasks once\n"
	@printf "  make storage-link         Create storage symlink\n"
	@printf "\n$(YELLOW)Generators$(NC)\n"
	@printf "  make make-controller NAME=...\n"
	@printf "  make make-model NAME=...\n"
	@printf "  make make-migration NAME=...\n"
	@printf "  make make-seeder NAME=...\n"
	@printf "  make make-factory NAME=...\n"
	@printf "  make make-request NAME=...\n"
	@printf "  make make-resource NAME=...\n"
	@printf "  make make-job NAME=...\n"
	@printf "  make make-event NAME=...\n"
	@printf "  make make-listener NAME=...\n"
	@printf "  make make-command NAME=...\n"
	@printf "  make make-policy NAME=...\n"
	@printf "  make make-mail NAME=...\n"
	@printf "  make make-notification NAME=...\n"
	@printf "\n$(YELLOW)Composer$(NC)\n"
	@printf "  make composer-install\n"
	@printf "  make composer-update\n"
	@printf "  make composer-dump\n"
	@printf "\n$(YELLOW)Node$(NC)\n"
	@printf "  make npm-install\n"
	@printf "  make npm-dev\n"
	@printf "  make npm-build\n"
	@printf "\n$(YELLOW)Database$(NC)\n"
	@printf "  make db-shell\n"
	@printf "  make db-dump\n"
	@printf "  make db-restore\n"
	@printf "\n$(YELLOW)Quality$(NC)\n"
	@printf "  make pint\n"
	@printf "  make phpstan\n"
	@printf "  make phpunit\n"
	@printf "\n$(YELLOW)Utility$(NC)\n"
	@printf "  make permissions-fix\n"
	@printf "  make cache-clear\n"
	@printf "  make env-copy\n"
	@printf "\n"

# ─────────────────────────────────────────────────────────────
# Docker commands
up:
	$(DC) up --build -d

down:
	$(DC) down --volumes --remove-orphans

prod-up:
	$(DCP) up --build -d

prod-down:
	$(DCP) down --volumes --remove-orphans

restart:
	$(DC) restart

build:
	$(DC) build --pull

rebuild:
	$(DC) build --no-cache --pull

prune:
	@printf "Removing unused Docker objects...\n"
	@docker system prune -af --volumes

logs:
	$(DC) logs -f --tail=200 $(SERVICE)

prod-logs:
	$(DCP) logs -f --tail=200 $(SERVICE)

ps:
	$(DC) ps

shell:
	$(DC) exec php sh

root-shell:
	$(DC) exec --user root php sh

# ─────────────────────────────────────────────────────────────
# Laravel commands
artisan:
	$(PHP) php artisan $(ARGS)

migrate:
	$(PHP) php artisan migrate --force

migrate-fresh:
	$(PHP) php artisan migrate:fresh --force

migrate-refresh:
	$(PHP) php artisan migrate:refresh --force

seed:
	$(PHP) php artisan db:seed --force

fresh-seed:
	$(PHP) php artisan migrate:fresh --seed --force

rollback:
	$(PHP) php artisan migrate:rollback --force

optimize:
	$(PHP) php artisan optimize

clear:
	$(PHP) php artisan optimize:clear

test:
	$(PHP) php artisan test

tinker:
	$(PHP) php artisan tinker

queue:
	$(PHP) php artisan queue:work redis --sleep=3 --tries=3 --timeout=90

horizon:
	$(PHP) php artisan horizon

schedule:
	$(PHP) php artisan schedule:run

storage-link:
	$(PHP) php artisan storage:link

# ─────────────────────────────────────────────────────────────
# Generator shortcuts
make-controller:
	$(PHP) php artisan make:controller $(NAME)

make-model:
	$(PHP) php artisan make:model $(NAME)

make-migration:
	$(PHP) php artisan make:migration $(NAME)

make-seeder:
	$(PHP) php artisan make:seeder $(NAME)

make-factory:
	$(PHP) php artisan make:factory $(NAME)

make-request:
	$(PHP) php artisan make:request $(NAME)

make-resource:
	$(PHP) php artisan make:resource $(NAME)

make-job:
	$(PHP) php artisan make:job $(NAME)

make-event:
	$(PHP) php artisan make:event $(NAME)

make-listener:
	$(PHP) php artisan make:listener $(NAME)

make-command:
	$(PHP) php artisan make:command $(NAME)

make-policy:
	$(PHP) php artisan make:policy $(NAME)

make-mail:
	$(PHP) php artisan make:mail $(NAME)

make-notification:
	$(PHP) php artisan make:notification $(NAME)

# ─────────────────────────────────────────────────────────────
# Composer commands
composer-install:
	$(PHP) composer install --prefer-dist --no-progress --no-interaction

composer-update:
	$(PHP) composer update --prefer-dist --no-progress --no-interaction

composer-dump:
	$(PHP) composer dump-autoload --optimize

# ─────────────────────────────────────────────────────────────
# Node commands
npm-install:
	$(NODE) npm ci --no-audit --silent

npm-dev:
	$(NODE) npm run dev

npm-build:
	$(NODE) npm run build

# ─────────────────────────────────────────────────────────────
# Database commands
db-shell:
	$(DC_RUN) postgres sh -c 'exec psql -h postgres -U "$$\{DB_USERNAME:-postgres\}" "$$\{DB_DATABASE:-postgres\}"'

DB_DUMP_FILE ?= dump.sql
db-dump:
	@printf "Exporting database to $(DB_DUMP_FILE)\n"
	@$(DC_RUN) postgres sh -c 'exec pg_dump -h postgres -U "$$\{DB_USERNAME:-postgres\}" "$$\{DB_DATABASE:-postgres\}"' > $(DB_DUMP_FILE)

DB_RESTORE_FILE ?= dump.sql
db-restore:
	@printf "Restoring database from $(DB_RESTORE_FILE)\n"
	@cat $(DB_RESTORE_FILE) | $(DC) exec -T postgres psql -h postgres -U "$$\{DB_USERNAME:-postgres\}" "$$\{DB_DATABASE:-postgres\}"

# ─────────────────────────────────────────────────────────────
# Code quality commands
pint:
	$(PHP) ./vendor/bin/pint

phpstan:
	$(PHP) ./vendor/bin/phpstan analyse

phpunit:
	$(PHP) ./vendor/bin/phpunit

# ─────────────────────────────────────────────────────────────
# Utility shortcuts
permissions-fix:
	$(PHP_ROOT) sh -c 'chown -R www-data:www-data storage bootstrap/cache && chmod -R 755 storage bootstrap/cache'

cache-clear:
	$(PHP) php artisan optimize:clear

env-copy:
	@test -f .env || cp .env.example .env
	@printf "Created .env from .env.example\n"

# -----------------------------------------------------------------------------
# Init - first-time project setup (idempotent)
# - Copies .env if missing
# - Builds and starts containers
# - Installs composer & npm deps
# - Generates APP_KEY if missing
# - Waits for Postgres, runs migrations and seeders
# - Creates storage symlink and fixes permissions
# - Runs Laravel optimization commands
# - Optionally builds frontend assets
#
# Usage: make init            # runs with frontend build
#        make init BUILD_FRONT=0   # skip frontend build
# -----------------------------------------------------------------------------
INIT_BUILD_FRONT ?= 1

init:
	@printf "Initializing project (this may take a few minutes)...\n"
	@make env-copy
	@$(DC) build --pull
	@$(DC) up -d
	@printf "Waiting for Postgres to be ready...\n"
	@until $(DC) exec -T postgres pg_isready -U "$$\{DB_USERNAME:-postgres\}" >/dev/null 2>&1; do sleep 1; done
	@printf "Installing PHP dependencies (composer)...\n"
	@$(PHP) composer install --prefer-dist --no-progress --no-interaction || true
	@printf "Installing Node dependencies (npm)...\n"
	@$(DC) exec -T node sh -c 'npm ci --no-audit --silent' || true
	@printf "Generating APP_KEY if missing...\n"
	@$(PHP) sh -c 'KEY=$$(grep -E "^APP_KEY=" .env 2>/dev/null | cut -d"=" -f2-); if [ -z "$$KEY" ]; then php artisan key:generate --force; fi' || true
	@printf "Running migrations and seeders...\n"
	@$(PHP) php artisan migrate --force || true
	@$(PHP) php artisan db:seed --force || true
	@printf "Creating storage symlink and fixing permissions...\n"
	@$(PHP) php artisan storage:link || true
	@$(PHP_ROOT) sh -c 'chown -R www-data:www-data storage bootstrap/cache || true; chmod -R 755 storage bootstrap/cache || true'
	@printf "Clearing caches and optimizing application...\n"
	@$(PHP) php artisan optimize || true
	@if [ "$(INIT_BUILD_FRONT)" = "1" ]; then $(DC) exec -T node sh -c 'npm run build'; fi
	@printf "Initialization complete.\n"
