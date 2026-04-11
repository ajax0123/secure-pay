#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FAILED=0

fail() {
  echo "[FAIL] $1"
  FAILED=1
}

pass() {
  echo "[PASS] $1"
}

require_no_match() {
  local pattern="$1"
  local description="$2"
  if grep -E -r --exclude-dir=node_modules --exclude=package-lock.json --exclude=enforce-repo-guardrails.sh "$pattern" "$ROOT_DIR" >/dev/null 2>&1; then
    fail "$description"
  else
    pass "$description"
  fi
}

require_match() {
  local pattern="$1"
  local file="$2"
  local description="$3"
  if grep -E -n "$pattern" "$file" >/dev/null 2>&1; then
    pass "$description"
  else
    fail "$description"
  fi
}

echo "Running repository security guardrails..."

# 0) Clean up any stray node_modules directories to ensure clean dependency installs
echo "Cleaning up node_modules directories..."
find "$ROOT_DIR" -maxdepth 2 -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
echo "Cleaned up node_modules directories."

# 1) No insecure fallback secrets.
require_no_match "fallback_secret|default_hmac_secret|default_key_must_be_32_characters_" "No hardcoded fallback secrets remain"

# 2) No wildcard CORS in server code.
require_no_match "cors\\(\\s*\\)" "No open CORS middleware calls"
require_no_match "origin:\\s*['\"]\\*['\"]" "No wildcard CORS origin policies"

# 3) Haclathon backend must apply global and login-specific rate limiting.
require_match "app\.use\(globalLimiter\)" "$ROOT_DIR/haclathon/server/index.js" "Global limiter is wired in haclathon backend"
require_match "loginLimiter" "$ROOT_DIR/haclathon/server/routes/auth.js" "Login limiter is wired in haclathon auth routes"

# 4) Securepay must enforce environment-backed secrets.
require_match "env\.auth\.tokenExpiry|from '../config/env\.ts'" "$ROOT_DIR/securepay/server/src/controllers/authController.ts" "Securepay auth controller uses centralized env config"
require_match "from '../config/env\.ts'" "$ROOT_DIR/securepay/server/src/middleware/authMiddleware.ts" "Securepay auth middleware uses centralized env config"

# 5) Securepay encryption must use AES-GCM via centralized config.
require_match "env\.encryption\.algorithm" "$ROOT_DIR/securepay/server/src/services/encryptionService.ts" "Securepay encryption uses AES-256-GCM"

if [[ "$FAILED" -ne 0 ]]; then
  echo "One or more policy checks failed."
  exit 1
fi

echo "All repository security guardrails passed."
