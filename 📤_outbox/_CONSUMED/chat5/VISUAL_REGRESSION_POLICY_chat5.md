# Visual Regression Snapshots — Policy Recommendation (Chat 5)

**Author:** Co-CTO Claude chat 5 read-only investigation agent
**Date:** 2026-05-23
**Scope:** Policy decision pe `tests/visual-regression.spec.ts-snapshots/` Daniel resolves pre-Beta
**Mode:** READ-ONLY investigation. Zero source/test edits.
**Cross-refs:** D015 mockup DESIGN MASTER · D045 Iter 1 Mass Fix · D056 WCAG a11y · D071 Lighthouse perf · 16 polish passes Pass 4-16 LANDED · `📥_inbox/DANIEL_PENDING_chat5.md §Co-CTO autonomous mandate · Tactical CSS/a11y` · `📥_inbox/_CONSUMED/SETUP_DANIEL_TRACK_7.md §D.5`

---

## §1 Executive summary

**Status pending:** "Visual regression snapshots policy — commit win32 baselines sau gitignore" listed în `DANIEL_PENDING_chat5.md` §Tactical CSS/a11y ca Co-CTO autonomous tactical. Original D.5 Track 7 strategic decision (`SETUP_DANIEL_TRACK_7.md §D.5`) recomandare (a) "Run CI first with `--update-snapshots` → commit baselines" rămâne neimplementat.

**Current state:** 3 PNG baselines auto-generated local Windows (`*-all-win32.png` total ~9.3 KB) sit untracked. CI workflow `ci.yml` line 201 runs `tests/visual-regression.spec.ts` în chromium Ubuntu — fail-open mode (without baselines committed, first CI run generates them ca artefacte non-persistent).

**Preferred option:** **Option C — Defer to post-Beta** cu micro-step: gitignore `tests/visual-regression.spec.ts-snapshots/` explicit (anti-D049 accidental commit) + remove `visual-regression.spec.ts` from CI `ci.yml` E2E line 201 (currently silent fail-open, misleading green status).

**Rationale (5 bullets):**
1. **Mockup parity primary signal** = 16 polish passes Pass 4-16 LANDED via direct mockup-vs-prod manual comparison (Daniel + Co-CTO). Visual regression snapshots would lock-in *post-Pass-16* baseline, but Pass 17 (shadow) + Pass 18 (color tokens) sunt în flight → baselines premature.
2. **Win32 / Ubuntu rendering divergence** = D.5 §218 verbatim "Baselines generated în CI Ubuntu Linux WON'T match local Windows font rendering". `maxDiffPixelRatio: 0.02` în spec line 29 tolerant 2% jitter dar font-rendering cross-OS poate depăși threshold → false positives.
3. **Pre-Beta anti-paternalism** = `CLAUDE.md §Anti-paternalism absolute` "single comprehensive a-z review pre-Beta launch only. Daniel decide când e ready" — intermediate visual diff PR gates contradicție direct.
4. **Solo founder cost-benefit** = paid SaaS (Percy/Chromatic/Argos) = $0-200/mo monthly burn fără ROI clar pre-launch. Bootstrap Daniel + Bugatti Quality > Speed strict argue defer paid tools până post-Beta volume justify.
5. **Lighthouse + axe-core already cover quality dimensions** = D071 perf 97/100 + D056 a11y WCAG 2.1 AA hard gates active CI → visual layer adds incremental signal NU primary safety net pre-Beta.

---

## §2 Current state inventory

### §2.1 Spec file
**Path:** `tests/visual-regression.spec.ts` (72 LOC, 3 tests, tracked în git commit `1957b6f1` 2026-05-19 "feat(track-7-§7.3)")

**Stability options (lines 25-30 verbatim):**
```ts
const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
  caret: 'hide' as const,
  maxDiffPixelRatio: 0.02,   // 2% tolerance
};
```

**Three tests cover viewports:**
1. `homepage initial render` — 390x844 (iPhone 14) + Medical Disclaimer dismiss + dynamic mask defensive (`[data-testid="timestamp"]` + `time` + `[data-dynamic]`)
2. `homepage mobile small viewport` — 375x667 (iPhone SE)
3. `homepage tablet portrait` — 768x1024 (iPad Air)

