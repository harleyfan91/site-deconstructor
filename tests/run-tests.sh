#!/bin/bash
set -e
rm -rf dist
tsc -p tsconfig.test.json
node tests/analysisDefaults.test.js
