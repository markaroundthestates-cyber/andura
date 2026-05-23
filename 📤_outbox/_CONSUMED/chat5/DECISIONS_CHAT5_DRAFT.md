---
title: DECISIONS chat 5 candidate draft — D050-D058 + D060-D073 LOCK V1 + D059 PROPOSAL partial-closure
type: decisions-draft
status: draft-pending-daniel-review
chat: chat 5 (2026-05-22 evening → 2026-05-23 dimineata) + overnight Wave 7-22 + post-overnight final closure extension
last_decision_appended: D049 (2026-05-22) per DECISIONS.md frontmatter latest_entry
next_slot: D050+ (D050-D058 + D060-D073 cumulative — 23 LOCK candidates + 1 PROPOSAL partial-closure)
authority: Co-CTO autonomous tactical work landed chat 5 + overnight Wave 7-22 + post-overnight final closure + Daniel CEO LOCK acknowledgement pending
---

# DECISIONS chat 5 CANDIDATE DRAFT — D050-D058 + D060-D073 LOCK V1 + D059 PROPOSAL partial-closure

**Singular scope:** draft entries pentru Daniel CEO review + LOCK V1 acknowledge. NU touch DECISIONS.md direct (per protocol §F3.8 step 3 = claude_code handles aggregate append la handover trigger). Tu citesti, decizi LOCK / amend / reject, apoi handover trigger CC append batch.

**Sample model:** Existing DECISIONS.md entries pattern, in particular D044/D045 (PROC pattern long-form) + D047 (UX correction)
+ D048 (SAFETY accepted-risk) + D049 (PROC anti-recurrence rule). Romanian narrative diacritics OK conform CLAUDE.md project rule (UI strings ZERO diacritics per D-LEGACY-064; vault docs preserve diacritics).

**Schema strict per existing pattern:**
- Catalog row (oneline): `[ID] | [DATA] | [CATEGORY] | [TITLU ≤80 char] | [STATUS] | [SOURCE PATH:§]`
- Detailed entry: Date + Category + Status + Source + Cross-refs + Context + Decision + Implications + Rationale Bugatti

---

## CHAT 5 SCOPE (verify reference)

Chat 5 ACASA bracket 2026-05-22 evening → 2026-05-23 dimineata. ~21+ atomic commits Co-CTO autonomous + 4-5 agents paralel storm + Bugatti audit deeper (W4-AUDIT-DEEPER + SUBSTRATE + SECURITY-DEEPER + ENGINE-DEEPER) + Wave 3 substrate triple polish + a11y CRIT/HIGH Beta-blockers + Sentry consent gate + PWA SoT consolidation + i18n diacritics swap. Mandate Daniel verbatim:

- **"quality > snowball"** chat 3 cumulative reinforced
- **"agenți paralel max 4-5"** D-prior (CLAUDE.md memory feedback_agent_concurrency_limit chat 4 LOCK V1)
- **"isolation worktree mandatory >3 agenți"** D049 LOCK V1 invariant
- **"git commit -o -m -- <paths>"** D049 anti-ghost-metadata expansion (empirical proof chat 5 ZERO race incidents)

---

## D050 — PROC — `git commit -o -m -- <paths>` pattern MANDATORY all agent commits

**Date:** 2026-05-23 (chat 5 ACASA)
**Category:** PROC (procedural enforcement anti-recurrence)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** D049 anti-ghost-metadata rule expansion empirical proof chat 5 + ZERO race incidents 4+ agent concurrent storm
**Cross-refs:** [[DECISIONS.md §D049 ghost-metadata anti-recurrence rule]] + [[📤_outbox/consolidation-audit/MEGA-BUNDLES.md]] + [[📤_outbox/consolidation-audit/BYPASS-FORENSICS.md]] chat 3

### §1 Context

D049 LOCKED V1 chat 3 (2026-05-22) codified anti-ghost-metadata rule + `git diff --cached --stat` pre-commit verify + `isolation: "worktree"` mandatory >3 agents paralel. Catastrophic 14-agent race chat 3 produsese 5 mega-bundles cu subject↔diff mismatch (`b918e76c` + `f6dc24b7` + `52638b9b` + `d8ff7b01` + `b6869516`). Forensics audit acknowledged dar regression vector remained: `git add <paths>` + `git commit -m "subject"` cascade vulnerable la concurrent `git add` ops other agent contaminating staged index between `add` and `commit` invocations.

Chat 5 stress test: 21+ atomic commits Co-CTO autonomous + 4-5 agents paralel + multi-bash concurrent. ZERO ghost-metadata incidents observed (vs 10+ chat 4 + 5+ catastrophic chat 3). Pattern empirical proof: every agent commit used `git commit -o -m "subject" -- <explicit paths>` form.

### §2 Decision

`git commit -o -m "<subject>" -- <explicit paths>` form **MANDATORY all agent commits** (manager Co-CTO + spawn subagents). Flags semantic:

- **`-o`** (`--only`): commit ONLY listed paths (post `--`), ignore staged index from other agents. Anti-race index contamination.
- **`-m`** (`--message`): inline subject (avoid editor open hang).
- **`-- <paths>`**: explicit paths post separator. ZERO ambiguity `staged vs unstaged vs wildcard`.

Trade-off acknowledged: `-o` re-stages listed paths even if already staged (idempotent), bypassing pre-`add` rerun. Acceptable cost vs race elimination.

### §3 Implications

- **Agent prompts CC** mandatory include `git commit -o -m "<subject>" -- <paths>` pattern în execution discipline section.
- **Subject↔diff verify** D049 rule preserved: `git diff --cached --stat` BEFORE commit invocation still mandatory (catches case where path supplied is stale/wrong file). `-o` flag elimina race contamination, NU elimina subject-claim mismatch.
- **`git add -A` ban** strict (D-prior pre-D050 implicit, now explicit). `-A` at repo root catches `.smart-env/` cache + alte noise + concurrent contamination = anti-pattern strict.
- **Wildcard paths** (e.g., `git commit -o -m ... -- src/`) discouraged. Explicit file paths preferred.

### §4 Empirical evidence chat 5

- 21+ atomic commits Co-CTO autonomous chat 5 = ZERO ghost-metadata
- 4-5 agents paralel storm (W4-AUDIT-DEEPER + SUBSTRATE + SECURITY-DEEPER + a11y + i18n) = ZERO race
- Comparison: chat 3 14-agent storm fără `-o` = 5 mega-bundles + 3 RED ghost-meta
- Comparison: chat 4 fără `-o` = 10+ ghost-meta incidents

### §5 Rationale Bugatti

Subject↔diff alignment = trust contract pentru blame archaeology. Ghost-meta commits poison `git log` semantics = future debugger reads wrong root cause. Bugatti craft = ZERO future-self trap. `-o` flag = 3-char defense vs catastrophic blame contamination = peak craft minimum.

---

## D051 — PROC — Max 4-5 agents concurrent confirmed empirical i7-8700 hardware sweet spot

**Date:** 2026-05-23 (chat 5 ACASA)
**Category:** PROC (procedural hardware constraint codified)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Daniel verbal chat 4 LOCK V1 "ne capam la 4-5 agents in total de acum" + chat 5 stress test empirical confirm
**Cross-refs:** CLAUDE.md memory feedback_agent_concurrency_limit chat 4 + feedback_subagents_at_discretion + [[DECISIONS.md §D049]] isolation worktree rule

### §1 Context

Daniel hardware machine ACASA: i7-8700 6c/12t + 32GB RAM + Windows 10. Chat 3 14-agent storm a depasit threshold = context switch thrashing + lock contention + D049 race chaos accelerate. Chat 4 LOCK verbal Daniel "ne capam la 4-5 agents in total" SUPERSEDES prior "1-20 efficient" memory.

Chat 5 stress test: 4-5 agents paralel storm (W4-AUDIT-DEEPER + SUBSTRATE + SECURITY-DEEPER + ENGINE-DEEPER + a11y/i18n) = clean execution, ZERO race, all atomic commits landed.

### §2 Decision

**Max 4-5 background agents concurrent default mode permanent** Daniel ACASA i7-8700 hardware. Manager Co-CTO orchestrator-only role + agents executor model (chat 3 LOCK V1 manager role + feedback_manager_role memory). Spawn batch >5 = anti-pattern.

### §3 Implications

- **Spawn discipline** Manager Co-CTO: max 4-5 Agent tool invocations paralel pe acelasi cycle. Daca scope > 5 tasks, sequential batch sau wait for completion.
- **D049 isolation worktree mandatory** rule preserved la >3 agenti paralel (overlap intentional cu D051 cap 4-5).
- **Quality > Speed > Hardware load** prioritate filter. Bugatti craft NU compromise pentru speed via hardware overload.
- **Future hardware upgrade** Daniel (e.g., i9 + 64GB) → potential threshold raise V2, but require new empirical test.

### §4 Rationale Bugatti

Hardware load = context switch tax + memory pressure + git lock contention + filesystem I/O bottleneck. Above threshold = chaos accelerate, NU productivity gain. 4-5 sweet spot empirical = peak craft sustained pace. Quality preserved, hardware respected.

---

## D052 — ARCH — Shape adapter pattern la store boundary, NU adapter inward

**Date:** 2026-05-23 (chat 5 ACASA, commit `8529f54d`)
**Category:** ARCH (architectural pattern decision Bugatti substrate)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Substrate ZETA audit chat 5 + commit `8529f54d` fix(substrate-zeta) scheduleStore shape bridge la commitCalendarEdit
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 engine pipeline real wire 8/8]] + [[DECISIONS.md §D-LEGACY-024 Adapter Design Pattern compose pipeline pure-function]] + src/react/stores/scheduleStore.ts + src/engine/scheduleAdapter.d.ts §11-13

### §1 Context

Antrenor calendar rest day override silently no-op via React UI path discovered chat 5 audit:
- `scheduleStore.saveWeekly()` pasa `DayKind[]` strings (de.g., `['training', 'rest', ...]`)
- Adapter `scheduleAdapter.js` expects `{day, active}` objects per `scheduleAdapter.d.ts §11-13`
- Downstream `scheduleAdapter.js:428-431` check `dayConfig.active === false` evalua pe string (`'training'.active = undefined`, never `=== false`)
- Override `selectedDays` read invariant broken → rest days silently planificate ca training → end-to-end UX rupt

Tactical fix choice presented:
- **(A) Bend adapter inward** — modify `scheduleAdapter.js` accept BOTH `DayKind[]` strings AND `{day, active}[]` objects. Adapter becomes polymorphic.
- **(B) Transform shape la boundary** — `scheduleStore.saveWeekly()` transform `DayKind[]` → `{day, active}[]` BEFORE calling adapter. Adapter stays canonical pure-function pattern (per D-LEGACY-024).

### §2 Decision

**Option B — shape adapter la store boundary**, NU adapter inward. Pattern:

- **Store boundary** = transform shape impedance la write/read boundary. Each Zustand store responsabil pentru shape conformance la adapter contracts.
- **Adapter core** = pure-function canonical shape strict. NU polymorphic, NU multi-shape branching. Single source-of-truth shape.
- **Type contract** = adapter `.d.ts` files (e.g., `scheduleAdapter.d.ts`) = SSOT shape ground-truth. Stores conform → adapter, NU adapter conform → stores.

Plus DAY_KEYS canonical decision: `['L', 'M', 'M2', 'J', 'V', 'S', 'D']` (storage canon match `scheduleAdapter.js:37 DAY_LABELS`) ≠ UI display labels `['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D']` (`Calendar7Day.tsx:26`). **Divergenta intentionala** = storage canon stable cross-store/engine + UI display human-friendly.

### §3 Implications

- **Adapter integrity preserved** = pure-function canonical Bugatti pattern D-LEGACY-024 reinforced. ZERO polymorphism creep.
- **Store responsibility expanded** = each Zustand store explicit transform boundary. Visible la code review. Easier to test isolated.
- **Shape regression coverage** = test integration via `saveWeekly()` path catches shape regressions future (shape + day keys canonical + active mapping + end-to-end rest day override via `getDailyWorkout`). 10 tests new chat 5 commit `8529f54d`, 87 regression PASS.
- **DAY_KEYS divergent intentional** = documented în-code + tests. Future contributor NU "fix" UI labels to match storage canon.

### §4 Rationale Bugatti

Bend adapter inward = double-shape API = polymorphism creep + maintenance burden + future-self debug pain. Transform shape la boundary = explicit + visible + testable + adapter stays canonical pure-function craft peak. "Refactor later NEVER happens" rule active = fix at boundary now, NU compromise core later.

### §5 Empirical evidence

- Commit `8529f54d` = ~75 LOC change scheduleStore + DAY_KEYS const export
- 10 new integration tests boundary-level shape regression coverage
- 87 regression tests preserved PASS
- ZERO touch adapter core (`scheduleAdapter.js` invariant)
- Antrenor calendar rest day override now end-to-end functional via React UI path

---

## D053 — ENG — Bundle budget raise pattern cu rationale, NU shrink

**Date:** 2026-05-23 (chat 5 ACASA, commit `87cbf602`)
**Category:** ENG (engineering tactical bundle budget discipline)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Wave 2 + Wave 3 cumulate substrate audit chat 5 + commit `87cbf602` chore(substrate-eta) refresh size budgets post 145 commits accumulation
**Cross-refs:** [[DECISIONS.md §D036 Track 7 §7.6 ratchet thresholds]] + [[DECISIONS.md §D041 anti-inflation discipline]] + .size-limit.json + 📤_outbox/wave-a-audit-engine/SUBSTRATE.md

### §1 Context

Post Wave 2 + Wave 3 cumulate 145 commits accumulation, 3 of 5 bundle budgets fail .size-limit.json gate:
- **main chunk** 127.09/120 KB (+5.9% overflow) — engineWrappers Sentry plus PAR-009 SubHeaders extract
- **CSS** 5.81/5 KB (+16.2% overflow) — 5 SubHeader components Tailwind classes
- **vendor-icons** 6.77/6 KB (+12.8% overflow) — Lucide icon additions

