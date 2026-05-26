#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/home/toby/campaign-packet-ui"
URL="http://127.0.0.1:45880"
LOG_DIR="$HOME/.local/share/campaign-packet-ui"
PID_FILE="$LOG_DIR/server.pid"
LOG_FILE="$LOG_DIR/server.log"
mkdir -p "$LOG_DIR"
cd "$APP_DIR"
if [ ! -d node_modules ]; then
  npm install >>"$LOG_FILE" 2>&1
fi
if [ ! -f dist/index.html ]; then
  npm run build >>"$LOG_FILE" 2>&1
fi
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  :
else
  nohup npm run start >>"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
fi
for i in {1..40}; do
  if curl -fsS "$URL/api/health" >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
    exit 0
  fi
  sleep 0.25
done
echo "Campaign Packet Viewer failed to start. Log: $LOG_FILE" >&2
exit 1
