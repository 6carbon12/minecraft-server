#!/bin/bash
set -euo pipefail

COMMAND=$1
CONTAINER_NAME="${CONTAINER_NAME:-minecraft-server}"

# 1. Start a background process that follows only NEW logs
docker logs --tail 0 -f "${CONTAINER_NAME}" &
LOG_PID=$!

# 2. Execute your command
docker exec "${CONTAINER_NAME}" sh -c "echo \"${COMMAND}\" > /tmp/mc_pipe"
sleep 1

# The resulting logs will now stream directly to your terminal.
# 3. When you are done capturing or viewing, cleanly terminate the background process:
kill $LOG_PID
