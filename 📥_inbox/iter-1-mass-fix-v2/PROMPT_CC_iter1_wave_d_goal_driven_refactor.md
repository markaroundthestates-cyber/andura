# PROMPT_CC iter 1 V2 — Wave D — Goal-Driven multi-file refactor

**Model:** Opus 4.7 EXCLUSIVELY. Verify `claude --version`.
**Stop trigger UNIQUE:** Daniel manual STOP.
**Authority:** Daniel CEO directive 2026-05-20 evening — V2 design LANDED. This is Wave D (final CC Wave).
**Vault:** `C:\Users\Daniel\Documents\salafull\` (Windows ACASĂ).
**Branch:** main.
**Pre-req:** Wave A + Wave B + Wave C LANDED MANDATORY (multi-file refactor dependencies — see `_DAG.md §3`).

---

## §0 Context summary

You are executing **Wave D** of Iter 1 Mass Fix V2 — Goal-Driven multi-file refactor: Zod boundaries + Branded types + FSM Mode Detection + Persona hoist + Inter font self-host + a11y triple + GDPR full + Backup/DR full + Firebase rules CLI + Telemetry opt-in + i18n + DST + Library count verify + Phase 5+6 BATCH verify + Engine math precision + PWA UpdatePrompt + DB Tier audit + Bundle full + Tailwind CSS vars + ESLint ratchet + deploy.yml verify + Beta entry checklist + Prod ops + GDPR portability + Auth full audit + Trust & Safety + Supply chain.

**Source-of-truth backlog:** `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md §D` (35 tasks D001-D035).

**Strategic plan:** `📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md`.

**Tasks count:** ~35 atomic (mostly M-L multi-file refactor). ETA Opus continuous: ~20-25h.

---

## §1 Pre-flight Wave D (execute ONCE at start)

```bash
claude --version
cd C:/Users/Daniel/Documents/salafull
git status
git log --oneline -10               # confirm Wave A+B+C LANDED tags
git branch --show-current           # expect main
npm run test:run 2>&1 | tail -10    # expect 4290+ PASS + Wave B/C tests added

# Confirm Wave A+B+C LANDED prerequisite
git tag --list "post-wave-a-iter1-v2-*"  # expect at least 1
git tag --list "post-wave-b-iter1-v2-*"  # expect at least 1
git tag --list "post-wave-c-iter1-v2-*"  # expect at least 1

git tag pre-wave-d-iter1-v2-2026-05-XX
git push origin pre-wave-d-iter1-v2-2026-05-XX

cat 📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md | grep -A 100 "## §D WAVE D"
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-d-pre.json
```

---

## §2 Per-task execution loop (35 iterations D001 → D035)

Per task `_MASTER_BACKLOG.md §D`:

```
STEP 1 — Read source-finding D008 verbatim from 📤_outbox/audit-nuclear-2026-05-19/findings-§NN.md
STEP 2 — Read prod file(s) primary location head 50 lines
  Wave D multi-file scope — read ALL relevant files per task spec (often 3-5 files per task)
STEP 3 — Grep audit-fix pattern across ALL relevant files → IF MATCH NO-OP SKIP
STEP 4 — gitnexus_impact MANDATORY (Wave D = ALL M/L effort, multi-file blast radius)
STEP 5 — Edit files per Title spec
  Wave D = Goal-Driven primary. Multi-file refactor cu coherent scope per task.
  Beta blocker lens primary — each task contributes to Beta gate criteria.
STEP 6 — gitnexus_detect_changes mandatory — verify expected symbols only modified
STEP 7 — Run COMPREHENSIVE tests (Wave D refactor blast radius large)
  npm run test:run 2>&1 | tail -10
  IF tests touched: npm run test:run -- <relevant spec>
STEP 8 — Atomic commit
  git commit -m "fix(wave-d-<id>): <title> (<source>) [GD]"
  # Wave D primarily GD Goal-Driven
