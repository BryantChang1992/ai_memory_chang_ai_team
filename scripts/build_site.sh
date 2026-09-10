#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Use the same build and static-file copying in local verification and CI.
destination="${1:-_site}"
JEKYLL_ENV=production bundle exec jekyll build --destination "$destination"
python3 scripts/copy_static.py "$destination"
