SHELL := /bin/bash

.PHONY: build build_frontend build_backend test test_coverage coverage_check clean run run_local

build: build_frontend build_backend

build_frontend:
	cd vivahgo && npm run build

build_backend:
	@echo "No backend build step is configured; skipping backend build."

test:
	$(MAKE) test_coverage
	$(MAKE) coverage_check

test_coverage:
	npm run test:coverage

coverage_check:
	npm run coverage:check

clean:
	rm -rf coverage .nyc_output vivahgo/dist

run: build
	cd vivahgo && npm run dev

run_local: test build
	cd vivahgo; \
	npm run dev:server & \
	SERVER_PID=$$!; \
	trap 'kill $$SERVER_PID' EXIT INT TERM; \
	npm run dev:client -- --host