STEP 9 — Update _progress.md
STEP 10 — Continue
```

---

## §3 Detailed task groups (35 tasks D001-D035)

See `_MASTER_BACKLOG.md §D` for full table.

**§D.1 Zod + Branded + FSM (D001-D005, 5 tasks):**
- D001 Zod runtime validation onboarding payload boundary — `src/react/lib/onboardingSchema.ts` NEW + `Onboarding.tsx` parse
- D002 Zod engine boundary (Constraint Object + Coach context) — `src/engine/schemas/constraintObject.ts` NEW
- D003 Zod Firebase RTDB read/write boundary — `src/firebase.js` + `src/db.js`
- D004 Branded types appStore — `src/react/stores/appStore.ts` + `branded.ts` NEW (UID, sessionId, exerciseId, persona)
- D005 FSM discriminated unions Mode Detection — `src/engine/fsm/modeDetection.ts` (idle | starting | active | resting | finishing)

**§D.2 Persona + Inter font + a11y triple (D006-D010, 5 tasks):**
- D006 Persona wrapper hoist Layout.tsx (extends Wave B B079 stub)
- D007 Inter font self-host `/public/fonts/` + `@font-face` + preload (Google Fonts CDN drop — GDPR + offline)
- D008 prefers-reduced-motion full refactor (extends Wave A A023)
- D009 Skip-link full refactor (extends Wave A A024)
- D010 Autocomplete=on form attrs sweep (extends Phase 7 LANDED Auth email)

**§D.3 GDPR + Backup/DR + Firebase rules + Telemetry (D011-D016, 6 tasks):**
- D011 Privacy Policy content live (extends Wave A A025) — `SettingsTerms.tsx` + `privacyPolicy.ro.md`
- D012 T&C content live (extends Wave A A026) — `termsAndConditions.ro.md`
- D013 GDPR right-to-erasure functional verify (extends Wave A A027)
- D014 Backup/restore DR runbook + fresh device test (extends Wave A A034+A035)
- D015 Firebase rules CLI deploy — `firebase.json` + `.firebaserc` + `scripts/deploy-rules.cjs`
- D016 Telemetry opt-in flow honor Sentry — `src/util/sentry.js` + `appStore.telemetryOptIn`

**§D.4 i18n + DST + Library + Phase BATCH + Math + PWA + FSM + Tier (D017-D024, 8 tasks):**
- D017 DST transition tests + isoWeek audit
- D018 i18n EN locale stub
- D019 Library 657 count verify (currently 650 measured)
- D020 Phase 5+6 BATCH verify orphan stubs scan (extends Wave A A039)
- D021 Engine math precision audit + Stryker mutation testing nightly
- D022 PWA UpdatePrompt + NetworkFirst Firebase (extends Wave A A029+A030)
- D023 Mode Detection FSM 5-mode strict transition + adversarial test (closes D005 partial)
- D024 DB tier mapping audit + sync strategy verify (extends Wave A A036)

**§D.5 Bundle + ESLint + Tailwind CSS vars (D025-D029, 5 tasks):**
- D025 Bundle code-split full per-screen + per-sub-screen (extends Wave A A011+A012 to all routes)
- D026 Tailwind ↔ CSS vars migration full (extends Wave A A021)
- D027 ESLint ratchet rules error level + jsx-a11y add
- D028 Firebase rules CLI deploy full (extends D015)
- D029 deploy.yml + ci.yml test gate refactor full (Phase 7 LANDED — verify gaps)

**§D.6 Beta entry + Prod ops + GDPR portability + Auth + T&S + Supply chain (D030-D035, 6 tasks):**
- D030 Beta entry criteria checklist sign-off (extends Wave A A040)
- D031 Prod ops runbook + healthcheck script (extends Wave A A031+A032+A033)
- D032 GDPR portability functional verify (extends Wave A A028) — `SettingsExport.tsx` + `portabilityTest.spec.ts`
- D033 Auth flow full audit verify (Mock removed + sendMagicLink wired + ProtectedRoute listener + AuthCallback finalize + Onboarding gate)
- D034 Trust & Safety positioning copy + filter audit
- D035 Supply chain hygiene — SBOM generate nightly + Snyk monitor + npm audit production filter

---

## §4 Wave D-specific guidance

### §4.1 Goal-Driven primary — Beta blocker lens

Every Wave D task answers: "Does this contribute to Beta gate criteria 5/5?"

If NO → mark deferred to iter 2 OR Cluster E.

### §4.2 Multi-file refactor discipline

Per task: 1 coherent feature/concern across multiple files = 1 atomic commit. Avoid:
- Mixing unrelated multi-file changes in 1 commit
- "Drive-by" file edits beyond task scope
- Refactor adjacent code "while we're here"

### §4.3 Test impact mandatory for refactor

Wave D refactor scope = wide blast radius. Per task:
1. Identify test specs covering refactored files
2. Run full `npm run test:run` post-edit (NOT just relevant spec)
3. Fix test failures BEFORE commit
4. Document new tests added per refactor

### §4.4 Stubs LANDED in Wave A extend in Wave D

Many Wave A tasks created stub runbooks + skeleton implementations. Wave D extends each:
- A025-A028 GDPR stubs → D011-D013 functional content + verify
- A031-A033 Prod ops stubs → D031 full runbook + scripts
- A034-A035 Backup/DR stubs → D014 full procedures
- A029-A030 PWA stubs → D022 full UpdatePrompt + offline strategy
- A011-A012 bundle stubs → D025 full per-sub-screen lazy
- A021 Tailwind stub → D026 full CSS vars migration

Don't double-write. Cite Wave A commit SHA in Wave D commit body.

### §4.5 Cluster E paradigm decisions impact Wave D

By Wave D start, Daniel should have most Cluster E paradigm decisions LANDED (parallel sessions). Wave D respects decisions:
- E001 SettingsPrefs swap impl per decision
- E007 Phase 6 prod-extras keep+amend OR remove per decision
- E008 BodyData drift per decision
- E020 Google OAuth + Skip-auth per Slice 1.x decision

IF decisions still PENDING → defer affected Wave D tasks to iter 2.

---

## §5 Fail-stop per task

Same as Wave A §4. Stash + mark FAILED + continue.

**Wave D-specific:** Refactor partial state = dangerous. IF mid-task fail, prefer `git reset --hard HEAD` to clean stash, mark FAILED. Better fresh restart task than partial broken state.

---

## §6 Post-Wave D completion (Iter 1 CC autonomous FINAL)

```bash
npm run test:run 2>&1 | tail -20
npm run typecheck 2>&1 | tail -10
npm run build 2>&1 | tail -20
npm run lighthouse 2>&1 | tail -10  # Track 7 Lighthouse — verify perf budget post-bundle
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-d-post.json

