#!/usr/bin/env bash
# Ensures process.env / import.meta.env are only used in env.ts files and config files.
# App code must import the validated env object instead.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

ALLOWED_FILES=(
  "apps/backend/src/env.ts"
  "apps/store/src/env.ts"
)

CONFIG_GLOBS=(
  "*.config.ts"
  "*.config.js"
  "*.config.mjs"
)

violations=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  rel="${file#"$REPO_ROOT/"}"

  # Skip allowed env files
  skip=false
  for allowed in "${ALLOWED_FILES[@]}"; do
    if [[ "$rel" == "$allowed" ]]; then
      skip=true
      break
    fi
  done
  $skip && continue

  # Skip config files
  basename="$(basename "$rel")"
  for glob in "${CONFIG_GLOBS[@]}"; do
    # shellcheck disable=SC2254
    case "$basename" in
      $glob) skip=true; break ;;
    esac
  done
  $skip && continue

  # Collect violations from this file
  while IFS=: read -r lineno line; do
    if [[ $violations -eq 0 ]]; then
      echo ""
      echo -e "${RED}${BOLD}check-env-usage${RESET} ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
      echo ""
      echo -e "  ${RED}✖${RESET} Do not use ${YELLOW}process.env${RESET} or ${YELLOW}import.meta.env${RESET} directly."
      echo -e "    Import the validated ${CYAN}env${RESET} object from ${CYAN}env.ts${RESET} instead."
      echo ""
    fi
    # Highlight the violation in the line
    highlighted=$(echo "$line" | sed \
      -e "s/process\.env/$(printf "${RED}${BOLD}")process.env$(printf "${RESET}")/g" \
      -e "s/import\.meta\.env/$(printf "${RED}${BOLD}")import.meta.env$(printf "${RESET}")/g")
    echo -e "  ${DIM}${rel}:${lineno}${RESET}"
    echo -e "    ${highlighted}"
    echo ""
    violations=$((violations + 1))
  done < <(grep -n 'process\.env\|import\.meta\.env' "$file")
done < <(grep -rl 'process\.env\|import\.meta\.env' \
  "$REPO_ROOT/apps/backend/src" \
  "$REPO_ROOT/apps/store/src" \
  --include='*.ts' --include='*.tsx' 2>/dev/null || true)

if [[ $violations -gt 0 ]]; then
  echo -e "  Found ${RED}${violations}${RESET} violation(s)."
  echo ""
  exit 1
fi

echo -e "${GREEN}✔${RESET} No direct process.env / import.meta.env usage outside env.ts."
