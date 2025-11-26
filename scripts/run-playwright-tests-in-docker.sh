#!/bin/bash
set -euo pipefail

PLAYWRIGHT_VERSION=$(node -e "console.log(require('@playwright/test/package.json').version)")
echo "Running Playwright tests in Docker image mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}"

docker run -e CI --mount type=bind,source="$PWD",target=/app --user "$(id -u):$(id -g)" -w /app --ipc=host --net=host mcr.microsoft.com/playwright:v"$PLAYWRIGHT_VERSION" npx playwright test "$@"
