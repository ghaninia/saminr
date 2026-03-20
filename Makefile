COMPOSE_FILE ?= docker-compose.yml
COMPOSE = docker compose -f $(COMPOSE_FILE)

.PHONY: help up down stop restart build logs ps shell artisan migrate fresh test install key

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
	@echo "  ps        Show running services"
	@echo "  shell     Open shell in app container"
	@echo "  artisan   Run artisan command (cmd=\"...\")"
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

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec app sh

artisan:
	$(COMPOSE) exec app php artisan $(cmd)

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
