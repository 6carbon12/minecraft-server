#!/bin/bash
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$HOME/minecraft}"
BACKUP_DIR="${BACKUP_DIR:-$COMPOSE_DIR/backups}"
WORLD_DIR="${WORLD_DIR:-$COMPOSE_DIR/server/data/worlds}"
WORLD_NAME="main-world"
CONTAINER_NAME="${CONTAINER_NAME:-minecraft-server}"

CUSTOM_NAME="${1:-}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

if [[ -n "$CUSTOM_NAME" ]]; then
  # Sanitize name to prevent path traversal / illegal file chars
  CLEAN_NAME=$(echo "$CUSTOM_NAME" | sed 's/[^a-zA-Z0-9_-]/_/g')
  BACKUP_FILENAME="${DATE}_${CLEAN_NAME}.tar.gz"
else
  BACKUP_FILENAME="${DATE}.tar.gz"
fi

STAGE_DIR=$(mktemp -d -t mc_bkup_XXXXXX)
WORLD_LOCKED=false

mkdir -p "$BACKUP_DIR"

send_cmd() {
  docker exec "$CONTAINER_NAME" sh -c "echo '$1' > /tmp/mc_pipe" 2>/dev/null || true
}

# In any unexpected exits make sure to unfreeze the world state
cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "Error occurred (code $exit_code), releasing world hold..." >&2
  fi

  if [[ "$WORLD_LOCKED" == true ]]; then
    echo "Unfreezing world state in cleanup..."
    send_cmd "save resume"
    WORLD_LOCKED=false
  fi
  rm -rf "$STAGE_DIR"
}
trap cleanup EXIT

echo "Freezing world state..."
send_cmd "save hold"
WORLD_LOCKED=true

echo "Querying file manifest..."
MANIFEST=""
for i in {1..15}; do
  sleep 1
  send_cmd "save query"

  LOGS=$(docker logs --tail 30 "$CONTAINER_NAME" 2>&1 || true)

  if echo "$LOGS" | grep -q "Data saved. Files are now ready to be copied."; then
    # Grab the line containing the comma-separated file list (e.g., main-world/db/...:1234)
    MANIFEST=$(echo "$LOGS" | grep -E "${WORLD_NAME}/.*:[0-9]+" | tail -n1 || true)
    if [[ -n "$MANIFEST" ]]; then
      break
    fi
  fi
done

if [[ -z "$MANIFEST" ]]; then
  echo "ERROR: Timed out waiting for Bedrock file manifest from save query!" >&2
  exit 1
fi

MANIFEST_LIST_FILE="$STAGE_DIR/manifest_files.txt"
touch "$MANIFEST_LIST_FILE"

echo "$MANIFEST" | tr ',' '\n' | while IFS=':' read -r rel_path byte_limit; do
  rel_path=$(echo "$rel_path" | xargs)
  if [[ -n "$rel_path" ]]; then
    clean_path="${rel_path#$WORLD_NAME/}"
    echo "$clean_path" >> "$MANIFEST_LIST_FILE"
  fi
done

echo "Copying static files NOT listed in manifest..."
(
  cd "$WORLD_DIR/$WORLD_NAME"
  # Copy files except those in the manifest list
  find . -type f | while read -r file; do
    rel_file="${file#./}"
    if ! grep -qxF "$rel_file" "$MANIFEST_LIST_FILE"; then
      mkdir -p "$STAGE_DIR/$WORLD_NAME/$(dirname "$rel_file")"
      cp "$file" "$STAGE_DIR/$WORLD_NAME/$rel_file"
    fi
  done
)

echo "Copying and truncating manifest files..."
echo "$MANIFEST" | tr ',' '\n' | while IFS=':' read -r rel_path byte_limit; do
  rel_path=$(echo "$rel_path" | xargs)
  byte_limit=$(echo "$byte_limit" | xargs)

  clean_path="${rel_path#$WORLD_NAME/}"
  src_file="$WORLD_DIR/$WORLD_NAME/$clean_path"
  dest_file="$STAGE_DIR/$WORLD_NAME/$clean_path"

  mkdir -p "$(dirname "$dest_file")"

  if [[ -f "$src_file" && -n "$byte_limit" ]]; then
    # Copy exactly the required bytes
    head -c "$byte_limit" "$src_file" > "$dest_file"
  fi
done

echo "Unfreezing world state..."
send_cmd "save resume"
WORLD_LOCKED=false

echo "Making backup..."
tar -czf "$BACKUP_DIR/$BACKUP_FILENAME" -C "$STAGE_DIR" "$WORLD_NAME"

echo "Cleaning up old backups..."
find "${BACKUP_DIR:?}" -type f -name "*.tar.gz" -mtime +21 -delete

echo "Backup complete."
