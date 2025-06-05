#!/bin/bash
set -e
rm -rf dist
tsc -p tsconfig.test.json
node tests/analysisDefaults.test.js
 1ccvdv-codex/implement-schema-and-typing-updates
node tests/psi.test.js

 Codex
