---
title: PRE-BETA WALKTHROUGH PREP chat 5 — singular Daniel CEO walkthrough readiness reference
type: pre-beta-walkthrough-prep
status: read-only-investigation
chat: chat 5 wrap POST-PUSH (2026-05-23, 60 commits LANDED origin/main d89517fe..fd47d383)
authority: Co-CTO autonomous investigation per audit reports + DECISIONS + PRIMER primary sources
priority: singular reference Daniel walks in pre-Beta Bugatti walkthrough nuclear
verdict: READY-WITH-CAUTION (engineering Bugatti consolidated, 2 YELLOW + 1 INFO + 3 MED security paper deferrals surface)
last_refresh: 2026-05-23 post 60-commit push origin/main + Firebase rules deploy LIVE
cross_refs:
  - DECISIONS.md §D076 + §D050-§D074 (chat 5 LOCK batch 24 entries + PROPOSAL)
  - DECISIONS.md §D042 (ZERO bug Beta gate) + §D029 (audit nuclear procedure)
  - ANDURA_PRIMER.md §4 (end-state Pre-Beta strict)
  - 📤_outbox/PRE_BETA_CHECKLIST_chat5.md (engineering gate enumeration)
  - 📤_outbox/LATEST.md (CC autonomous chat 5 post-push raport)
  - 📤_outbox/_CONSUMED/chat5/CODE_REVIEW_NUCLEAR_chat5.md (v2 review verdict YELLOW)
  - 📤_outbox/_CONSUMED/chat5/EVAL_AUDIT_NUCLEAR_chat5.md (engine eval verdict YELLOW)
  - 📤_outbox/_CONSUMED/chat5/E2E_VERIFY_NUCLEAR_chat5_wave8.md (verifier GREEN)
  - 📤_outbox/_CONSUMED/chat5/SHAPE_CHECK_INTEGRATION_AUDIT_chat5.md (GREEN)
  - 📤_outbox/_CONSUMED/chat5/FIREBASE_RULES_DEPLOY_LIVE_chat5.md (GREEN LIVE fittracker-c34e8)
  - 📥_inbox/HANDOVER_2026-05-23_chat5-post-push-FINAL.md (definitive scribe)
  - 📤_outbox/WORKTREE_CLEANUP_AUDIT_chat5.md (76 worktrees / 3.7G post-Beta cleanup)
---

# Andura Pre-Beta Walkthrough Prep chat 5 — Singular Daniel Reference

> **Scop:** Comprehensive readiness checklist Daniel CEO+Product uses to drive Bugatti walkthrough nuclear pre-Beta launch. Surface all gaps so Daniel walks in with full picture. Deferred per Daniel verbatim *"mai vedem fix inainte de beta"* — acest doc = singular reference when trigger fires.
>
> **Distinct from `PRE_BETA_CHECKLIST_chat5.md`:** Acela = engineering gate enumeration cu Daniel-only blockers itemized. Acest doc = **walkthrough-day** comprehensive prep (gate matrix + persona flow walk + remaining gaps + sequence recommend).

---

## §1 Executive summary

### Verdict: **READY-WITH-CAUTION**

Engineering Bugatti foundation consolidated end-of-chat-5. 5/5 nuclear audits LANDED. 3/3 DRIFTs resolved. 16 polish passes mockup parity saturation. 60-commit push origin/main delivered Daniel verbal "push totul" 2026-05-23. Firebase rules LIVE `fittracker-c34e8`. Sentry 11/11 React wrappers + 8/8 orchestrator adapters instrumented (anti-drift gate). Tests 5708+ PASS / 0 FAIL. Lighthouse mobile 3G 97 truly-final.

**Why CAUTION (NU READY-clean):**

