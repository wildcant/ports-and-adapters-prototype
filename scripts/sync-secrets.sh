#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./scripts/sync-secrets.sh <worker-name>"
  exit 1
fi

WORKER_NAME="$1"
ENV_FILE=".env"
KEYS_FILE=".env.keys.production"

if [ ! -f "$KEYS_FILE" ]; then
  echo "Error: $KEYS_FILE not found. Only admins with the production key can sync secrets."
  exit 1
fi

DOTENV_PRIVATE_KEY=$(grep '^DOTENV_PRIVATE_KEY=' "$KEYS_FILE" | cut -d'=' -f2)
export DOTENV_PRIVATE_KEY

dotenvx get -f "$ENV_FILE" --format json \
  | jq -r 'to_entries[] | select(.key | startswith("DOTENV_") | not) | @base64' \
  | while read -r entry; do
      key=$(echo "$entry" | base64 -d | jq -r '.key')
      value=$(echo "$entry" | base64 -d | jq -r '.value')
      echo "Setting $key..."
      echo "$value" | npx wrangler secret put "$key" --name "$WORKER_NAME"
    done

echo "Done."
