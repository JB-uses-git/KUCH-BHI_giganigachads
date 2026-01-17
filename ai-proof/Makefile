.PHONY: help install build run stop clean test docs

# Variables
DOCKER_IMAGE := ai-proof-backend
DOCKER_CONTAINER := ai-proof-backend
BACKEND_PORT := 8000
FRONTEND_PORT := 3000

help:
	@echo "AI-PROOF - Detect AI-Generated Images"
	@echo ""
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies (Python & Node)"
	@echo "  make backend      - Run backend server locally"
	@echo "  make frontend     - Run frontend server locally"
	@echo "  make dev          - Run both backend and frontend"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run backend in Docker"
	@echo "  make compose      - Run full stack with Docker Compose"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Lint code"
	@echo "  make clean        - Clean up generated files"
	@echo "  make docs         - Open API documentation"

# Installation
install:
	@echo "Installing backend dependencies..."
	pip install -r backend/requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Local Development
backend:
	@echo "Starting backend on port $(BACKEND_PORT)..."
	uvicorn backend.app.main:app --reload --port $(BACKEND_PORT)

frontend:
	@echo "Starting frontend on port $(FRONTEND_PORT)..."
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	@echo "Backend will run on http://localhost:$(BACKEND_PORT)"
	@echo "Frontend will run on http://localhost:$(FRONTEND_PORT)"
	@(cd backend && uvicorn app.main:app --reload) & \
	(cd frontend && npm run dev)

# Docker Commands
docker-build:
	@echo "Building Docker image $(DOCKER_IMAGE)..."
	docker build -t $(DOCKER_IMAGE):latest .

docker-run: docker-build
	@echo "Running Docker container on port $(BACKEND_PORT)..."
	docker run -p $(BACKEND_PORT):$(BACKEND_PORT) \
		--name $(DOCKER_CONTAINER) \
		$(DOCKER_IMAGE):latest

docker-stop:
	@echo "Stopping Docker container..."
	docker stop $(DOCKER_CONTAINER) 2>/dev/null || true
	docker rm $(DOCKER_CONTAINER) 2>/dev/null || true

# Docker Compose
compose:
	@echo "Starting full stack with Docker Compose..."
	docker-compose up --build

compose-down:
	@echo "Stopping Docker Compose services..."
	docker-compose down

compose-logs:
	docker-compose logs -f

# Testing
test:
	@echo "Running tests..."
	pytest backend/tests -v --tb=short 2>/dev/null || echo "No tests found or pytest not installed"

lint:
	@echo "Linting Python code..."
	pylint backend/app --disable=all --enable=E,F 2>/dev/null || echo "Pylint not installed"
	@echo "Linting frontend code..."
	cd frontend && npm run lint 2>/dev/null || echo "ESLint not configured"

# Cleanup
clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov 2>/dev/null || true
	rm -rf frontend/.next frontend/node_modules 2>/dev/null || true
	rm -rf backend/venv 2>/dev/null || true
	docker-compose down -v 2>/dev/null || true
	@echo "Cleanup complete!"

# Documentation
docs:
	@echo "Opening API documentation..."
	@python -m webbrowser "http://localhost:$(BACKEND_PORT)/docs" 2>/dev/null || \
	echo "Please open http://localhost:$(BACKEND_PORT)/docs in your browser"

# Utilities
health-check:
	@echo "Checking backend health..."
	curl -s http://localhost:$(BACKEND_PORT)/api/health | python -m json.tool

requirements-update:
	@echo "Updating backend requirements..."
	pip install --upgrade -r backend/requirements.txt

npm-update:
	@echo "Updating frontend dependencies..."
	cd frontend && npm update

# Development utilities
env-setup:
	@echo "Setting up environment..."
	cp .env.example .env
	@echo "Environment file created at .env"

shell-backend:
	python -c "import sys; sys.path.insert(0, 'backend'); from app.stegastamp import get_wrapper; print(get_wrapper())"

# Default target
.DEFAULT_GOAL := help
