#!/bin/bash
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$HOME/minecraft}"
BACKUP_DIR="${BACKUP_DIR:-$COMPOSE_DIR/backups}"
WORLD_DIR="${WORLD_DIR:-$COMPOSE_DIR/server/data/worlds}"
WORLD_NAME="main-world"
CONTAINER_NAME="${CONTAINER_NAME:-minecraft-server}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

FAST_MODE=false
MAKE_BKUP=true
RESTORE_FILE=""

# Parse command line flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -F|--fast)
      FAST_MODE=true
      shift
      ;;
    -D|--no-backup)
      MAKE_BKUP=false
      shift
      ;;
    *)
      RESTORE_FILE="$1"
      shift
      ;;
  esac
done

send_cmd() {
  docker exec "$CONTAINER_NAME" sh -c "echo '$1' > /tmp/mc_pipe" 2>/dev/null || true
}

# 1. Validation
if [[ -z "$RESTORE_FILE" ]] || [[ ! -f "$RESTORE_FILE" ]]; then
  echo "Error: RESTORE_FILE standard path not provided or does not exist." >&2
  echo "Usage: $0 [-F|--fast] [-D|--no-backup] /path/to/backup.tar.gz" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# 2. Player Notification & Kick
if [[ "$FAST_MODE" == false ]]; then
  echo "Notifying players..."
  send_cmd "say Server undergoing rollback, all players will be kicked promptly."
  send_cmd "say For further details contact admins."
  sleep 10
  send_cmd "kick @a Server will be rolled-back."
  sleep 2
fi

# 3. Shutdown
echo "Stopping Docker container..."
docker stop "$CONTAINER_NAME"

# 4. Pre-Restore Safety Backup
if [[ "$MAKE_BKUP" == true ]]; then
  echo "Creating pre-restore safety backup..."
  tar -czf "$BACKUP_DIR/${DATE}-before-restore.tar.gz" -C "$WORLD_DIR" "$WORLD_NAME"
fi

# 5. Clean & Restore
echo "Restoring world data..."
rm -rf "${WORLD_DIR:?}/${WORLD_NAME:?}"
tar -xzf "$RESTORE_FILE" -C "$WORLD_DIR"

# 6. Restart Container
echo "Starting Docker container..."
docker start "$CONTAINER_NAME"

basename "$RESTORE_FILE" > .latest_restored

echo "Restore complete successfully."