- 3 audit verdicts YELLOW (NU GREEN): gsd-ui-auditor (2 minor surface findings non-blocking), gsd-code-reviewer v2 (closed cumulative dar 0-3 NIT cosmetic safe defer), gsd-eval-auditor (deferrals post-Beta documented — coach-voice persona scenarios paper rubric NU automated check, orchestrator pipeline telemetry observability gap)
- 6 audit deferrals chat 3 surfaced pending Daniel acceptat-risk paper OR build: §24-H1 FEATURE_FLAGS + §24-H3 ENVIRONMENT_STRATEGY + §27-H1 PRICING + §28-H1 DPA_FIREBASE + §28-H2 DATA_RESIDENCY + §28-H4 CONSENT_MGMT
- 3 MED security paper: frame-ancestors CSP directive (GH Pages hosting limitation) + CSP `unsafe-inline` (Tailwind + SPA constraint) + Magic Link 30s client throttle (D048 LOCK V1 accepted-risk pre-Beta — Firebase quota defense-in-depth secondary)
- 76 worktrees / 3.7G / 30 stuck at `d89517fe` + 20+ stashes accumulate (hygiene defer post-Beta safe per audit recommendation)
- D076 LOCK V1 ratifies **Phase 6 prod-extras blessed divergence** — 7 React components engine-wired in production absent din mockup pre-amend. Mockup amended v1.1 LANDED — verify walkthrough mockup reads correct version

**Daniel-only HARD remaining (1 item):** Bugatti walkthrough nuclear (acest doc = prep reference).

---

## §2 Bugatti gate matrix — 18 dimensions

Toate primary-source-grounded via DECISIONS LOCK + audit reports + git verify.

| # | Dimension | State | Source ref | Notes |
|---|-----------|-------|------------|-------|
| 01 | **Bug count (D042 ZERO blocker gate)** | PASS | DECISIONS §D042 + EVAL §0 | 0 CRIT, all v2 review CRIT/HIGH/MED/LOW/NIT-04 closed Wave 8-14 saturated |
| 02 | **Test coverage (D067 target 89.82%+)** | PASS | DECISIONS §D067 + LATEST §4 | 5708+ PASS / 0 FAIL / ~7 todo. Top 5 gaps ALL CLOSED (sentry 100%, fatigue 88.67%, auth-callback 100%, dataCleanup 98.61%, aa+reality ≥80%) |
| 03 | **Lighthouse mobile 3G (D071 ≥90 target)** | PASS @ 97 | DECISIONS §D071 + MASTER_INDEX trajectory | Truly-final 97 + LCP 2.16s + FCP 2.07s + A11Y 100 + BP 96 (peak match cumulative) |
| 04 | **WCAG a11y baseline (D056)** | PASS | DECISIONS §D056 + PRE_BETA §1.4 | focus-visible global + ExitConfirmSheet aria-modal + Forms aria-describedby/invalid/required + E2E axe-core 1 PASS |
| 05 | **GDPR consent gate Sentry (D055)** | PASS | DECISIONS §D055 + EVAL §5 | `initSentry` gated pe `telemetryOptIn` flag + 9 tests + subscribe re-init + PrivacyPolicy truthful |
| 06 | **Bundle budget (D053)** | PASS | DECISIONS §D053 + PRE_BETA §1.5 | 5/5 base + 2 new gates (vendor-data 33KB + vendor-state 1.5KB) = 7/7 gated cu rationale |
| 07 | **Zustand partialize (D054)** | PASS | DECISIONS §D054 + PRE_BETA §1.5 | 8/8 stores explicit partialize (appStore + coachStore + nutritionStore + progresStore + onboardingStore + settingsStore + scheduleStore + workoutStore) |
| 08 | **PWA manifest SoT (D057)** | PASS | DECISIONS §D057 + PRE_BETA §2.1 | `vite.config.js` canonical, `public/manifest.json` deleted, background_color unified `#faf7f1` |
| 09 | **Sentry instrument (D063 + D074)** | PASS | DECISIONS §D063 + §D074 + EVAL §1 | React wrappers 11/11 + orchestrator adapters 8/8 (Wave 15 `5c450321` D074 scope expansion) + anti-drift gate `assert_all_adapters_instrumented.test.ts` |
| 10 | **i18n compliance Romanian no-diacritics (D-LEGACY-064 + D058 + D065)** | PASS | DECISIONS §D058 + §D065 | 100% compliance UI + tests + commits + mockup. Wave 14 ampersand sweep V2 `bcdac136`. Vault docs preserved diacritics. |
| 11 | **Engine pipeline Big 11 + MMI #9 (D066)** | PASS engine, YELLOW UI | DECISIONS §D066 + §D059 PROPOSAL | Engine LANDED `applyMuscleMemoryUpgrade` gated pauseMonths ≥6 production wired. UI prompt indicator DEFERRED post-Beta (D059 §4 sub-scope) |
| 12 | **Font self-host Inter Variable Latin (D061)** | PASS | DECISIONS §D061 + PRE_BETA §1.2 | 344KB → 48KB (-86%) Latin subset filter. CSP `font-src 'self'` tighten. SUPERSEDES §P6 |
| 13 | **Perf quadruple (D060)** | PASS | DECISIONS §D060 + §D064 | defer registerSW + AuthCluster lazy + SW precache excludes + modulepreload requestIdleCallback. Cumulative 64→97 |
| 14 | **Modulepreload (D064)** | PASS | DECISIONS §D064 + paired D060 | hash-agnostic + post-FCP requestIdleCallback + Safari iOS fallback |
| 15 | **Dead code (D069)** | PASS | DECISIONS §D069 | AA module lines 141-151 verified unreachable + Option 1 delete LANDED `0af95f19` |
| 16 | **Mockup parity (D015 + D076 amendment)** | PASS-WITH-AMENDMENT | DECISIONS §D015 + §D076 | Mockup v1.1 amended `8dfe36e3` Phase 6 prod-extras blessed divergence ratify (7 components). DRIFT-2 + DRIFT-3 Option A mockup literal restore |
| 17 | **Firebase rules LIVE production** | PASS | FIREBASE_RULES_DEPLOY_LIVE §verification | LIVE `fittracker-c34e8` 2026-05-23 09:15:57 UTC. firestore.rules + database.rules.json released. Daniel browser console verify optional |
| 18 | **Push freshness origin/main** | PASS @ HEAD synced | LATEST §1 + CHAT_STATE §0 | 60 commits LANDED `d89517fe..fd47d383`. Post-push +6 SSOT cascade commits (D076 main scribe + PRIMER §5 + LATEST + CHAT_STATE + HANDOVER post-push + archive) NU pushed yet — verify Daniel intent before second push trigger |