**Coverage scope = `/` homepage only.** Zero coverage pentru 4 taburi (Coach + Antrenament + Library + Cont) + onboarding + workout FSM screens.

### §2.2 Snapshot baselines
**Path:** `tests/visual-regression.spec.ts-snapshots/` (untracked, NOT gitignored verified `git status --ignored`)

**Files (3 baselines, ~9.3 KB total):**
- `homepage-mobile-375x667-all-win32.png` (2.1 KB) — 2026-05-23 01:37 local generation
- `homepage-mobile-390x844-all-win32.png` (2.7 KB) — 2026-05-23 01:37
- `homepage-tablet-768x1024-all-win32.png` (4.5 KB) — 2026-05-23 01:37

**Platform suffix `-all-win32`** = Playwright auto-naming pattern `{name}-{projectName}-{platform}.png`. "all" = project name în `playwright.config.js` line 43. "win32" = local Daniel Windows generation → CI Ubuntu would generate `-all-linux.png` separate set.

### §2.3 npm scripts
**`package.json` line 47 (single script):**
```json
"visual:update": "playwright test visual-regression --update-snapshots"
```

Zero script pentru baseline-only run, zero script pentru CI artefact extract. Single regenerate command.

### §2.4 Playwright config
**`playwright.config.js`** — zero visual regression-specific section (no `snapshotDir`, no `snapshotPathTemplate` override). Default Playwright behavior:
- Snapshots stored la `tests/{spec-name}-snapshots/`
- Default threshold `maxDiffPixelRatio` per `expect.toHaveScreenshot()` call (override per-test în spec)
- Single `all` project line 43 runs all specs (visual + smoke + magic-link unified)

### §2.5 CI workflow
**`.github/workflows/ci.yml` line 201 (Track 7 §7.9 comment line 198):**
```yaml
- name: Run E2E smoke tests (Track 7 §7.2 + §7.3)
  run: npx playwright test tests/smoke-react.spec.ts tests/magic-link.spec.ts tests/visual-regression.spec.ts tests/e2e/v2-4-taburi-smoke.spec.js --reporter=line
  timeout-minutes: 15
```

**CRITICAL FINDING:** `visual-regression.spec.ts` listed în CI run dar baselines NU committed → first CI run will:
- Either generate baselines as artifacts (lost post-job) și pass
- Or fail comparison if Playwright treats missing baseline ca error (depending pe `--update-snapshots` flag presence — currently absent)

Verified `git log --oneline -- tests/visual-regression.spec.ts-snapshots/` = empty (zero commits to snapshots ever). CI status pe spec ăsta = misleading green (no real comparison happening).

### §2.6 Test script integration
**`package.json` `test:e2e:smoke` line 22:**
```json
"test:e2e:smoke": "playwright test tests/smoke-react.spec.ts tests/magic-link.spec.ts"
```

Visual regression spec EXCLUS din `test:e2e:smoke` (smoke fast variant). Included DOAR în `test:e2e` (full E2E) sau direct `npx playwright test`.

---

## §3 Industry baseline comparison

### §3.1 Playwright native `toHaveScreenshot()` (current setup)

**Mechanism:** Built-in Playwright API. Stores baselines la `tests/{spec}-snapshots/`. Pixel comparison cu options `threshold` (0-1, per-pixel diff sensitivity) + `maxDiffPixels` (absolute count) + `maxDiffPixelRatio` (ratio).

**Pros:**
- Zero additional dependency
- Zero monthly cost
- Local generation deterministic same-machine
- Native CI integration (artifacts via Playwright HTML report)
- Visual diff în Playwright HTML report (3-pane: expected/actual/diff)

**Cons:**
- Cross-OS rendering jitter (Windows font hinting vs Ubuntu vs macOS = different antialiasing → baseline mismatch)
- Diff review în-PR = manual download artifact + open HTML report (no PR comment integration)
- Baselines în repo = binary bloat (3 PNG 9.3 KB current OK, dar 50+ screens 4 viewports = 200+ baselines fast grow)
- Browser version pin discipline = each Playwright upgrade may shift rendering

