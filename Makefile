.PHONY: help setup setup-backend setup-frontend run run-backend run-frontend clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup    - Install dependencies for both backend and frontend"
	@echo "  make run      - Run both backend and frontend simultaneously"
	@echo "  make clean    - Remove virtual environments and node_modules"

# Install both backend and frontend
setup: setup-backend setup-frontend
	@echo "\n=== Setup Complete! ==="
	@echo "You can now start the application using: make run"

# Install backend dependencies
setup-backend:
	@echo "\n=== Setting up Backend ==="
	cd backend && \
	python3 -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt
	@if [ ! -f backend/.env ]; then \
		echo "Creating backend/.env from example..."; \
		cp backend/.env.example backend/.env 2>/dev/null || true; \
	fi

# Install frontend dependencies
setup-frontend:
	@echo "\n=== Setting up Frontend ==="
	cd frontend && npm install

# Run both servers in parallel
run:
	@echo "\n=== Starting ClipMagnet ==="
	@echo "Frontend will be available at http://localhost:5173"
	@echo "Backend will be running at http://localhost:8000"
	@echo "Press Ctrl+C to stop both servers.\n"
	$(MAKE) -j 2 run-backend run-frontend

# Run backend development server
run-backend:
	cd backend && \
	. venv/bin/activate && \
	uvicorn main:app --reload

# Run frontend development server
run-frontend:
	cd frontend && npm run dev

# Clean up build artifacts and dependencies
clean:
	@echo "\n=== Cleaning up ==="
	rm -rf backend/venv
	rm -rf frontend/node_modules
	rm -rf backend/__pycache__
	@echo "Clean complete."
