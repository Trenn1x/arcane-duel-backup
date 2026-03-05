#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8093}"
SERVER_LOG="/tmp/beaverforge-server-${PORT}.log"
NGROK_LOG="/tmp/beaverforge-ngrok-${PORT}.log"

cd "${ROOT_DIR}"

if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} is in use. Stop that process or pass another port."
  exit 1
fi

echo "Starting Beaverforge server on ${PORT}..."
nohup env BEAVERFORGE_PORT="${PORT}" python3 server.py >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!
sleep 1

if ! ps -p "${SERVER_PID}" >/dev/null 2>&1; then
  echo "Server failed to start. Log:"
  cat "${SERVER_LOG}" || true
  exit 1
fi

echo "Starting ngrok tunnel..."
nohup ngrok http "${PORT}" --log=stdout --log-format=json >"${NGROK_LOG}" 2>&1 &
NGROK_PID=$!
sleep 2

TUNNEL_URL=""
for _ in {1..20}; do
  TUNNEL_URL="$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c 'import json,sys; d=json.load(sys.stdin); ts=d.get("tunnels",[]); print(ts[0]["public_url"] if ts else "")' 2>/dev/null || true)"
  if [[ -n "${TUNNEL_URL}" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "${TUNNEL_URL}" ]]; then
  echo "Tunnel URL not found yet. Check ${NGROK_LOG}"
  exit 1
fi

echo
echo "trenn1x session is live."
echo "Play URL: ${TUNNEL_URL}"
echo "Invite URL: ${TUNNEL_URL}?join=ROOMCODE"
echo "Server PID: ${SERVER_PID} | ngrok PID: ${NGROK_PID}"
echo "Logs: ${SERVER_LOG} | ${NGROK_LOG}"
