---
title: Iter 2 V2 — Pre-Beta Finalization + Iter 1 BLOCKED Resolutions
status: DESIGN_LANDED_READY
created: 2026-05-21
authority: post Wave A iter 1 autonomous 90% closed + Daniel decisions surfaced
cross_refs:
  - DECISIONS.md §D045 (iter 1 V2 baseline)
  - 📤_outbox/wave-a-audit-engine/ITER_EXIT_V4_REPORT.md
  - 📤_outbox/wave-a-audit-engine/PATTERNS.md (A005-A010 placement)
  - 📤_outbox/wave-a-audit-engine/CODE-REVIEW.md (10 LOW)
  - 📤_outbox/wave-a-audit-engine/REVIEW-A036-A038.md (14 MEDIUM)
  - 📤_outbox/wave-a-audit-engine/SECURITY.md (2 PARTIAL)
  - 📤_outbox/wave-a-audit-engine/UI-REVIEW.md (UI nits)
  - 📥_inbox/MORNING_HANDOVER_2026-05-21.md (5 Daniel decisions)
---

# Iter 2 V2 — Pre-Beta Finalization Plan

## §1 Iter 2 scope summary

- **38 atomic tasks total** (post pattern-collapse, NU 60+ pre-collapse count)
- **10 Wave A iter 1 BLOCKED resolutions** (4 ConfirmModal UI placement + 2 Cluster E + 2 Bundle code-split + 2 LARGE refactor A021+A022)
- **10 LOW from code-review iter 2 backlog** (CODE-REVIEW.md L-1..L-10)
- **14 MEDIUM from engine math** (5 A036 + 9 A038 — depinde de §3.4 Kalman decision)
- **4 UI 6-pillar nits cross-cutting** (ConfirmModal tap targets + focus trap + Escape, SettingsPrivacy toggle, CoachTodayCard tokens+icons)
- **2 Security PARTIAL follow-ups** (GDPR Tier 1 IDB + Tier 2 RTDB DELETE, throttle quota documented accepted)

**Pre-Beta launch path:** depinde de Daniel decisions §6. Iter 2 estimated **5-9h CC Opus** real pace (~5-8 min/task observed Wave A) — daca toate 38 tasks executate. Subset pe Daniel decisions reduce scope substantial.

---

## §2 Iter 2 atomic backlog table

