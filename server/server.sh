#!/bin/bash

PIPE=/tmp/mc_pipe
[ -p $PIPE ] || mkfifo $PIPE

graceful_shutdown() {
  echo "Stopping server via SIGTERM..."
  echo "stop" > $PIPE
  wait $SERVER_PID
  rm $PIPE
  echo "Server Stopped."
  exit 0
}

trap 'graceful_shutdown' SIGTERM

export LD_LIBRARY_PATH=.
( tail -f $PIPE ) | box64 ./bedrock_server &
SERVER_PID=$!

echo "Server started. To send commands, run: docker exec minecraft-server sh -c 'echo \"command\" > $PIPE'"

wait $SERVER_PID
