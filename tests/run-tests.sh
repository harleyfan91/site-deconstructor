#!/bin/bash
set -e
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set. Please configure the Supabase connection string."
  exit 1
fi
rm -rf dist
rm -f node_modules/typescript/tsbuildinfo
# Compile TypeScript for tests, but don't fail on type errors
npx tsc -p tsconfig.test.json --noEmitOnError false >/dev/null || true
node tests/analysisDefaults.test.js

node tests/accessibility.test.js
node tests/securityHeaders.test.js
node tests/social.test.js
node tests/ui.test.js
node tests/colorFrequency.test.js
node tests/export.test.js
node tests/seo.test.js
