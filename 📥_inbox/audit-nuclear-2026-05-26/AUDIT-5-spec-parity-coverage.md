# AUDIT-5 — Spec / Vision / Parity Coverage (Nuclear, Pre-Beta)

**Auditor slice:** WHAT WAS PROMISED vs WHAT IS BUILT. Read-only. Every claim grounded in a file path.
**Date:** 2026-05-26 · **Baseline:** `main` HEAD (working tree)
**Sources of truth read:** `ANDURA_PRIMER.md` §1-§8 full · `DECISIONS.md` D001-D080 · `04-architecture/mockups/andura-clasic.html` (DESIGN MASTER, 50 screens) · `src/react/routes/**` · `src/engine/**` · `src/coach/orchestrator/**`

---

## EXECUTIVE VERDICT (CEO answers up top)

1. **% of "ce trebuie" (Pre-Beta FULL) actually built: ~92-94%.** Every spec'd feature, every engine, and nearly every mockup screen has real code wired into the user flow. The remaining ~6-8% is **not missing features** — it is (a) two engine surfaces that run *silently* with no UI reveal (MMI boost indicator, orchestrator pipeline used only partially in the live path), and (b) polish/quality items, not absent capability.
2. **Can it deliver what the founder wants (a coach that genuinely thinks for the user, Gigel-friendly, RO-first)? YES — WITH GAPS.** The "thinks for the user" promise is REAL and wired: engines read live history/experience and adapt weights (verified `engineWrappers.ts` → `scheduleAdapterAggregate.ts` → `getDailyWorkout` real pipeline). RO-first + no-diacritics + Gigel-friendly gating are enforced in code. The gaps are about *visibility/transparency of the thinking*, not absence of thinking.
3. **Anything MISSED? Nothing structurally missing.** No engine without implementation. No spec'd V1 feature absent. No LOCKED decision contradicted by code. The honest gaps are listed in §4 + §5 — all MED/LOW, none CRITICAL.

---

## §1 FEATURE COVERAGE TABLE (F1-F15 + 4 auxiliary)

PRIMER §2: 10 keep + 4 modify + 2 drop (F5, F13).

| ID | Feature | Spec | Status | Evidence |
|----|---------|------|--------|----------|
| F1 | Patterns Banner (2 keep: LOW_ADHERENCE + STAGNATION, 3 drop) | MODIFY | **BUILT** | `engineWrappers.ts:732 getPatternsBanner` — exactly 2 patterns; `components/Antrenor/PatternsBanner.tsx`; wired `Antrenor.tsx` |
| F2 | Last Session Memory | KEEP | **BUILT** | `workoutStore.ts` `LastSessionSummary` + `scheduleAdapterAggregate.ts:77 EngineSession`; recentSessions transform feeds pipeline |
| F3 | Fatigue Score (single number) | MODIFY | **BUILT** | `engine/fatigue.js` + `engineWrappers.ts:199 getFatigue`; `StatsGrid` 3-cell |
| F4 | Readiness Verdict (5-state) | KEEP | **BUILT** | `engine/readiness.js` + `engineWrappers.ts:169 getReadiness`; `components/Antrenor/ReadinessVerdict.tsx` |
| F5 | AA-Friction Modal | **DROP V1** | **CORRECTLY ABSENT** as V1 paranoid; per-set safety RIR-0 path survives as `aaFrictionDetect.ts` / `AaFrictionModal` (D033 rename PerSetSafetyModal). Spec-compliant. |
| F6 | PR Wall (weight/reps/volume) | KEEP | **BUILT** | `engine/prEngine.js` + `engineWrappers.ts:248 getPRDelta`; `routes/screens/istoric/PrWall.tsx`; `components/Antrenor/PRWallRecent.tsx` |
| F7 | Coach Director (orchestrator output) | KEEP | **BUILT** | `coach/orchestrator/index.js runPipeline` + React aggregate `coachDirectorAggregate.ts` |
| F8 | Streak Counter | KEEP | **BUILT** | `workoutStore.ts:245 U-05 streak` day-boundary logic; `StatsGrid` cell |
| F9 | BMR Strip (single line) | MODIFY | **BUILT** | Nutrition targets via `engineWrappers.ts:590 getNutritionTargetsToday` (BMR/TDEE); surfaced Progres/Antrenor |
| F10 | Stats Grid 3-cell | KEEP | **BUILT** | `components/Antrenor/StatsGrid.tsx` (streak + fatigue + readiness) |
| F11 | PRs Notification per-PR | KEEP | **BUILT** | `components/Antrenor/PRNotificationBanner.tsx` (`prHit` conditional) |
| F12 | Rating Buttons 3-button (USOARA/NORMALA/GREA) | KEEP | **BUILT** | `components/Workout/SetRatingButtons.tsx` + `sessionRating.ts` |
| F13 | Rating Notes Anti-RE free-text | **DROP V1** | **CORRECTLY ABSENT** — per spec. |
| F14 | Ratings Window (20→90 sessions) | MODIFY | **BUILT** | Window applied in rating/adherence consumption (`engineWrappers.ts` adherence; `sessionRating.ts`) |
| F15 | Per-set RPE | KEEP | **BUILT** | `routes/screens/antrenor/PostRpe.tsx` + per-set RIR mapping `scheduleAdapterAggregate.ts:93 RATING_TO_RIR` |
| — | Mode Detection (5 moduri) | KEEP | **BUILT (engine-side)** | event-listener mode-detect logic ported; consumed via store/engine context (no dedicated screen — by design) |