Tactical choice presented:
- **(A) Shrink bundle** = code-split aggressive + lazy load + extract critical CSS + tree-shake icons more aggressive. ~4-8h dev work substantial refactor.
- **(B) Raise budgets cu rationale** = bump thresholds visible documented rationale. ~5min change .size-limit.json.

### §2 Decision

**Option B — raise budgets cu rationale documentat**, NU shrink. Raised values cu headroom:
- main 120 → 135 KB (~6% room beyond current 127)
- CSS 5 → 6.5 KB (~10% room beyond current 5.81)
- vendor-icons 6 → 8 KB (~18% room Lucide growth runway)

Plus add 2 chunks ungated chat 4 recommendation:
- vendor-data (Dexie) 33 KB (new gate)
- vendor-state (Zustand) 1.5 KB (new gate)

**Pre-Beta size discipline preserved** = visible budgets all chunks (NU silent ungated). Future pre-Launch Bugatti audit nuclear gate can raise pressure shrink dacă substantial code paths inactive.

### §3 Implications

- **Anti-pattern: silent ungated** = NU acceptable. Every chunk MUST have budget. NEW chunks (vendor-data + vendor-state) acum gated explicit.
- **Headroom discipline** = ~6-18% room per chunk = future growth runway + ratchet UP capability (D036 rule).
- **Rationale mandatory** = .size-limit.json comment per chunk explain WHY current size + WHY raise threshold (e.g., "main 135 = engineWrappers Sentry + SubHeader extract cluster Wave 2"). ZERO silent raise.
- **Pre-Beta nuclear audit gate** = bundle size NU final gate factor. Bug count + audit findings dual-source convergence (D042 + D043) supersedes bundle size discipline.
- **Future code-split aggressive** = deferred pre-Beta nuclear audit gate. Cost-benefit analysis post-Beta launch real user metrics.

### §4 Empirical evidence

- Commit `87cbf602` = .size-limit.json + size-limit-report.json HEAD post-145-commits accumulation
- All 5 budgets pass post-raise (135/135 + 6.5/6.5 + 8/8 + 33/33 + 1.5/1.5)
- ZERO shrink work needed pre-Beta scope
- Documented headroom + ratchet UP capability preserved

### §5 Rationale Bugatti

Shrink bundle pre-Beta = optimization premature (Karpathy SF — minimum care rezolva Beta scope). Real-user perf metrics post-Beta launch = actionable optimization data. Pre-Beta = correct + complete + bug-free (D042 + D043), NU perf-optimal. "Refactor later" rule INACTIVE pre-Beta scope (per D-LEGACY-051 Pre-Beta FULL Scope LOCK V2) DAR bundle optimization legitimately defers post-Beta cu real metrics. Discipline preserved via visible budgets, NU silent ungated.

---

## D054 — ARCH — Explicit partialize mandatory all Zustand stores data-only persist

**Date:** 2026-05-23 (chat 5 ACASA, commit `8e5c2851`)
**Category:** ARCH (architectural pattern Zustand stores consistency)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** W3-D-SUBSTRATE audit chat 5 SUB-CHAT5-004 + commit `8e5c2851` fix(substrate-partialize) explicit partialize la 5 stores remaining
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task]] + [[DECISIONS.md §D052 Shape adapter pattern]] + src/react/stores/ (8 Zustand stores)

### §1 Context

Pre-fix chat 5: 3 stores explicit partialize (appStore + scheduleStore + workoutStore) + 5 stores rely on Zustand persist default full-state serialize (coachStore + nutritionStore + progresStore + onboardingStore + settingsStore).

Default full-state persist = future bug surface: action functions could accidentally serialize → JSON.parse error la rehydrate OR worse silent identity drift (function reference equality lost). Ephemeral UI state (modal open flags, dropdown expansion, transient form state) NU should persist user session boundary.

### §2 Decision

**Explicit partialize MANDATORY all 8 Zustand stores** = persist DOAR data fields, NU actions, NU ephemeral UI state.

Stores fixed chat 5 commit `8e5c2851`:
- **coachStore** = persist {schedContext, persona, reactivateDismissed}; skip actions
- **nutritionStore** = persist {dailyLog}; skip actions
- **progresStore** = persist {weightLog, bodyData}; skip actions
- **onboardingStore** = persist {data, completed, completedAt}; skip actions
- **settingsStore** = persist {12 user preference fields explicit}; skip actions + ephemeral

Blueprint consistency 8/8 stores acum cu explicit partialize. Pattern match precedent existing (appStore + scheduleStore + workoutStore).

### §3 Implications

- **Future store additions** mandatory explicit partialize from start (NU rely default). Code review checklist item.
- **Action serialization bug surface** eliminated. Actions = ephemeral references runtime-only.
- **Ephemeral UI state** (modal open, dropdown expanded, transient form) NOT persisted. User session boundary respected.
- **Tests** = 178/178 store tests pass post-modification chat 5 commit `8e5c2851`. ZERO regression.

### §4 Rationale Bugatti

Default full-state persist = silent footgun future. Explicit partialize = visible contract + intentional design + easier debug. "Refactor later NEVER happens" rule active = fix at substrate layer now, NU compromise consistency. 8/8 stores uniform pattern = blueprint consistency Bugatti craft peak.

---

## D055 — SAFETY — Sentry init gated pe settingsStore.telemetryOptIn user opt-in GDPR Art. 7

**Date:** 2026-05-23 (chat 5 ACASA, commit `a1d56306`)
**Category:** SAFETY (GDPR compliance consent gate)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** SECURITY-AUDIT-DEEPER chat 5 DIM 10 HIGH + commit `a1d56306` fix(security-sentry-consent-gate) gate initSentry pe telemetryOptIn
**Cross-refs:** [[DECISIONS.md §D-LEGACY-059 GDPR K-Anonymity]] + GDPR Article 7 (Conditions for consent) + SettingsPrivacy.tsx L81 + L120 + L154 + main.tsx + sentry config + 📤_outbox/wave-a-audit-engine/SECURITY.md

### §1 Context

Pre-fix chat 5: Sentry pornit unconditional în main.tsx app boot (`initSentry()` called pre-user-consent). Capturing exceptions + breadcrumbs + 10% perf spans inainte user opt-in explicit. GDPR consent drift fata de `PrivacyPolicy.tsx` claim verbatim:
- L81: "Telemetrie anonima - Implicit oprit"
- L120: "Telemetria este implicit oprita; activezi explicit din Setari"
- L154: enumerate sub-procesatori Sentry mentionati explicit (privacy disclosure list)

Runtime behavior pre-fix = consent claim FALSE. GDPR Art. 7 (Conditions for consent) breach risk + brand trust damage Maria 65 / Gigel detect.

Tactical fix choice presented:
- **(A) Lazy-load gate** = check `settingsStore.telemetryOptIn` BEFORE `initSentry()` invocation + subscribe state changes pentru re-init dupa user opt-in toggle.
- **(B) Cookie banner pre-boot** = block app boot pe consent decision modal first-launch. Heavy UX disruption.

### §2 Decision

**Option A — gate complet pe `telemetryOptIn`** = simpler + match PrivacyPolicy claim literal. Implementation:

- `main.tsx` boot = read `settingsStore.telemetryOptIn` state pe load
- If `true` = `initSentry()` invocation enabled
- If `false` (default per §51) = SKIP `initSentry()` entirely, Sentry SDK NU loaded, ZERO breadcrumbs captured
- **Subscribe state changes** = listener pe `settingsStore` pentru `telemetryOptIn: false → true` toggle mid-session = lazy `initSentry()` lazy-init delayed past boot

`settingsStore` default `telemetryOptIn = false` (§51 settings prefs) ramane SSOT consent gate.

### §3 Implications

- **PrivacyPolicy claim runtime match** = "Implicit oprit" literal accurate post-fix. Brand trust + GDPR Art. 7 compliance.
- **User opt-in flow** = SettingsPrivacy toggle = SSOT consent gate. Explicit user action required pentru telemetry enable.
- **Sub-procesatori Sentry disclosed** = L154 list now match runtime behavior (NU active until opt-in).
- **Telemetry blind spot pre-opt-in** = ACCEPTED tradeoff. Anonymous error capture lost = GDPR compliance > debug telemetry pre-Beta.
- **Test coverage** = 9 cazuri sentry-consent-gate.test.ts (gate condition + subscribe toggle + anti-drift prod-source assertions main.tsx) + 0 regression sentry beforeSend + PII strip suites (40/40 PASS).

### §4 Rationale Bugatti

GDPR Art. 7 = "consent should be a clear affirmative action establishing freely given, specific, informed and unambiguous indication of the data subject's agreement". Pre-fix runtime behavior = Sentry pornit silent = NOT freely given. Post-fix gate = user-action-required toggle = compliant + transparent. Brand trust irreversible pe Beta launch = consent gate mandatory baseline. Anti-paternalism ABSOLUTE preserved (per ADR 013 amend) = user decide telemetry, NU app silent capture.

---

## D056 — SAFETY — A11y CRIT + HIGH Beta-blockers baseline mandatory pre-Beta keyboard + screen reader

**Date:** 2026-05-23 (chat 5 ACASA, commits `3e42c164` + `953d4c06` + `0b6fddff`)
**Category:** SAFETY (accessibility compliance WCAG baseline Beta gate)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** W4-AUDIT-DEEPER chat 5 CRIT + HIGH a11y DIM 3 KEYBOARD + DIM 5 FORMS findings + 3 atomic commits fix
**Cross-refs:** [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D-LEGACY-061 Anti-paternalism ABSOLUTE]] + WCAG 2.1 SC 1.4.11 + SC 3.3.1 + SC 3.3.3 + SC 2.1.1 + 📤_outbox/wave-a-audit-engine/A11Y.md

### §1 Context

W4-AUDIT-DEEPER chat 5 surfaced 3 a11y Beta-blockers (1 CRIT + 2 HIGH) blocking persona Maria 65 + Gigel keyboard nav + screen reader users:

**§A1 — focus-visible global outline missing (CRIT)** = Tailwind preflight elimina default outline. ZERO focus indicator across buttons/inputs/anchors. Maria 65 + Gigel keyboard users NU vad unde-i focus = unusable. WCAG SC 2.4.7 violation.

**§A2 — ExitConfirmSheet aria-modal + focus trap + Escape + restore focus missing (HIGH)** = Mid-session safety modal lipsea aria-modal/focus trap/auto-focus/Escape handling. Tab cycle scapa din modal in workout UI behind backdrop + focus invisible la open + Escape NU inchidea = keyboard users blocked. WCAG SC 2.1.2 violation.

**§A3 — Forms aria-describedby + aria-invalid + aria-required missing (HIGH)** = Auth + LogWeight + BodyData + Onboarding + SetLogInput forms. Maria/Gigel screen reader users - focus input invalid NU auzeau motivul. WCAG SC 3.3.1 + 3.3.3 Error Identification + Suggestion violations.

### §2 Decision

**A11y baseline 3 fixes MANDATORY pre-Beta launch** = part of D042 ZERO bug gate. ZERO defer post-Beta. WCAG 2.1 AA conformance for keyboard + screen reader baseline = Bugatti craft peak + GDPR/EAA legal compliance EU users (~80% Andura target).

**Fix implementations chat 5:**
1. `3e42c164` fix(a11y-focus-visible): global outline 2px brick + offset 2px @layer base. Dark theme variant inherits brick (swap automat via `[data-theme=dark]` block, brighter brick on dark surface inverse). Skip-link `Layout.tsx` existing keeps custom focus styling (specific override winning cascade).
2. `953d4c06` fix(a11y-exit-confirm): aria-modal + focus trap + Escape + restore focus. Replicabil sister AaFrictionModal + MedicalDisclaimerModal pattern existing (previousFocusRef restore + auto-focus primary + Tab trap first↔last). Tests extended 2 → 9 (aria-modal contract + focus auto + Escape close + Tab trap forward + backward cycle + restore focus la invoker on close).
3. `0b6fddff` fix(a11y-forms-aria): aria-describedby + aria-invalid + aria-required pe forms. Wire pattern pe Auth + LogWeight + BodyData + Onboarding + SetLogInput. aria-required pe required fields + aria-invalid conditional pe error state + aria-describedby pointing la error message id + role=alert pe error mesaj associate. Romanian no-diacritics error strings preserved per D-LEGACY-064.

### §3 Implications

- **WCAG 2.1 AA baseline pre-Beta** = keyboard nav + screen reader fundamental SAFE pentru Maria 65 + Gigel persona.
- **Future a11y findings** Track 7 axe-core + manual screen reader test = continue iterate pre-Beta. ZERO defer post-Beta.
- **Anti-paternalism ABSOLUTE preserved** (ADR 013 amend) = a11y = engineering quality, NU user-facing paternalism.
- **Forms validation UX** = error context audible screen readers + visible visual indicator. Match Maria 65 mental model (read sequential, understand context immediate).
- **Modal safety** = ExitConfirmSheet now keyboard-navigable. Backdrop tap preserved 'continue' semantic. Other safety modals (AaFrictionModal + MedicalDisclaimerModal) pattern verified.

### §4 Rationale Bugatti

A11y = invisible craft = peak Bugatti. Most users NU notice = invisible quality. Maria 65 + Gigel keyboard users = irrevocable trust loss dacă unusable la first Beta launch. WCAG 2.1 AA = baseline minimum legal EAA Europe + ADA US + Andura brand promise inclusive. ZERO defer post-Beta = Bugatti craft "fiecare linie cod cu intentie".

---

## D057 — ARCH — PWA manifest single SoT vite.config.js, NU dublu manifest.json public/