### Audit verdicts secondary

| Auditor | Verdict | Critical findings |
|---------|---------|-------------------|
| gsd-security-auditor | GREEN | 0 CRIT. Firebase rules deploy LIVE closed prior HIGH. §A007 logout authSignOut closure preserved. |
| gsd-verifier (E2E Wave 8) | GREEN | Shim writeback CRIT #2/#3 verified production-side. MMI cap activable real. |
| gsd-code-reviewer v2 | YELLOW | All CRIT/HIGH/MED/LOW/NIT-04 closed. 0-3 NIT cosmetic safe defer. |
| gsd-ui-auditor | YELLOW-WITH-POLISH | 2 minor surface findings non-blocking. DRIFT-2/3 Option A LANDED. Pass 4-16 polish saturation. |
| gsd-eval-auditor | YELLOW | Deferrals documented: coach-voice persona scenarios paper rubric NU automated check (0% scenario coverage) + orchestrator telemetry observability gap (`onSubSpan` orphan) + persona dimension diversity PARTIAL (T1 absent, advanced absent, joint care knee-only) |

---

## §3 Persona flow walkthrough — Gigel + Marius + Maria 65

Per `ANDURA_PRIMER.md §1` Gigel test mandatory: *"Cum reacționează Gigel? Dubios pentru user?"*. Walkthrough verifică flow live `andura.app` post-push surface state.

### §3.1 Onboarding flow (Magic Link auth + obiectiv selector + Tier T0→T3+)

| Flow segment | State | Audit ref | Persona notes |
|--------------|-------|-----------|---------------|
| Splash F-splash-05 | PASS LANDED | Wave C parity LANDED chat 3 | All 3 personas. |
| Auth Magic Link sendMagicLink | PASS, MED accepted-risk | D048 LOCK V1 | 30s client throttle accepted Gigel/Marius/Maria 65 anti-double-tap. Firebase quota defense-in-depth secondary. PARTIAL `bypassable DevTools` flagged gsd-security-auditor §A018. |
| Auth Magic Link callback handler | PASS GREEN | AuthCallback.tsx 100% coverage (Wave 11 closure) | Token exchange + error redirect + timeouts. |
| Auth Google OAuth | PASS LANDED | DECISIONS §D046 §3.2 reverse iter 2 | B005 `81d4bb33` low-friction Gigel/Marius. |
| Skip-auth "Incearca fara cont" | PASS LANDED | B006 chat 1 Wave B-1 | Maria 65 test-drive. appStore.isSkipAuth + ProtectedRoute gate. |
| Onboarding 7 steps (Obiectiv 4→6 expand + Big 6 hard typing) | PASS LANDED | B003 chat 1 Wave B-1 Cycle 1 | 6 obiective mockup parity + persist v2 migrate. All personas. |
| Medical Disclaimer Modal (LOCK 4 D-LEGACY-060) | PASS LANDED | Phase 7 §A.5 closure | Mandatory accept gate pre-app entry. |
| GDPR Art. 8 RO parental consent age 16+ | PASS LANDED | §28-H5 `8764eb75` | Romanian compliance Maria 65 + Gigel data subjects rights. |
| Tier-based personalization T0→T3+ | PASS engine, PARTIAL persona coverage | D-LEGACY-007 + EVAL §3 dimensions | T0+T2+T3 fixtures present. **T1 absent**, **advanced absent**, **joint care knee-only**. Coach voice scenarios 7/7 `it.todo()` deferred (paper rubric only). |