**Cost:** $0/mo. Setup effort: minimal (already DONE).

### §3.2 Percy (BrowserStack)

**Mechanism:** Cloud SaaS. Snapshots uploaded to Percy backend, rendered cross-browser (Chrome/Firefox/Safari/Edge) în Percy's controlled VM environment, visual diff UI dashboard.

**Pros:**
- Deterministic rendering env (Percy controls browser version + OS + fonts)
- Cross-browser parity automatic
- PR comment integration (visual diff inline)
- Responsive width testing built-in
- Diff approval UI (click-to-approve baseline updates)

**Cons:**
- Paid: Free tier 5K snapshots/mo, Pro $599/mo for 25K snapshots
- Vendor lock (Percy-specific SDK calls în tests)
- Network dependency (CI uploads snapshots → can fail/slow on bad days)
- Snapshots stored cloud (cross-OS dev access fine, dar privacy concerns pentru fitness UI screens — Daniel personal logo + branding visible)

**Cost:** $0 (Free 5K/mo enough pentru solo) → $599/mo Pro post-volume. Setup effort: ~4-6h migration (npm install + spec rewrite + CI integration + first baseline review).

### §3.3 Chromatic (Storybook ecosystem)

**Mechanism:** Cloud SaaS, primarily targets Storybook component snapshots dar supports Playwright integration. Branch-based baselines, PR-gated approval.

**Pros:**
- Storybook deep integration (component-level snapshots, NU page-level)
- TurboSnap mode (only re-snapshots stories that changed code-wise)
- Free tier 5K snapshots/mo
- Visual diff UI + figma-like accept/reject workflow

**Cons:**
- Storybook-first design (Andura NU folosește Storybook → setup overhead massive)
- Page-level Playwright integration second-class citizen
- Paid: $149/mo Starter, $419/mo Pro
- Same vendor lock + cloud privacy concerns ca Percy

**Cost:** $0-419/mo. Setup effort: ~8-12h (Storybook bootstrap if adopted) sau ~4h Playwright-only mode.

### §3.4 Argos CI (open-source self-host option)

**Mechanism:** Open-source cloud SaaS (self-hostable). Playwright native integration cu `@argos-ci/playwright`. Buckets snapshots per branch, PR diff UI.

**Pros:**
- Open-source (self-host avoid vendor lock)
- Free tier generous (5K screenshots/mo)
- Playwright-native integration (no Storybook required)
- GitHub App integration PR comments
- BYO bucket option (S3 self-host)

**Cons:**
- Cross-OS rendering still requires controlled CI env (Ubuntu Docker)
- Self-host setup overhead (Postgres + S3 + Node app)
- Smaller community than Percy/Chromatic
- Paid: $19/mo Hobby, $99/mo Pro

**Cost:** $0-99/mo. Setup effort: ~3-5h SaaS, ~8-12h self-host.

### §3.5 Comparison matrix

| Aspect | Playwright native | Percy | Chromatic | Argos |
|---|---|---|---|---|
| Monthly cost (solo) | $0 | $0 (free tier) → $599 | $0 (free tier) → $419 | $0 (free tier) → $99 |
| Vendor lock | None | High | High | Low (open-source) |
| Cross-OS determinism | Manual (CI Ubuntu pin) | Built-in | Built-in | Manual (CI pin) |
| PR diff UI | Artifact download | Inline comment | Inline comment | Inline comment |
| Setup effort | DONE | ~4-6h | ~4-12h | ~3-12h |
| Snapshot location | Repo binary | Cloud | Cloud | Cloud or self-host |
| Privacy | Local | Cloud (Percy infra) | Cloud (Chromatic infra) | Cloud or self-host |
| Storybook required | No | No | Recommended | No |

---

## §4 Andura context fit

### §4.1 Solo founder + bootstrap budget

