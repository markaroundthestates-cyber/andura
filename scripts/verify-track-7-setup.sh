#!/bin/bash
# Track 7 setup verification — runs ALL 6 checks per Daniel directive.
#
# USAGE (Option A — Daniel local cu gh CLI + env vars):
#   1. winget install GitHub.cli  # (sau download from https://cli.github.com/)
#   2. gh auth login
#   3. Export secrets ca env vars (NU în terminal history — paste-only into shell):
#      export ANTHROPIC_API_KEY="sk-ant-..."
#      export CHECKLY_API_KEY="cu_..."
#      export CHECKLY_ACCOUNT_ID="..."
#      export BROWSERBASE_API_KEY="bb_live_..."
#      export SNYK_TOKEN="..."
#      export FIREBASE_SA_PATH="/path/to/firebase-service-account.json"
#   4. bash scripts/verify-track-7-setup.sh > setup-verify.log 2>&1
#   5. Paste content of setup-verify.log to CC chat OR commit la 📤_outbox/SETUP_VERIFICATION.md
#
# USAGE (Option B — CI workflow without local gh CLI):
#   Trigger .github/workflows/verify-track-7-setup.yml manually:
#     1. GitHub repo → Actions tab → "Verify Track 7 Setup" workflow → Run workflow
#     2. Wait completion (~2 min)
#     3. Open run logs → copy summary table to 📤_outbox/SETUP_VERIFICATION.md

set -uo pipefail

REPO="markaroundthestates-cyber/andura"
EXPECTED_SECRETS=(
  "ANTHROPIC_API_KEY"
  "BROWSERBASE_API_KEY"
  "BROWSERBASE_PROJECT_ID"
  "CHECKLY_API_KEY"
  "CHECKLY_ACCOUNT_ID"
  "FIREBASE_SERVICE_ACCOUNT"
  "LHCI_GITHUB_APP_TOKEN"
  "PLAYWRIGHT_AUTH_TEST_UID"
  "SNYK_TOKEN"
)
EXPECTED_LABELS=(
  "exploration-anomaly"
  "nightly-stagehand"
  "severity-p0"
  "severity-p1"
  "severity-p2"
  "severity-p3"
)

FAILED=0
WARNED=0

print_section() {
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "$1"
  echo "════════════════════════════════════════════════════════════════"
}

# ───────────────────────────────────────────────────────────────────────────
print_section "§1 GitHub Secrets list (9 expected)"
# ───────────────────────────────────────────────────────────────────────────
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ gh CLI NOT installed. Install: winget install GitHub.cli"
  FAILED=$((FAILED + 9))
else
  SECRET_NAMES=$(gh secret list --repo "$REPO" --json name --jq '.[].name' 2>/dev/null | sort)
  if [ -z "$SECRET_NAMES" ]; then
    echo "❌ Cannot list secrets — auth issue? Run: gh auth status"
    FAILED=$((FAILED + 9))
  else
    for expected in "${EXPECTED_SECRETS[@]}"; do
      if echo "$SECRET_NAMES" | grep -qx "$expected"; then
        echo "✅ $expected"
      else
        echo "❌ $expected MISSING"
        FAILED=$((FAILED + 1))
      fi
    done
  fi
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "§2 GitHub Labels (6 new expected)"
# ───────────────────────────────────────────────────────────────────────────
if command -v gh >/dev/null 2>&1; then
  LABEL_NAMES=$(gh api "repos/$REPO/labels" --paginate --jq '.[].name' 2>/dev/null | sort)
  for expected in "${EXPECTED_LABELS[@]}"; do
    if echo "$LABEL_NAMES" | grep -qx "$expected"; then
      echo "✅ $expected"
    else
      echo "❌ $expected MISSING"
      FAILED=$((FAILED + 1))
    fi
  done