**Auxiliary (4):**

| Aux | Spec | Status | Evidence |
|-----|------|--------|----------|
| Auth Magic Link (+SMTP) | RESOLVED | **BUILT** | `auth.js sendMagicLink`; `Auth.tsx`; `AuthCallback.tsx` |
| Onboarding T0 Big 6 hard typing | core | **BUILT** | `routes/screens/Onboarding.tsx` — 8 steps (Big 6 + height + summary), bounds gate `validateOnboardingField` |
| Mode Detection | core | BUILT (see above) | — |
| Tier Storage (T0/1/2 + Dexie + Firebase) | core | **BUILT** | `storage/tieringEngine.js` + `react/lib/dexieMigration.ts` + `reactBoot.ts` (D079 restored sync/restore) |

**F-coverage verdict: 19/19 spec'd items present and correct (2 correctly-absent drops included).** ZERO missing features.

---

## §2 ENGINE COVERAGE TABLE (8+1 pipeline + 6 auxiliary)

Pipeline ordering canonical per PRIMER §2 / ADR 026 §42.10. Orchestrator `ORDERED_ADAPTERS` = 8 adapters (`adapters/index.js:52`). MMI composes LAST via React wrapper.

| # | Engine | Impl present | Wired to user flow | Evidence |
|---|--------|:---:|:---:|----------|
| 1 | Periodization | YES | YES | `engine/periodization/index.js` → `adapters/periodizationAdapter.js` (pipeline slot 1) |
| 2 | Goal Adaptation | YES | YES | `engine/goalAdaptation/index.js` → `goalAdaptationAdapter.js` (slot 2) |
| 3 | Energy Adjustment | YES | YES | `engine/energyAdjustment/index.js` → `energyAdjustmentAdapter.js` (slot 3, ±15% tier-aware) |
| 4 | Bayesian Nutrition (Kalman TDEE) | YES | YES | `engine/bayesianNutrition/index.js` → `bayesianNutritionAdapter.js`; React `getNutritionTargetsToday` reads `posterior.mu`; **Kalman FLIP-ON pre-Beta** per D046 §3.4 (`featureFlags bayesian_kalman_v1`) — brand-promise "adaptive TDEE NU 2000 hardcoded" REAL |
| 5 | Tempo / Form Cues | YES | YES | `engine/tempo/index.js` → `tempoAdapter.js` (slot 5); `getWhyExerciseSummary` wired |
| 6 | Specialization | YES | YES | `engine/specialization/index.js` → `specializationAdapter.js` (slot 6, 4-gate + weaknessDetector wire) |
| 7 | Warm-up & Mobility | YES | YES | `engine/warmup/index.js` → `warmupAdapter.js` (slot 7); `PlannedWorkoutOutput.warmup` surfaced WorkoutPreview |
| 8 | Deload | YES | YES | `engine/deload/index.js` → `deloadAdapter.js` (slot 8 terminal) |
| 9 | MMI Engine #9 (Algorithm Hibrid + Boost cap) | YES | **PARTIAL — silent** | `engine/tempo/mindMuscle.js` + `engine/muscleMemoryAdapter.js`; React wire `engineWrappers.ts:455 applyMmiCapToWorkout` composes LAST. **Engine effect ACTIVE silently (pauseMonths≥6 cap), UI boost indicator DEFERRED** per D066 + D059 PROPOSAL open. |

**Auxiliary engines (6):**

