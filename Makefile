.PHONY: install dev build clean docker-up docker-down db-migrate db-seed test lint

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

clean:
	pnpm clean

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

db-migrate:
	cd apps/api && pnpm prisma migrate dev

db-seed:
	cd apps/api && pnpm prisma db seed

db-reset:
	cd apps/api && pnpm prisma migrate reset

test:
	pnpm test

lint:
	pnpm lint

# Full setup for new development
setup: install docker-up db-migrate
	@echo "✅ Setup complete! Run 'make dev' to start."

# Production deployment
deploy:
	pnpm build
	@echo "🚀 Ready for deployment"