Daniel = CEO + Product Owner + sole funder. Plan x20 horizon = perf-driven OPEX minimization preferable. Paid SaaS pe visual regression = recurring burn fără direct revenue impact. Daniel pattern observed (per `feedback_no_pseudo_blockers.md` + `feedback_subagents_at_discretion.md`) = prefer free + autonomous tools.

**Implication:** Option B (Percy/Chromatic paid) = misaligned cu bootstrap profile pre-Beta. Post-Beta dacă revenue model proves, reconsider.

### §4.2 Bugatti craft Quality > Speed strict

Per `CLAUDE.md` Bugatti paradigm: "Quality > Speed strict. Refactor later NEVER happens. Bug 02:00 > 5 commits grabă."

Visual regression catches *regression*, NU initial craft quality. Initial polish craft = handled prin 16 passes manual mockup parity Pass 4-16 LANDED + Daniel walkthrough pre-Beta. Quality dimensiunea ce VR cover = "post-launch did we break X via Y unrelated change?" — relevant POST-Beta cand iteration velocity ↑.

**Implication:** Pre-Beta low value (manual mockup parity already primary signal). Post-Beta high value (regression catch când multiple agents iterate parallel).

### §4.3 PWA + 4 personas (Gigel/Marius/Maria 65)

PWA visual consistency = critical UX. Maria 65 conservativ vârstnic notable affected by visual jank (font shifts, layout drift). Gigel non-tech RO = trust signals via visual polish parity mockup.

**Implication:** Visual regression *valuable* dar coverage gap = current spec covers DOAR `/` homepage. Coverage extension (4 taburi + onboarding + workout FSM) = ~12-20 additional baselines required = effort scope must match value.

### §4.4 Pre-Beta vs post-Beta phase fit

**Pre-Beta active:** Daniel Gates 100% + Bugatti audit nuclear pre-Launch + walkthrough single comprehensive. Per `CLAUDE.md §Anti-paternalism absolute`: zero intermediate review gates.

VR în PR = intermediate review gate (block PR pe pixel diff > threshold) → contradicție direct cu anti-paternalism strategy LOCKED.

**Post-Beta:** Multi-iteration velocity ↑, regression risk ↑, ROI VR ↑. Reconsider adoption Q3-Q4 2026 sau dacă bug pattern indicates UI drift recurrent.

### §4.5 Coverage gap vs effort

Currently 3 baselines `/` homepage 3 viewports. To meaningfully cover Andura:
- 4 taburi × 3 viewports = 12 baselines
- Onboarding 4 screens × 2 viewports = 8 baselines
- Workout FSM (Pregatire + Execuție + Pauza + PostRpe) × 2 viewports = 8 baselines
- Modal/sheet states (~10 unique) × 1 viewport = 10 baselines
- **Total target: ~38 baselines** (vs current 3)

Effort estimate: 6-10h initial baseline generation + review + commit. Maintenance: ~1-2h per polish pass to regenerate + visual review per PR.

Pass 17 + Pass 18 în flight = baselines premature regenerate cycle pending design phase complete.

---

## §5 Options analysis

### §5.1 Option A — Adopt local-only snapshots committed to repo

**Setup:**
1. Run `npm run visual:update` în CI Ubuntu Docker container (avoid Windows generation)
2. Daniel review artifacts în PR
3. Commit baselines la `tests/visual-regression.spec.ts-snapshots/-all-linux.png` set
4. CI continues `npx playwright test visual-regression` cu baselines committed
5. Pre-commit hook OR PR check enforces visual regression status

**PRO:**
- Zero monthly cost
- Canonical state baked into repo (`git diff` reveals intent)
- Same-PR review (code + visual în one place)
- Zero vendor lock
- Privacy preserved (no cloud upload personal UI screens)