else
  echo "❌ gh CLI not installed (see §1 remediation)"
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "§3 Branch protection ruleset main Active"
# ───────────────────────────────────────────────────────────────────────────
if command -v gh >/dev/null 2>&1; then
  RULESETS=$(gh api "repos/$REPO/rulesets" 2>/dev/null)
  if [ -z "$RULESETS" ] || [ "$RULESETS" = "[]" ]; then
    echo "❌ No rulesets configured"
    FAILED=$((FAILED + 1))
  else
    MAIN_RULESET=$(echo "$RULESETS" | jq -r '.[] | select(.target == "branch" and (.name | test("main"; "i"))) | "\(.name) — enforcement=\(.enforcement)"')
    if [ -z "$MAIN_RULESET" ]; then
      echo "❌ No 'main' branch ruleset (or 'main' not în target_branches)"
      echo "    Existing rulesets:"
      echo "$RULESETS" | jq -r '.[] | "  - \(.name) (target=\(.target))"'
      FAILED=$((FAILED + 1))
    else
      echo "✅ $MAIN_RULESET"
      if ! echo "$MAIN_RULESET" | grep -q "active"; then
        echo "⚠️ Ruleset NOT enforced (enforcement != 'active')"
        WARNED=$((WARNED + 1))
      fi
    fi
  fi
else
  echo "❌ gh CLI not installed"
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "§4 Workflow permissions"
# ───────────────────────────────────────────────────────────────────────────
if command -v gh >/dev/null 2>&1; then
  PERMS=$(gh api "repos/$REPO/actions/permissions/workflow" --jq '.default_workflow_permissions' 2>/dev/null)
  if [ "$PERMS" = "write" ]; then
    echo "✅ default_workflow_permissions = write (Stagehand Issues create enabled)"
  elif [ "$PERMS" = "read" ]; then
    echo "❌ default_workflow_permissions = read — Stagehand Issues create will fail"
    echo "   Fix: Repo Settings → Actions → General → Workflow permissions → 'Read and write'"
    FAILED=$((FAILED + 1))
  else
    echo "❌ Cannot read workflow permissions (output: '$PERMS')"
    FAILED=$((FAILED + 1))
  fi
else
  echo "❌ gh CLI not installed"
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "§5 API connectivity smoke (GET-only, no token spend)"
# ───────────────────────────────────────────────────────────────────────────

smoke_api() {
  local name="$1"
  local url="$2"
  local header_kv="$3"
  shift 3
  local extra_headers=("$@")

  if [ -z "${SMOKE_ENABLED:-}" ]; then
    echo "⚠️ $name: SMOKE_ENABLED=1 not set — skipping curl"
    WARNED=$((WARNED + 1))
    return
  fi

  local curl_args=("-sS" "-o" "/dev/null" "-w" "%{http_code}" "-H" "$header_kv")
  for h in "${extra_headers[@]}"; do
    curl_args+=("-H" "$h")
  done
  curl_args+=("$url")

  STATUS=$(curl "${curl_args[@]}")
  if [ "$STATUS" = "200" ]; then
    echo "✅ $name: HTTP 200"
  elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo "❌ $name: HTTP $STATUS (auth fail — token invalid sau expired)"
    FAILED=$((FAILED + 1))
  elif [ "$STATUS" = "404" ]; then
    echo "❌ $name: HTTP 404 (endpoint changed sau resource missing)"
    FAILED=$((FAILED + 1))
  else
    echo "❌ $name: HTTP $STATUS (unexpected)"
    FAILED=$((FAILED + 1))
  fi
}

if [ -z "${SMOKE_ENABLED:-}" ]; then
  echo "Skipping API curl smoke — to enable, export SMOKE_ENABLED=1 + all token env vars."
  echo "Reason: avoid running curl without env vars set (would silently skip toate)."
  WARNED=$((WARNED + 5))
