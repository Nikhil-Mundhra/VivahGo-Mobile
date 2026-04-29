SHELL := /bin/bash

ROOT_DIR := $(abspath .)
APP_DIR := $(ROOT_DIR)/vivahgo
APP_ENV_FILE := $(APP_DIR)/.env
VERCEL_PREVIEW_ENV_FILE := $(ROOT_DIR)/.vercel/.env.preview.local

INFISICAL ?= infisical
INFISICAL_INSTALL_CMD ?= brew install infisical/get-cli/infisical
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

# Get local IP address (works on macOS and most Linux distros)
LOCAL_IP := $(shell ipconfig getifaddr en0 2>/dev/null || hostname -I | cut -d' ' -f1)
DEV_LOG := .dev.log

.PHONY: build build_frontend build_backend test test_coverage coverage_check clean run dev run_local \
	check-secrets test-db infisical-init infisical-login ensure-infisical setup sync-app-env sync-preview-env sync-envs

build: setup build_frontend build_backend

build_frontend: ensure-infisical
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run build

build_backend:
	@echo "No backend build step is configured; skipping backend build."

test: ensure-infisical
	$(MAKE) test_coverage
	$(MAKE) coverage_check

test_coverage: ensure-infisical
	$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run test:coverage

coverage_check: ensure-infisical
	$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- npm run coverage:check

clean:
	rm -rf coverage .nyc_output vivahgo/dist

run: ensure-infisical
	@echo -e "$(BLUE)-------------------------------------------------------$(RESET)"
	@echo -e "🚀 $(BOLD)Server is starting...$(RESET)"
	@echo -e "🌐 Dev Server:   $(CYAN)http://localhost:5173$(RESET)"
	@echo -e "📱 Phone Access: $(CYAN)http://$(LOCAL_IP):5173$(RESET)"
	@echo -e "$(BLUE)-------------------------------------------------------$(RESET)"
	@echo -e "📝 Logs are being written to $(GREEN)$(DEV_LOG)$(RESET)"
	@echo -e "👉 Run '$(BOLD)tail -f $(DEV_LOG)$(RESET)' to view stream"
	@# We manually trigger dev:server and dev:client to ensure --host reaches the right place
	@cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) --command \
		'npm run dev:server & SERVER_PID=$$!; sleep 2; npm run dev:client -- --host; kill $$SERVER_PID' > $(ROOT_DIR)/$(DEV_LOG) 2>&1
dev: run

run_local: ensure-infisical test build
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) --command 'npm run dev:server & SERVER_PID=$$!; trap "kill $$SERVER_PID" EXIT INT TERM; npm run dev:client -- --host'

check-secrets: ensure-infisical
	@echo "Listing secret names from Infisical ($(INFISICAL_ENV))..."
	@$(INFISICAL) run $(INFISICAL_RUN_ARGS) -- printenv | cut -d= -f1 | sort

test-db: ensure-infisical
	@echo "Verifying MongoDB Atlas connection with secrets from Infisical..."
	cd "$(APP_DIR)" && $(INFISICAL) run $(INFISICAL_RUN_ARGS) -- mongosh "$$MONGODB_URI"

infisical-init: ensure-infisical
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) init

infisical-login: ensure-infisical
	$(INFISICAL) login

ensure-infisical:
	@if ! command -v "$(INFISICAL)" >/dev/null 2>&1; then \
		echo "Infisical CLI not found. Installing with: $(INFISICAL_INSTALL_CMD)"; \
		$(INFISICAL_INSTALL_CMD); \
	fi

setup: ensure-infisical
	@if ! command -v "$(INFISICAL)" >/dev/null 2>&1; then \
		echo "Infisical CLI is still unavailable after installation attempt."; \
		exit 1; \
	fi
	@if [ ! -f "$(INFISICAL_CONFIG_DIR)/.infisical.json" ]; then \
		echo "Infisical project config not found. Logging in and linking this repo..."; \
		$(MAKE) infisical-login; \
		$(MAKE) infisical-init; \
	fi
	@if [ ! -d "$(ROOT_DIR)/node_modules" ]; then \
		echo "Installing root dependencies..."; \
		npm install; \
	fi
	@if [ ! -d "$(APP_DIR)/node_modules" ]; then \
		echo "Installing app dependencies..."; \
		npm install --prefix vivahgo; \
	fi

sync-app-env: ensure-infisical
	@mkdir -p "$(dir $(APP_ENV_FILE))"
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) export $(INFISICAL_EXPORT_ARGS) --env=$(INFISICAL_ENV) --output-file="$(APP_ENV_FILE)"
	@echo "Wrote $(APP_ENV_FILE) from Infisical environment '$(INFISICAL_ENV)'."

sync-preview-env: ensure-infisical
	@mkdir -p "$(dir $(VERCEL_PREVIEW_ENV_FILE))"
	cd "$(INFISICAL_CONFIG_DIR)" && $(INFISICAL) export $(INFISICAL_EXPORT_ARGS) --env=$(VERCEL_PREVIEW_INFISICAL_ENV) --output-file="$(VERCEL_PREVIEW_ENV_FILE)"
	@echo "Wrote $(VERCEL_PREVIEW_ENV_FILE) from Infisical environment '$(VERCEL_PREVIEW_INFISICAL_ENV)'."

sync-envs: sync-app-env sync-preview-env
