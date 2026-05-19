# SETUP DANIEL Track 7 — Manual Configuration Checklist

**Purpose:** Step-by-step Daniel manual setup pentru Track 7 Automated Testing activation. CC autonomous work has LANDED skeletons (§7.1-§7.10 ready-to-activate); these manual steps unlock CI gates.

**Authority:** D032 LOCKED V1 — Track 7 Automated Testing 3-tier defense.

**Estimated total time:** ~3-4 ore (split across multiple sessions OK).

**Update protocol:** Mark ✅ când done, ⚠️ când blocked, 📝 când needs follow-up.

---

## Dependency Graph

```
A. Accounts + tokens  ─┬→  C. GitHub Secrets  ─→  CI gates activate
                       │
                       └→  Local testing pre-deploy

B. Firebase Console  ─→  Auth flow + Magic Link + Firestore parity

D. CEO decisions  ─→  Unblocks specific phase activations
                  └→  §9-C1 unlocks §7.5 AaFriction wording finalize
```

**Critical path:** A → C unlocks most CI. B unlocks live auth tests. D can run în parallel anytime.

---

## A. Accounts + Tokens (~60-90 min)

### A.1 Checkly Free Hobby (§7.7 unlock) — ⏱ ~10 min

- [ ] **Sign up:** https://app.checklyhq.com/signup (Free Hobby tier 1,500 browser checks/lună)
- [ ] **Generate API key:** Account Settings → API Keys → Create new API key
- [ ] **Note Account ID:** Account Settings → Account ID (UUID format)
- [ ] **Set up alert channel:** Alert Channels → New → Slack webhook URL → channel `#andura-alerts`
- [ ] **Cost check:** Default config 5min × 2 EU locations = ~8,640 checks/lună > 1,500 free.
  Options:
  - (a) Reduce frequency to 30min în checkly.config.ts (~1,440/lună fits free)
  - (b) Upgrade $40/mo Team plan
  - (c) Reduce to 1 location only (~4,320/lună still over)
- [ ] **GitHub Secrets upload:**
  - `CHECKLY_API_KEY` = (paste from step above)
  - `CHECKLY_ACCOUNT_ID` = (paste UUID)
- [ ] **Local install:** `npm i -D checkly @checkly/cli` (când ready să run local)

### A.2 Browserbase + Stagehand (§7.8 unlock) — ⏱ ~15 min

- [ ] **Sign up:** https://www.browserbase.com/ (paid product, pricing TBD — verify după signup)
- [ ] **Create project:** Browserbase Dashboard → New Project → name "Andura Exploration"
- [ ] **Generate API key:** Settings → API Keys → Create → copy `bb_live_*`
- [ ] **Note Project ID:** Project Settings → Project ID (UUID format)
- [ ] **GitHub Secrets upload:**
  - `BROWSERBASE_API_KEY` = `bb_live_...`
  - `BROWSERBASE_PROJECT_ID` = (paste UUID)
- [ ] **Cost monitoring:** First overnight cron uses 3 personas × ~5min = 15 min Browserbase time/zi.
  Verify pricing within budget.
- [ ] **Local install (post-activation):** `npm i -D @browserbasehq/stagehand zod`

### A.3 Anthropic API key (§7.8 unlock) — ⏱ ~5 min

- [ ] **Verify existing key:** Likely Daniel already has from Claude Code subscription.
  Check: https://console.anthropic.com/settings/keys
- [ ] **If absent:** Create new API key în Anthropic Console → Settings → API Keys → Create
- [ ] **Set usage limit:** Recommended $5-10/lună budget for Stagehand exploration
  (each persona run ~$0.10-0.30 Claude 4.7 Opus tokens)