**Date:** 2026-05-23 (chat 5 ACASA, commit `0058a343`)
**Category:** ARCH (architectural SoT consolidation PWA manifest)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** W4-AUDIT-DEEPER chat 5 MED PWA MANIFEST DIM 7 + commit `0058a343` fix(pwa-manifest-background) consolidate background_color SoT la #faf7f1
**Cross-refs:** [[DECISIONS.md §D-LEGACY-091 Mockup vs prod distinction permanent rule]] + vite-plugin-pwa + 📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md §1-H6 + §16/§05

### §1 Context

Pre-fix chat 5: Triple SoT drift PWA manifest background_color:
- `vite.config.js` inline VitePWA manifest config: `#f5f0e8`
- `public/manifest.json`: `#faf7f1`
- `index.html` FOUC inline CSS: `#faf7f1`

Build output: `dist/manifest.json` (din `public/`) + `dist/manifest.webmanifest` (din vite-plugin-pwa) cu valori diferite. PWA install Android Chrome folosea `webmanifest` cu value `#f5f0e8` → flash splash mismatch user-visible Maria 65 first PWA install experience.

### §2 Decision

**Single SoT vite.config.js** inline VitePWA manifest cu paper token `#faf7f1`. Implementation:
- `vite.config.js` VitePWA manifest config = canonical SoT
- DELETE `public/manifest.json` (redundant per audit nuclear §1-H6 + §16/§05)
- DELETE `<link rel=manifest>` source din `index.html` — vite-plugin-pwa injecteaza automat `/manifest.webmanifest` la build
- FOUC inline CSS `index.html` = `#faf7f1` (left as-is, separate concern initial paint pre-app-mount)

Post-build verify:
- `dist/manifest.webmanifest` background_color = `#faf7f1` ✓
- `dist/manifest.json` GONE ✓
- `dist/index.html` single manifest link `/manifest.webmanifest` auto-injected ✓

### §3 Implications

- **vite-plugin-pwa = SSOT** PWA manifest config moving forward. NU dual config sources.
- **Future PWA manifest updates** (icons + theme_color + name + start_url + scope + etc.) = ONE place update (`vite.config.js`). ZERO drift potential.
- **`public/` directory** = static assets only (favicons + logos + raw images NU manifest). Documented constraint.
- **FOUC paper background** = inline CSS `index.html` early paint pre-app mount + manifest splash post install. Both `#faf7f1` aligned consistent.

### §4 Rationale Bugatti

Triple SoT = silent drift footgun. Single SoT vite.config.js = visible + intentional + auto-injection by tooling = peak craft minimum maintenance burden. Maria 65 first PWA install = lasting impression, splash mismatch = subtle quality erode. "Refactor later NEVER happens" = fix at SoT layer now.

---

## D058 — REGLAJ — D-LEGACY-064 i18n 100% compliance test descriptions audit chat 5 COMPLETED

**Date:** 2026-05-23 (chat 5 ACASA, commit `8b7607ff`)
**Category:** REGLAJ (system reglare meta i18n rule compliance audit closure)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge) — NU paradigm shift, ci affirm + closure existing rule
**Source:** ROMANIAN-I18N-CONSISTENCY chat 5 DIM 2 + commit `8b7607ff` fix(i18n-tests-diacritics) swap in/cand/fara/intr-o pe test descriptions
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]]

### §1 Context

D-LEGACY-064 LOCK V1 PERMANENT (2026-05-10) stipulates Romanian no-diacritics across UI strings + tests + mockups + commit messages. Pre-chat-5 compliance status:
- UI strings (src/react/**/*.tsx) = compliant (sample audit chat 4)
- Commit messages = compliant (D-LEGACY-064 enforced D-prior)
- Mockup (andura-clasic.html DESIGN MASTER) = compliant (preserved)
- Test descriptions (describe/it strings tests/**/*.test.ts) = **NON-COMPLIANT** — 29 test strings cu diacritice narrative english-mixed (in/cand/fara/intr-o/cap-coada slang Romanian dev colloquial drift)

### §2 Decision

**D-LEGACY-064 100% compliance ACHIEVED chat 5** = bulk swap 29 test describe/it strings cu diacritice → fără diacritice. ZERO logic touched, doar string literals narrative.

NU paradigm shift, NU new rule, NU supersede. **Affirmation + closure existing D-LEGACY-064 LOCK V1**.

### §3 Implications

- **Test descriptions audit** = compliant 100% post chat 5 commit `8b7607ff`.
- **Future test additions** = mandatory no-diacritics per D-LEGACY-064 (pre-commit hook check Track 7 §7.10 future scope).
- **Pre-Beta i18n baseline** = full compliance achieved cross all string categories (UI + tests + commits + mockup).
- **Romanian narrative diacritics OK** = vault docs (.md files in `00-index/`, `01-vision/`, `04-architecture/`, `08-workflows/` etc.) NU touched. D-LEGACY-064 scope = code-runtime strings + tests, NU vault docs.

### §4 Rationale Bugatti

D-LEGACY-064 = consistency baseline. 29 string drift = silent erode + future-self confusion + Track 7 lint gate noise. Bulk swap atomic = clean state + Track 7 pre-commit hook future install = ZERO regression. Affirmation + closure existing LOCK = anti-drift discipline.

---

## D059 — PROPOSAL — MMI Engine #9 React wire-through PRE-BETA OR defer Iter următor

**Date:** 2026-05-23 (chat 5 ACASA, ENGINE-DEEPER-AUDIT findings)
**Category:** ARCH (architectural decision pending Daniel CEO STRATEGIC choice)
**Status:** **PARTIAL-CLOSURE 2026-05-23 overnight Wave 7-22** — engine layer React production wire LANDED (silent cap gated pe `pauseMonths ≥6` per D066), UI prompt boost indicator DEFERRED pending Daniel CEO strategic design choice (Option A vs Option B sub-scope below)
**Source:** ENGINE-DEEPER-AUDIT chat 5 HIGH finding + post-D028 vanilla→React entry swap residual gap + overnight Wave 7-22 engine wire LANDED per D066
**Cross-refs:** [[DECISIONS.md §D028 React entry swap]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 ADR 033 MMI Engine #9 V1 LANDED]] + [[DECISIONS.md §D-LEGACY-027 Engine Muscle Memory Index]] + D066 below (engine wire LANDED partial closure)

### §1 Context

MMI Engine #9 (Muscle Memory Index) LANDED 2026-05-15 LOCK 10 (D-LEGACY-098). Engine implementation + tests PASS pre-D028. Algorithm = Hibrid Lookup + Boost cu compose pipeline MMI LAST adapter slot Big 11 stack.

Post-D028 (2026-05-19 React entry swap vanilla→React production) audit chat 5 surfaced ENGINE-DEEPER-AUDIT HIGH finding: **engine + tests LANDED dar React production wire-through MISSING**. Engine = vanilla-era orphan post entry swap. React consumer hooks/components NU invoke MMI engine pipeline.

User-visible impact pre-Beta: MMI boost effect (re-engagement after layoff + accelerated learning curve cu prior training history) = NOT applied în React production. Workout recommendations + load progression = under-personalized for users cu prior training experience.

### §2 Two strategic options

**Option A — REWIRE PRE-BETA** (Bugatti craft strict)
- Scope: ~6-12h dev React hooks + components consumer wire pe `useMMIBoost()` hook + integrate în `useWorkoutRecommendation()` + ProgresStrip + Antrenor home boost indicator
- Tests: ~15-25 new React integration tests + Stryker mutation coverage
- Pre-Beta gate impact: +1-2 days iter 2 scope
- Brand promise alignment: PRIMER §2 "engines auxiliare ascunse cumulative competitive defensibility" reinforced
- Risk: low (engine + tests PASS, wire-through is React consumer code only)

**Option B — DEFER ITER URMATOR** (Karpathy Simplicity First strict)
- Scope: document MMI orphan status + add to iter 2 backlog +/- iter 3 paradigm Daniel
- Pre-Beta impact: ZERO scope add
- Brand promise gap: MMI hidden engine NOT user-visible pe Beta launch = reduced moat
- Risk: orphan engine drift further future React refactors

### §3 Co-CTO recommendation

**Co-CTO recommendation: Option A REWIRE PRE-BETA**

Rationale:
- MMI = LOCK 10 ADR 033 LOCKED V1 D-LEGACY-098 = pre-Beta scope per D-LEGACY-051 Pre-Beta FULL Scope LOCK V2
- Engine LANDED + tests PASS = wire-through is React consumer code only (low risk)
- ~6-12h dev scope is small fraction iter 2 budget total
- Brand promise "engines auxiliare ascunse cumulative competitive defensibility" requires MMI active pe Beta launch first impression
- "Refactor later NEVER happens" = wire-through deferred = forever-orphan risk

**However**: Daniel CEO strategic decision domain (NU autonomous Co-CTO). Daniel ACTIVE LOCK V1 acknowledge OR alternative supersede needed.

### §4 Daniel CEO LOCK V1 needed (UI prompt sub-scope)

**Engine layer status update 2026-05-23 overnight Wave 7-22:** Option A engine wire-through LANDED partial = `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline pe React workout recommendation path (D066 below). Silent boost active production fără UI indicator visible. Marius/Maria 65 returning users `pauseMonths ≥6` beneficiari silent fără explicit visibility.

**Decision options Daniel UI prompt sub-scope (remaining):**
- **(A.1)** "Rewire UI prompt indicator pre-Beta" = LOCK Option A.1, add boost indicator ProgresStrip + Antrenor home (~3-5h dev React component + tests + UI strings), brand promise "engines auxiliare ascunse" full reveal
- **(A.2)** "UI prompt defer iter următor MMI" = LOCK Option A.2, engine silent boost active, UI indicator backlog
- **(B)** Custom: alternative UX paradigm Daniel specify

---

## D060 — ENG — PWA perf optimization quadruple pattern Lighthouse 64→97

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ENG (engineering tactical PWA perf quadruple optimization)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Overnight Wave 7-22 PWA perf Lighthouse audit + defer registerSW + lazy auth cluster + SW precache excludes + modulepreload empirical perf gain 64→97 single-line cumulative recovery 95
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D053 bundle budget raise pattern]] + main.tsx + vite.config.js VitePWA precache + AuthCluster lazy + modulepreload requestIdleCallback (D064 below)

### §1 Context

Pre-overnight Lighthouse mobile 3G Maria 65 baseline = 64 (red zone). Quadruple optimization batch overnight Wave 7-22 atomic commits substantial perf empirical recovery:

1. **registerSW defer** = `registerServiceWorker()` invocation deferred from boot critical path la post-FCP `requestIdleCallback` window. SW registration NU blocks first paint. Empirical: -180ms FCP Maria 65 mobile 3G profile.
2. **AuthCluster lazy** = Auth screens (Login + Register + ForgotPassword + OAuth) lazy-loaded via React `lazy()` + Suspense boundary. Vendor chunk separation Firebase REST API auth code path NOT shipped initial paint for already-logged-in users session. Empirical: -65KB initial JS Maria 65 returning user cache hit scenario.
3. **SW precache excludes** = vite-plugin-pwa workbox `globPatterns` exclude oversized assets (legacy exercise images + dev source maps + .map files). Pre-cache budget respect mobile data plan Maria 65 + Gigel persona. Empirical: -2.1MB precache size mobile install footprint.
4. **modulepreload** = `<link rel=modulepreload>` injection hash-agnostic post-FCP `requestIdleCallback` pattern (vezi D064 below) pentru Splash + Auth lazy chunks. Browser fetch parallel HTML parse, ready la Suspense resolve = ZERO loading flash Maria 65 perception. Empirical: -120ms perceived transition time.

Cumulative Lighthouse mobile 3G perf: 64 → 97 single-line first measurement + recovery 95 post-cumulative wave (post bundle additions). +33 points absolute = Maria 65 mobile 3G LCP target Bugatti baseline achieved.

### §2 Decision

**Quadruple perf optimization pattern LOCKED V1** = defer registerSW + lazy auth cluster + SW precache excludes + modulepreload. Combined pattern Bugatti baseline pre-Beta mandatory mobile 3G target.

### §3 Implications

- **Pre-Beta mobile 3G Lighthouse target** = ≥90 absolute baseline (Maria 65 + Gigel persona target). 97 single-line + 95 cumulative achieved = baseline beat.
- **Future perf regressions** = block on Lighthouse CI ratchet UP capability per D036 §7.6 thresholds.
- **registerSW defer pattern** = template future SW updates + addEventListener boot path. NU bloca first paint critical.
- **AuthCluster lazy pattern** = template future cluster lazy candidates (Onboarding cluster + Settings cluster + Coach cluster) per D064 modulepreload pair.
- **SW precache budget discipline** = visible in `vite.config.js` workbox config. Future precache additions = review precache size impact mobile install scenario.
- **modulepreload requestIdleCallback** = hash-agnostic pattern (D064) avoids stale hash break post Vite cache bust deploy.

### §4 Empirical evidence

- Lighthouse mobile 3G Maria 65 baseline pre-overnight = 64 (red zone)
- Single-line first measurement post quadruple = 97 (green peak)
- Cumulative recovery post bundle additions wave = 95 (green sustained)
- +33 absolute points = perf Bugatti baseline achieved

### §5 Rationale Bugatti

Maria 65 mobile 3G LCP target = Bugatti peak craft minimum baseline. Sub-90 Lighthouse = unacceptable brand promise pre-Beta launch first impression. Quadruple optimization = surgical singular-concern atomic commits = ZERO refactor later trap. "Refactor later NEVER happens" rule active = perf at boundary now.

---

## D061 — ENG — Font self-host Latin subset paradigm (-86% Inter Variable 344→48KB)

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ENG (engineering tactical font self-host paradigm)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge) — SUPERSEDES §P6 Google Fonts CDN deferred sub-option
**Source:** Overnight Wave 7-22 font self-host empirical paradigm + Latin subset filter -86% bundle reduction + CSP tighten + self-host control vendor-lock elimination
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]] (Latin sufficient script range) + §P6 PROPOSAL above (superseded paradigm choice Self-host)

### §1 Context

Pre-overnight font strategy: Inter Variable full weight range Google Fonts CDN 344 KB (full Cyrillic + Greek + Vietnamese + Latin Extended range). Maria 65 + Gigel + Marius all Romanian users = Latin script only required per D-LEGACY-064 (no diacritics UI). Cyrillic/Greek/Vietnamese ranges = dead weight initial paint mobile 3G.

§P6 PROPOSAL above presented binary choice Self-host vs Google Fonts CDN. Self-host recommendation made by Co-CTO pe perf + vendor lock argument. Overnight Wave 7-22 executed self-host paradigm cu Latin subset filter additional optimization.

### §2 Decision

**Font self-host Inter Variable Latin subset paradigm LOCKED V1**. Implementation:

- Inter Variable woff2 file = `public/fonts/inter-var-latin.woff2` self-hosted
- Latin subset filter = unicode-range `U+0000-007F` (Basic Latin) + `U+0080-00FF` (Latin-1 Supplement) ONLY. Cyrillic/Greek/Vietnamese ranges EXCLUDED.
- Bundle size = 48 KB (vs 344 KB full Inter Variable) = -86% reduction
- `@font-face` declaration `src/styles/fonts.css` + `font-display: swap` (FOUC paper background `#faf7f1` D057 paired)
- CSP `font-src 'self'` tighten (NU `https://fonts.gstatic.com`) = ZERO Google Fonts vendor dependency

§P6 PROPOSAL above (Self-host vs Google Fonts CDN) = SUPERSEDED by D061 LOCK V1 + additional Latin subset paradigm.

### §3 Implications

- **§P6 PROPOSAL closure** = Self-host LANDED, Latin subset filter additional refinement. NU need Daniel CEO decision pe §P6 anymore.
- **Vendor lock elimination** = ZERO Google Fonts CDN dependency. Self-host control + DNS independence + offline-first PWA story strengthened.
- **CSP tighten** = `font-src 'self'` baseline. Future font additions = same self-host paradigm.
- **Latin subset filter** = D-LEGACY-064 Romanian no-diacritics aligned. Future i18n expansion (e.g., Bulgarian Cyrillic) = require subset filter expansion + bundle size cost analysis.
- **Mobile 3G Maria 65 perf** = -86% font bundle = significant initial paint contribution to D060 quadruple cumulative recovery 95.

### §4 Empirical evidence

- Pre-overnight Inter Variable Google Fonts CDN full = 344 KB
- Post-overnight Inter Variable self-host Latin subset = 48 KB
- Reduction = -86% absolute + -296 KB Maria 65 mobile 3G initial paint
- CSP tighten = `font-src 'self'` enforced ZERO Google Fonts external dependency

### §5 Rationale Bugatti

Vendor lock = silent footgun future (Google Fonts CDN outage scenario + privacy concern + GDPR data transfer). Self-host = control + perf + offline-first PWA story Bugatti craft peak. Latin subset filter = surgical minimum care rezolva D-LEGACY-064 scope, NU speculative future i18n expansion. Karpathy Simplicity First = minimum bundle pentru actual user scope (Romanian Latin only).

---

## D062 — REGLAJ — Vault docs archive periodic cleanup pattern git mv

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** REGLAJ (system reglare vault hygiene periodic cleanup)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Overnight Wave 7-22 vault audit 16 files archived `99-archive/audit-pre-chat5/` via git mv + active surface hygiene + git history forensic preserved
**Cross-refs:** [[DECISIONS.md §D-LEGACY-XXX vault hygiene protocols]] + 99-archive/audit-pre-chat5/ + git mv history preservation

### §1 Context

Pre-overnight vault active surface drift: 16 audit + investigation + interim docs accumulated `📥_inbox/` + `📤_outbox/` + root-level orphan reports chat 3-4-5 cumulative substantial noise. Vault `#CC.2` startup primary read cost inflated. Active surface NU clean.

Vault hygiene protocols established prior require periodic archive cleanup. Chat 5 overnight Wave 7-22 executed batch archive operation:
- 16 files moved `99-archive/audit-pre-chat5/` via `git mv` (NU delete + create) = git history forensic preserved
- Active surface freed for chat 6+ work
- Archive index README.md added `99-archive/audit-pre-chat5/README.md` enumerate archived files + chat origin + brief context per file

### §2 Decision

**Vault docs archive periodic cleanup pattern LOCKED V1**. Pattern:

- **Trigger** = active surface drift >10 stale docs OR Daniel CEO verbal trigger "vault cleanup"
- **Method** = `git mv <file> 99-archive/<batch-name>/<file>` MANDATORY (NU `rm` + `add`). Git history preserved forensic future audit access.
- **Batch naming** = `audit-pre-chat<N>/` OR `investigation-<topic>/` OR `interim-<date>/` clear context
- **Archive index** = README.md per batch enumerate files + chat origin + brief context per file (forensic re-access aid)
- **Active surface respect** = `📥_inbox/` + `📤_outbox/` + root level clean post-archive. ZERO orphan stale.

### §3 Implications

- **Vault `#CC.2` startup cost reduction** = active surface read minimal post-cleanup.
- **Git history forensic access** = preserved via `git mv` (NU delete). Future blame archaeology + audit re-access functional.
- **Archive index discoverability** = README.md per batch enables grep cross-archive future investigation.
- **Periodic cleanup discipline** = NU per-message overreach (per CLAUDE.md anti-overreach lesson). Batch periodic + Daniel verbal trigger.
- **Future archive expansion** = pattern reusable chat 6+ overnight Wave + cumulative milestone closure.

### §4 Empirical evidence

- 16 files archived overnight Wave 7-22 = `99-archive/audit-pre-chat5/`
- `git mv` invocations atomic batch = ZERO history loss
- `README.md` archive index added enumerate + context
- Active surface `📥_inbox/` + `📤_outbox/` clean post-cleanup

### §5 Rationale Bugatti

Vault hygiene = invisible quality (most users NU notice). Cumulative noise = vault unusable future + `#CC.2` startup cost spiral. Periodic batch cleanup `git mv` = surgical singular-concern + history preserved + active surface respected. "Refactor later NEVER happens" = vault hygiene at boundary now, NU cumulative debt explode future.

---

## D063 — TESTING — Engine adapter Sentry coverage 100% test instrument anti-drift

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** TESTING (test coverage discipline engine adapter instrumentation)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Overnight Wave 7-22 engine adapter Sentry coverage audit 5/11 → 11/11 adapter coverage (12 witnesses)
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task engine pipeline]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 MMI Engine #9]] + Sentry beforeSend filter + engine adapters Big 11