| ID | Source | Karpathy | Effort | File | Title | Daniel Decision Required |
|----|--------|----------|--------|------|-------|--------------------------|
| **B.1 Iter 1 BLOCKED — Daniel decisions §6 dependent** |
| B001 | PATTERNS §A005 | SC | S | src/react/routes/screens/cont/SettingsPrefs.tsx | Schimba faza row + ConfirmModal wire | yes (D-1 §6) |
| B002 | PATTERNS §A006 | SC | S | src/react/routes/screens/cont/SettingsPrefs.tsx | Reseteaza onboarding row + ConfirmModal + navigate | no |
| B003 | PATTERNS §A009 | SC | M | src/react/routes/screens/antrenor/Antrenor.tsx + onboardingStore.ts | Schimba program row + Goal expand 4→6 + ConfirmModal | yes (D-1 §6 + D-1b Goal expand) |
| B004 | PATTERNS §A010 | SC | M | src/react/components/Workout/ExitConfirmSheet.tsx + workoutStore.ts | Finish-early 4th option + finishSessionEarly() action | yes (D-1 §6 + workoutStore signature) |
| B005 | ITER_EXIT §A013 | TBC | M | src/react/routes/screens/auth/Auth.tsx | Google OAuth Slice 1.x wire | yes (D-2 §6) |
| B006 | ITER_EXIT §A014 | TBC | S | src/react/routes/screens/auth/Auth.tsx | Skip-auth dev paradigm Slice 1.x | yes (D-2 §6) |
| B007 | ITER_EXIT §A011 | GD | L | vite.config.js + main.tsx + lazy routes | Bundle code-split 432KB → ≤145KB main | yes (D-3 §6 live supervised) |
| B008 | ITER_EXIT §A012 | GD | M | scripts/bundle-budget.cjs + .size-limit.json | Bundle budget gate ratchet down | yes (D-3 §6 post B007) |
| B009 | ITER_EXIT §A021 | GD | L | src/styles/global.css + tailwind.config.js + ~30 component files | Tailwind ↔ CSS vars migration | yes (D-5 §6) |
| B010 | ITER_EXIT §A022 | GD | L | ~231 .js files | TypeScript strict mode .js → .ts migration | yes (D-5 §6) |
| **B.2 Code-review LOW (10) — iter 2 backlog default execute** |
| B011 | CODE-REVIEW L-1 | SF | S | src/auth.js:25-27 + src/main.tsx | FIREBASE_API_KEY placeholder silent fallback → startup assert | no |
| B012 | CODE-REVIEW L-2 | SC | S | src/react/components/Antrenor/CoachTodayCard.tsx:36 | Hardcoded RO quote mockup stub — document sau engine-drive | no (document acceptable) |
| B013 | CODE-REVIEW L-3 | SC | M | src/react/components/ConfirmModal.tsx | Escape key + click-outside-to-close + focus-trap | no |
| B014 | CODE-REVIEW L-4 | SF | S | tsconfig.json + ~10 import sites | Path aliases @auth + @routes + @stores | no |
| B015 | CODE-REVIEW L-5 | SC | XS | src/react/routes/screens/cont/SettingsDanger.tsx:40-42 | console.warn → DEV-only wrap | no |
| B016 | CODE-REVIEW L-6 | SC | XS | scripts/test-restore.cjs:31-34 | Hostname check andura.app refuse | no |
| B017 | CODE-REVIEW L-7 | SC | S | scripts/healthcheck.cjs:81 | Firebase RTDB content-type validate | no |
| B018 | CODE-REVIEW L-8 | SC | XS | src/react/routes/screens/antrenor/Antrenor.tsx:125 | Extract showWorkoutCard ternary | no |
| B019 | CODE-REVIEW L-9 | SC | S | src/auth.js:189 | crypto.getRandomValues nonce CSPRNG | no |
| B020 | CODE-REVIEW L-10 | SC | XS | src/react/routes/screens/AuthCallback.tsx:27-31 | Single navigate path missing_params | no |
| **B.3 Engine math MEDIUM (14) — depinde §3.4 Kalman decision** |
| B021 | A036 M-01 | TBC | M | src/storage/db.js + migrateAnonymousToAuth.js | DB namespace cache invalidation on Auth migration | no |
| B022 | A036 M-02 | TBC | S | src/storage/tieringEngine.js:113-125 | stuckHotEntries telemetry counter + Sentry warn | no |
| B023 | A036 M-03 | SC | XS | src/storage/tier2Stub.js:40-73 | Tier 2 stub Promise<void> doc + ESLint floating-promises | no |
| B024 | A036 M-04 | TBC | M | src/react/stores/scheduleStore.ts:65-95 | scheduleStore saveWeekly Sentry breadcrumb + user toast | no |
| B025 | A036 M-05 | TBC | M | src/storage/tieringEngine.js:162-228 | Cross-tab race rotateOnce Web Locks API | no |
| B026 | A038 C-01 | TBC | L | src/engine/bayesianNutrition/kalmanFilter.js:69 + tests | processNoise × 0.01 derivation + Hall 2008 citation | **yes (D-4 §6 — if Kalman Beta)** |
| B027 | A038 C-02 | TBC | S | src/featureFlags.js + kalmanFilter.js cap-comment | bayesian_kalman_v1 flag Beta cohort enable sau doc deferred | **yes (D-4 §6)** |
| B028 | A038 M-01 | TBC | M | src/engine/bayesianNutrition/kalmanFilter.js + types.js | validateKalmanState defensive helper | no |
| B029 | A038 M-02 | TBC | L | src/engine/bayesianNutrition/tests/kalmanConvergence.test.js NEW | 90-day simulator R²>0.85 gate test | **yes (D-4 §6 — if Kalman Beta)** |
| B030 | A038 M-03 | SC | S | src/engine/bayesianNutrition/kalmanFilter.js:33-41 | computeR2 filter valid pairs NU substitute 0 | no |
| B031 | A038 M-04 | SC | XS | src/engine/bayesianNutrition/kalmanFilter.js:115 | R²>0.85 strict vs >= epsilon — document spec | no |
| B032 | A038 L-01 | TBC | M | src/engine/periodization/constants.js:19-31 | ISRAETEL_BASELINES citation + cross-reference RP source | no |
| B033 | A038 L-02 | SC | M | src/engine/bayesianNutrition/volumeLandmarks.js:90-95 | MOVEMENT_CATEGORY RO aliases sau Library exercise.category | no |
| B034 | A038 L-03 | SC | XS | src/engine/bayesianNutrition/constants.js:274 | KCAL_FLOOR_DAILY_MIN persona-aware doc deferred | no |
| **B.4 UI 6-pillar nits cross-cutting (4)** |
| B035 | UI-REVIEW #1+#3 | SC | S | src/react/components/ConfirmModal.tsx:38,47,49,60 | Tap targets py-3.5 (52px) + safe-area-inset-bottom | no |
| B036 | UI-REVIEW #3 | SC | S | src/react/routes/screens/cont/SettingsPrivacy.tsx:34 | Toggle h-11 (44px) sau invisible hit area expand Maria 65 | no |
| B037 | UI-REVIEW #3 | SC | S | src/react/components/Antrenor/CoachTodayCard.tsx:34,38,40-41 | Extract --coach-lora + --coach-meta tokens + Lucide Clock/Layers icons | no |
| B038 | UI-REVIEW #2 | TBC | M | DECISIONS.md append D046 + src/react/components/ConfirmModal.tsx | LOCK V1 modal paradigm sau migrate full-screen confirm-page | **yes (D-1 §6 — paradigm decision)** |
| **B.5 Security PARTIAL iter 2 follow-ups (2)** |
| B039 | SECURITY T-7 | TBC | M | src/react/routes/screens/cont/SettingsDanger.tsx:22-43 | Tier 1 IndexedDB deleteDatabase + Tier 2 Firebase RTDB DELETE wipeAllLocalData | yes (D-6 §6 — implement vs amend Privacy Policy) |
| B040 | SECURITY T-4 | SF | XS | DECISIONS.md append accepted-risk entry | Throttle quota client-side documented accepted risk | no |