else
  # Anthropic — GET /v1/models (lightweight, no token spend)
  if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    smoke_api "Anthropic" "https://api.anthropic.com/v1/models" "x-api-key: $ANTHROPIC_API_KEY" "anthropic-version: 2023-06-01"
  else
    echo "❌ Anthropic: ANTHROPIC_API_KEY env var not set"
    FAILED=$((FAILED + 1))
  fi

  # Checkly — GET /v1/account (basic metadata)
  if [ -n "${CHECKLY_API_KEY:-}" ] && [ -n "${CHECKLY_ACCOUNT_ID:-}" ]; then
    smoke_api "Checkly" "https://api.checklyhq.com/v1/account" "Authorization: Bearer $CHECKLY_API_KEY" "X-Checkly-Account: $CHECKLY_ACCOUNT_ID"
  else
    echo "❌ Checkly: CHECKLY_API_KEY + CHECKLY_ACCOUNT_ID env vars required"
    FAILED=$((FAILED + 1))
  fi

  # Browserbase — GET sessions (current state)
  if [ -n "${BROWSERBASE_API_KEY:-}" ]; then
    smoke_api "Browserbase" "https://api.browserbase.com/v1/sessions?status=RUNNING" "X-BB-API-Key: $BROWSERBASE_API_KEY"
  else
    echo "❌ Browserbase: BROWSERBASE_API_KEY env var not set"
    FAILED=$((FAILED + 1))
  fi

  # Snyk — GET orgs
  if [ -n "${SNYK_TOKEN:-}" ]; then
    smoke_api "Snyk" "https://api.snyk.io/rest/orgs?version=2024-10-15" "Authorization: token $SNYK_TOKEN"
  else
    echo "❌ Snyk: SNYK_TOKEN env var not set"
    FAILED=$((FAILED + 1))
  fi
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "§6 Firebase SA JSON valid + andura.app authorizedDomains"
# ───────────────────────────────────────────────────────────────────────────
SA_PATH="${FIREBASE_SA_PATH:-firebase-service-account.json}"
if [ ! -f "$SA_PATH" ]; then
  for alt in scripts/firebase-service-account.json "$HOME/.firebase-andura-sa.json"; do
    if [ -f "$alt" ]; then
      SA_PATH="$alt"
      break
    fi
  done
fi

if [ ! -f "$SA_PATH" ]; then
  echo "❌ Firebase SA file NOT found. Checked paths:"
  echo "   - firebase-service-account.json"
  echo "   - scripts/firebase-service-account.json"
  echo "   - \$HOME/.firebase-andura-sa.json"
  echo "   - \$FIREBASE_SA_PATH env var"
  FAILED=$((FAILED + 2))
else
  echo "Found SA at: $SA_PATH"
  PROJECT_ID=$(jq -r '.project_id // empty' "$SA_PATH" 2>/dev/null)
  CLIENT_EMAIL=$(jq -r '.client_email // empty' "$SA_PATH" 2>/dev/null)
  PRIVATE_KEY_VALID=$(jq -r '.private_key | startswith("-----BEGIN PRIVATE KEY-----")' "$SA_PATH" 2>/dev/null)

  if [ -z "$PROJECT_ID" ] || [ -z "$CLIENT_EMAIL" ]; then
    echo "❌ SA JSON invalid (missing project_id sau client_email)"
    FAILED=$((FAILED + 1))
  elif [ "$PRIVATE_KEY_VALID" != "true" ]; then
    echo "❌ SA JSON private_key malformed (missing BEGIN PRIVATE KEY header)"
    FAILED=$((FAILED + 1))
  else
    echo "✅ SA JSON valid: project=$PROJECT_ID, client=$CLIENT_EMAIL"
  fi

  # andura.app authorized domains check requires Firebase Admin SDK call
  # — not feasible în bash. Manual check needed via Firebase Console.
  echo ""
  echo "⚠️ andura.app authorizedDomains verification requires Firebase Console MANUAL:"
  echo "   Open: https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
  echo "   Verify 'andura.app' în Authorized domains list."
  WARNED=$((WARNED + 1))
fi

# ───────────────────────────────────────────────────────────────────────────
print_section "SUMMARY"
# ───────────────────────────────────────────────────────────────────────────
echo "Failed checks:  $FAILED"
echo "Warned checks:  $WARNED"
echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "🦫 ALL ESSENTIAL CHECKS ✅ — Track 7 §7.6 activation autonomous ready."
  if [ "$WARNED" -gt 0 ]; then
    echo "Review warnings above (typically Firebase Console manual verify)."
  fi
  exit 0
else
  echo "❌ $FAILED check(s) failed — remediate before §7.6 activation."
  exit 1
fi
