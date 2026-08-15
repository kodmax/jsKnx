#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

echo "==> Format"
yarn format:ci

echo "==> Lint"
yarn lint:ci

echo "==> Typecheck"
yarn typecheck

echo "==> Build (release: turbo --force)"
yarn turbo run build --force

echo "==> Test"
yarn test

echo "==> Publish dry-run (packages/js-knx)"
cd packages/js-knx
npm publish --dry-run --access public --provenance --registry https://registry.npmjs.org
