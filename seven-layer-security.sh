#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${ROOT_DIR}/haclathon"
SERVER_DIR="${PROJECT_DIR}/server"
CLIENT_DIR="${PROJECT_DIR}/client"
REPORT_DIR="${PROJECT_DIR}/security-reports"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="${REPORT_DIR}/security-${TIMESTAMP}.log"

MODE="audit"
if [[ "${1:-}" == "--apply" ]]; then
  MODE="apply"
fi

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

mkdir -p "${REPORT_DIR}"

print_line() {
  local message="$1"
  echo "${message}" | tee -a "${REPORT_FILE}"
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  print_line "[PASS] $1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  print_line "[WARN] $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  print_line "[FAIL] $1"
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

check_file_contains() {
  local file="$1"
  local needle="$2"
  if grep -q "${needle}" "${file}"; then
    return 0
  fi
  return 1
}

file_perm() {
  local file="$1"
  if stat -c "%a" "${file}" >/dev/null 2>&1; then
    stat -c "%a" "${file}"
  else
    stat -f "%Lp" "${file}"
  fi
}

run_npm_audit() {
  local target_dir="$1"
  local target_name="$2"
  local output_file
  output_file="${REPORT_DIR}/npm-audit-${target_name}-${TIMESTAMP}.txt"

  if [[ ! -f "${target_dir}/package.json" ]]; then
    warn "${target_name}: package.json not found; skipped npm audit"
    return
  fi

  if (cd "${target_dir}" && npm audit --omit=dev --audit-level=high >"${output_file}" 2>&1); then
    pass "${target_name}: npm audit found no high/critical runtime vulnerabilities"
  else
    fail "${target_name}: npm audit reported high/critical runtime vulnerabilities (see ${output_file})"
  fi
}

print_line "=============================================="
print_line "SecurePay 7-Layer Security Script"
print_line "Mode: ${MODE}"
print_line "Report: ${REPORT_FILE}"
print_line "=============================================="

if [[ ! -d "${PROJECT_DIR}" || ! -d "${SERVER_DIR}" || ! -d "${CLIENT_DIR}" ]]; then
  fail "Expected structure not found. Run from repository root containing haclathon/server and haclathon/client."
  exit 1
fi

print_line ""
print_line "Layer 1 - Host and Runtime Baseline"
if has_cmd node; then
  pass "Node.js installed: $(node -v)"
else
  fail "Node.js is required but missing"
fi

if has_cmd npm; then
  pass "npm installed: $(npm -v)"
else
  fail "npm is required but missing"
fi

if [[ "${EUID}" -eq 0 ]]; then
  warn "Running as root is discouraged; use least-privilege user"
else
  pass "Running as non-root user"
fi

if has_cmd ufw; then
  if ufw status 2>/dev/null | grep -q "Status: active"; then
    pass "UFW firewall is active"
  else
    warn "UFW is installed but inactive"
  fi
else
  warn "UFW not detected (acceptable on non-Ubuntu hosts)"
fi

print_line ""
print_line "Layer 2 - Secrets and File Hygiene"
if [[ -f "${SERVER_DIR}/.gitignore" ]] && check_file_contains "${SERVER_DIR}/.gitignore" ".env"; then
  pass "server/.gitignore protects .env files"
else
  fail "server/.gitignore should include .env"
fi

if [[ -f "${CLIENT_DIR}/.gitignore" ]] && check_file_contains "${CLIENT_DIR}/.gitignore" ".env"; then
  pass "client/.gitignore protects .env files"
else
  warn "client/.gitignore does not explicitly include .env"
fi

if [[ -f "${SERVER_DIR}/.env" ]]; then
  current_perm="$(file_perm "${SERVER_DIR}/.env")"
  if [[ "${current_perm}" -le 640 ]]; then
    pass "server/.env permissions are restricted (${current_perm})"
  else
    if [[ "${MODE}" == "apply" ]]; then
      chmod 600 "${SERVER_DIR}/.env"
      pass "server/.env permissions hardened to 600"
    else
      fail "server/.env permissions are too open (${current_perm}); run with --apply to harden"
    fi
  fi
else
  warn "server/.env not found (expected for local execution)"
fi

if has_cmd rg; then
  secret_hits="$(rg -n --glob '!**/node_modules/**' --glob '!**/package-lock.json' --glob '!**/*.md' '(secret|api[_-]?key|private[_-]?key|password)\s*[:=]\s*["\'\`][^"\'\`]{10,}' "${PROJECT_DIR}" || true)"
  if [[ -z "${secret_hits}" ]]; then
    pass "No obvious hard-coded secret values detected by quick scan"
  else
    fail "Potential hard-coded secrets detected. Review findings in this report."
    print_line "${secret_hits}"
  fi