### §3.2 Antrenor tab home (workout coach surface)

| Component | State | Audit ref | Walkthrough check |
|-----------|-------|-----------|-------------------|
| CoachTodayCard (dynamic truth quote) | PASS LANDED | HIGH-3 Wave 9 `74650a5f` | Replace hardcoded muscle-group quote. Persona match rate check Gigel context. |
| CoachRestCard (sibling truth) | PASS LANDED | MED Wave 10 `c904098a` | Remove hardcoded muscle-group claim. |
| StatsGrid 3-cell | PASS LANDED + RO plural helper | MED-CODE-23 `c0bf1f65` | Streak/zile/sets RO plural rules. Phase 6 prod-extras blessed (D076 §7). |
| AlertsBanner urgent injury-risk floor | PASS LANDED | Phase 6 prod-extras blessed (D076 §7) | Safety gate Maria 65 joint pain trigger. |
| PatternsBanner (LOW_ADHERENCE + STAGNATION) | PASS LANDED | Wave 6 audit closure + gate ≥3 sessions `009354b6` | Gigel-friendly UX gate. Big 11 patternLearning consumer (D076 §7). |
| PRWallRecent | PASS LANDED + pr-records writeback CRIT #3 | Wave 8 `4c30882e` | Phase 6 prod-extras blessed (D076 §7). PR Wall populated post-RPE detectPR. |
| PRNotificationBanner per-PR | PASS LANDED | Phase 6 prod-extras blessed (D076 §7) | Real PR detection from shape CRIT #2/#3 LANDED Wave 8. |
| ReadinessVerdict (pre-session core coach value) | PASS LANDED + DB.get logs writeback CRIT #2 | Wave 8 `31f56293` | Phase 6 prod-extras blessed (D076 §7). 5 engines downstream input-starved fixed. |
| FatigueStrip | PASS DRIFT-2 Option A | DECISIONS §D076 + Wave 15 `5b6a7760` | Mockup literal restore (icons removed + 14px tokens parity). |
| Mode Detection (5 moduri pure event listeners) | PASS LANDED | Phase 3-6 baseline | All 5 moduri operational. |

### §3.3 Workout flow (workout start → exercise log → PostRpe → PostSummary → Istoric)

| Flow segment | State | Audit ref | Walkthrough check |
|--------------|-------|-----------|-------------------|
| WorkoutPreview rich (5 atomic chat 3 Wave C) | PASS LANDED + FALLBACK guard | Wave 11 `f81e2716` + Wave C parity | Loading + empty + error states. Per-set RPE F15. |
| RestOverlay SVG ring | PASS LANDED | Wave C parity chat 3 | Visual feedback. |
| Workout BottomNav hide in-session | PASS LANDED | `5a311ee4` chat 2 evening | Anti-misclick safety. |
| Pause-resume preserve title | PASS LANDED HIGH-CODE-05 | Wave 9 `8aafdf41` | Replace 'Push' lie cross-component. |
| Set log input (per-set safety RIR 0 + AaFriction = PerSetSafetyModal post D033 rename) | PASS LANDED | DECISIONS §D033 + golden-master strangler | LOCK 9 PerSetSafetyModal. |
| ExitConfirmSheet 4-button (Termina mai devreme + Pauseaza + Renunta + Inchide) | PASS LANDED | B004 chat 1 Wave B `7d2331f6` | Mockup L2377-2390 universal destructive drill-down. |
| PostRpe handleSubmit (detectPR + persist) | PASS LANDED + Bugatti truth fix HIGH-CODE-06 | Wave 8 `4c30882e` + Wave 9 `bd1f50a9` | Reject null workout NU persist lie. PR records writeback. |
| PostSummary streak | PASS LANDED §11-H3 | `3b40301e` chat 2 | Real streak data, RO plural. |
| Rating buttons F12 3-button (USOARA/NORMALA/GREA RO) | PASS LANDED | F12 keep verbatim PRIMER §2 | Persona-friendly culture. |

