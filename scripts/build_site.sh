#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Use the same build and static-file copying in local verification and CI.
destination="${1:-_site}"
JEKYLL_ENV=production bundle exec jekyll build --destination "$destination"
python3 scripts/copy_static.py "$destination"

# The training app is exported independently, then copied after Jekyll so its
# underscore-prefixed framework assets are preserved verbatim.
training_output="projects/storage-lab/out"
if [[ ! -f "$training_output/index.html" ]]; then
  echo "Storage Lab export missing. Run npm ci and npm run build:pages in projects/storage-lab first." >&2
  exit 1
fi
mkdir -p "$destination/storage-lab"
cp -R "$training_output/." "$destination/storage-lab/"