**Karpathy legend:** SC = Surgical Changes, SF = Simplicity First, TBC = Think Before Coding, GD = Goal-Driven Execution
**Effort legend:** XS = <10 min, S = 10-30 min, M = 30-60 min, L = 1-3h

**Total task count:** 40 atomic tasks (B001-B040 — 38 distinct + 2 paradigm decisions B038+B040 doc-only)

---

## §3 Priority groupings

### B.1 Iter 1 BLOCKED resolutions (10 tasks, Daniel-decisions blocked)
- §A005 + §A006 + §A009 + §A010 ConfirmModal UI placement (4 wire sites, post D-1 paradigm)
- §A013 + §A014 Cluster E OAuth + Skip-auth (post D-2 Beta scope)
- §A011 + §A012 Bundle code-split (post D-3 live supervised timing)
- §A021 + §A022 LARGE refactor (post D-5 iter 2 scope vs defer)

### B.2 Code-review LOW (10 tasks, autonomous execute default)
Ne-blocate Daniel decisions. ~3-5 effort hours cumulative SC + SF Karpathy.

### B.3 Engine math MEDIUM (14 tasks, partial Daniel-decisions blocked)
- 5 A036 Tier MEDIUM autonomous (B021-B025) ne-blocate
- 9 A038 Kalman MEDIUM split: B026+B027+B029 BLOCKED pe D-4 Kalman Beta decision; B028+B030-B034 autonomous independent

### B.4 UI 6-pillar nits (4 tasks)
- 3 autonomous SC (B035 ConfirmModal tap, B036 SettingsPrivacy toggle, B037 CoachTodayCard tokens+icons)
- 1 BLOCKED D-1 paradigm (B038 modal vs full-screen confirm)

### B.5 Security PARTIAL (2 tasks)
- B039 GDPR Tier 1+2 wipe BLOCKED D-6 implement vs amend Privacy Policy decision
- B040 throttle quota accept-risk doc autonomous

