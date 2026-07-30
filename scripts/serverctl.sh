#!/bin/bash
set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-minecraft-server}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    status)
      docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}
      shift
      ;;
    start)
      docker start ${CONTAINER_NAME}
      shift
      ;;
    stop)
      docker stop ${CONTAINER_NAME}
      shift
      ;;
    restart)
      docker stop ${CONTAINER_NAME}
      docker start ${CONTAINER_NAME}
      shift
      ;;
    logs)
      docker logs ${CONTAINER_NAME}
      shift
      ;;
    *)
      shift
      ;;
  esac
done