- [ ] **GitHub Secrets upload:**
  - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`

### A.4 Snyk (§7.4 vulnerability scan) — ⏱ ~10 min

- [ ] **Sign up:** https://snyk.io/signup (Free tier: 100 tests/lună, unlimited public repos)
- [ ] **Connect GitHub repo:** Integrations → GitHub → Authorize → select `andura` repo
- [ ] **Generate API token:** Settings → API Token → reveal token
- [ ] **GitHub Secrets upload:**
  - `SNYK_TOKEN` = (paste token)

### A.5 Lighthouse CI GitHub App (§7.3 results upload) — ⏱ ~10 min

- [ ] **Install GitHub App:** https://github.com/apps/lighthouse-ci → Install → select `andura` repo
- [ ] **Generate app token:** App settings → New token → name "Track 7 LHCI"
- [ ] **GitHub Secrets upload:**
  - `LHCI_GITHUB_APP_TOKEN` = `LHCI_GH_TOKEN_...`
- [ ] **Alternative (skip if Daniel choice):** Use `target: 'temporary-public-storage'` în lighthouserc.js (already configured) — Lighthouse uploads to temp public URL, NO token needed but ephemeral.

---

## B. Firebase Console manual (§7.2 + live auth tests unlock) — ⏱ ~30-45 min

### B.1 Authorized domains
- [ ] **Open Firebase Console:** https://console.firebase.google.com/ → andura project
- [ ] **Authentication → Settings → Authorized domains:**
  - [ ] `andura.app` (production, must be present)
  - [ ] `localhost` (dev — should be default)
  - [ ] Remove ANY untrusted domains (security hygiene)

### B.2 Firestore rules publish parity
- [ ] **Firestore → Rules tab:** verify rules match local `firestore.rules` file
- [ ] **If mismatch:** Daniel decide (publish local OR pull remote into local)
- [ ] **Test rules:** Rules Playground → simulate read/write pentru test UID

### B.3 Service Account JSON pentru Playwright auth (§7.2 unlock)
- [ ] **Firebase Console → Project Settings → Service accounts tab**
- [ ] **Generate new private key** → download `andura-firebase-adminsdk-*.json`
- [ ] **Store secret-safe location:** NOT în repo (firestore-service-account.json în .gitignore line 20)
- [ ] **GitHub Secret upload:**
  - Option (a) — JSON content: `FIREBASE_SERVICE_ACCOUNT` = (paste full JSON)
  - Option (b) — Base64 encoded: `FIREBASE_SERVICE_ACCOUNT_B64` = `base64 -i file.json`
  - Option (c) — File path în GitHub Action (mounted via secrets): `FIREBASE_SERVICE_ACCOUNT_PATH` = `/tmp/sa.json` (workflow writes JSON then sets path)
  - **Recommended:** Option (a) cu workflow step writing secret to file:
    ```yaml
    - run: echo "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}" > /tmp/sa.json
    - env:
        GOOGLE_APPLICATION_CREDENTIALS: /tmp/sa.json
    ```

### B.4 Auth test user provision (§7.2 unlock)
- [ ] **Authentication → Users → Add user**
  - Email: `playwright-test@andura.app`
  - Password: random secure (NU folosi în code) — actual auth via Admin SA custom token
- [ ] **Copy UID** (e.g. `aBc123XyZ456...`)
- [ ] **GitHub Secret upload:**
  - `PLAYWRIGHT_AUTH_TEST_UID` = (paste UID)

### B.5 (Optional) Firebase Web API key strategy
- [ ] **Current state:** Daniel CEO decision pending (§D pending — see below)
- [ ] **Option 1 — Public-safe commit:** Firebase docs explicit "Web API key NU este secret, este designed-public". Commit `VITE_FIREBASE_API_KEY` direct în source. Restrict via Firebase Console → API restrictions → only `andura.app` referer.
- [ ] **Option 2 — Env var pipeline:** Keep API key out of git, inject via Vite env at build time. More work but stricter.

---

## C. GitHub Repo Settings (~30 min)

### C.1 Branch protection `main` (§7.6 PR gate) — ⏱ ~10 min
- [ ] **Settings → Branches → Add rule pentru `main`:**
  - [ ] Require pull request before merging (NO direct push)
  - [ ] Require status checks to pass before merging:
    - `CI / Validate` (typecheck + lint + test:run + build + size + depcheck + madge + jscpd + licenses + audit + Snyk)
    - `CI / E2E Smoke` (Playwright smoke-react + magic-link + visual-regression)
    - `CI / Lighthouse` (perf ≥85 / a11y ≥95)
  - [ ] Require branches to be up to date before merging
  - [ ] Require linear history (no merge commits — rebase or squash only)
  - [ ] Restrict who can push: only `markaroundthestates-cyber` (Daniel)
  - [ ] Block force pushes (cu exception pentru Daniel pe emergency)

### C.2 GitHub Secrets upload checklist (~10 min)

After completing A.* sections, total 11 secrets uploaded:

| Secret | Source | Track 7 phase | Critical? |
|--------|--------|---------------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` (or `_B64` or `_PATH`) | B.3 | §7.2 auth.setup | HIGH |
| `PLAYWRIGHT_AUTH_TEST_UID` | B.4 | §7.2 auth.setup | HIGH |
| `CHECKLY_API_KEY` | A.1 | §7.7 synthetic prod | MED |
| `CHECKLY_ACCOUNT_ID` | A.1 | §7.7 synthetic prod | MED |
| `BROWSERBASE_API_KEY` | A.2 | §7.8 exploration | LOW |
| `BROWSERBASE_PROJECT_ID` | A.2 | §7.8 exploration | LOW |
| `ANTHROPIC_API_KEY` | A.3 | §7.8 exploration | LOW |
| `SNYK_TOKEN` | A.4 | §7.4 vuln scan | MED |
| `LHCI_GITHUB_APP_TOKEN` | A.5 | §7.3 + §7.6 Lighthouse | LOW (optional — temp public storage fallback) |
| `GITHUB_TOKEN` | auto | §7.8 Issues queue | auto-provided |

