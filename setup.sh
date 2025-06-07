#!/usr/bin/env bash
# Setup script run by Codex to prepare the workspace.
set -euo pipefail

# Install dependencies according to package-lock.json
npm ci --legacy-peer-deps