**CON:**
- Repo binary bloat (~10-50 KB per baseline × ~38 baselines = ~400 KB-2MB)
- Cross-OS dev experience friction (Daniel Windows local can't easily regenerate matching CI Ubuntu — requires Docker setup)
- Diff review = download artifact + open Playwright HTML report manual (no inline PR comment)
- Baseline drift în Playwright browser upgrade = mass regenerate require
- Pre-Beta = intermediate review gate contradiction `CLAUDE.md anti-paternalism`

**Cost:** $0/mo. Setup effort: ~3-5h (Docker setup + first baseline generation + CI tuning).

### §5.2 Option B — Cloud-hosted Percy / Chromatic / Argos

**Setup (Argos recommendation per cost + open-source):**
1. `npm install --save-dev @argos-ci/playwright`
2. Modify `visual-regression.spec.ts` to use `argosScreenshot()` instead of `toHaveScreenshot()`
3. Argos GitHub App install + `ARGOS_TOKEN` secret
4. CI uploads to Argos backend
5. PR diff inline comment via Argos GitHub App

**PRO:**
- Deterministic rendering env (Argos controls)
- Inline PR diff UI (visual diff visible without artifact download)
- Approval workflow click-to-accept baseline update
- Free tier 5K snapshots/mo enough solo Andura pre-Beta volume
- Cross-browser parity native if want extend
- Self-host option avoids vendor lock

**CON:**
- Even free tier = recurring infrastructure dependency (network calls, account management)
- Cloud privacy (Argos sees Andura UI fitness logo + branding, not sensitive but Daniel preference observed = avoid cloud where avoidable)
- Spec rewrite + npm dep adds = ~3-5h setup
- Pre-Beta = intermediate gate contradiction (same as Option A)
- Free tier limits during heavy iteration (3 viewports × 5+ screens × 10+ PR per day = exhaust 5K quick)

**Cost:** $0/mo free tier → $99/mo Argos Pro. Setup effort: ~3-5h SaaS, ~8-12h self-host.

### §5.3 Option C — Defer to post-Beta (RECOMMENDED)

**Setup (micro-step ONLY):**
1. Add `tests/visual-regression.spec.ts-snapshots/` la `.gitignore` (anti-D049 accidental commit)
2. Remove `tests/visual-regression.spec.ts` from `ci.yml` line 201 E2E run (or wrap în conditional `--update-snapshots` only manual trigger workflow)
3. Document policy în comment header `visual-regression.spec.ts` (e.g., "Spec retained ca scaffolding post-Beta adoption. Pre-Beta = manual mockup parity Pass 4-16+ primary signal. Re-activate via Option A or B post-Beta launch decision.")
4. Local untracked snapshots remain disposable (Daniel can `npm run visual:update` ad-hoc for local audit if curious)

**PRO:**
- Zero infrastructure / zero cost
- Aligned `CLAUDE.md §Anti-paternalism absolute` (no intermediate gates)
- Daniel walkthrough pre-Beta single comprehensive = primary visual quality signal (per spec strategy LOCKED)
- 16 polish passes Pass 4-16 LANDED via direct mockup parity = quality already locked-in upstream of VR
- Lighthouse D071 perf 97 + axe-core a11y WCAG 2.1 AA already cover quality dimensions
- Pass 17 (shadow) + Pass 18 (color tokens) în flight = baselines premature anyway
- Spec scaffolding preserved zero-cost for future re-activation
- Removes CI misleading green status (currently fail-open without baselines committed)

**CON:**
- Post-Beta drift risk (UI regression undetected until manual notice)
- Spec scaffolding rot risk (if Playwright API changes pre-re-activation)
- "Why did we build this and not use it?" optics minor (mitigated by header comment + DECISIONS entry)

**Cost:** $0/mo. Setup effort: ~15 min (gitignore append + ci.yml edit + spec header comment).

### §5.4 Option D — Hybrid (Lighthouse + Daniel manual + post-Beta cloud)

**Setup:**
1. **Pre-Beta:** Same as Option C (gitignore + CI remove + scaffolding preserve)
2. **Lighthouse CI** D071 LANDED = perf regression primary signal pre-Beta (97 baseline ratchet UP capability)
3. **axe-core** Track 7 §7.2 integration = a11y regression baseline
4. **Daniel manual walkthrough** pre-Beta = visual + UX comprehensive single pass
5. **Post-Beta trigger:** When iteration velocity ↑ + regression bug noticed → adopt Argos Option B (free tier) OR Option A repo-baseline

**PRO:**
- Stepwise risk-matched investment
- Pre-Beta zero overhead
- Post-Beta adoption decision data-driven (based pe actual regression patterns)
- Aligned `feedback_quality_long_horizon.md` "10x time now to do right" vs premature optimization

**CON:**
- Decision delegation (Daniel must remember to revisit post-Beta)
- Same as Option C pe pre-Beta period (drift risk)
- Conditional future setup overhead (still requires ~3-12h post-Beta adoption)

**Cost:** $0/mo pre-Beta, $0-99/mo post-Beta. Setup effort: 15 min now + ~3-12h post-Beta decision.

---

## §6 Recommendation

### §6.1 Preferred: **Option C — Defer to post-Beta** (alternatively Option D hybrid IF Daniel wants explicit reconsider trigger)

**Rationale:**
- **Strategy alignment:** `CLAUDE.md §Anti-paternalism absolute` LOCKED V1 = ZERO intermediate review gates pre-Beta. VR PR gates violate direct.
- **Manual mockup parity primary:** 16 polish passes Pass 4-16 LANDED via direct mockup-vs-prod = primary visual signal pre-Beta. VR = redundant safety net pre-launch.
- **Quality coverage handled elsewhere:** D071 Lighthouse perf 97 + D056 a11y WCAG 2.1 AA + manual Daniel walkthrough = layered quality gates pre-Beta.
- **Pass 17/18 în flight:** Baselines committed now = regenerate cycle în 1-3 days = wasted effort.
- **Cost-benefit:** Solo founder bootstrap + Bugatti craft argument = defer paid + defer infrastructure investment until ROI proven post-Beta.
- **CI honest state:** Current spec runs în CI fără baselines = misleading green. Remove from CI line 201 fixes audit-trail honesty.

### §6.2 Implementation steps if Option C adopted (Co-CTO autonomous, ~15 min)

**Step 1: Gitignore append**
```
# .gitignore append at end
# Visual regression baselines (Track 7 §7.3 deferred post-Beta per VISUAL_REGRESSION_POLICY_chat5.md §6)
tests/visual-regression.spec.ts-snapshots/
```

**Step 2: CI workflow edit `ci.yml` line 201**

Before:
```yaml
run: npx playwright test tests/smoke-react.spec.ts tests/magic-link.spec.ts tests/visual-regression.spec.ts tests/e2e/v2-4-taburi-smoke.spec.js --reporter=line
```

After:
```yaml
run: npx playwright test tests/smoke-react.spec.ts tests/magic-link.spec.ts tests/e2e/v2-4-taburi-smoke.spec.js --reporter=line
```

Update comment line 198-199:
```yaml
# Track 7 §7.9 — vanilla legacy tests/e2e/smoke/ deleted; Track 7 §7.2 NEW
# specs (magic-link + smoke-react) replace it. Visual regression §7.3 spec
# preserved ca scaffolding dar excluded din CI pre-Beta per
# VISUAL_REGRESSION_POLICY_chat5.md §6 (re-activate post-Beta decision).
```

**Step 3: Spec header comment annotation**

Append după line 13 în `tests/visual-regression.spec.ts`:
```ts
// POLICY 2026-05-23: Spec scaffolding preserved dar EXCLUDED din CI run +
// baselines gitignored per VISUAL_REGRESSION_POLICY_chat5.md §6 (Option C
// defer post-Beta). Pre-Beta visual quality = 16 polish passes mockup
// parity Pass 4-16+ + Daniel manual walkthrough + D071 Lighthouse + D056
// a11y. Re-activate via Option A (repo baselines) or B (Argos cloud) post-
// Beta launch decision basat pe regression patterns observed.
```

**Step 4: DECISIONS.md LOCK V1 append (separate atomic commit)**

Suggested entry stub (Daniel + Co-CTO decide LOCKED V1 când ready):
```
### D0?? — STRATEGY — Visual regression deferred post-Beta scaffolding pattern (Option C)

**Status:** LOCKED V1 (recurrent reference scaffolding-not-active pattern)
**Date:** 2026-05-?? (Daniel approve trigger)
**Category:** STRATEGY (pre-Beta gate posture + post-Beta deferred decision)
**Source:** `📤_outbox/VISUAL_REGRESSION_POLICY_chat5.md` Option C analysis
**Cross-refs:** D015 mockup MASTER · D045 Iter 1 · D056 a11y · D071 Lighthouse · `📥_inbox/_CONSUMED/SETUP_DANIEL_TRACK_7.md §D.5`

**Decision:** Visual regression `tests/visual-regression.spec.ts` (Track 7 §7.3) preserved ca CI scaffolding dar EXCLUDED din active CI run pre-Beta. Snapshots gitignored. Pre-Beta visual quality signal = manual mockup parity + Lighthouse + axe-core + Daniel walkthrough. Re-activate post-Beta basat pe regression patterns observed.

**Pattern LOCKED V1 chain:**
- Scaffold preserved (zero rot, easy re-activate)
- CI honest state (no misleading green)
- Anti-paternalism aligned (no intermediate gates)
- Solo founder bootstrap (zero recurring cost)
- Bugatti Quality > Speed (manual mockup parity = primary, NU automated regression net pre-launch)
```

**Step 5: Verification post-edit**

- `git status --short` — confirm DOAR 3 files modified (`.gitignore` + `ci.yml` + `visual-regression.spec.ts`)
- `git diff` review surgical (no scope creep)
- 3 atomic commits separate (Bugatti single-concern):
  - `chore(gitignore): visual regression snapshots gitignored per Option C policy`
  - `chore(ci): visual regression spec excluded from CI per Option C policy`
  - `chore(test-scaffold): visual-regression.spec.ts policy header annotation`

### §6.3 Persona impact assessment

**Gigel (non-tech RO mediu):** Zero impact (VR is internal QA tool, NU user-facing). Manual mockup parity Pass 4-16 LANDED = Gigel UI experience already polished.

**Marius (performant la sala):** Zero impact. Marius's primary touchpoints (workout FSM + library) NU currently covered de VR spec anyway.

**Maria 65 (conservativ vârstnic):** Indirect concern = visual jank impact accessibility. D056 a11y baseline + Lighthouse 97 + manual Daniel walkthrough = primary protection. Defer adoption acceptable risk.

---

## §7 Open questions for Daniel

### §7.1 PRIMARY — Option selection
**Q1:** Approve Option C (defer post-Beta + scaffolding preserve) sau prefer alternative?
- **Option A** = commit baselines now (Docker Ubuntu generation)
- **Option B** = adopt Argos free tier
- **Option C** = defer post-Beta (RECOMMENDED)
- **Option D** = Option C + explicit post-Beta reconsider trigger documented

### §7.2 IF Option C selected — Co-CTO autonomous trigger
**Q2:** Co-CTO autonomous implement Step 1-3 (gitignore + ci.yml + spec header) sau Daniel manual?
- Co-CTO autonomous tactical mandate per D045 §Co-CTO autonomous + `feedback_co_cto_no_review_ask.md` → default autonomous unless Daniel says wait
- Step 4 DECISIONS.md LOCK V1 = Daniel + Co-CTO compose entry post-implementation

### §7.3 IF Option B selected — Cloud vendor choice
**Q3:** Argos (open-source, free 5K/mo, $99 Pro) vs Percy ($599 Pro) vs Chromatic ($419 Pro)?
- Argos = lowest cost + open-source self-host fallback → recommended Option B variant

### §7.4 SECONDARY — Post-Beta reconsider trigger
**Q4:** Concrete trigger pentru post-Beta VR adoption decision?
- Option: "1st visual regression bug user-reported post-launch" trigger
- Option: "Iter 2 Mass Fix V2 Wave A complete" trigger
- Option: "3+ months post-Beta if iteration velocity > 5 PR/week sustained" trigger

### §7.5 META — Coverage scope IF re-activated
**Q5:** Coverage extension target?
- Minimum: 3 baselines `/` homepage (current state)
- Medium: ~14 baselines (4 taburi × 3 viewports + onboarding key screens)
- Maximum: ~38 baselines (full app coverage)

---

## §8 Cross-references

### §8.1 SSOT files
- `DECISIONS.md` §D015 LOCK V1 — mockup DESIGN MASTER (single source UI parity, supersedes vanilla)
- `DECISIONS.md` §D045 LOCK V1 — Iter 1 Mass Fix V2 design phase (Wave A-D ~305 atomic tasks pending)
- `DECISIONS.md` §D056 LOCK V1 — A11y CRIT + HIGH Beta-blockers WCAG 2.1 AA mandatory pre-Beta
- `DECISIONS.md` §D071 LOCK V1 — Lighthouse perf 64→97→86→95→97 recovery cycle Maria 65 mobile 3G
- `DECISIONS.md` §D072 LOCK V1 — Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO singular verdict
- `DECISIONS.md` §D076 LOCK V1 — Phase 6 prod-extras blessed divergence (DRIFT-1 Option B)

### §8.2 Pending tasks references
- `📥_inbox/DANIEL_PENDING_chat5.md` §Co-CTO autonomous mandate · Tactical CSS/a11y — entry "Visual regression snapshots policy — commit win32 baselines sau gitignore (Co-CTO tactical)"
- `📥_inbox/_CONSUMED/SETUP_DANIEL_TRACK_7.md` §D.5 — original strategic decision (a)/(b)/(c) options + recommendation (a)

### §8.3 Polish passes commits (mockup parity primary signal pre-Beta)
- `8577b9cd` Pass 4 + `a6f97e5a` + `12af6c69` + `b04c842b` — radius + brick CTAs
- `c58d0847` + `2bc76fdd` + `f88f1a5c` Pass 5 — visual refresh
- `53aad720` + `cbe82ebe` Pass 6 — inputs radius 12px
- `68180509` + `e2acf587` Pass 7 — form input radius
- `23a07f3d` Pass 8 — SubHeader padding asymmetric
- `1c4e3d2e` Pass 9 — toggle switch unify
- `7cbf9877` Pass 10 — empty-state consistency
- `4f9dd017` + `6daad3fb` Pass 11 — card border line/lineStrong
- `00a84376` + `953523dd` Pass 12 — modal sheet padding
- `5f43f652` + `15a03777` Pass 13 — typography weight + size
- `fe130b9d` + `930cf995` Pass 14 — dividers spacing
- `a019f328` Pass 15 — chip badge pill
- `fd47d383` Pass 16 — icons size + stroke
- `212d4784` Pass 17 — shadow elevation uniformization (în flight chat 5)
- Pass 18 color tokens — în flight chat 5 (sibling agent activ)

### §8.4 Source files referenced (READ-ONLY investigation)
- `tests/visual-regression.spec.ts` (72 LOC, tracked commit `1957b6f1`)
- `tests/visual-regression.spec.ts-snapshots/*.png` (3 files, untracked, NOT gitignored)
- `playwright.config.js` (60 LOC)
- `package.json` line 47 `visual:update` script
- `.github/workflows/ci.yml` line 198-202 E2E run
- `.gitignore` (current 57 lines, snapshots line addition pending)

### §8.5 CLAUDE.md governance pointers
- §Anti-paternalism absolute — "ZERO intermediate review gates pre-Beta"
- §Bugatti paradigm — "Quality > Speed strict. Refactor later NEVER happens"
- §Testing baseline — "Vitest + jsdom isolated + E2E Playwright live + Daniel Gates production manual smoke"
- §Push policy D031 — invariant (zero auto-push)
- §SSOT auto-sync — DECISIONS.md LOCK V1 append for strategic decisions

---

**END VISUAL_REGRESSION_POLICY_chat5.md — Co-CTO recommendation Option C (defer post-Beta + scaffolding preserve). Pending Daniel decide §7.1 primary question. Implementation autonomous Co-CTO if approved (Step 1-3 ~15 min + Step 4 LOCK V1 post-implementation).**
