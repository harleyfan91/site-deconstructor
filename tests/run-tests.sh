#!/bin/bash
set -e
rm -rf dist
tsc -p tsconfig.test.json
node tests/analysisDefaults.test.js
node tests/psi.test.js
node tests/accessibility.test.js
node tests/securityHeaders.test.js
