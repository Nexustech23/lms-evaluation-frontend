#!/bin/bash
# Run this on the server (nexus1) inside /home/ubuntu/lms-evaluation-frontend
# whenever frontend code changes need to go live.
set -e

cd "$(dirname "$0")"

echo "==> Pulling latest code..."
git pull

echo "==> Rebuilding image (API_URL build-arg is read from .env automatically)..."
docker compose build lms-frontend

echo "==> Recreating container..."
docker compose up -d lms-frontend

echo "==> Verifying network attachment..."
docker network inspect lms-shared --format "Containers on lms-shared: {{range .Containers}}{{.Name}} {{end}}"

echo "==> Done. Check: http://103.192.198.186:3000"