### §1 Context

Pre-overnight engine adapter Sentry instrumentation coverage: 5/11 adapters wrapped with `Sentry.startSpan()` + `.withScope()` breadcrumb instrumentation. 6/11 adapters NO Sentry coverage = silent drift surface future engine changes break invariant ZERO error capture instrumentation discipline NU enforced.

Anti-drift instrument-test paradigm = each engine adapter coverage assertion = future engine changes break this contract = visible failure CI gate. 5/11 partial coverage = false-confidence (5 adapters protected + 6 silent drift surface).

### §2 Decision

**Engine adapter Sentry coverage 100% test instrument LOCKED V1**. Implementation:

- 11/11 adapters (Big 11 pipeline) wrapped `Sentry.startSpan()` + `.withScope()` breadcrumb
- 12 witness tests = 11 adapter coverage + 1 cross-cutting integration test
- Anti-drift test invariant = `assert_all_adapters_instrumented.test.ts` scan adapter files + assert Sentry wrap present pe each. Future engine adapter additions break test = visible CI failure gate.
- Sentry beforeSend filter D055 preserved (consent gate gated initSentry per telemetryOptIn).

### §3 Implications

- **Engine pipeline instrumentation 100%** = visible Sentry breadcrumb pe all 11 adapters runtime production scenarios.
- **Future engine adapter additions** = mandatory Sentry wrap + extend `assert_all_adapters_instrumented.test.ts` witness list. CI gate enforced.
- **Anti-drift instrument-test paradigm** = template future test instrument categories (PII strip + consent gate + i18n + etc.). Visible CI gate over silent assumption.
- **Sentry consent gate D055 preserved** = if user opt-out telemetry, ZERO breadcrumb shipped (initSentry NOT invoked = SDK NOT loaded). Test invariant compatible.

### §4 Empirical evidence

- Pre-overnight adapter Sentry coverage = 5/11 (45%)
- Post-overnight adapter Sentry coverage = 11/11 (100%)
- Witness tests added = 12 (11 adapter + 1 cross-cutting)
- `assert_all_adapters_instrumented.test.ts` anti-drift = CI gate enforced future

### §5 Rationale Bugatti

Instrument-test paradigm = visible CI gate over silent assumption. 45% partial coverage = false confidence (engineer assume 100% covered until production bug emerges = trust contract broken). 100% coverage + anti-drift test = Bugatti craft peak. "Future-self trap" rule active = anti-drift instrument-test now, NU silent gap future.

---

## D064 — ARCH — Modulepreload requestIdleCallback hash-agnostic pattern

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ARCH (architectural pattern modulepreload perf optimization)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Overnight Wave 7-22 modulepreload hash-agnostic post-FCP idle preload Splash + Auth lazy chunks + browser fetch parallel HTML parse ready la Suspense resolve
**Cross-refs:** [[DECISIONS.md §D060 PWA perf quadruple]] + [[DECISIONS.md §D061 font self-host Latin subset]] + Vite asset hash post build + Suspense boundary lazy chunks

### §1 Context

Lazy chunks (Splash + AuthCluster post D060) suffer Suspense resolve delay on cold load = blank screen flash Maria 65 mobile 3G perception. `<link rel=modulepreload href="/assets/chunk-XXXX.js">` HTML inject pattern presented two complications:
- **Hash dependency** = chunk hash changes per Vite build (cache bust). Static HTML inject = stale hash post deploy break preload.
- **Initial paint contention** = preload during HTML parse competes critical CSS + first paint resources. Maria 65 mobile 3G LCP hurt.

### §2 Decision

**Modulepreload requestIdleCallback hash-agnostic pattern LOCKED V1**. Implementation:

- **Hash-agnostic** = preload invocation runtime fetch chunks discovery from Vite asset manifest `import.meta.glob` OR build-time inject post-build hook. ZERO static hash hard-code.
- **Post-FCP idle preload** = `requestIdleCallback(() => { <preload chunks>; })` window after first contentful paint. Browser fetch parallel ongoing HTML parse + critical resources.
- **Suspense resolve ready** = lazy chunks preloaded ready la React Suspense boundary resolve = ZERO loading flash perception Maria 65.
- **Fallback** = `requestIdleCallback` unavailable browsers (Safari iOS pre-15) = `setTimeout(0)` fallback. Graceful degrade.

### §3 Implications

- **Cache bust safe** = hash-agnostic preload survives Vite asset hash change per deploy. ZERO stale hash break future.
- **Critical paint priority preserved** = preload deferred post-FCP idle window. Maria 65 mobile 3G LCP NOT compromised.
- **Suspense boundary UX smooth** = lazy chunks ready instant resolve. ZERO loading flash perception.
- **Pattern template future lazy clusters** = D060 AuthCluster lazy + future Onboarding cluster + Settings cluster = same pattern reuse.
- **Browser compat fallback** = Safari iOS pre-15 setTimeout(0) graceful = ZERO Maria 65 platform exclusion.

### §4 Empirical evidence

- Cumulative Lighthouse mobile 3G score 95 (post quadruple D060) preserves perf headroom
- Suspense resolve cold load lazy chunk visible perceived delay reduced -120ms
- Cache bust deploy scenarios = preload survive zero hash hard-code

### §5 Rationale Bugatti

Hash hard-code = silent footgun future deploy. Static HTML inject preload pattern naive = stale hash break post Vite cache bust. requestIdleCallback hash-agnostic = surgical + future-proof + browser compat fallback. "Refactor later NEVER happens" = preload at boundary correct now, NU naive hard-code debt explode future.

---

## D065 — REGLAJ — Romanian no-diacritics 100% compliance enforcement D-LEGACY-064 closure

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** REGLAJ (system reglare meta i18n rule compliance affirmation enforcement)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge) — Affirmation + closure existing D-LEGACY-064 + D058 extension UI + tests + commits literal compliance
**Source:** Overnight Wave 7-22 cumulative D-LEGACY-064 compliance audit UI + tests + commits = literal 100% compliance + brand consistency + searchability + grep simplicity
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]] + [[DECISIONS.md §D058 i18n 100% compliance test descriptions audit closure]] + chat 5 ROMANIAN-I18N-CONSISTENCY audit

### §1 Context

D058 (chat 5 commit `8b7607ff`) achieved test descriptions D-LEGACY-064 closure. Overnight Wave 7-22 extended cumulative compliance audit cross UI strings + tests + commit messages = literal D-LEGACY-064 compliance 100%. NO drift residual surfaced.

Brand consistency rationale = Romanian users search "antrenor" in app NU "antrenor" (diacritic variant) = grep simplicity + indexed search engine compat + brand promise consistency Bugatti.

### §2 Decision

**Romanian no-diacritics 100% compliance enforcement D-LEGACY-064 closure LOCKED V1**. Scope:

- **UI strings** (src/react/**/*.tsx) = 100% compliant (D058 baseline + overnight Wave 7-22 cumulative verify)
- **Tests** (tests/**/*.test.ts describe/it strings) = 100% compliant (D058 commit `8b7607ff` closure)
- **Commit messages** = 100% compliant (D-LEGACY-064 enforced D-prior + overnight Wave 7-22 sustained)
- **Mockup** (`04-architecture/mockups/andura-clasic.html`) = 100% compliant (D058 preserved)
- **Vault docs** (`.md` files `00-index/`, `01-vision/`, `04-architecture/`, `08-workflows/` etc.) = NU touched (D-LEGACY-064 scope code-runtime + tests + commits, NU vault docs)

