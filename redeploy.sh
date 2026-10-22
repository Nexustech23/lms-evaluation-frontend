#!/usr/bin/env bash
# Run: bash redeploy.sh in /home/ubuntu/lms-evaluation-frontend-new.
# Wait for active uploads before redeploying.
set -Eeuo pipefail
cd "$(dirname "$0")"

# Serialize deployments of this project, including image retention/cleanup.
exec 9>".git/lms-deploy.lock"
flock -n 9 || { echo "Another deployment is running." >&2; exit 1; }
if [ "$(git branch --show-current)" != main ]; then
  echo "Switch to main before deploying." >&2
  exit 1
fi
git pull --ff-only origin main

SERVICE=lms-frontend
ROLLBACK_IMAGE=local/lms-frontend:rollback
BACKUP_IMAGE=local/lms-frontend:deploy-backup
CACHE_KEEP="${BUILD_CACHE_KEEP:-2GB}"
old_image=$(docker inspect --format '{{.Image}}' "$SERVICE" 2>/dev/null || true)
old_rollback=$(docker image inspect --format '{{.Id}}' "$ROLLBACK_IMAGE" 2>/dev/null || true)
if [ -n "$old_image" ]; then
  # Protect the running release before its Compose image tag is replaced.
  docker image tag "$old_image" "$BACKUP_IMAGE"
fi
trap 'echo "Deployment stopped. Check the error above; retain rollback/backup images for recovery." >&2' ERR

echo "==> Building standalone frontend..."
docker compose build "$SERVICE"
docker compose up -d --no-build --no-deps "$SERVICE"

healthy=false
for attempt in {1..30}; do
  if [ "$(docker inspect --format '{{.State.Running}}' "$SERVICE")" = true ] &&
    docker compose exec -T "$SERVICE" node -e '
      fetch("http://127.0.0.1:3000/", {signal: AbortSignal.timeout(5000)})
        .then(r => { if (!r.ok) process.exit(1); })
        .catch(() => process.exit(1));' >/dev/null 2>&1; then
    healthy=true
    break
  fi
  sleep 2
done
if [ "$healthy" != true ]; then
  echo "Frontend health check failed. No cleanup performed. Backup: $BACKUP_IMAGE" >&2
  exit 1
fi

new_image=$(docker inspect --format '{{.Image}}' "$SERVICE")
if [ -n "$old_image" ] && [ "$old_image" != "$new_image" ]; then
  docker image tag "$old_image" "$ROLLBACK_IMAGE"
fi
# A no-change redeploy retains the existing rollback instead of replacing it.
if [ -n "$old_image" ]; then
  docker image rm --no-prune "$BACKUP_IMAGE" >/dev/null
fi
rollback_image=$(docker image inspect --format '{{.Id}}' "$ROLLBACK_IMAGE" 2>/dev/null || true)
if [ -n "$old_rollback" ] && [ "$old_rollback" != "$rollback_image" ] && [ "$old_rollback" != "$new_image" ]; then
  # Exact superseded project image only; never force removal of images in use
  # or images with other tags. Never prune containers, volumes or networks.
  docker image rm --no-prune "$old_rollback" || echo "Old image is still referenced; retained."
fi

echo "==> Healthy. Cleaning unused build cache (shared Docker cache; keep $CACHE_KEEP)..."
docker builder prune -af --keep-storage "$CACHE_KEEP" || echo "Cache cleanup failed; deployment remains healthy."
echo "==> Frontend deployed. Previous release retained as $ROLLBACK_IMAGE (when available)."
df -h /