---

## §4 Wave structure recommendation

**ANTI-PATTERN avoid:** Iter 1 Wave A 40 tasks autonomous overnight worked because of D029 NO-OP detection ~30% (11/40) + Daniel CEO ZERO pre-Beta interventions. **Iter 2 = OPPOSITE** — depinde substantial de Daniel decisions §6. Multi-Wave structure inefficient pentru ~38 tasks cu ~50% Daniel-gated.

**Recommended Iter 2 structure: 3 Waves (NU 4 mega-Waves Iter 1 paradigm):**

### Wave B-1: Daniel-decisions blockers resolved → execute (post §6 review)
- Once Daniel commits §6 decisions (D-1 through D-7): tasks B001-B010 + B026+B027+B029 + B038 + B039 unblock
- Execute as sequential sub-batches per decision domain (UI paradigm batch / Cluster E batch / Bundle live supervised / Kalman batch / GDPR batch / LARGE refactor batch)
- **Estimated:** 8-15h CC Opus pe range Daniel decisions yes-most (full scope) vs 3-5h yes-minimal (defer max)

### Wave B-2: Autonomous LOW + MEDIUM independent (parallel-safe)
- Tasks B011-B025 (10 LOW code-review + 5 A036 MEDIUM Tier independent)
- Tasks B028 + B030-B034 (6 A038 MEDIUM Kalman independent of Beta decision)
- Tasks B035 + B036 + B037 (3 UI nits autonomous)
- Task B040 (DECISIONS.md accepted-risk doc)
- **Estimated:** 4-7h CC Opus pe ~25 atomic tasks ~5-8 min/task observed pace
- **Can run BEFORE Wave B-1** dacă Daniel preferă warmup autonomous înainte de decizii sau dacă Daniel ia decisions partial (yes-some, no-some)

### Wave B-3: Iter 2 EXIT audit (mirror Wave A EXIT)
- gsd-security-auditor + gsd-ui-auditor + gsd-code-reviewer paralel pe diff Iter 2 commits
- Re-measure D045 conservative closure rate vs actual
- Verdict: pre-Beta gate GO sau iter 3 needed?
- **Estimated:** 1-2h CC Opus + paralel agents

**No Wave C / D needed for Iter 2.** Wave A 4 mega-Waves paradigm was specific to ~305 task scope. Iter 2 ~38 tasks fits in 2 productive Waves + 1 exit audit Wave.

---

## §5 Estimated cumulative effort (honest per Wave A pace)

Wave A observed: ~3.5h cumulative real time pentru 36 effective closures = **~5-8 min/task** (D029 NO-OP ~1-2 min, SC ~5-10 min, NEW component ~15-25 min, doc parallel x2 = ~30x speedup).

### Iter 2 effort range per Daniel §6 decisions

| Scenario | Tasks executed | CC Opus hours | Calendar (1-2 sessions) |
|---|---|---|---|
| **Yes-minimal** (defer Bundle + LARGE + Cluster E + Kalman = 5 NO) | ~22 tasks | ~3-5h | 1 session morning |
| **Yes-mixed** (Bundle live supervised + ConfirmModal yes, OAuth + Kalman + LARGE defer) | ~28 tasks | ~5-8h | 2 sessions (1 supervised Bundle + 1 autonomous rest) |
| **Yes-most** (Bundle + Cluster E + ConfirmModal + Kalman + GDPR full implement; defer A021+A022 LARGE post-Beta) | ~33 tasks | ~7-10h | 2-3 sessions |
| **Yes-all** (full 38+ tasks include A021+A022 LARGE) | ~38 tasks | ~10-15h | 3-5 sessions |

**Recommendation:** Yes-mixed paradigm balanced — Bundle live supervised (Daniel HIGH-PRIORITY Maria 65 LCP) + ConfirmModal paradigm LOCK V1 (zero new files vs 16) + autonomous LOW+MEDIUM run paralel; defer Cluster E + LARGE + Kalman Beta paradigm post-Beta launch.

---