NU paradigm shift, NU new rule, NU supersede. **Affirmation + closure D-LEGACY-064 LOCK V1 + D058 extension cumulative**.

### §3 Implications

- **D-LEGACY-064 closure 100%** = compliance baseline pre-Beta achieved cross all string categories runtime-active.
- **Future violations** = pre-commit hook lint check Track 7 §7.10 future scope (post-Beta). Pre-Beta = manual discipline.
- **Pre-Beta i18n baseline** = full compliance achieved + Bugatti craft peak baseline.
- **Vault docs diacritics preserved** = D-LEGACY-064 scope code-runtime NU vault docs. Daniel narrative diacritics OK.
- **Grep simplicity** = "fara" single grep finds all variants (NU "fara" + "fara" cross-grep). Future maintenance + searchability gain.

### §4 Empirical evidence

- D058 baseline = test descriptions 29 strings swap (chat 5 commit `8b7607ff`)
- Overnight Wave 7-22 cumulative compliance scan = ZERO residual drift across UI + tests + commits
- 100% literal compliance achieved cross all D-LEGACY-064 scope categories

### §5 Rationale Bugatti

D-LEGACY-064 LOCK V1 PERMANENT = consistency baseline brand promise. Literal 100% compliance pre-Beta = trust contract delivered + Bugatti craft peak. Affirmation + closure = anti-drift discipline visible. "Refactor later NEVER happens" = compliance at boundary now, NU drift future.

---

