SHELL := /bin/bash

ROOT_DIR := $(abspath .)
APP_DIR := $(ROOT_DIR)/vivahgo
APP_ENV_FILE := $(APP_DIR)/.env
VERCEL_PREVIEW_ENV_FILE := $(ROOT_DIR)/.vercel/.env.preview.local

INFISICAL ?= infisical
INFISICAL_ENV ?= dev
VERCEL_PREVIEW_INFISICAL_ENV ?= $(INFISICAL_ENV)
INFISICAL_PATH ?= /
INFISICAL_CONFIG_DIR ?= $(shell \
	if [ -f "$(ROOT_DIR)/.infisical.json" ]; then \
		printf '%s' "$(ROOT_DIR)"; \
	elif [ -f "$(APP_DIR)/.infisical.json" ]; then \
		printf '%s' "$(APP_DIR)"; \
	else \
		printf '%s' "$(ROOT_DIR)"; \
	fi)

INFISICAL_RUN_ARGS := --project-config-dir="$(INFISICAL_CONFIG_DIR)" --env=$(INFISICAL_ENV) --path=$(INFISICAL_PATH)
INFISICAL_EXPORT_ARGS := --path=$(INFISICAL_PATH) --format=dotenv
ifdef INFISICAL_PROJECT_ID
INFISICAL_RUN_ARGS += --projectId=$(INFISICAL_PROJECT_ID)
INFISICAL_EXPORT_ARGS += --projectId=$(INFISICAL_PROJECT_ID)
endif

.PHONY: build build_frontend build_backend test test_coverage coverage_check clean run dev run_local \
	check-secrets test-db infisical-init infisical-login setup sync-app-env sync-preview-env sync-envs

build: build_frontend build_backend

build_frontend:
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run build

build_backend:
	@echo "No backend build step is configured; skipping backend build."

test:
	$(MAKE) test_coverage
	$(MAKE) coverage_check

test_coverage:
	$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run test:coverage

coverage_check:
	$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run coverage:check

clean:
	rm -rf coverage .nyc_output vivahgo/dist

run:
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run dev

dev: run

run_local: test build
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) --command 'npm run dev:server & SERVER_PID=$$!; trap "kill $$SERVER_PID" EXIT INT TERM; npm run dev:client -- --host'

check-secrets:
	@echo "Listing secret names from Infisical ($(INFISICAL_ENV))..."
	@$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- printenv | cut -d= -f1 | sort

test-db:
	@echo "Verifying MongoDB Atlas connection with secrets from Infisical..."
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) -- mongosh "$$MONGODB_URI"

infisical-init:
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) init

infisical-login:
	$(INFISICAL) login

setup:
	@if ! command -v "$(INFISICAL)" >/dev/null 2>&1; then \
		echo "Infisical CLI is not installed. Install it with brew install infisical/get-cli/infisical or npm install -g @infisical/cli."; \
		exit 1; \
	fi
	$(MAKE) infisical-login
	@if [ ! -f "$(INFISICAL_CONFIG_DIR)/.infisical.json" ]; then \
		$(MAKE) infisical-init; \
	fi
	npm install
	npm install --prefix vivahgo

sync-app-env:
	@mkdir -p "$(dir $(APP_ENV_FILE))"
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) export $(INFISICAL_EXPORT_ARGS) --env=$(INFISICAL_ENV) --output-file="$(APP_ENV_FILE)"
	@echo "Wrote $(APP_ENV_FILE) from Infisical environment '$(INFISICAL_ENV)'."

sync-preview-env:
	@mkdir -p "$(dir $(VERCEL_PREVIEW_ENV_FILE))"
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) export $(INFISICAL_EXPORT_ARGS) --env=$(VERCEL_PREVIEW_INFISICAL_ENV) --output-file="$(VERCEL_PREVIEW_ENV_FILE)"
	@echo "Wrote $(VERCEL_PREVIEW_ENV_FILE) from Infisical environment '$(VERCEL_PREVIEW_INFISICAL_ENV)'."

sync-envs: sync-app-env sync-preview-env