else
  warn "ripgrep not installed; skipped hard-coded secret scan"
fi

print_line ""
print_line "Layer 3 - Identity and Access Controls"
if check_file_contains "${SERVER_DIR}/controllers/authController.js" "bcrypt"; then
  pass "Password hashing with bcrypt is present"
else
  fail "bcrypt usage missing in auth controller"
fi

if check_file_contains "${SERVER_DIR}/middleware/authMiddleware.js" "verifyAuthToken"; then
  pass "JWT verification middleware detected"
else
  fail "JWT verification middleware not detected"
fi

if check_file_contains "${SERVER_DIR}/routes/wallet.js" "requireAuth" && check_file_contains "${SERVER_DIR}/routes/fraud.js" "requireAuth"; then
  pass "Protected routes enforce authentication"
else
  fail "Some sensitive routes appear to be missing requireAuth"
fi

print_line ""
print_line "Layer 4 - API Surface Hardening"
if check_file_contains "${SERVER_DIR}/index.js" "helmet"; then
  pass "Helmet middleware enabled"
else
  fail "Helmet middleware missing"
fi

if check_file_contains "${SERVER_DIR}/index.js" "allowedOrigins" && ! check_file_contains "${SERVER_DIR}/index.js" "origin: '*'"; then
  pass "CORS appears allowlist-based"
else
  fail "CORS configuration may be too permissive"
fi

if check_file_contains "${SERVER_DIR}/middleware/rateLimiter.js" "loginLimiter"; then
  pass "Login rate limiter is defined"
else
  fail "Login rate limiter definition missing"
fi

if grep -R "loginLimiter\|globalLimiter" "${SERVER_DIR}"/*.js "${SERVER_DIR}"/routes/*.js >/dev/null 2>&1; then
  pass "Rate limiter appears wired into server or route files"
else
  fail "Rate limiter found but not wired; enforce in index.js and /auth/login"
fi

print_line ""
print_line "Layer 5 - Data and Crypto Protection"
if check_file_contains "${SERVER_DIR}/config/env.js" "AES_SECRET_KEY must be a 32-byte hex string"; then
  pass "AES key format validation is enforced"
else
  fail "AES key format validation is missing"
fi

if check_file_contains "${SERVER_DIR}/utils/encryption.js" "aes-256-gcm"; then
  pass "AES-256-GCM encryption implementation detected"
else
  fail "AES-256-GCM implementation not found"
fi

if check_file_contains "${SERVER_DIR}/models/Transaction.js" "encrypted_payload"; then
  pass "Encrypted transaction payload model field is present"
else
  warn "Encrypted payload field not found in transaction model"
fi

print_line ""
print_line "Layer 6 - Supply Chain and Dependency Security"
if has_cmd npm; then
  run_npm_audit "${SERVER_DIR}" "server"
  run_npm_audit "${CLIENT_DIR}" "client"
else
  fail "npm not available; dependency audit cannot run"
fi

print_line ""
print_line "Layer 7 - Monitoring, Auditability, and Integrity"
if [[ -f "${SERVER_DIR}/services/auditLogger.js" ]]; then
  pass "Audit logger service exists"
else
  fail "Audit logger service missing"
fi

if check_file_contains "${SERVER_DIR}/controllers/fraudController.js" "socket"; then
  pass "Real-time fraud alerting hooks detected"
else
  warn "Fraud controller does not show explicit socket usage"
fi

if has_cmd sha256sum; then
  (
    cd "${PROJECT_DIR}"
    sha256sum server/index.js server/config/env.js server/utils/encryption.js > "${REPORT_DIR}/integrity-${TIMESTAMP}.sha256"
  )
  pass "Integrity hashes generated at ${REPORT_DIR}/integrity-${TIMESTAMP}.sha256"
elif has_cmd shasum; then
  (
    cd "${PROJECT_DIR}"
    shasum -a 256 server/index.js server/config/env.js server/utils/encryption.js > "${REPORT_DIR}/integrity-${TIMESTAMP}.sha256"
  )
  pass "Integrity hashes generated at ${REPORT_DIR}/integrity-${TIMESTAMP}.sha256"
else
  warn "No SHA-256 utility found; skipped integrity hash generation"
fi

print_line ""
print_line "================ Summary ================"
print_line "Pass: ${PASS_COUNT}"
print_line "Warn: ${WARN_COUNT}"
print_line "Fail: ${FAIL_COUNT}"
print_line "Report written to: ${REPORT_FILE}"
print_line "========================================="

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi

exit 0