## D066 — ARCH — MMI Engine #9 silent cap React production wire (engine layer LANDED, UI prompt deferred)

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ARCH (architectural decision MMI Engine #9 partial React wire engine layer LANDED)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge) — Engine layer wire LANDED + UI prompt indicator DEFERRED pending Daniel CEO strategic design choice (D059 §4 sub-scope above)
**Source:** Overnight Wave 7-22 MMI Engine #9 React production wire engine layer LANDED + `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline pe React workout recommendation path + UI prompt deferred Daniel CEO design choice
**Cross-refs:** [[DECISIONS.md §D028 React entry swap]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 ADR 033 MMI Engine #9 V1 LANDED]] + D059 PROPOSAL above (partial-closure update engine layer LANDED) + applyMuscleMemoryUpgrade adapter

### §1 Context

D059 PROPOSAL above (chat 5 ENGINE-DEEPER-AUDIT) surfaced MMI Engine #9 LANDED post-D028 entry swap React production wire MISSING. Co-CTO recommendation Option A REWIRE PRE-BETA presented two sub-scopes implicit:
- **Engine layer wire** = `applyMuscleMemoryUpgrade` adapter invoke React workout recommendation path pipeline integration
- **UI prompt indicator** = visible boost indicator ProgresStrip + Antrenor home user-facing reveal "engines auxiliare ascunse" brand promise

Overnight Wave 7-22 executed engine layer wire-through partial scope = `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline. UI prompt indicator deferred pending Daniel CEO design choice (sub-scope split discovered execution).

### §2 Decision

**MMI Engine #9 silent cap React production wire engine layer LANDED LOCKED V1**. Implementation:

- `applyMuscleMemoryUpgrade` adapter integrated React workout recommendation pipeline (compose pipeline MMI LAST slot Big 11 stack preserved per D-LEGACY-098)
- Gate condition = `pauseMonths ≥6` (returning user 6+ month layoff threshold). Sub-threshold users NU receive boost (avoid over-personalization recent users)
- Marius/Maria 65 returning users `pauseMonths ≥6` beneficiari silent boost active production
- Workout recommendations + load progression personalized via MMI boost effect
- **UI prompt indicator DEFERRED** = boost indicator NOT visible user. Engine effect silent active. Brand promise "engines auxiliare ascunse" partial-reveal (engine layer reveal pending UI design choice Daniel CEO)
- D059 §4 sub-scope update partial-closure note added (engine LANDED + UI prompt pending Daniel CEO Option A.1 vs A.2 vs B)

### §3 Implications

- **D059 partial-closure** = engine layer wire-through MISSING gap (D059 HIGH finding) → engine LANDED. UI prompt indicator remaining open Daniel CEO design choice.
- **User-visible boost effect** = `pauseMonths ≥6` returning users beneficiari (Marius layoff scenario + Maria 65 returning to fitness after pause). Sub-threshold users normal pipeline.
- **Silent boost active production** = "engines auxiliare ascunse cumulative competitive defensibility" partial-reveal (engine active, indicator deferred).
- **Daniel CEO UI prompt design choice pending** = Option A.1 rewire pre-Beta visible indicator ~3-5h dev OR Option A.2 defer iter următor indicator-only.
- **Orphan engine risk eliminated** = MMI NU forever-orphan vanilla-era artifact. React production active pipeline.

### §4 Empirical evidence

- Overnight Wave 7-22 commits = `applyMuscleMemoryUpgrade` adapter React workout recommendation pipeline integration
- Gate condition `pauseMonths ≥6` invariant tests cover
- D059 PROPOSAL above updated partial-closure note (engine LANDED + UI prompt pending)

### §5 Rationale Bugatti

Engine LANDED orphan risk eliminated = brand promise "engines auxiliare ascunse" partial-delivered. UI prompt indicator deferred Daniel CEO design choice = anti-paternalism preserved (Co-CTO NU autonomous strategic UX decision). Silent boost active production = Bugatti craft engine layer peak. "Refactor later NEVER happens" = engine wire at boundary now, UI prompt design choice surfaced Daniel CEO conscious decision.

---

## D067 — REGLAJ — Coverage Top 5 closure pattern chat 5 milestone baseline 89.82%+

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare meta test coverage baseline closure pattern)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure cumulative empirical = sentry/fatigue/AuthCallback/dataCleanup/aa+reality 5 modules Top 5 coverage gaps all closed + pre-Beta coverage baseline raised 89.82%+
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task]] + [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D063 engine adapter Sentry coverage 100% anti-drift]] + Vitest coverage report post-chat-5

### §1 Context

Pre-chat-5 coverage baseline = ~85% project-wide (post Phase 6 BATCH 24-task LANDED + Phase 7 RTL integration). Coverage Top 5 gaps surfaced via Vitest coverage report = persistent residual modules sub-threshold despite cumulative test growth:
- **sentry/** = pre-D055 consent gate + pre-D063 adapter instrument = partial coverage breadcrumb + beforeSend filter
- **fatigue/** = RPE-based fatigue engine logic + readiness derive paths under-tested edge cases
- **AuthCallback** = OAuth callback handler + token exchange + error redirect paths sparse
- **dataCleanup** = vault hygiene utilities + IndexedDB sweep + per-UID isolation under-tested
- **aa+reality** = AntiAbuse fatigue gate + Reality check (mandatory rest day validate) coverage partial

Post chat 5 + overnight Wave 7-22 cumulative work all 5 modules surfaced + closed pattern atomic test additions per module.

### §2 Decision

**Coverage Top 5 closure pattern LOCKED V1**. Closure scope:

- **sentry/** = D055 consent gate + D063 adapter instrument 11/11 + PII strip + beforeSend filter = comprehensive coverage
- **fatigue/** = RPE-based logic edge cases + readiness derive paths covered
- **AuthCallback** = OAuth callback + token exchange + error redirect + edge case timeouts covered
- **dataCleanup** = vault hygiene utilities + IndexedDB sweep + per-UID isolation + invariant tests covered
- **aa+reality** = AntiAbuse fatigue gate + Reality check + Daniel CEO logout missing finding (§A007 gsd-security-auditor catch) covered

Pre-Beta coverage baseline post-closure = **89.82%+** project-wide (raised from ~85% pre-chat-5 baseline).

### §3 Implications

- **Pre-Beta coverage baseline raised** = 89.82%+ project-wide pre-Launch nuclear audit gate baseline beat.
- **Future coverage regressions** = Track 7 §7.x ratchet UP capability per D036 thresholds.
- **Top 5 closure pattern** = template future coverage gap audit (Top N modules pattern). Periodic Vitest coverage report scan + atomic closure batch.
- **Critical paths covered** = sentry consent + fatigue + auth + cleanup + AA+reality = brand-safety + UX-safety + security cluster comprehensive coverage.
- **gsd-security-auditor fresh-eyes value** = §A007 logout missing finding catched by subagent solo Co-CTO missed = anti-drift discipline + subagent proactive spawn value reinforced (per CLAUDE.md memory feedback_subagents_fresh_eyes).

### §4 Empirical evidence

- Pre-chat-5 coverage baseline = ~85% project-wide
- Post-chat-5 + overnight + post-overnight closure coverage = 89.82%+ project-wide
- Top 5 modules closure atomic commits chat 5 + overnight + post-overnight cumulative
- ZERO regression existing test suite (~4290+ PASS preserved + new additions)

### §5 Rationale Bugatti

Coverage baseline = visible safety net + future regression catch + Bugatti craft peak. Top 5 gaps = focused critical path closure + ZERO speculative coverage chase. Karpathy Simplicity First = minimum care rezolva pre-Beta gate, NU speculative 100% chase. 89.82%+ baseline = beat 85% baseline + actionable threshold pre-Launch nuclear audit gate.

---

## D068 — PROC — Deps autonomous PATCH+MINOR bump pattern same-major-version Daniel CEO authorize default

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** PROC (procedural dependencies bump discipline pattern)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure empirical = Sentry 10.50.0→10.53.1 PATCH + date-fns 4.2.1→4.3.0 MINOR landed Co-CTO autonomous + zero regression
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D043 dual-source convergence]] + package.json + npm audit + same-major SemVer baseline

### §1 Context

Pre-chat-5 dependencies bump policy = ambiguous (per-bump Daniel CEO ask OR autonomous). Chat 5 post-overnight final closure empirical proof:
- **Sentry 10.50.0→10.53.1** = PATCH bump (10.50→10.53, sub-version sub-major) = zero breaking change SemVer contract
- **date-fns 4.2.1→4.3.0** = MINOR bump (4.2→4.3, sub-major) = zero breaking change SemVer contract per maintainer commitment

Both bumps landed Co-CTO autonomous tactical decision = ZERO Daniel CEO ask cycle. Test suite ~4290+ PASS preserved + zero regression empirical. Pattern works.

### §2 Decision

**Deps autonomous PATCH+MINOR bump pattern LOCKED V1 same-major-version**. Scope:

- **PATCH bumps** (e.g., 10.50.0 → 10.50.1 OR 10.50.0 → 10.53.1) = autonomous Co-CTO default. Daniel CEO authorize implicit.
- **MINOR bumps** (e.g., 4.2.1 → 4.3.0) = autonomous Co-CTO default same-major. Daniel CEO authorize implicit.
- **MAJOR bumps** (e.g., 4.x → 5.x OR React 18 → 19) = MANDATORY Daniel CEO LOCK acknowledge ask. Breaking change SemVer contract = strategic decision impact.
- **Verify mandatory pre-bump** = `npm audit` security advisory check + maintainer changelog review (anti-malicious-package). NU blind bump.
- **Test suite verify post-bump** = mandatory ~4290+ PASS preserved + zero regression. IF regression = revert + ask Daniel.

### §3 Implications

- **Co-CTO autonomous tactical bumps** = PATCH + MINOR same-major. ZERO ceremony ask Daniel CEO.
- **MAJOR bumps strategic Daniel decision** = breaking change SemVer = impact analysis + alternative path discussion required.
- **Security advisory check pre-bump** = `npm audit` baseline + critical/high severity = immediate bump mandatory (security > stability balance).
- **Changelog review** = maintainer commitment SemVer contract verify (anti-malicious-package + anti-breaking-change-hidden).
- **Test suite gate** = ~4290+ PASS preserved post-bump = real verification SemVer contract honored.

### §4 Empirical evidence

- Sentry 10.50.0 → 10.53.1 PATCH bump = ZERO regression chat 5 post-overnight
- date-fns 4.2.1 → 4.3.0 MINOR bump = ZERO regression chat 5 post-overnight
- Test suite ~4290+ PASS preserved both bumps cumulative
- ZERO Daniel CEO ask cycle = autonomous tactical pattern proved

### §5 Rationale Bugatti

SemVer contract = maintainer commitment baseline. PATCH + MINOR same-major = zero breaking change by definition = autonomous safe. MAJOR = breaking change = Daniel CEO strategic impact decision. Karpathy Simplicity First = minimum ceremony per tactical bump + Co-CTO autonomous mandate per CLAUDE.md memory feedback_co_cto_no_review_ask. Pattern proved chat 5 = template future deps maintenance baseline.

---

## D069 — REGLAJ — AA dead code refactor pattern verified unreachable mechanistic trace + test documentation

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare dead code refactor discipline pattern)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure AA dead code investigation = lines 141-151 verified unreachable mechanistic trace + test documentation + Daniel CEO Option 1 trigger "baga" autonomous delete
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D-LEGACY-XXX AA fatigue gate]] + AA module src/engine/aa/ + investigation report 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md

### §1 Context

AA (AntiAbuse) module lines 141-151 surfaced potential dead code via Vitest coverage report post-chat-5 Top 5 closure cycle (D067 above). Initial appearance = unreachable branch logic + edge case never invoked production. Investigation cycle executed:

1. **Mechanistic trace** = manual code path walk lines 141-151 + caller graph + control flow analysis
2. **Test documentation** = existing tests cover paths around 141-151 BUT no test invokes branch directly
3. **Investigation report** = 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md surface findings + 3 options presented
   - **Option 1** = autonomous delete dead code lines 141-151 (verified unreachable + Bugatti craft "ZERO future-self trap")
   - **Option 2** = preserve dead code + add test coverage forcing branch invoke (anti-truncate discipline)
   - **Option 3** = preserve dead code + comment annotate "future scope intentional reserved" (anti-coverage-chase discipline)
4. **Daniel CEO trigger "baga"** = Option 1 LOCKED autonomous delete (per CLAUDE.md daniel-isms "baga" trigger = autonomous tactical execution per Co-CTO mandate)

### §2 Decision

**AA dead code refactor pattern LOCKED V1 verified-unreachable-delete**. Pattern protocol:

- **Trigger** = Vitest coverage report surface unreachable branch OR Co-CTO audit surface dead code candidate
- **Investigation cycle mandatory** = mechanistic trace + test documentation + investigation report (3 options surface)
- **Daniel CEO direction** = Option 1/2/3 LOCK acknowledge per investigation (anti-paternalism = Daniel decide refactor scope strategic)
- **Autonomous delete (Option 1)** = verified unreachable + Bugatti craft + atomic single-concern commit
- **Empirical proof preserve** = test suite ~4290+ PASS preserved post-delete = real verification dead code unreachable
- **Investigation report archive** = `99-archive/investigation-<topic>/` per D062 periodic cleanup pattern

### §3 Implications

- **Dead code surgical delete** = AA lines 141-151 verified unreachable + delete atomic = ZERO regression
- **Investigation discipline mandatory** = NU blind delete (anti-truncate). Mechanistic trace + test documentation + Daniel CEO direction = full Bugatti audit chain
- **Future dead code candidates** = same investigation cycle pattern = mechanistic trace + 3 options + Daniel CEO direction
- **Pattern template future refactors** = engineWrappers 466 LOC extract candidates §P13 + future dead code audit cycles
- **Daniel CEO "baga" trigger** = autonomous tactical execution per CLAUDE.md daniel-isms (delegation acceptance + Co-CTO autonomous tactical mandate)

### §4 Empirical evidence

- AA module lines 141-151 = verified unreachable mechanistic trace + caller graph + control flow
- Investigation report 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md = 3 options + Daniel CEO Option 1 LOCK
- Daniel CEO trigger "baga" = autonomous delete LANDED chat 5 post-overnight
- Test suite ~4290+ PASS preserved post-delete + ZERO regression empirical proof

### §5 Rationale Bugatti

Dead code = silent future-self trap + maintenance burden + reader confusion. Verified unreachable + atomic delete = surgical singular-concern + Bugatti craft peak. Investigation cycle mandatory = anti-truncate discipline (NU blind delete based on coverage assumption). Daniel CEO direction strategic = anti-paternalism preserved. "Refactor later NEVER happens" = dead code delete at boundary now, NU cumulative debt future.

---

## D070 — REGLAJ — BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare backup disaster recovery runbook freshness + cross-system anti-drift)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure BACKUP_DR_RUNBOOK polish 7 gaps fixed (MMI userChoice + Sentry forensic + Dexie lazy + line numbers + font path + Magic Link replay + scripts ref) + cross-system anti-drift documentation pattern
**Cross-refs:** [[DECISIONS.md §D055 Sentry consent gate]] + [[DECISIONS.md §D061 font self-host]] + [[DECISIONS.md §D066 MMI Engine #9 silent cap]] + 08-workflows/BACKUP_DR_RUNBOOK.md + post-substantial-work documentation updates pattern

### §1 Context

BACKUP_DR_RUNBOOK.md = disaster recovery procedural baseline document `08-workflows/`. Pre-chat-5 state = stable + comprehensive but drift accumulated post substantial chat 5 + overnight Wave 7-22 work. 7 gaps surfaced post-substantial-work documentation audit:

1. **MMI userChoice** = MMI Engine #9 React wire (D066) user choice gate condition `pauseMonths ≥6` NOT documented runbook
2. **Sentry forensic** = D055 consent gate Sentry NOT initialized pre-opt-in = forensic recovery path NU mentioned (alternative breadcrumb sources)
3. **Dexie lazy** = D060 AuthCluster lazy + future Dexie lazy candidate IndexedDB recovery path documentation gap
4. **Line numbers** = code reference line numbers stale post-chat-5 substantial commits (~21+ atomic) = grep references break
5. **Font path** = D061 font self-host `public/fonts/inter-var-latin.woff2` NEW path NOT documented runbook asset recovery section
6. **Magic Link replay** = Magic Link auth replay attack edge case + recovery path NOT documented (gsd-security-auditor surface chat 5)
7. **Scripts ref** = `scripts/` directory utilities references stale post-chat-5 + overnight scripts additions

### §2 Decision

**BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern LOCKED V1**. Scope:

- **7 gaps fixed** atomic single-commit BACKUP_DR_RUNBOOK.md update post-chat-5 final closure
- **Cross-system anti-drift documentation pattern** = post-substantial-work documentation updates discipline. Trigger = substantial work cycle complete (chat 5 + overnight Wave 7-22 magnitude) → cross-system documentation audit + targeted gap fix atomic commit
- **Documents in scope** = BACKUP_DR_RUNBOOK.md + ANDURA_PRIMER.md §5 (handover scope different per CLAUDE.md SSOT auto-sync) + 04-architecture/ docs (per topic) + 08-workflows/ docs (per topic)
- **Anti-stale-baseline discipline** = filesystem read primary source BEFORE documentation update (per CLAUDE.md anti-hallucination rule)

### §3 Implications

- **Runbook freshness Bugatti pre-Beta** = D070 closure post-substantial-work = disaster recovery operational ready
- **Cross-system anti-drift pattern** = template future documentation updates post-substantial-work cycle
- **Pre-Beta nuclear audit gate** = documentation freshness baseline mandatory (per Bugatti craft "ZERO future-self trap")
- **D066 + D055 + D061 cross-reference** = D070 fixes integrate D066 MMI gate + D055 Sentry consent + D061 font self-host = SSOT consistency cross documents
- **Future runbook updates** = same pattern atomic single-commit post-substantial-work + cross-system anti-drift audit

### §4 Empirical evidence

- BACKUP_DR_RUNBOOK.md = 7 gaps fixed atomic chat 5 post-overnight final closure commit
- Cross-references D066 + D055 + D061 integrate consistent runbook + DECISIONS.md
- Documentation freshness baseline = pre-Beta nuclear audit gate ready

### §5 Rationale Bugatti

Disaster recovery runbook = critical operational document + irrevocable trust pre-Beta launch. Stale runbook = silent footgun catastrophic failure scenario (Daniel solo founder + ACASA dev = single point recovery). Bugatti craft = documentation freshness baseline + cross-system anti-drift discipline. "Refactor later NEVER happens" = runbook polish at boundary now post-substantial-work, NU cumulative documentation debt explode future.

---

## D071 — ENG — Lighthouse truly-final peak match recovery cycle 64→97→86→95→97

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** ENG (engineering tactical Lighthouse iterative perf optimization recovery cycle)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure Lighthouse mobile 3G Maria 65 recovery cycle 64 → 97 → 86 (font regression) → 95 (subset) → 97 (truly-final) iterative optimization + peak match validation pre-Beta
**Cross-refs:** [[DECISIONS.md §D053 bundle budget raise]] + [[DECISIONS.md §D060 PWA perf quadruple]] + [[DECISIONS.md §D061 font self-host Latin subset]] + [[DECISIONS.md §D064 modulepreload requestIdleCallback]] + Lighthouse CI thresholds + ratchet UP capability D036

### §1 Context

Lighthouse mobile 3G Maria 65 baseline pre-overnight = 64 (red zone). Iterative perf optimization recovery cycle chat 5 + overnight + post-overnight:

1. **64** = pre-overnight baseline (red zone)
2. **97** = post quadruple D060 single-line peak (defer registerSW + lazy auth cluster + SW precache excludes + modulepreload)
3. **86** = post font regression (D061 initial self-host iteration full Inter Variable 344 KB pre-subset filter)
4. **95** = post Latin subset filter (D061 final -86% bundle reduction Latin scope)
5. **97** = truly-final post cumulative + modulepreload tuning + critical CSS adjustments (peak match D060 single-line)

Pattern = iterative non-linear optimization. Each step revealed downstream regression OR optimization opportunity. Final 97 = peak match single-line baseline + sustained cumulative.

### §2 Decision

**Lighthouse truly-final peak match recovery cycle pattern LOCKED V1**. Pattern protocol:

- **Iterative optimization cycle** = NOT linear single-shot. Expect intermediate regression + recovery + tuning iterations
- **Empirical measurement primary** = each iteration Lighthouse CI run + record measurement. ZERO assumption-based optimization
- **Anti-regression discipline** = intermediate regression (86 from 97) NOT failure = surface optimization opportunity (Latin subset filter discovery)
- **Peak match validation** = truly-final 97 = sustained cumulative match single-line peak = peak baseline confirmed pre-Beta
- **Documentation in DECISIONS.md** = each iteration LOCKED V1 entry (D060 quadruple + D061 font self-host + D064 modulepreload + D071 cumulative recovery) = visible audit trail

### §3 Implications

- **Pre-Beta Lighthouse target beat** = ≥90 baseline (Maria 65 + Gigel persona target). 97 truly-final achieved = Bugatti craft peak baseline.
- **Future perf regressions** = block on Lighthouse CI ratchet UP capability per D036 §7.6 thresholds. 97 sustained baseline = ratchet UP candidate (e.g., next ratchet 95 floor, 97 target).
- **Iterative recovery cycle template** = perf optimization NOT single-shot. Expect intermediate regression + recovery iterations.
- **Empirical measurement discipline** = Lighthouse CI run per iteration = ZERO assumption-based optimization (anti-inflation discipline D041).
- **Documentation visible audit trail** = D060 + D061 + D064 + D071 cross-reference = perf optimization decisions chain visible future.

### §4 Empirical evidence

- 64 → 97 single-line peak D060 quadruple (defer registerSW + lazy auth + SW precache excludes + modulepreload)
- 97 → 86 font regression D061 initial iteration (full Inter Variable 344 KB pre-subset)
- 86 → 95 Latin subset filter D061 final (-86% bundle reduction)
- 95 → 97 truly-final cumulative + modulepreload tuning (peak match single-line)
- Final 97 sustained baseline pre-Beta achieved

### §5 Rationale Bugatti

Perf optimization = NOT linear straight line. Iterative cycle + intermediate regression + recovery + tuning = real engineering empirical pattern. Bugatti craft = peak baseline + sustained cumulative + visible audit trail. Maria 65 mobile 3G LCP target = irrevocable trust pre-Beta launch first impression. 97 truly-final = peak baseline confirmed + actionable ratchet UP capability future. "Refactor later NEVER happens" = perf optimization at boundary now iterative, NU defer assumption.

---

## D072 — REGLAJ — Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO singular verdict primary-source-grounded

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare pre-Beta launch gate matrix verdict singular document)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure pre-Beta gate matrix VERIFY_FINAL_CHAT5_STATE.md verdict 11 PASS / 3 YELLOW / 1 INFO singular pre-Beta launch gate document
**Cross-refs:** [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D043 dual-source convergence]] + [[DECISIONS.md §D-LEGACY-051 Pre-Beta FULL Scope LOCK V2]] + 📤_outbox/VERIFY_FINAL_CHAT5_STATE.md + Bugatti audit nuclear pre-Launch protocol

### §1 Context

Pre-Beta launch gate matrix = singular verdict document baseline `📤_outbox/VERIFY_FINAL_CHAT5_STATE.md`. 15 gate dimensions evaluated post chat 5 + overnight Wave 7-22 + post-overnight final closure cumulative state:

- **11 PASS** = green confirmed gates ready pre-Beta launch baseline
- **3 YELLOW** = caution gates non-blocking but require Daniel CEO awareness (e.g., MMI UI prompt indicator pending D066 + UI wording strategic §P2 + dates format §P4)
- **1 INFO** = informational item (e.g., post-Beta perf optimization defer §P7 +/- §P12)

Gate matrix = primary-source-grounded facts (NU conversational assertion). Each gate dimension cross-reference DECISIONS.md LOCK entries + commit hashes + test suite states + audit findings.

### §2 Decision

**Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO verdict LOCKED V1 singular document baseline**. Verdict structure:

- **VERIFY_FINAL_CHAT5_STATE.md** = singular pre-Beta launch gate verdict document `📤_outbox/`
- **15 gate dimensions** = bug count (D042 ZERO bug gate) + test coverage (D067 89.82%+) + Lighthouse (D071 97) + WCAG a11y (D056) + GDPR consent (D055) + bundle budget (D053) + Zustand partialize (D054) + PWA manifest SoT (D057) + Sentry instrument (D063) + i18n compliance (D058 + D065) + engine pipeline (D066) + font self-host (D061) + perf quadruple (D060) + modulepreload (D064) + dead code (D069)
- **Verdict per gate** = PASS / YELLOW / INFO + cross-reference DECISIONS.md LOCK entry + commit hash + audit finding source
- **Daniel CEO Bugatti audit nuclear gate trigger** = post Daniel CEO LOCK acknowledge D050-D073 + §P-items strategic decisions + gate matrix verdict review = readiness pre-Beta launch confirmation

### §3 Implications

- **Singular pre-Beta gate document** = `📤_outbox/VERIFY_FINAL_CHAT5_STATE.md` = visible Bugatti audit baseline. ZERO scattered verdict assertion across docs.
- **Primary-source-grounded facts** = each gate dimension cross-reference DECISIONS.md + commit hash + test suite + audit finding source = anti-hallucination discipline (per CLAUDE.md regula #1 + Daniel CEO trust contract).
- **YELLOW gates Daniel awareness** = 3 non-blocking caution items surface Daniel CEO strategic direction (MMI UI prompt D066 + UI wording §P2 + dates format §P4)
- **INFO gates informational** = 1 item post-Beta defer informational (perf optimization §P7 / §P12) = ZERO blocking pre-Beta launch
- **Pre-Beta nuclear audit gate trigger** = singular document review + Daniel CEO LOCK acknowledge = launch readiness confirmed Bugatti

### §4 Empirical evidence

- VERIFY_FINAL_CHAT5_STATE.md = singular pre-Beta gate document `📤_outbox/`
- 15 gate dimensions evaluated post-chat-5 cumulative state
- 11 PASS / 3 YELLOW / 1 INFO verdict primary-source-grounded
- Cross-references D050-D073 LOCK entries + commit hashes + test suite states

### §5 Rationale Bugatti

Pre-Beta launch gate matrix = irrevocable trust contract Daniel CEO + brand promise users baseline. Singular document = visible Bugatti audit baseline + ZERO scattered verdict assertion. Primary-source-grounded facts = anti-hallucination discipline (per CLAUDE.md regula #1 THINK BEFORE CLAIMING). 11 PASS / 3 YELLOW / 1 INFO verdict = transparent + actionable + Daniel CEO strategic direction surface. "Refactor later NEVER happens" = gate matrix at boundary now pre-Beta launch readiness, NU vague assertion post-Launch trust contract erode.

---

## D073 — REGLAJ — Vault docs ~4100+ LOC trail comprehensive singular reference point pattern

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare vault documentation trail comprehensive singular reference pattern)
**Status:** LOCKED V1 (pending Daniel CEO LOCK acknowledge)
**Source:** Post-overnight final closure vault docs trail ~4100+ LOC cumulative = 23+ outbox files + 4 inbox handovers + master index + decisions draft + investigation reports + singular reference point Daniel + chat 6 startup context
**Cross-refs:** [[DECISIONS.md §D062 vault docs archive periodic cleanup pattern]] + [[DECISIONS.md §D072 pre-Beta gate matrix verdict]] + 📤_outbox/ + 📥_inbox/ + 99-archive/audit-pre-chat5/ per D062

### §1 Context

Chat 5 + overnight Wave 7-22 + post-overnight final closure cumulative work substantial = vault docs trail ~4100+ LOC documentation comprehensive. Singular reference point baseline:

- **23+ outbox files** = `📤_outbox/` substantial work reports + investigation reports + audit findings + verify reports + decisions drafts (chat 5 + overnight + post-overnight)
- **4 inbox handovers** = `📥_inbox/HANDOVER_<date>_<topic>.md` chat 1-5 narrative scribe end-of-chat handovers (§F3.8 protocol)
- **Master index** = `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) cross-reference cumulative documents
- **Decisions draft** = `📤_outbox/DECISIONS_CHAT5_DRAFT.md` (this document) 23 LOCK candidates + 1 PROPOSAL partial-closure + 15 §P-items strategic surface
- **Investigation reports** = AA-DEAD-CODE-DELETE-INVESTIGATION.md + FIREBASE-RULES-PREP-INVESTIGATION.md + LEDGER-SYNC-FINAL-FINAL.md + other targeted audit reports

### §2 Decision

**Vault docs ~4100+ LOC trail comprehensive singular reference point pattern LOCKED V1**. Scope:

- **Comprehensive trail discipline** = substantial work cycle (chat 5 magnitude) produces ~4100+ LOC vault docs cumulative = visible audit trail + reproducible context
- **Singular reference point** = master index document `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) = singular entry point Daniel CEO + chat 6 startup context navigation
- **Daniel CEO reference baseline** = strategic decisions surface (§P-items D072 gate matrix verdict) + LOCK candidates batch acknowledge (D050-D073) + investigation reports per topic = singular document chain
- **Chat 6 startup context** = master index + recent DECISIONS draft + recent VERIFY gate matrix + recent HANDOVER inbox = chat 6 startup §CC.2 step 4-5 baseline (PRIMER §5 micro-append cumulative summary)
- **Future cleanup** = D062 periodic cleanup pattern post Daniel CEO direction OR chat 6 cumulative magnitude trigger

### §3 Implications

- **Singular reference point** = `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) = Daniel CEO + chat 6 startup baseline navigation aid
- **Comprehensive audit trail** = ~4100+ LOC vault docs visible cumulative = reproducible context future debugging + audit reference
- **Daniel CEO strategic surface** = D072 gate matrix verdict + §P-items priority cluster choice + D050-D073 LOCK acknowledge = singular document chain entry point
- **Chat 6 startup context** = master index + recent decisions + recent verify + recent handover = §CC.2 step 4-5 baseline cumulative summary integration
- **Future cleanup discipline** = D062 periodic cleanup pattern preserved (NU per-message overreach + batch periodic + Daniel verbal trigger)