### §3.4 Progres tab (BodyData + Greutate + HeatMapWeekly + FatigueStrip + TDEEStrip)

| Component | State | Audit ref | Walkthrough check |
|-----------|-------|-----------|-------------------|
| BodyData persistence | PASS LANDED | Phase 6 prod-extras blessed (D076 §7) | Tier Storage Tier 0/1/2 + Dexie + Firebase archive. |
| WeightLogList (Loguri greutate screen) | PASS LANDED | `e10285ec` chat 2 morning | Progres history nav. |
| HeatMapWeekly | PASS DRIFT-3 Option A non-interactive | DECISIONS §D076 + Wave 15 `92c5396b` | Button → p mockup parity restore. |
| GDPR Art. 20 SettingsExport include Tier 1 IDB | PASS LANDED §28-M4 | `230f15d7` chat 2 evening | Sessions export portability. |
| Kalman adaptive TDEE (Hall 2008 derivation + FLIP-ON pre-Beta) | PASS LANDED | DECISIONS §D046 §3.4 + B026 `bef...` + B027 FLIP-ON `bfd9891f` | Bayesian Nutrition real working NU 2000 kcal hardcoded. featureFlags bayesian_kalman_v1 100%. R²>0.85 simulator test. |
| TDEEStrip BMR single line F9 | PASS LANDED F9 simplified PRIMER §2 | Phase 5 closure | Single line implementation. |

### §3.5 Istoric tab (sessionsHistory + PR records)

| Component | State | Audit ref | Walkthrough check |
|-----------|-------|-----------|-------------------|
| Calendar 16 atomic chat 3 Wave C | PASS LANDED | Wave C parity chat 3 | Per scheduleAdapter D052 boundary shape adapter. |
| sessionsHistory multi-session (AM+PM array preserve) | PASS LANDED LOW-CODE-12 | Wave 12 `40676379` | useSessionsByDate hook. |
| PR Wall F6 | PASS LANDED + writeback CRIT #3 | Wave 8 `4c30882e` | Engine reads `pr-records` populated. |
| Date format unify | PASS LANDED + DANIEL_PENDING reference | DANIEL_PENDING_chat5 | 3-way variants Istoric `DD.MM.YYYY` vs WeightLogList `D mai` vs PrWall `D mai YYYY`. Co-CTO autonomous compose pre-Beta D024. |

### §3.6 Settings tab + danger zone drill-down (logout + delete + reset)

