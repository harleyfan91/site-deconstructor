#!/bin/bash
set -e
rm -rf dist
tsc -p tsconfig.test.json
node tests/analysisDefaults.test.js
node tests/psi.test.js
node tests/accessibility.test.js
node tests/securityHeaders.test.js
node tests/social.test.js
node tests/ui.test.js
node tests/colorFrequency.test.js
node tests/export.test.js
node tests/seo.test.js