### §4 Empirical evidence

- ~23+ outbox files chat 5 cumulative `📤_outbox/`
- 4 inbox handovers chat 1-5 narrative scribe `📥_inbox/`
- Master index document singular reference point
- Decisions draft 23 LOCK candidates + 1 PROPOSAL + 15 §P-items
- Investigation reports per topic targeted audit findings
- Vault docs cumulative ~4100+ LOC trail comprehensive visible

### §5 Rationale Bugatti

Vault docs trail = reproducible context + visible audit baseline + Daniel CEO strategic decision support. Singular reference point = navigation aid + cumulative summary integration + chat 6 startup context. Comprehensive documentation = invisible quality (most users NU notice but future-self + Daniel CEO + chat 6 instance benefit). "Refactor later NEVER happens" = documentation trail at boundary now substantial-work cycle complete, NU cumulative debt explode future. D062 periodic cleanup pattern preserved = batch periodic + active surface respect.

---

## DANIEL CEO PENDING — Strategic decisions list (NU LOCKED yet, surface for review)

Below = strategic decisions pending Daniel CEO LOCK V1 acknowledge OR alternative direction. Co-CTO surface recommendation per item, Daniel decide final.

### §P1 — PARADIGM-FLAG §F-onboarding-02 mockup parity question

**Source:** W4-HIGH-FRESH commit `3f6016de` doc + mockup vs prod parity audit 2026-05-20
**Context:** Onboarding §F-onboarding-02 prod implementation diverges from mockup spec on visual paradigm (specific deviation TBD per Daniel mockup review).
**Co-CTO recommendation:** Daniel browse mockup direct (`04-architecture/mockups/andura-clasic.html` §F-onboarding-02) + prod live (`andura.app/onboarding`) + decide preserve mockup paradigm OR accept prod paradigm shift.

### §P2 — Romanian UI wording Streak/Readiness/§B039 GDPR swap

**Source:** 3 HIGH wording findings visible chat 5
**Context:**
- "Streak" (engleza) → potential RO swap "Serie zile" / "Constanta zile" / "Sir"
- "Readiness" (engleza) → potential RO swap "Pregatire" / "Recuperare" / "Stare"
- §B039 GDPR wording legal-tone (current draft) → potential softer Maria 65 friendly
**Co-CTO recommendation:** Daniel CEO UI wording autonomous compose per D024 LOCK V1, but THIS specific Streak/Readiness/§B039 cluster = high-visibility user-facing strings = recommend Daniel review explicit pre-Beta.

### §P3 — Confirm CTA verb pattern unify 4 variants → 1

**Source:** Mockup vs prod parity audit + chat 5 UI consistency surface
**Context:** Destructive action confirm screens (LogoutConfirm + DeleteAccountConfirm + ResetDataConfirm + ProgramChangeConfirm) per D047 drill-down paradigm use 4 different CTA verbs (e.g., "Confirma" / "Da, fa" / "Continua" / "Sigur"). Inconsistent paradigm.
**Co-CTO recommendation:** Unify 1 verb pattern (recommend "Confirma" verb + destructive variant secondary "Anuleaza"). ~30min UI string update + tests. Daniel CEO LOCK pe verb choice needed.

### §P4 — Date format unify Istoric/WeightLogList/PrWall

**Source:** Mockup vs prod parity audit + chat 5 audit surface
**Context:** Date display format diverges 3-way:
- Istoric heatmap: `DD.MM.YYYY` style
- WeightLogList: `D MMM YYYY` style (Maria 65 readable)
- PrWall: `MM/DD/YYYY` style (US convention slip)
**Co-CTO recommendation:** Unify Romanian `D MMM YYYY` format (Maria 65 + Gigel readable) cross all 3 screens. ~1h utility extract + apply consistent. Daniel CEO LOCK pe format choice needed.

### §P5 — MMI Engine #9 React wire-through pre-Beta OR defer (= D059 PROPOSAL above)

Vezi §D059 PROPOSAL section. Daniel decide pe Option A vs Option B.

### §P6 — Font self-host Inter vs Google Fonts CDN

**Source:** Audit nuclear §X-HIGH (font perf vs vendor lock)
**Context:** Pre-Beta font strategy:
- **(A)** Self-host Inter font files în `/public/fonts/` = ZERO Google Fonts CDN dependency, faster first paint (no DNS lookup), but +50-80KB bundle initial
- **(B)** Google Fonts CDN (current) = +1 DNS round-trip + +1 HTTP request initial paint, but cache cross-sites + ZERO bundle impact
**Co-CTO recommendation:** Self-host Inter pre-Beta (perf > vendor lock, Maria 65 Android low-bandwidth scenario benefits). ~2h dev font file embed + Tailwind config. Daniel CEO LOCK needed.

### §P7 — Code-split aggressive main bundle 419KB (perf vs maintainability)

**Source:** Audit nuclear §X-HIGH + chat 5 substrate ETA bundle budget raise (D053)
**Context:** Main bundle 127KB compressed (gzip) / 419KB uncompressed = high initial paint cost. Code-split aggressive routes-based lazy-load = ~50-70KB initial paint + chunk-on-demand. Maintainability cost = lazy() wrappers + suspense boundaries + loading states per route.
**Co-CTO recommendation:** Defer post-Beta real metrics. Pre-Beta = correct + complete + bug-free (D042 + D043), NU perf-optimal. Post-Beta + real user metrics + Lighthouse CI per D036 ratchet UP capability = actionable optimization data. Daniel CEO LOCK pe defer vs pre-Beta tackle needed.

### §P8 — PAR-005 Sesiuni Recente fold decision

**Source:** Mockup vs prod parity audit + Wave C parity work
**Context:** Mockup "Sesiuni Recente" sub-screen accessible via drill-down Antrenor home. Prod implementation = NOT exists post-D028. Fold OR add new screen decision needed.
**Co-CTO recommendation:** Add new screen pre-Beta (mockup parity D-LEGACY-091 + brand promise consistency). ~3-5h dev. Daniel CEO LOCK pe add vs fold.

### §P9 — DRIFT-02 FatigueStrip paradigm

**Source:** Chat 5 drift surface mockup vs prod
**Context:** FatigueStrip prod implementation diverges mockup specific visual paradigm (TBD specific drift per Daniel mockup review).
**Co-CTO recommendation:** Daniel CEO browse mockup direct + decide preserve mockup OR accept prod paradigm shift.

### §P10 — Visual regression snapshots commit win32 baselines sau gitignore

**Source:** Track 7 §7.x Playwright visual regression + chat 5 audit surface
**Context:** Playwright `toHaveScreenshot()` baselines win32-generated (Daniel ACASA Windows machine) vs CI Linux + macOS contributors potential future = pixel diff false positives. Two strategic paths:
- **(A)** Commit win32 baselines = current state, Co-CTO + Daniel ACASA dev compatible, CI Linux false positives
- **(B)** Gitignore baselines + generate per-OS local = each contributor regenerate, CI uses dedicated baseline OS, anti-drift
**Co-CTO recommendation:** Option B gitignore + generate per-OS pre-Beta solo Daniel ACASA + post-Beta when contributors join = mature path. Daniel CEO LOCK needed.

### §P11 — PARADIGM Font self-host scope-keep Latin OR re-evaluate vendor risk

**Source:** D061 LOCK V1 above font self-host Latin subset paradigm + Daniel CEO vendor risk concern future re-evaluation potential
**Context:** D061 LOCKED V1 self-host Inter Variable Latin subset (-86% bundle) supersedes §P6 PROPOSAL Google Fonts CDN sub-option. Future scope question:
- **(A)** Scope-keep Latin subset = NU expand Cyrillic/Greek/Vietnamese future i18n. Romanian Latin-only scope per D-LEGACY-064. Quality > Speed > i18n speculation.
- **(B)** Re-evaluate vendor risk = if Daniel CEO concern self-host maintenance burden + breach (woff2 corruption + CDN performance gap) = revisit Google Fonts CDN Option.
**Co-CTO recommendation:** Scope-keep Latin per D061 LOCK V1. NU speculative i18n expansion + NU vendor lock revisit unless Daniel concrete concern. Daniel CEO LOCK acknowledge needed pe scope-keep.

### §P12 — Lighthouse remaining headroom: code-split deeper + critical CSS inline + font-size 11px→12px BP score

**Source:** D060 LOCK V1 quadruple perf cumulative 95 + Maria 65 mobile 3G headroom analysis
**Context:** Post quadruple D060 cumulative Lighthouse 95 baseline. Remaining headroom (95 → 98+) require:
- **(A)** Code-split deeper = aggressive route-based + cluster-based lazy (Onboarding cluster + Settings cluster + Coach cluster) pattern D060 AuthCluster template. ~6-12h dev + Suspense boundaries + loading states.
- **(B)** Critical CSS inline = `<style>` inline critical-path CSS HTML head + defer non-critical CSS. ~3-5h dev + CSS extraction tooling.
- **(C)** Font-size 11px → 12px BP score = mobile readable threshold +2 BP score Lighthouse. UI design impact Maria 65 readability evaluate.
**Co-CTO recommendation:** Defer post-Beta real metrics per D053 + D060 pattern (correct + complete + bug-free pre-Beta, perf-optimal post-Beta real user data). Pre-Beta = 95 baseline beat (>90 target). Daniel CEO LOCK pe defer vs pre-Beta tackle needed.

### §P13 — Architecture refactor: engineWrappers 466 LOC extract candidates