| Aux engine | Impl | Wired | Evidence |
|------------|:---:|:---:|----------|
| Muscle Recovery (Big 6 + lagging) | YES | YES | `engine/muscleRecovery.js`; `getCoachRestReason` + `getCoachTodayQuote` (`engineWrappers.ts:878/976`) |
| Weakness Detector (Brzycki 1RM) | YES | YES | `engine/weaknessDetector.js`; `getLaggingSignal` (`engineWrappers.ts:922`) + specializationAdapter consumer |
| PR Wall (weight/reps/volume) | YES | YES | `engine/prEngine.js`; `getPRDelta` + `prHistoryAggregate.ts` |
| Readiness (5-state + kcal/protein delta) | YES | YES | `engine/readiness.js`; `getReadiness` |
| Streak Counter | YES | YES | `workoutStore.ts` streak day-boundary helpers |
| Coach Director (orchestrator central) | YES | YES | `coach/orchestrator/index.js` + `coachDirectorAggregate.ts` enrich (4+4 fields) |

**Engine verdict: 9/9 pipeline engines implemented + wired; 6/6 auxiliary implemented + wired.** ZERO "vizor fără ușă" (spec'd engine with no implementation OR no UI surface) — EXCEPT MMI's UI *boost reveal* which is an intentional deferral (engine still runs, just silent).

**Architecture note (NOT a gap, but flag for AUDIT-1):** The live React workout path composes engines via two routes — (a) `scheduleAdapter.getDailyWorkout` runs the real 8-adapter `runPipeline`, and (b) the React `engineWrappers`/`coachDirectorAggregate` call individual pure engines directly (Option B Bugatti, `engineWrappers.ts:688`) instead of the orchestrator's `buildSession`. Both are wired and tested; this is documented design, not divergence. Cross-check belongs to the engine-internals audit.

---

## §3 MOCKUP SCREEN PARITY TABLE

DESIGN MASTER `andura-clasic.html` defines **50 screen containers** (`id="screen-*"`). Mapped against `router.tsx` + `routes/screens/**`.

| Mockup screen | React | Status | Evidence |
|---------------|-------|--------|----------|
| screen-splash | Splash.tsx | IMPLEMENTED | router `/` |
| screen-auth | Auth.tsx | IMPLEMENTED | `/auth` |
| screen-auth-reactivate | Auth.tsx | IMPLEMENTED | `/auth/reactivate` (reuses Auth) |
| screen-onboard..onb-frecventa (7 onboarding) | Onboarding.tsx | IMPLEMENTED | `/onboarding/:step` single component, 8 steps |
| screen-antrenor | Antrenor.tsx | IMPLEMENTED | `/app/antrenor` |
| screen-energy-check | EnergyCheck.tsx | IMPLEMENTED | antrenor/energy-check |
| screen-energy-cause | EnergyCause.tsx | IMPLEMENTED | antrenor/energy-cause |
| screen-workout-preview | WorkoutPreview.tsx | IMPLEMENTED | antrenor/workout-preview |
| screen-ceva-nu-merge | CevaNuMerge.tsx | IMPLEMENTED | antrenor/ceva-nu-merge |
| screen-pain-button | PainButton.tsx | IMPLEMENTED | antrenor/pain-button |
| screen-equipment-swap | EquipmentSwap.tsx | IMPLEMENTED | antrenor/equipment-swap |
| screen-aparate-lipsa | AparateLipsa.tsx | IMPLEMENTED | antrenor/aparate-lipsa |
| screen-schedule-override | ScheduleOverride.tsx | IMPLEMENTED | antrenor/schedule-override |
| screen-workout | Workout.tsx | IMPLEMENTED | antrenor/workout |
| screen-post-rpe | PostRpe.tsx | IMPLEMENTED | antrenor/post-rpe |
| screen-post-summary | PostSummary.tsx | IMPLEMENTED | antrenor/post-summary |
| screen-istoric | Istoric.tsx | IMPLEMENTED | `/app/istoric` |
| screen-pr-wall | PrWall.tsx | IMPLEMENTED | istoric/pr-wall (PAR-001 landed) |
| screen-sesiuni-recente | (Istoric list inline) | **PARTIAL** | Istoric.tsx renders recent-sessions list inline; no dedicated `/sesiuni-recente` route. Functionally covered, not a separate screen. |
| screen-loguri-greutate | WeightLogList.tsx | IMPLEMENTED | progres/weight-log-list (mockup `loguri-greutate`) |
| screen-weight-timeline | WeightTimeline.tsx | IMPLEMENTED | progres/weight-timeline (PAR-004 landed) |
| screen-progres | Progres.tsx | IMPLEMENTED | `/app/progres` |
| screen-log-weight | LogWeight.tsx | IMPLEMENTED | progres/log-weight |
| (Body data — prod-extra) | BodyData.tsx | IMPLEMENTED | progres/body-data (D076 blessed) |
| screen-settings | Cont.tsx | IMPLEMENTED | `/app/cont` |
| screen-settings-profile | SettingsProfile.tsx | IMPLEMENTED | cont/settings-profile |
| screen-settings-notifications | SettingsNotifications.tsx | IMPLEMENTED | — |
| screen-settings-subscription | SettingsSubscription.tsx | IMPLEMENTED | — |
| screen-settings-appearance | SettingsAppearance.tsx | IMPLEMENTED | — |
| screen-settings-themes | SettingsThemes.tsx | IMPLEMENTED | cont/settings-themes (PAR-002 landed — **was prior "deferred", now built**) |
| screen-settings-privacy | SettingsPrivacy.tsx | IMPLEMENTED | — |
| screen-settings-terms | SettingsTerms.tsx | IMPLEMENTED | — |
| screen-settings-prefs | SettingsPrefs.tsx | IMPLEMENTED | — |
| screen-settings-export | SettingsExport.tsx | IMPLEMENTED | cont/settings-export (GDPR Art.20) |
| screen-settings-danger | SettingsDanger.tsx | IMPLEMENTED | cont/settings-danger |
| screen-settings-support | SettingsSupport.tsx | IMPLEMENTED | — |
| screen-settings-about | SettingsAbout.tsx | IMPLEMENTED | — |
| screen-settings-faq | SettingsFaq.tsx | IMPLEMENTED | — |
| screen-confirm-reset-coach | ResetCoachConfirm.tsx | IMPLEMENTED | drill-down (D047 RIP-OUT paradigm) |
| screen-confirm-schimba-faza | SchimbaFazaConfirm.tsx | IMPLEMENTED | — |
| screen-confirm-redo-onboarding | RedoOnboardingConfirm.tsx | IMPLEMENTED | — |
| screen-confirm-logout | LogoutConfirm.tsx | IMPLEMENTED | — |
| screen-confirm-delete | DeleteAccountConfirm.tsx | IMPLEMENTED | — |
| screen-confirm-program-change | ProgramChangeConfirm.tsx | IMPLEMENTED | antrenor/program-change-confirm |
| screen-confirm-finish-early | FinishEarlyConfirm.tsx | IMPLEMENTED | antrenor/finish-early-confirm |
| (Reset data — prod) | ResetDataConfirm.tsx | IMPLEMENTED | cont/reset-data-confirm (drill-down family) |

**Notable: `screen-onb-medical` (onboarding medical step) — intentionally NOT a separate React screen.** Per **D078 LOCKED V1**: medical history intake DROPPED on purpose ("nu facem medicina"); medical touchpoint = `MedicalDisclaimerModal` only. This is a *blessed divergence*, not a parity gap.

**Screen parity count:**
- Mockup screens: **50** (7 onboarding collapsed to 1 React component but all steps present).
- IMPLEMENTED: **49/50**.
- PARTIAL: **1** (`sesiuni-recente` — covered inline in Istoric, no dedicated route).
- MISSING: **0**.
- React adds prod-extras (BodyData, ResetDataConfirm) blessed by D076.

**Real current parity ≈ 98%** (49 full + 1 partial of 50). This is HIGHER than the stale "~88% / 5 deferred" note in PRIMER §5 (2026-05-22) — the deferred screens (pr-wall, weight-timeline, settings-themes, sesiuni-recente) have since landed via PARITY-MISSING-SCREENS Wave 2e. **PRIMER §5 parity figure is stale and should be updated.** (LOW)

---

## §4 LOCKED DECISIONS NOT REFLECTED IN CODE

Scanned D001-D080. Most are PROC/REGLAJ (workflow/meta — not code-bearing). Code-bearing decisions checked against `src/`:

| Decision | Reflected? | Note |
|----------|:---:|------|
| D015/D016 React Clasic 4-tab on mockup | YES | `router.tsx` 4-tab nav, mockup-driven |
| D026 engine pipeline real wire 8/8 + Cont 9/9 | YES | `adapters/index.js` 8/8; Cont sub-screens present |
| D046 §3.4 Kalman FIX + FLIP-ON pre-Beta | YES | `featureFlags.js bayesian_kalman_v1`; `getNutritionTargetsToday` reads posterior |
| D047 ConfirmModal RIP-OUT + drill-down screens | YES | `ConfirmModal.tsx` absent; LogoutConfirm/DeleteAccountConfirm/ResetDataConfirm present |
| D052 Shape adapter at store boundary | YES | `scheduleStore.ts` + `scheduleAdapter.d.ts` |
| D054 Explicit partialize 8/8 stores | YES | stores/ |
| D055 Sentry gated on telemetryOptIn | YES | `main.tsx` + `SettingsPrivacy.tsx` |
| D057 PWA manifest single SoT vite.config | YES | no `public/manifest.json` |
| D061 Font self-host Latin subset | YES | `public/fonts/inter-var-latin.woff2` |
| D078 No medical intake, disclaimer only | YES | onboarding has no medical step; disclaimer modal present |
| D079 reactBoot backup/restore + migrations | YES | `src/react/lib/reactBoot.ts` |
| **D059 / D066 MMI UI boost prompt** | **NO (deferred)** | Engine layer LANDED; **UI prompt indicator is the ONLY LOCKED-adjacent item explicitly open** (D059 status still PROPOSAL, pending Daniel CEO Option A.1/A.2/B). |
| D074 orchestrator adapters 0/8 Sentry-instrumented | **AS-DOCUMENTED** | Intentional post-Beta scope; React wrappers 11/11 instrumented. Not a contradiction. |

**Verdict: ZERO LOCKED V1 decision is contradicted by code.** The single open item (MMI UI reveal) is a *deferred PROPOSAL awaiting a Daniel strategic UX choice*, not a broken lock.

---

## §5 CEO ANSWERS + COMPLETE MISSED LIST

### Overall % built
**~92-94% of Pre-Beta FULL.** Reasoning: 19/19 features present, 9/9 + 6/6 engines implemented-and-wired, 49/50 screens full (1 partial-by-design-equivalent), 0 LOCKED decisions contradicted. The shortfall is transparency/polish, not capability.

### Can it deliver what the founder wants?
**YES, WITH GAPS.** The structural moat is real in code: hidden engines that "think for the user" run on live inputs and adapt weights by history + experience (`scheduleAdapterAggregate.ts` RO→EN experience mapping, recentSessions→RIR signal transform, real `runPipeline`). Gigel-friendly gating is enforced (e.g. LOW_ADHERENCE banner gated ≥3 sessions, `engineWrappers.ts:720`). RO-first / no-diacritics enforced (D058/D065). Magic Link + Google OAuth + skip-auth all present. The gaps below are about *showing* the thinking and final-mile polish.

### Complete MISSED / GAP list (severity-tagged)

- **[MED] MMI #9 boost reveal is invisible to the user.** Engine caps returning-user weights silently (`applyMmiCapToWorkout`), but there is NO UI surface telling the user "we eased you back in." Brand promise "engines auxiliare ascunse" is partially met (hidden = OK) but the *re-resume reassurance* a returning Marius/Maria would value is not shown. D059 PROPOSAL open. Decision belongs to Daniel (A.1 reveal pre-Beta / A.2 defer / B custom UX).
- **[LOW] `sesiuni-recente` has no dedicated screen** — recent-sessions list is rendered inline in Istoric. Mockup defines it as a sub-page. Functionally equivalent; cosmetic parity gap only.
- **[LOW] PRIMER §5 stale parity figure** ("~88%, 5 deferred") contradicts current reality (~98%, those screens landed). SSOT doc drift — should be refreshed (affects nobody's runtime, but the founder reads §5 for "unde am ramas").
- **[LOW] Two engine-composition paths coexist** (orchestrator `runPipeline` via scheduleAdapter + direct pure-engine calls in React `engineWrappers`/Option B). Both wired + tested; not a bug, but a future-maintainer trap. Belongs to AUDIT-1 (engine internals) for a definitive ruling on which is canonical for the live coach output.
- **[LOW] Onboarding medical step intentionally dropped (D078)** — listed here only so the CEO is not surprised by mockup↔build divergence; this is a *deliberate, locked* decision, NOT an oversight.
- **[INFO] Mode Detection has no dedicated screen/visible control** — by spec it is pure event-listener logic feeding engine context; correctly invisible.

### What was NOT missed (reassurance)
- No engine exists in spec without an implementation file.
- No engine exists in `src/engine` without a UI/flow consumer.
- No V1 feature (F1-F15) is absent or stubbed.
- No mockup screen is fully missing (worst case is 1 inline-instead-of-dedicated).
- No LOCKED V1 decision is contradicted by the build.

**Bottom line for the CEO:** Nothing structural slipped through. The product *can* deliver the "coach that thinks for you" vision today. The honest remaining work before Beta is (1) one strategic UX call on whether to reveal the MMI re-resume coaching, (2) trivial parity/doc cleanup, and (3) the quality/security/anti-RE passes already mandated by D077/D080 — none of which are missing capabilities.
