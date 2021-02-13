# Import variables from .env file
include ./config/.env

BUILD_BASE_DIR  := ./build
BUILD_DIR       := ./${BUILD_BASE_DIR}/${NODE_ENV}

PRODUCTION_REPO := ssh://${SSH_USERNAME}@${SSH_HOSTNAME}/${PRODUCTION_GIT_PATH}

# ============================================================================ #
# Install tasks
# ============================================================================ #
install:
	pnpm install

# ============================================================================ #
# Build tasks
# ============================================================================ #
build:
	pnpm build

# ============================================================================ #
# Creating Git repositories
# ============================================================================ #
create-production-repo:
	@ cd $(BUILD_DIR) && \
		git init && \
		git remote add origin $(PRODUCTION_REPO)

# ============================================================================ #
# Sub-tasks
# ============================================================================ #

clean:
	@ rm --recursive --force $(BUILD_BASE_DIR)

deploy: build create-production-repo
	@ cd $(BUILD_DIR) && \
		git add --all && \
		git commit --message 'Deploying the latest "$(NODE_ENV)" build' && \
		git push --force origin +main:refs/heads/main
	@ git tag --force $(NODE_ENV)
	@ echo "Deploying the \"$(NODE_ENV)\" build completed!"

# ============================================================================ #

.PHONY: install build clean deploy