| Drill-down screen | State | Audit ref | Walkthrough check |
|-------------------|-------|-----------|-------------------|
| LogoutConfirm (drill-down NU shared modal) | PASS LANDED + §A007 authSignOut fix | DECISIONS §D047 RIP-OUT + `fc3e6cc9` | Token clear + authSignOut() preserved. HIGH RISK security-critical Daniel-supervised pattern. |
| DeleteAccountConfirm (Tier 1+2 wipe) | PASS LANDED + GDPR Art. 17 §28-M4 | `5266ef4e` + `230f15d7` | IDB wipeUserDB + RTDB DELETE. Reauth required. |
| ResetDataConfirm | PASS LANDED | `5266ef4e` chat 1 Wave B-1 Stage 1 | Anti-paternalism preserved Daniel decide. |
| RedoOnboardingConfirm | PASS LANDED Stage 3 | `a47a481b` + `aa79bedb` | SettingsPrefs Avansat section ADD wire. |
| SchimbaFazaConfirm (engine wire) | PASS LANDED B001 | `7e677ad6` chat 2 evening | `phaseOverride` util engine integration. |
| ResetCoachConfirm (engine wire) | PASS LANDED B011 | `166fd695` chat 2 evening | `coachReset` util AI incremental learning reset. |
| FinishEarlyConfirm | PASS LANDED B004 | `7d2331f6` chat 1 | Workout handleExit flow. PostRpe partial summary natural NU pierzi progresul. |
| SettingsAbout (Despre Andura) | PASS LANDED chat 2 evening | `77575a0f` | Static screen + Cont row wire + 6 tests. |
| SettingsSupport (Suport) | PASS LANDED chat 2 evening | `ab87dc00` | mailto contact + Cont row wire. |
| SettingsFaq (FAQ accordion 7 Q&A) | PASS LANDED chat 2 evening | `4706328d` | 3 sections + Suport CTA. |
| Notifications permission ladder | PASS LANDED §32-H2 | `5ae4ff36` + 5 tests `83665208` | Notification.requestPermission graceful. |
| Dark theme full WCAG palette | PASS LANDED | `4fa1887f` chat 2 evening | themeSync + [data-theme="dark"] tailwind darkMode. Both light + dark WCAG-compliant. |
| OfflineBanner network status | PASS LANDED §13-M3 | `793d824a` chat 2 morning | aria-live polite. |
| InstallPrompt PWA | PASS LANDED §7-H5 | `70b696a5` chat 2 morning | Install Android Chrome flow. |

### §3.7 Mockup parity coverage end-of-chat-5

- ~88% screen count (44/51 React vs mockup) per chat 2 final metrics — missing: pr-wall + weight-timeline + sesiuni-recente + settings-themes + ceva-nu-merge-cont **all defer post-Beta**
- Pass 4-16 polish saturation: radius / CTAs / inputs / SubHeader / toggles / borders / empty-state / modals / typography / dividers / chip / badge / icons (mockup v1.1 amended `8dfe36e3`)
- 3 confirms + 3 numerics typography minor skipped Pass 13 — separate future polish pass, NU pre-Beta blocker

---

## §4 Remaining gaps surface (concrete enumeration)

### §4.1 YELLOW non-blocking (3 items pending Daniel acceptat-risk OR build trigger)

1. **MMI UI prompt indicator** — engine layer LANDED (D066), UI prompt indicator DEFERRED post-Beta (D059 §4 PROPOSAL pending Daniel A.1 vs A.2 vs B). Co-CTO LOCK V1 defer iter următor. Brand promise "engines auxiliare ascunse" partial-reveal (engine effect silent active, boost indicator NU visible user).
2. **Coach voice persona scenarios** — 7/7 `it.todo()` deferred (rubric paper-only, ZERO automated check). Gigel anti-paternalism + Marius PR safety + Maria 65 joint + bulk→cut + injury + deload + per-set safety scenarios documented dar NU evaluated.
3. **Orchestrator telemetry observability gap** — `onSubSpan` callback exists ADR 030 §3.3 dar ZERO React caller passes it. Engine-output telemetry = 0 events (no event fires when MMI silent cap activates, when engine adapter returns baseline, etc).

### §4.2 INFO post-Beta defer (2 items)

1. **Code-split deeper** — ~450ms unused-JS savings remaining per Lighthouse opportunity. Co-CTO LOCK V1 DEFER POST-BETA per D072 INFO non-blocking.
2. **Critical CSS inline** — Lighthouse opportunity remaining. Co-CTO LOCK V1 DEFER POST-BETA per D072 INFO non-blocking.

### §4.3 MED security paper (3 items Daniel decide accept OR build)

1. **frame-ancestors CSP directive** — currently missing, GH Pages hosting limitation. Daniel decide: document acceptat-risk OR add header.
2. **CSP `unsafe-inline`** — currently allowed (Tailwind + SPA redirect constraint). Daniel decide: document acceptat-risk OR refactor.
3. **Magic Link 30s client throttle (D048 LOCK V1 accepted-risk pre-Beta)** — bypassable DevTools. Defense-in-depth via Firebase server-side rate limit absorbs malicious abuse. Iter 2+ ticket: monitor Firebase quota dashboard.

### §4.4 6 audit deferrals chat 3 surfaced (Daniel strategic decide)