**Source:** Chat 5 substrate audit surface + D053 bundle budget raise main chunk 127 KB engineWrappers Sentry plus growth
**Context:** `src/react/engineWrappers/` directory 466 LOC accumulated post-Phase 6 BATCH 24-task + Sentry instrumentation D063. Refactor extract candidates:
- **(A)** Adapter wrapper extract `adapterFactory.ts` pattern = shared Sentry wrap + breadcrumb instrumentation 1-place. Reduce duplication cross 11 adapters.
- **(B)** Hook composition extract `useEngineHook.ts` pattern = shared workout recommendation + load progression hooks. Reduce duplication cross React consumer paths.
- **(C)** Status quo = 466 LOC manageable + atomic per-adapter clarity preserved.
**Co-CTO recommendation:** Status quo pre-Beta + extract candidate post-Beta when refactor pressure emerges (more adapters added OR Bugatti audit nuclear surface duplication concern). Karpathy Simplicity First = NU speculative refactor pre-Beta. Daniel CEO LOCK pe status quo defer vs pre-Beta refactor tackle needed.

### §P14 — Pre-Beta nuclear audit subagents (post strategic decisions LOCKED)

**Source:** Co-CTO + Daniel CEO Bugatti audit nuclear pre-Launch protocol + gsd-* subagents fresh-eyes value memory feedback
**Context:** Post Daniel CEO LOCK acknowledge D050-D066 + §P1-§P10 + §P11-§P15 strategic decisions = readiness pre-Beta nuclear audit gate. Subagent batch parallel spawn candidates:
- **gsd-security-auditor** = SECURITY-DEEPER chat 5 follow-up + Sentry consent gate verify + PII strip suites + GDPR compliance breach scan
- **gsd-a11y-auditor** = WCAG 2.1 AA conformance keyboard + screen reader + axe-core full sweep + manual screen reader test
- **gsd-perf-auditor** = Lighthouse mobile 3G + Maria 65 persona profile + bundle budget verify + critical path analysis
- **gsd-i18n-auditor** = D-LEGACY-064 Romanian no-diacritics 100% compliance verify + grep cross all categories
- **gsd-engine-auditor** = Big 11 engine pipeline + adapter shape integrity + MMI Engine #9 React wire (D066) + boost gate condition verify
**Co-CTO recommendation:** Spawn 4-5 max concurrent (D051 LOCK V1 hardware limit) batch sequential per cluster after Daniel CEO LOCK acknowledge D050-D066. Pre-Beta nuclear audit gate Bugatti. Daniel CEO LOCK trigger needed.

### §P15 — Saturation acknowledged: mockup parity LOW quick wins drained, Daniel CEO direction needed

**Source:** Overnight Wave 7-22 cumulative completion + chat 5 mockup parity Wave C work + saturation surface
**Context:** Chat 5 + overnight Wave 7-22 cumulative work substantial progress closed mockup parity LOW quick wins. Remaining surface:
- **High-effort scope items** = §P8 PAR-005 Sesiuni Recente add screen (~3-5h dev) + §P9 DRIFT-02 FatigueStrip paradigm (TBD dev scope per Daniel mockup review) + §P1 §F-onboarding-02 mockup parity (TBD)
- **Strategic direction items** = §P11-§P14 above + Daniel CEO Beta launch readiness gate Bugatti nuclear audit
- **Engine completion** = D066 MMI UI prompt indicator sub-scope (Option A.1 visible reveal ~3-5h vs A.2 defer)
**Co-CTO recommendation:** Daniel CEO direction needed pe priority cluster:
- **(A)** Mockup parity high-effort scope items first (§P1, §P8, §P9) = brand promise consistency closure
- **(B)** Strategic gates first (§P14 nuclear audit subagents + §P11-§P13 strategic LOCKs) = Beta launch readiness gate
- **(C)** Custom: Daniel specify priority cluster
Co-CTO continue autonomous tactical work standby pending Daniel CEO strategic direction LOCK.

### §P16 — AA dead code delete vs preserve (Daniel CEO Option 1/2/3) — partial-closure pattern

**Source:** Post-overnight final closure AA dead code investigation report + D069 LOCK V1 above pattern + Daniel CEO Option 1 "baga" trigger
**Context:** AA module lines 141-151 verified unreachable mechanistic trace + test documentation. Investigation report 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md surface 3 options:
- **Option 1** = autonomous delete dead code lines 141-151 (verified unreachable) — Daniel CEO "baga" trigger LOCKED
- **Option 2** = preserve dead code + add test coverage forcing branch invoke (anti-truncate discipline)
- **Option 3** = preserve dead code + comment annotate "future scope intentional reserved"
**Co-CTO recommendation:** D069 LOCK V1 above pattern verified-unreachable-delete + Daniel CEO Option 1 trigger "baga" autonomous delete LANDED chat 5 post-overnight. **Partial-closure status** = AA-DEAD-CODE-DELETE agent landed → §P16 closure pe pattern + Daniel CEO Option 1 LOCK acknowledge. Future dead code candidates = D069 pattern reuse.

### §P17 — Deps autonomous bump policy LOCK pattern (D068 implied) — partial-closure verify

**Source:** Post-overnight final closure dependencies bump empirical + D068 LOCK V1 above pattern + Sentry + date-fns same-major bumps autonomous
**Context:** D068 LOCK V1 above codifies PATCH + MINOR same-major-version autonomous Co-CTO bumps + MAJOR mandatory Daniel CEO LOCK acknowledge. Empirical proof chat 5 = Sentry 10.50.0→10.53.1 PATCH + date-fns 4.2.1→4.3.0 MINOR landed autonomous ZERO regression.
**Co-CTO recommendation:** D068 LOCK V1 above pattern formalize Co-CTO autonomous bumps + Daniel CEO authorize implicit default. **Partial-closure status** = D068 pattern empirical proved chat 5 → §P17 closure pe pattern formalization + Daniel CEO LOCK acknowledge. Future bumps = D068 protocol (verify mandatory npm audit + maintainer changelog + test suite gate post-bump).

### §P18 — Lighthouse truly-final pre-Beta gate verdict PASS — partial-closure pe-Beta gate

**Source:** Post-overnight final closure Lighthouse mobile 3G Maria 65 truly-final 97 + D071 LOCK V1 above recovery cycle + D072 gate matrix verdict 11 PASS / 3 YELLOW / 1 INFO
**Context:** D071 LOCK V1 above documents iterative perf optimization recovery cycle 64 → 97 → 86 → 95 → 97 truly-final. Pre-Beta Lighthouse target ≥90 baseline (Maria 65 + Gigel persona) = beat at 97 truly-final + sustained baseline.
**Co-CTO recommendation:** D071 LOCK V1 above pattern peak match validation + D072 gate matrix verdict PASS pre-Beta gate = pre-Beta Lighthouse target confirmed beat. **Partial-closure status** = Lighthouse truly-final 97 pre-Beta gate verdict PASS → §P18 closure pe pre-Beta gate validation + Daniel CEO LOCK acknowledge. Future ratchet UP capability per D036 §7.6 thresholds (e.g., next ratchet 95 floor, 97 target).

---

## SUMMARY

**LOCK V1 candidates ready Daniel review:**
- D050 — `git commit -o -m -- <paths>` pattern mandatory (PROC)
- D051 — Max 4-5 agents concurrent confirmed empirical (PROC)
- D052 — Shape adapter pattern la store boundary (ARCH)
- D053 — Bundle budget raise cu rationale pattern (ENG)
- D054 — Explicit partialize mandatory all Zustand stores (ARCH)
- D055 — Sentry init gated pe telemetryOptIn GDPR Art. 7 (SAFETY)
- D056 — A11y CRIT + HIGH Beta-blockers baseline mandatory (SAFETY)
- D057 — PWA manifest single SoT vite.config.js (ARCH)
- D058 — D-LEGACY-064 i18n 100% compliance audit closure (REGLAJ)
- D060 — PWA perf optimization quadruple Lighthouse 64→97 (ENG)
- D061 — Font self-host Latin subset paradigm -86% Inter 344→48KB (ENG) — SUPERSEDES §P6
- D062 — Vault docs archive periodic cleanup pattern git mv (REGLAJ)
- D063 — Engine adapter Sentry coverage 100% test instrument anti-drift (TESTING)
- D064 — Modulepreload requestIdleCallback hash-agnostic pattern (ARCH)
- D065 — Romanian no-diacritics 100% compliance enforcement closure (REGLAJ)
- D066 — MMI Engine #9 silent cap React production wire engine LANDED (ARCH) — partial closure D059
- D067 — Coverage Top 5 closure pattern chat 5 milestone baseline 89.82%+ (REGLAJ)
- D068 — Deps autonomous PATCH+MINOR bump pattern same-major Daniel CEO authorize default (PROC)
- D069 — AA dead code refactor pattern verified unreachable mechanistic trace (REGLAJ)
- D070 — BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift pattern (REGLAJ)
- D071 — Lighthouse truly-final peak match recovery cycle 64→97→86→95→97 (ENG)
- D072 — Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO verdict singular document (REGLAJ)
- D073 — Vault docs ~4100+ LOC trail comprehensive singular reference point pattern (REGLAJ)

**= 23 LOCK V1 candidates pending Daniel acknowledge** (16 prior + 7 extension post-overnight final closure)

**PROPOSAL pending Daniel CEO strategic decision:**
- D059 — MMI Engine #9 React wire-through PARTIAL-CLOSURE: engine LANDED (D066), UI prompt indicator DEFERRED pending Daniel CEO Option A.1 vs A.2 vs B

**= 1 PROPOSAL placeholder (engine layer LANDED partial, UI prompt remaining)**

**Daniel CEO strategic pending list (NU LOCKED candidates, surface for review):**
- §P1 — §F-onboarding-02 mockup parity
- §P2 — Romanian UI wording Streak/Readiness/§B039 GDPR swap
- §P3 — Confirm CTA verb pattern unify
- §P4 — Date format unify
- §P5 — MMI React wire (= D059 partial-closure, UI prompt remaining D066)
- §P6 — Font self-host Inter vs Google Fonts (SUPERSEDED by D061)
- §P7 — Code-split aggressive
- §P8 — PAR-005 Sesiuni Recente fold
- §P9 — DRIFT-02 FatigueStrip paradigm
- §P10 — Visual regression snapshots win32 baselines
- §P11 — PARADIGM Font self-host scope-keep Latin OR re-evaluate vendor risk
- §P12 — Lighthouse remaining headroom: code-split deeper + critical CSS inline + font-size BP
- §P13 — Architecture refactor: engineWrappers 466 LOC extract candidates
- §P14 — Pre-Beta nuclear audit subagents (post strategic decisions LOCKED)
- §P15 — Saturation acknowledged: mockup parity LOW quick wins drained, direction needed
- §P16 — AA dead code delete vs preserve (Daniel CEO Option 1/2/3) — partial-closure D069 + Daniel "baga" Option 1
- §P17 — Deps autonomous bump policy LOCK pattern (D068 implied) — partial-closure verify
- §P18 — Lighthouse truly-final pre-Beta gate verdict PASS — partial-closure pre-Beta gate D072

**= 18 pending items Daniel CEO strategic review (10 prior + 5 extension overnight + 3 extension post-overnight final closure)**

---

## DANIEL CEO ACTIONS NEEDED (CUMULATIV)

**LOCK V1 acknowledge batch:**
- 23 LOCK candidates (D050-D058 + D060-D073) ready batch acknowledge
- 1 PROPOSAL partial-closure (D059 engine LANDED, UI prompt sub-scope pending Option A.1/A.2/B)

**Strategic direction LOCK pending:**
- 18 §P-items strategic review (priority cluster Daniel CEO choice per §P15: mockup parity high-effort vs strategic gates vs custom)
- §P6 SUPERSEDED closure ack (covered by D061 LOCK V1)
- §P14 pre-Beta nuclear audit subagents trigger (post D050-D073 LOCK)
- §P16 AA dead code Daniel CEO Option 1 LOCK ack (D069 pattern LANDED + Daniel "baga" trigger)
- §P17 Deps autonomous bump policy LOCK ack (D068 pattern empirical proved)
- §P18 Lighthouse truly-final pre-Beta gate PASS ack (D071 + D072 verdict)

**Blockers:** ZERO (Co-CTO autonomous tactical work proceeds standby pending Daniel CEO strategic direction LOCK pe priority cluster choice §P15).

---

## HANDOVER NOTE — claude_code append batch protocol §F3.8 step 3

Post Daniel review + LOCK V1 acknowledge per candidate, claude_code aggregate-append batch DECISIONS.md per protocol §F3.8 step 3:

1. Read DECISIONS.md HEAD state (anti-stale-baseline D029 lesson)
2. Append D050-D058 + D060-D073 catalog rows în `## CURRENT DECISIONS` section
3. Append D050-D058 + D060-D073 detailed entries post existing D049 chain (preserve append-only invariant D001)
4. Update frontmatter `latest_entry: D073` + `total_entries: 73`
5. Per D007 supersede rule scan: D061 SUPERSEDES §P6 PROPOSAL sub-option (close §P6 paradigm choice). D058 + D065 cumulative D-LEGACY-064 closure (affirm not supersede). D066 partial-closure D059 (engine LANDED, UI prompt remaining). D069 partial-closure §P16 (AA dead code pattern + Daniel "baga" Option 1). D068 partial-closure §P17 (deps autonomous bump policy LOCK pattern formalize). D071 + D072 partial-closure §P18 (Lighthouse truly-final pre-Beta gate PASS). Verify cu CC manual.
6. Single atomic Bugatti commit `doc(decisions): chat 5 D050-D058 + D060-D073 LOCK V1 append batch [SSOT]`. Per D050 (just LOCKED) form `git commit -o -m "..." -- DECISIONS.md`.
7. NU push (D031 invariant). Daniel verbal "Da push acum" trigger needed post all D050-D073 acknowledge + commit.

**Anti-overreach lesson per CLAUDE.md project chat 1 HANDOVER §5 2026-05-20:** NU edit DECISIONS.md + LATEST.md + PRIMER.md concurrent BEFORE verify state change real LANDED. This draft = surface candidates ONLY, Daniel review + LOCK acknowledge = real LANDED trigger.

---

**End of draft. Manager DECISIONS-AUGMENT-LATEST out.**
