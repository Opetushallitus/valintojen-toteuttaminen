#!/bin/bash
set -euo pipefail

PLAYWRIGHT_VERSION=$(pnpm list --depth 0 --json @playwright/test | node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync(0, 'utf8')); const entry = data.find(pkg => pkg.name === '@playwright/test'); if (!entry || !entry.version) { process.exit(1); } console.log(entry.version.replace(/^@playwright\\/test@/, ''));")

docker run -e CI --mount type=bind,source="$PWD",target=/app --user "$(id -u):$(id -g)" -w /app --ipc=host --net=host mcr.microsoft.com/playwright:v"$PLAYWRIGHT_VERSION" npx playwright test "$@"
