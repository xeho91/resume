# Import variables from .env file
include ./config/.env

BUILD_BASE_DIR := build
BUILD_DIR      := ${BUILD_BASE_DIR}/${NODE_ENV}

# ============================================================================ #
# Tasks
# ============================================================================ #
install:
	@ pnpm install
	@ pipenv install

build:
	pnpm build

clean:
	@ rm --recursive --force $(BUILD_BASE_DIR)
	@ echo "Removed build directory."

fonts:
	@ ./scripts/generate-font-subsets.sh
	@ echo "Font subsets generated."

pdf:
	@ node ./scripts/generatePDF.js
	@ echo "PDF file generated."

deploy:
	@ git add --force $(BUILD_DIR)
	@ git commit --message "Deploy the production build"
	@ git tag deploy --force
	@ git subtree push --prefix $(BUILD_DIR) $(PRODUCTION_REPO) $(PRODUCTION_BRANCH)
	@ echo "Deploying the production build finished."

# ============================================================================ #

.PHONY: install build clean deploy