git tag post-wave-d-iter1-v2-2026-05-XX
git tag iter-1-mass-fix-v2-COMPLETE-2026-05-XX
git push origin post-wave-d-iter1-v2-2026-05-XX
git push origin iter-1-mass-fix-v2-COMPLETE-2026-05-XX
git push origin main

cat > 📤_outbox/LATEST.md << 'EOF'
# Wave D LANDED — Iter 1 Mass Fix V2 COMPLETE (4/4 Waves)

## Status
ITER 1 CC AUTONOMOUS COMPLETE

## Wave D tasks executed
- D001-D035: <N LANDED> / <M NO-OP> / <K FAILED> / <X DEFERRED Cluster E or iter 2>
- Distinct CRIT/HIGH closed: ~42

## Iter 1 aggregate metrics
- Wave A: ~40 tasks LANDED, ~46 CRIT/HIGH closed
- Wave B: ~150 tasks LANDED, ~205 individual findings closed
- Wave C: ~80 tasks LANDED, ~110 individual findings closed
- Wave D: ~35 tasks LANDED, ~42 CRIT/HIGH closed
- Cluster E Daniel parallel: <X LANDED> / <Y PENDING>
- **TOTAL findings closed iter 1: ~403-423 of ~870 actionable = ~46-49% closure**

## Build + Tests
- Tests: <X> PASS (vs 4290 baseline pre-iter-1)
- Typecheck: 0 errors
- Build: OK, main bundle <Z>KB (target ≤145KB)
- Lighthouse: <perf>/100, <a11y>/100, <best-practices>/100, <seo>/100

## Commits + Push iter 1 total
- Commits: ~305 atomic
- Tags: pre-wave-a/b/c/d + post-wave-a/b/c/d + iter-1-mass-fix-v2-COMPLETE
- Push: origin main + all tags ✓

## Issues + Deferred
- Failed tasks: <enumerate with stash IDs>
- Deferred Cluster E pending: <enumerate>
- Deferred iter 2 scope: <enumerate>

## Next action — Iter 1 EXIT audit
Run Iter 1 EXIT audit per ORCHESTRATOR.md §8:
1. Audit Nuclear V4 D029 mirror procedure pe HEAD post-iter-1
2. Mockup vs Prod V2 audit pe HEAD post-iter-1
3. Track 7 systems scan aggregate
4. Aggregate convergence report 📤_outbox/iter-1-convergence-2026-XX/_aggregate-findings.md
5. Daniel CEO decision:
   - CONTINUE iter 2 if remaining ≥ ~100 dual-source
   - EXIT iter loop if 0/0 dual-source → Daniel single comprehensive smoke a-z → Beta launch

EOF
```

---

## §7 Karpathy Wave D axis

- **GD (Goal-Driven):** ~95% of Wave D — Beta gate primary lens, multi-file refactor coherent
- **TBC (Think Before Coding):** ~5% (FSM + Branded types + Zod schema design)

NO SC, NO SF în Wave D scope.

---

## §8 Anti-recurrence

- D008 source verify per file affected
- D015 mockup verbatim (if UI surface touched)
- D023 vault writes filesystem
- D026 Vitest 4290+ baseline preserve + new tests added
- D029 stale-baseline grep audit-fix per file
- D031 push manual final at end-of-Wave
- D041 anti-inflation aggregate iter 1 metrics honest reporting (NU compound, measured per-source)
- D-LEGACY-064 Romanian no-diacritics in any UI surface touched

---

🦫 **Wave D — START.** Read `_MASTER_BACKLOG.md §D`. Execute 35 tasks D001-D035 per §2 loop. Multi-file refactor discipline. Extends Wave A stubs. Push manual final. Write LATEST.md COMPLETE iter 1 report. Daniel triggers Iter 1 EXIT audit.