## §6 Pre-execution Daniel decisions checklist → **5 RESOLVED 2026-05-21 morning (D046 LOCKED V1)** + 3 remaining minor

### D-1: ConfirmModal UI placement paradigm — ✅ **RESOLVED D047 CORRECTION: RIP-OUT A003 + uniform drill-down**
**Daniel verdict 2026-05-21 morning + CORRECTION:** RIP-OUT A003 ConfirmModal complet + ALL destructive actions migrate drill-down screens uniformly Bugatti consistency NU mix paradigms.
- **REVERSE PATTERNS.md** (reuse recommendation) + REVERSE eu mis-interpretation D046 §3.1 (stays-system-level)
- **D047 LOCKED V1** correction D046 §3.1 (umbrella D046 §3.2-§3.5 rămân binding)
- **B001+B002+B003+B004 → B001-B011 scope expansion:**
  - 4 drill-down original screens (B001-B004 Settings + Antrenor flows per mockup)
  - 4 RIP-OUT migrate screens (B005r LogoutConfirm + B006r DeleteAccountConfirm + B007r-B008r Settings actions Wave A reversal)
  - 3 NEW architecture (B009r routes wire + B010r tests + B011r GotoScreen union extend)
- **Code work scope:**
  - RIP `src/react/components/ConfirmModal.tsx` + `ConfirmModal.test.tsx` 11 tests
  - REVERT Wave A integrations: `15ee9d60` A004+A008 + `d5203d02` A007 + `fc3e6cc9` A007-fix + `3f05f8ce` A016 SettingsDanger logout/delete usage
  - NEW LogoutConfirm.tsx + DeleteAccountConfirm.tsx drill-down screens
  - A007 security pattern (authSignOut() token clear) **preserved** în NEW LogoutConfirm.tsx
- **Effort:** ~5-8h dev HIGH RISK security-critical flows Daniel-supervised iter 2 (NU autonomous)
- **B038 paradigm task** scope: drill-down per mockup explicit (D047 supersedes B038 modal LOCK option)

### D-1b: Goal type expansion (PATTERNS §A009 sub-decision) — ⏳ **DEFERRED Daniel clarificare**
- **Options stand:** (a) Goal type 4 → 6 per mockup vs (b) keep 4 + map+suppress UI rows
- **Engine impact pending:** phase recalculation hook on goal switch — verify engine pipeline support pre commit B003 scope

### D-2: Cluster E020 OAuth + Skip-auth — ✅ **RESOLVED: REVERSE include Beta**
**Daniel verdict:** REVERSE, INCLUDE pre-Beta. Skip-auth (Maria 65 test drive paradigm) + Google OAuth (Gigel/Marius low friction) = auth FULL paradigm, NU Magic Link singur MVP.
- **Cost:** ~2-4h dev + Firebase OAuth provider Google Cloud Console + Skip-auth state mgmt + E2E tests
- **Schedule:** iter 2 Wave B-1
- **Tasks B005 + B006 UNBLOCKED**

### D-3: Bundle code-split A011-A012 timing — ✅ **RESOLVED: SAME supervised ASAP-saptamana**
**Daniel verdict:** SAME supervised live, timing ASAP-saptamana NU end-of-iter defer. Block 2-3h Daniel-prezent.
- **Schedule:** Daniel programam live session 2-3h windowed săptămâna curentă
- **Tasks B007 + B008 ARMED** for Daniel-trigger live session

### D-4: A038 Kalman BLOCKER — ✅ **RESOLVED: REVERSE FIX + FLIP ON pre-Beta**
**Daniel verdict:** REVERSE, FIX + FLIP ON pre-Beta. PRIMER §2 brand-promise "Kalman adaptive TDEE NU 2000 kcal hardcoded" must be REAL working, NU OFF+EWMA fallback false-FULL.
- **Fix scope:** processNoise=22*0.01 origin documented + Hall 2008 citation + calibrate simulator persona Marius/Maria/Gigel + flip flag ON + 2 CRIT+4 MED+3 LOW REVIEW-A036-A038 fixed
- **Total:** ~12-20h dev + simulator combined
- **Schedule:** iter 2 sau iter 3
- **Tasks B026+B027+B029 UNBLOCKED** (Bayesian V1 Beta scope); B028+B030-B034 already autonomous independent