**Upload:** Repo Settings → Secrets and variables → Actions → New repository secret → name + value paste

### C.3 GitHub Issues labels (§7.8 exploration queue) — ⏱ ~5 min
- [ ] **Issues → Labels → New label:**
  - `exploration-anomaly` (color: orange `#FBCA04`)
  - `severity-p0` (color: red `#B60205`)
  - `severity-p1` (color: orange `#D93F0B`)
  - `severity-p2` (color: yellow `#FBCA04`)
  - `severity-p3` (color: gray `#BFD4F2`)
  - `nightly-stagehand` (color: purple `#5319E7`)

### C.4 Actions workflow run permissions (default OK usually) — ⏱ ~2 min
- [ ] **Settings → Actions → General:**
  - Workflow permissions: "Read and write permissions" (Stagehand creates Issues)
  - Allow GitHub Actions to create and approve pull requests: optional

---

## D. CEO Decisions Pending (~30-60 min strategic thinking)

### D.1 §9-C1 F5 AaFriction vs LOCK 9 PerSetSafetyModal disambiguation
- [ ] **Context:** Master spec §9 (TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md). Two modal components/concepts may overlap:
  - F5 AaFrictionModal (older naming?)
  - LOCK 9 PerSetSafetyModal (newer LOCK V1 wording)
- [ ] **Decision needed:**
  - (a) Rename `AaFrictionModal.tsx` → `PerSetSafetyModal.tsx` + update DECISIONS.md disambiguation entry
  - (b) Keep both as separate concepts cu clear scope split (document scope difference)
  - (c) F5 deprecated → remove, only LOCK 9 active
- [ ] **Unblocks:** §7.5 coach voice Scenario 7 (Per-set RIR 0 AaFriction LOCK 9) wording finalize + tests/engine/coach-scenarios/coach-voice.scenarios.test.ts activation

### D.2 Firebase Web API key — public-safe vs env var
- [ ] **Context:** B.5 above. Firebase docs say Web API key is designed-public.
- [ ] **Decision needed:**
  - (a) Commit `VITE_FIREBASE_API_KEY` direct în code + restrict Firebase Console referrer policy `andura.app` only
  - (b) Keep env var pipeline (`VITE_FIREBASE_API_KEY` deploy build inject)
- [ ] **Recommendation:** (a) per Firebase docs simplicity. Restrict via console.

