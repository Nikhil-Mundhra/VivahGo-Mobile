SHELL := /bin/bash

.PHONY: build build_frontend build_backend test run run_local

build: build_frontend build_backend

build_frontend:
	cd VivahGo && npm run build

build_backend:
	@echo "No backend build step is configured; skipping backend build."

test:
	npm test

run: build test
	cd VivahGo && npm run dev

run_local: test build
	cd VivahGo && \
	npm run dev:server & \
	SERVER_PID=$$!; \
	trap 'kill $$SERVER_PID' EXIT INT TERM; \
	npm run dev:client -- --host