1. **§24-H1 FEATURE_FLAGS** — feature flag service strategy
2. **§24-H3 ENVIRONMENT_STRATEGY** — dev/staging/prod separation strategy
3. **§27-H1 PRICING** — post-Beta pricing strategy (Free Beta now)
4. **§28-H1 DPA_FIREBASE** — Data Processing Agreement Firebase
5. **§28-H2 DATA_RESIDENCY** — EU data residency Firebase region
6. **§28-H4 CONSENT_MGMT** — full Consent Management Platform vs current minimal opt-in

### §4.5 Hygiene non-blocking defer post-Beta safe (Daniel verbal trigger)

1. **76 worktrees / 3.7G** — `.claude/worktrees/` post substantial parallel work chat 3-5. 30 stuck at `d89517fe` prime cleanup target. NU now risk active state agents.
2. **20+ stashes** — Daniel verbal `git stash drop` trigger needed.
3. **Visual regression snapshots policy** — `tests/visual-regression.spec.ts-snapshots/` untracked. Commit win32 baselines vs gitignore strategic decision.
4. **Font-size 11px → 12px** — Maria 65 readability headroom optional (Best Practices 96→100 headroom).
5. **engineWrappers 466 LOC extract** — refactor candidate post-Beta când pressure emerges (§P13).

### §4.6 Persona dimension diversity PARTIAL (per EVAL §3)

- **T1 absent** (returning, < 30 day history)
- **Bulk only in edgeCases** (not canonical)
- **Age mid-50s gap** (32/28/67 covered)
- **Joint care knee-only** (back/shoulder/wrist absent for Maria)
- **Advanced experience absent**
- **Pause months returning user NOT in canonical** (only MMI test fixtures hardcoded 7/18/25)

---

## §5 Daniel-only manual gates (pre-Beta launch sequence)

### §5.1 Push trigger (D031 invariant) — verbal "Da push" + 30 sec

Current branch +6 commits ahead origin/main (SSOT cascade post-push chat 5 wrap + D076 main scribe + outbox archive). Daniel verbal trigger → `git push origin main` (Co-CTO autonomous executes). NU autonomous.

### §5.2 Bugatti walkthrough nuclear (acest doc reference) — single comprehensive a-z

Per `ANDURA_PRIMER.md §4` Daniel CEO directive verbatim: *"FULL AUDIT. Fiecare linie de cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"*.

**Walkthrough scope (toate device classes):**
- **Mobile Samsung S21** (primary target Gigel/Marius/Maria 65) — Magic Link auth + PWA install + 4 tabs + workout flow real device
- **Tablet** — responsive layout
- **Desktop** — admin reference + console verify Firebase rules match repo
- **Real device manual smoke** — 11/11 gate (NU intermediate, NU partial smoke)
- **Live `andura.app` post-push state** — surface cumulative chat 5 work via GH Actions deploy.yml ~2-3min activation cycle
- **Persona walk** — Gigel ("Dubios?") + Marius (perf gym) + Maria 65 (a11y + readability)
- **Bug 02:00 > 5 commits grabă filter** — orice surface = stop + fix Bugatti, NU "post-Beta v1.5"
- **Comprehensive a-z** — anti-paternalism filter NU intermediate gates

### §5.3 Daniel strategic decisions paper OR build (optional pre-Beta)

- §4.3 3 MED security paper acceptat-risk OR build
- §4.4 6 audit deferrals strategic direction
- §5.4 hygiene cleanup verbal trigger

---

## §6 Pre-Beta launch sequence recommend

Ordered steps Daniel runs pe walkthrough day:

1. **Pre-walkthrough prep** (5 min)
   - Read acest doc §1-§4 (executive + gate matrix + flows + gaps surface)
   - Optional: skim `PRE_BETA_CHECKLIST_chat5.md` for engineering gate enumeration depth
   - Optional: skim `HANDOVER_2026-05-23_chat5-post-push-FINAL.md` for narrative

2. **Verify live state** (5 min)
   - Open `andura.app` desktop Chrome
   - DevTools → Application → Service Workers verify registered
   - DevTools → Application → Manifest verify `background_color: #faf7f1`
   - Firebase Console verify rules match repo `firestore.rules` + `database.rules.json`

3. **Bugatti walkthrough mobile Samsung S21** (30-60 min — primary device)
   - PWA install flow (Add to Home Screen)
   - Magic Link auth Gigel persona
   - Onboarding 7 steps + Obiectiv 6 selector + Big 6 hard typing
   - Medical Disclaimer Modal accept
   - 4 tabs: Antrenor → Progres → Istoric → Cont (per §3 walk)
   - Workout flow: start → exercise log → PostRpe → PostSummary → Istoric
   - Settings danger zone drill-down (logout + delete + reset confirm screens)
   - Dark theme toggle + OfflineBanner network status