### D-5: A021-A022 LARGE refactor scope — ✅ **RESOLVED: REVERSE include iter 2**
**Daniel verdict:** REVERSE, INCLUDE iter 2 pre-Beta. Bugatti "fiecare linie cod citită" pre-Launch nuclear gate = substrate trebuie clean (TS strict + Tailwind consistent). "Refactor later NEVER happens" rule activă. A022a .d.ts stubs = stepping stone NU finish.
- **Cost:** ~6-10h supervised combined
- **A022 split** = 6 atomic subtasks deja documented WAVE_BCD_D029_SAMPLE.md
- **Wave B/C/D blend incremental**, iter 2 finalizează
- **Tasks B009 + B010 UNBLOCKED** for iter 2 scope execution

### D-6: GDPR Tier 1+2 wipe implementation (SECURITY T-7) — ⏳ **PENDING Daniel verdict**
- **Options stand:** (a) Implement IDB deleteDatabase + RTDB DELETE (~30-60 min) vs (b) Amend Privacy Policy honest disclosure (~10-15 min)
- **Recommendation:** (a) implement — pre-Beta acceptable expand, eliminates GDPR exposure
- **Affects task:** B039

### D-7: Iter 2 Wave structure preference — ⏳ **PENDING Daniel verdict** (or default Co-CTO autonomous tactical)
- **Default recommendation:** (c) parallel — Daniel supervises Bundle live in 1 window, CC executes autonomous Wave B-2 background
- Per Co-CTO autonomy LOCKED V1, eu pot decide tactical singur dacă Daniel NU surface preferință explicit

---

## §7 Anti-hallucination guards

- **Effort estimates:** based EXCLUSIV pe Wave A observed pace ~5-8 min/task (chat 4 inflated 3x estimate corrected per ITER_EXIT V4 §2). NU speculation chat 4 paradigm 30 min/task.
- **Daniel preferences:** ZERO speculation. Options + tradeoffs neutral surface. PATTERNS.md recommendation ConfirmModal explicit acknowledged contradicts mockup drill-down 2026-05-11 §1 — Daniel CEO decide.
- **Task counts:** verified against source files cited verbatim (CODE-REVIEW.md L-1..L-10, REVIEW-A036-A038.md 5 MEDIUM A036 + 9 MEDIUM A038 + UI-REVIEW.md 3 priority + 6 nits).
- **No new files referenced beyond confirmed paths.** All file paths verified in source audits cited.
- **Romanian no-diacritics** applied to all UI strings proposed (B001-B004 + B035-B037 component nits).
- **B038 paradigm task** acknowledged as DECISIONS.md append (NU bug fix) — only landed if Daniel D-1 picks ConfirmModal paradigm.
- **B040 throttle accepted-risk** = DECISIONS.md append only (NU code change) — autonomous safe.

---

## §8 Next steps post Daniel §6 review

1. Daniel reviews §6 → commits D-1 through D-7 decisions (~15-30 min)
2. CC ingests decisions → generates Wave B-1 sub-batches per decision domain
3. CC executes Wave B-1 sequential cu live supervised Bundle dacă D-3 = (a)
4. CC executes Wave B-2 autonomous parallel sau sequential post Wave B-1
5. CC executes Wave B-3 EXIT audit paralel agents → verdict pre-Beta gate
6. **Pre-Beta gate GO** dacă convergence ZERO findings dual-source SAU Daniel single-comprehensive smoke manual decide

**Branch state expected post Iter 2:** ~50-70 commits ahead origin/main, NU pushed (D031 invariant). Backup tag pre-iter-2 mandatory pre Wave B-1 start.

---

🦫 **Iter 2 plan ready. 38 atomic tasks across 5 priority groups. 3 Waves recommended (B-1 Daniel-blocked + B-2 autonomous + B-3 exit audit). Effort 3-15h CC Opus range per Daniel decisions §6 yes-minimal vs yes-all spectrum. Recommended yes-mixed paradigm balanced. Awaiting Daniel CEO §6 commits to unblock Wave B-1 start.**