### D.3 npm audit case-by-case decizii
- [ ] **Context:** 14 remaining vulnerabilities (12 low + 2 moderate) require `npm audit fix --force` semver-major breaking. CC §7.4-fix applied only safe patches (brace-expansion + ws).
- [ ] **Decision needed:** Review `npm audit --production` output → choose:
  - (a) Force upgrade all (`--force`) — risk breakage, gain security
  - (b) Manual case-by-case upgrade per package (lower risk, more time)
  - (c) Defer non-critical vulns (low severity, devDep-only)
- [ ] **Recommendation:** (b) manual case-by-case. Snyk action în §7.6 CI will surface în PR — Daniel decides per PR review.

### D.4 Checkly frequency vs cost tradeoff
- [ ] **Context:** A.1 cost note. Default 5min × 2 locations = ~8,640 checks/lună > Free Hobby 1,500.
- [ ] **Decision needed:**
  - (a) Reduce frequency 30min în checkly.config.ts (~1,440/lună fits free)
  - (b) Upgrade $40/mo Team plan
  - (c) Reduce to 1 location only
- [ ] **Recommendation:** (a) — 30min sufficient pentru solo dev pre-Beta. Adjust to 5min post-launch.

### D.5 Visual regression baseline strategy
- [ ] **Context:** §7.3 visual-regression.spec.ts. Baselines generated în CI Ubuntu Linux WON'T match local Windows font rendering.
- [ ] **Decision needed:**
  - (a) Run CI first with `--update-snapshots` to generate baselines → Daniel review artifacts → commit baselines
  - (b) Use Docker locally (Ubuntu container) to generate baselines locally → commit
  - (c) Skip visual regression entirely (rely on axe-core + Lighthouse for visual quality)
- [ ] **Recommendation:** (a) — easiest, lowest setup overhead.

---

## E. Activation Test Sequence (post-A+B+C complete)

Run în order, verify each before proceeding:

1. **Local test:** `npm run typecheck && npm run lint && npm run test:run` → expect baseline 4547 PASS
2. **CI trigger:** push small commit (e.g., comment fix) → verify all jobs GREEN în Actions tab
3. **Auth test:** `GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json PLAYWRIGHT_AUTH_TEST_UID=<uid> npx playwright test tests/auth.setup.ts` → expect storageState generated
4. **Visual regression baselines:** `npx playwright test visual-regression --update-snapshots` (în CI ideal, sau Docker local) → review screenshots → commit
5. **Checkly first deploy:** `npx checkly deploy` → verify Checkly dashboard shows project
6. **Stagehand dry run:** `node scripts/nightly-exploration.mjs` → expect "no anomalies" or first batch of Issues
7. **Final smoke:** Follow `📤_outbox/TRACK_7_FINAL_SMOKE_CHECKLIST.md` cap-coadă

---

## F. Status Tracker

Update as Daniel completes sections:

| Section | Status | Date completed | Notes |
|---------|--------|----------------|-------|
| A.1 Checkly | ⏳ | | |
| A.2 Browserbase | ⏳ | | |
| A.3 Anthropic | ⏳ | | |
| A.4 Snyk | ⏳ | | |
| A.5 Lighthouse GH App | ⏳ | | (optional) |
| B.1 Firebase domains | ⏳ | | |
| B.2 Firestore rules | ⏳ | | |
| B.3 Firebase SA | ⏳ | | |
| B.4 Test user UID | ⏳ | | |
| B.5 Web API key strategy | ⏳ | | D.2 decision |
| C.1 Branch protection | ⏳ | | |
| C.2 11 GitHub Secrets | ⏳ | | |
| C.3 GitHub labels | ⏳ | | |
| C.4 Workflow permissions | ⏳ | | |
| D.1 F5/LOCK 9 disambiguation | ⏳ | | Strategic |
| D.2 Firebase API key strategy | ⏳ | | Strategic |
| D.3 npm audit triage | ⏳ | | Per PR review |
| D.4 Checkly frequency | ⏳ | | Cost decision |
| D.5 Visual regression baselines | ⏳ | | Strategic |

---

🦫 **Setup complet = Track 7 §7.10 final smoke pe checklist `📤_outbox/TRACK_7_FINAL_SMOKE_CHECKLIST.md` GREEN → Beta launch gate PASS.**