4. **Persona scenario walk** (15-30 min)
   - **Gigel**: anti-paternalism filter ("Dubios?"), patterns banner, low_adherence gate
   - **Marius**: PR Wall, StatsGrid signal-richness, ReadinessVerdict, MMI silent cap (pauseMonths ≥6 returning)
   - **Maria 65**: a11y focus-visible outline, font readability, joint pain trigger AlertsBanner, skip-auth "Incearca fara cont"

5. **Tablet + desktop smoke** (10 min)
   - Responsive layout sanity check
   - Console errors check (Sentry consent gate gating active)

6. **Decisions surface** (per Daniel intent)
   - §4.3 3 MED security paper acceptat-risk OR build trigger
   - §4.4 6 audit deferrals strategic direction
   - §5.4 hygiene cleanup verbal trigger
   - §4.1 MMI UI prompt indicator Option A.1 vs A.2 vs B (D059 PROPOSAL)

7. **Fix loop** (if needed)
   - Any surface = Co-CTO autonomous fix Bugatti single-concern atomic commit
   - Daniel verbal push trigger post-fix batch
   - Repeat walkthrough până ZERO surface

8. **Beta launch announce** (Daniel decide când ready)
   - All persona flows GREEN
   - All decisions §4 papered OR built
   - Daniel verdict explicit "Beta READY"

---

## §7 Cross-refs

**SSOT primary:**
- [[DECISIONS.md §D076]] — Phase 6 prod-extras blessed divergence ratify (DRIFT-1 Option B amend) LOCK V1
- [[DECISIONS.md §D050-§D074]] — chat 5 LOCK batch 23 entries + D059 PROPOSAL
- [[DECISIONS.md §D042]] — ZERO bug Beta gate
- [[DECISIONS.md §D031]] — push manual Daniel-triggered ABSOLUTE
- [[ANDURA_PRIMER.md §4]] — end-state Pre-Beta strict + "20000 ore I don't care"

**Chat 5 references:**
- [[📤_outbox/PRE_BETA_CHECKLIST_chat5.md]] — engineering gate enumeration cu Daniel-only blockers itemized
- [[📤_outbox/LATEST.md]] — CC autonomous chat 5 post-push raport
- [[📤_outbox/WORKTREE_CLEANUP_AUDIT_chat5.md]] — 76 worktrees / 3.7G post-Beta cleanup
- [[📥_inbox/HANDOVER_2026-05-23_chat5-post-push-FINAL.md]] — definitive end-of-chat narrative scribe §F3.8
- [[📥_inbox/DANIEL_PENDING_chat5.md]] — refresh post Wave 8/9/10 LANDED Daniel-only items

**Audit reports `_CONSUMED/chat5/`:**
- [[📤_outbox/_CONSUMED/chat5/CODE_REVIEW_NUCLEAR_chat5.md]] — gsd-code-reviewer v2 YELLOW
- [[📤_outbox/_CONSUMED/chat5/EVAL_AUDIT_NUCLEAR_chat5.md]] — gsd-eval-auditor YELLOW deferrals
- [[📤_outbox/_CONSUMED/chat5/E2E_VERIFY_NUCLEAR_chat5_wave8.md]] — gsd-verifier GREEN
- [[📤_outbox/_CONSUMED/chat5/SHAPE_CHECK_INTEGRATION_AUDIT_chat5.md]] — GREEN
- [[📤_outbox/_CONSUMED/chat5/FIREBASE_RULES_DEPLOY_LIVE_chat5.md]] — GREEN LIVE `fittracker-c34e8`
- [[📤_outbox/_CONSUMED/chat5/MASTER_INDEX_chat5.md]] — singular navigation dashboard chat 5

**Mockup + design master:**
- [[04-architecture/mockups/andura-clasic.html]] v1.1 — DESIGN MASTER amended `8dfe36e3` Phase 6 prod-extras blessed divergence ratify

---

**End of Pre-Beta Walkthrough Prep chat 5. Singular Daniel reference. READY-WITH-CAUTION verdict per §1. Manager out.**
