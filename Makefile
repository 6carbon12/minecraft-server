.PHONY: dev prod

dev:
	@echo "Configuring for Development..."
	@ln -sf docker-compose.dev.yml docker-compose.override.yml
	@echo "Ready. Run 'docker compose up -d' to start the dev server."

prod:
	@echo "Restoring Production Default..."
	@rm -f docker-compose.override.yml
	@echo "Ready. Run 'docker compose up -d' to start the prod server."
