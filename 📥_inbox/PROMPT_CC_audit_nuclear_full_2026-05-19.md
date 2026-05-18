# PROMPT_CC — Bugatti Audit Nuclear FULL pre-Launch V3 (Absolut Complete 100% — exhaustive)

**Date generated:** 2026-05-19 (V3 revision)
**Authority:** Daniel CEO directive verbatim *"FULL AUDIT. Fiecare linie de cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"* + *"absolut full"* + *"Think HARD. Modifica-l sa fie 100% complet. Nu omite nimic"* (×3 iterations) 2026-05-19 chat Co-CTO ACASĂ V3 maximal-comprehensive
**Scope:** ALL on HEAD `main` post `deploy-react-production-2026-05-19` tag (post Phase 6 BATCH 24-task LANDED + deploy production live `andura.app`)
**Procedure:** Log-only backlog generate, ZERO auto-fix, ZERO commit (Daniel decides fix combined smoke #7 per PRIMER §6)
**Output:** `📤_outbox/audit-nuclear-2026-05-19/findings-§N.md` per category + `SUMMARY.md` aggregate severity matrix + production readiness % final score
**Model:** Opus EXCLUSIVELY MAX thinking budget
**Multi-noapte:** OK — checkpoint file `_progress.md` resume capable
**V3 delta vs V2:** 50 categorii (§1-§50) + §51 production readiness score + §52 procedure (vs V2 32 cat). NEW §33-§50: CI/CD pipeline + prod ops runbook + DB tier 0/1/2 deep + network/offline sync + engineering standards + engine math formula precision + library 657 schema deep + calendar V1 specs + deps inventory + vault structure + trust&safety + mode detection FSM + Phase 5+6 BATCH verify + Karpathy applied + engine SoT voice + adapter pattern + hybrid workflow + cross-functional quality gates.

---

## §1 Source Code Audit (line-by-line)

- 1.1 `src/react/**` ALL .ts/.tsx/.css fiecare linie
- 1.2 `src/engine/**` Big 11 pipeline + auxiliary engines
- 1.3 `src/coach/orchestrator/**` 8 adapter chain + contextBuilder
- 1.4 `src/util/**` + `src/db.js` + `src/constants.js`
- 1.5 Mockup `04-architecture/mockups/andura-clasic.html` DESIGN MASTER (verify parity referință)
- 1.6 Comments quality JSDoc inline completeness
- 1.7 Code formatting consistency (Prettier config respected)
- 1.8 ESLint rules respected zero suppression unjustified
- 1.9 Vanilla legacy `src/pages/*.js` deprecated state (still present sau cleaned)
- 1.10 CSS technical debt (unused selectors PurgeCSS coverage, dead Tailwind classes, specificity wars, `!important` abuse hunt, z-index chaos, color tokens unused)
- 1.11 Font loading strategy (FOUT/FOIT decision, font preload critical, system font fallback chain Romanian glyphs ș/ț/â/î/ă render, woff2/woff format, self-host vs Google Fonts decision)
- 1.12 Image / asset optimization (webp/avif/png/jpg decisions, compression rate, responsive images srcset, lazy loading native, critical images preload, icon set Lucide tree-shake, SVG sprite vs inline)
- 1.13 Animation performance (CSS animation vs JS, requestAnimationFrame usage, `will-change` abuse hunt, reflow/repaint triggers, 60fps Maria 65 phone slab target)
- 1.14 Touch event handling (double-tap zoom prevention, scroll inertia native, swipe gestures dacă există, `touch-action` declarations, pointer events vs touch events)
- 1.15 Encoding integrity (UTF-8 verify, BOM hunt, line endings LF consistent)
- 1.16 Import statement organization (external first, internal second, types last)
- 1.17 Module boundaries respected (NU cross-layer imports unjustified)
- 1.18 Public vs private API surfaces clear (index.ts barrel exports intentional)

## §2 Test Files Audit (251 files)

- 2.1 Coverage gap detection (branches/edge cases missing)
- 2.2 Assert quality real invariant verify (NU smoke-only)
- 2.3 Mock fidelity NU over-mock obscuring bugs
- 2.4 Flake risk patterns (Date.now / Math.random / timing-dependent)
- 2.5 Test data fixtures realistic NU synthetic divorced reality
- 2.6 E2E Playwright disclaimer dismiss helper backlog (23 fails LOCK 4 regression per D019)
- 2.7 Vitest jsdom vs Playwright E2E coverage split appropriate
- 2.8 Vitest config `testTimeout` + `hookTimeout` reasonable
- 2.9 Coverage % per module (vitest --coverage c8/istanbul report)
- 2.10 Mutation testing (Stryker dacă util — verify test quality beyond coverage %)
- 2.11 Cyclomatic complexity hunt (eslint-plugin-complexity)
- 2.12 Determinism / reproducibility tests (engine pipeline same input → same output, random seed inject)
- 2.13 Time-mock comprehensive (`vi.setSystemTime` per streak/calendar/DST tests)
- 2.14 Snapshot tests integrity (NU large snapshots obscuring intent)
- 2.15 Test isolation (NO shared mutable state between tests)
- 2.16 Test naming convention (describe/it BDD-style consistent)
- 2.17 E2E Playwright smoke vs live `andura.app` 4 tabs 5/5 pass verify
- 2.18 Test pyramid balance (unit majority + integration few + E2E minimal)
- 2.19 Synthetic 50-profile × 90-day demographic prior database production infra test fixture status

## §3 TypeScript Strict Audit

- 3.1 `noUncheckedIndexedAccess` strict zero regression
- 3.2 `exactOptionalPropertyTypes` strict zero regression
- 3.3 Type assertions `as` abuse hunt + justify each
- 3.4 `any` / `unknown` unjustified hunt
- 3.5 Interface vs type consistency
- 3.6 Generic constraints correctness
- 3.7 Discriminated unions correctness
- 3.8 Public API JSDoc TypeScript narrative
- 3.9 `.d.ts` ambient declarations correct
- 3.10 Runtime validation at boundaries (zod/yup/io-ts la API + Firebase + IndexedDB read points)
- 3.11 Discriminated unions state machine FSM transitions (`type WorkoutState = { kind: 'idle' } | { kind: 'active', ... }`)
- 3.12 Branded types for IDs (User UID branded, Exercise ID branded, prevents misuse)
- 3.13 Exhaustiveness checks switch statements (`never` type checks default branch)
- 3.14 Type guards properly narrowing (NU coerce assertions)
- 3.15 Const assertions (`as const`) used appropriately for literal narrowing
- 3.16 `tsconfig.strict` ALL flags enabled verify (`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `alwaysStrict`, `noImplicitAny`, `noImplicitThis`, `noFallthroughCasesInSwitch`, `noImplicitReturns`)
- 3.17 Type imports separated (`import type { ... }` vs runtime imports)
- 3.18 Utility types appropriate (Pick/Omit/Partial/Required/Readonly correct semantics)

## §4 Security Audit

- 4.1 XSS injection vectors (`innerHTML` / `dangerouslySetInnerHTML` hunt)
- 4.2 Firebase rules production-grade enforcement (Firestore + Storage + Auth + RTDB)
- 4.3 Auth Magic Link flow vulnerabilities (token leak, replay attack, expiry handling)
- 4.4 OAuth Firebase Phase 3 state (PENDING per PRIMER §3 — verify NU partial wired exposing surface)
- 4.5 localStorage/IndexedDB exposure sensitive data (Big 6 personal)
- 4.6 CSP headers Content Security Policy enforcement (nonce-based, strict-dynamic)
- 4.7 Service Worker scope + cache invalidation strategy
- 4.8 Dependency vulnerabilities `npm audit` + `snyk` scan
- 4.9 Bundle inspection secrets/env leak production build (`grep -r "VITE_" dist/` hunt + Firebase API keys check legitimate exposure)
- 4.10 Cross-tab session sync race conditions
- 4.11 IndexedDB quota handling overflow strategy
- 4.12 Encryption at rest considerations (sensitive personal data)
- 4.13 CDL append-only tamper-proof verify (ADR 011 invariant)
- 4.14 GDPR right-to-erasure complete data wipe verify (SettingsDanger LANDED Phase 6 task_17)
- 4.15 k-anonymity k=5 minim validation enforcement (ADR 019)
- 4.16 Magic Link rate limiting / abuse protection
- 4.17 X-Frame-Options anti-clickjacking header set (`DENY` sau `SAMEORIGIN`)
- 4.18 CSRF protection (stateful endpoints dacă există + SameSite cookie)
- 4.19 Magic Link replay attack deep simulation (token reuse, replay window, JWT signature verify)
- 4.20 Session hijack simulation (token în URL hash vs cookie, localStorage exfil)
- 4.21 Open redirect vulnerabilities (auth callback URL validation whitelist)
- 4.22 Path traversal attempts (file uploads dacă există, deep links)
- 4.23 HSTS preload list enrollment + max-age proper
- 4.24 Mixed content audit (HTTPS-only, NO `http://` resources)
- 4.25 Subdomain takeover scan (DNS records orphan)
- 4.26 SRI Subresource Integrity (third-party scripts inline)
- 4.27 Referrer-Policy header `strict-origin-when-cross-origin`
- 4.28 Permissions-Policy header minimal (camera/microphone/geolocation deny default)
- 4.29 X-Content-Type-Options `nosniff`
- 4.30 Cross-Origin-Opener-Policy + Cross-Origin-Embedder-Policy + Cross-Origin-Resource-Policy
- 4.31 Penetration test simulation OWASP Top 10 cumulative
- 4.32 Firebase Spark plan quota limits awareness + rate limit graceful
- 4.33 Auth state listener cleanup verify (memory leak prevention)
- 4.34 Storage rules deny-by-default verify (Firebase Storage)

## §5 Performance Audit

- 5.1 Bundle size analysis (`vite-bundle-analyzer`)
- 5.2 Tree-shaking effective
- 5.3 Code splitting routes lazy load (React.lazy + Suspense)
- 5.4 Source maps strip production
- 5.5 `console.*` strip production
- 5.6 Debug code strip production
- 5.7 Lighthouse mobile 3G simulation (Maria 65 phone Romania slab)
- 5.8 Lighthouse desktop separate audit
- 5.9 Time-to-Interactive Maria 65 perception target
- 5.10 React render profile unnecessary re-renders (React DevTools Profiler)
- 5.11 Zustand subscriptions granularity (NU subscribe entire store)
- 5.12 IndexedDB Dexie query patterns optimized
- 5.13 Memory leaks (event listener cleanup `useEffect` return)
- 5.14 Critical render path
- 5.15 RUM Real User Monitoring stub or absence justified
- 5.16 **LCP < 2.5s** target Maria 65 3G simulation (Core Web Vital)
- 5.17 **FID < 100ms** target
- 5.18 **CLS < 0.1** target
- 5.19 **TBT < 200ms** target
- 5.20 **Speed Index < 3.4s** target
- 5.21 **INP < 200ms** target (replaces FID 2024+)
- 5.22 **TTFB < 800ms** target
- 5.23 Bundle size budget per chunk (vendor < 200KB, main < 100KB enforced numeric)
- 5.24 CI-enforceable performance thresholds (lighthouse-ci action, block PR regression)
- 5.25 Memory long-running session (multi-hour workout pause/resume, store accumulation)
- 5.26 Detached DOM nodes hunt (Chrome DevTools Memory snapshot)
- 5.27 Worker termination cleanup (dacă există Web Workers)
- 5.28 React `useMemo` / `useCallback` appropriate (NU over-memoize cu cost > benefit)
- 5.29 Suspense boundaries strategic (NU all wrap top-level)
- 5.30 First Contentful Paint < 1.8s target
- 5.31 Largest interactive < 3s target
- 5.32 Image lazy-load + responsive sizes
- 5.33 Font display swap strategy
- 5.34 Lighthouse PWA score >= 90 production target

## §6 Accessibility Audit (WCAG 2.1 AA + Beyond)

- 6.1 WCAG 2.1 AA compliance comprehensive (axe-core scan)
- 6.2 Keyboard nav full app (Tab + Enter + Esc + Space + Arrow keys)
- 6.3 ARIA labels + roles correct
- 6.4 Color contrast 4.5:1 minim verify (Maria 65 vision)
- 6.5 Tap targets 44×44px minim (Maria 65 thumb)
- 6.6 Screen reader narration sensible RO (NVDA primary test)
- 6.7 Focus management modal/sub-screens
- 6.8 Language declaration `<html lang="ro">`
- 6.9 `prefers-reduced-motion` respect
- 6.10 Dark mode contrast separate audit (dacă supportat SettingsAppearance LANDED)
- 6.11 Dynamic content announcements ARIA live regions
- 6.12 Form labels proper (`<label for=`)
- 6.13 Error messages associated cu input (`aria-describedby`)
- 6.14 Cognitive accessibility Gigel-friendly language (plain Romanian B1 level, NU jargon technical)
- 6.15 Motor accessibility Maria 65 (large tap targets, NO precision required actions, undo affordances)
- 6.16 Color blind safe palette (deuteranopia/protanopia/tritanopia simulate, NU red/green only encoding semantic)
- 6.17 ADHD-friendly UI Daniel persona (NO blink, NO autoplay distraction, focus mode option, low cognitive overhead)
- 6.18 Plain language compliance (B1 Romanian level, anti-paternalism preserved)
- 6.19 Vestibular safety (`prefers-reduced-motion` respect deep, NO parallax/auto-spin/zoom-on-scroll)
- 6.20 Skip-to-content link (a11y bypass nav)
- 6.21 Form autofill compatible (`autocomplete` attribute proper per field)
- 6.22 Heading hierarchy proper (h1 → h2 → h3, NU skip levels)
- 6.23 Touch target spacing 8px minim between (Maria 65 thumb collision avoidance)
- 6.24 Error recovery affordances (undo destructive actions, clear retry buttons)
- 6.25 Time-based content (NO auto-advance < user-control)
- 6.26 Zoom 200% functionality (Maria 65 reading)
- 6.27 Text resize behavior (relative units rem/em vs px)
- 6.28 Visible focus indicators consistent app-wide

## §7 UX Flows End-to-End Audit

- 7.1 Onboarding T0 Big 6 → first session full journey (age/sex/goal/frequency/experience/weight)
- 7.2 Workout flow start → log sets → PostRpe → PostSummary complete
- 7.3 Energy check + Pain button + Equipment swap + Aparate lipsa sub-flows
- 7.4 Schedule override + Calendar V1 S2 7-day wiring (L–Ma–Mi–J–V–S–D)
- 7.5 9 Cont sub-screens fiecare path (Profile/Notif/Sub/Aspect/Prefs/Privacy/Terms/Export/Danger)
- 7.6 Edge cases: empty state, error state, offline state per tab
- 7.7 5 moduri Mode Detection event listeners (pure event-based per PRIMER §2)
- 7.8 PWA install prompt UX (`beforeinstallprompt` event handling)
- 7.9 First-time user vs returning user differentiation
- 7.10 Persona-specific UX Gigel / Marius / Maria 65 path divergence
- 7.11 Recovery flows post-error
- 7.12 Pause/resume session via `pausedSnapshot` integrity
- 7.13 Three-tab smoke (Antrenor + Progres + Istoric — Cont = settings, less critical UX flow)
- 7.14 Onboarding funnel conversion (dropout points audit, Big 6 questions order optimization)
- 7.15 Empty states per tab (0 sessions, no data, first time)
- 7.16 Error retry states UX (retry buttons, exponential backoff feedback)
- 7.17 Permission denied states (PWA install denied, notifications blocked)
- 7.18 Multi-device auth simultaneous handling
- 7.19 Logout flow complete (clears state, redirects splash)
- 7.20 Account deletion data wipe verify (SettingsDanger Phase 6 task_17 functional + irreversibility confirm modal)
- 7.21 Critical user journeys (new user first workout, returning daily check, recovery long break >7 days)
- 7.22 Progressive disclosure used appropriately (NU info overload Gigel)
- 7.23 Tooltip vs inline help decisions
- 7.24 Cognitive load Gigel test per screen (info density appropriate)
- 7.25 Settings change → behavior change observable verify
- 7.26 Back navigation behavior consistent (browser back vs in-app back)
- 7.27 Deep linking (URL share resume state)
- 7.28 Session continuity cross-device (auth → resume workout from another phone)
- 7.29 Equipment swap mid-session UX (Bowflex disconnect → fallback exercise)
- 7.30 Aparate lipsa flow (recommend substitute, NU block)
- 7.31 Pain button flow (ACUT vs USOARA → workout adapt vs continue)

## §8 Engine Correctness Audit

- 8.1 8 Coach Engines pipeline §42.10 prescriptive ordering preserved
- 8.2 Pure-function paradigm ADR 026 §9 (NO `Date.now`/`Math.random`/mutation hunt în engines)
- 8.3 CDL append-only invariant (ADR 011)
- 8.4 Three-tier log Tier 0/1/2 integrity (ADR 005)
- 8.5 Constraint Object immutable propagation
- 8.6 Big 11 8/8 phases regression check
- 8.7 Bayesian Nutrition Kalman filter math correctness
- 8.8 Periodization Floor/Ceiling Range Israetel framework
- 8.9 Energy Adjustment ±15% asymmetric tier-aware (T0=±10% T1+=±15%)
- 8.10 MMI Engine #9 Hibrid Lookup + Boost re-resume cap LOCK 10 V1
- 8.11 DemographicPriorDatabase ADR 017 cold-start age+experience-aware
- 8.12 Dimension Registry ADR 018 plug-in additive Open-Closed
- 8.13 Aggressive Loading detection LOCK 9 (4 module pure-function)
- 8.14 Accelerated learning wired LOOP CLOSE LOCK 9 "engine I'm wrong se vindeca 2-3 sesiuni" FULFILLED prod path
- 8.15 PR detection accuracy (weight/reps/volume)
- 8.16 Streak counter logic correctness
- 8.17 Calendar V1 S2 7-day strip semantic correctness
- 8.18 Specialization 4-gate strict (Marius Advanced+T1++Bulk/Recomp+injury auto-disable)
- 8.19 Deload micro-deload + standard week 4 non-negotiable + MRV invariant
- 8.20 Warm-up & Mobility Instant Skip T0 default anti-Maria-friction
- 8.21 Determinism same input → same output engine pipeline (random seed inject test)
- 8.22 CDL replay capability — rebuild user state from event log forensic debug
- 8.23 Numeric precision floating point accumulation (Kalman filter posterior.mu drift, Brzycki 1RM rounding, RPE × weight rounding rules consistent app-wide)
- 8.24 Engine boundaries respect (NO cross-engine side effects, pure-function compose)
- 8.25 Bayesian Nutrition Kalman convergence verify (posterior.mu stabilizes given consistent input over 90 days)
- 8.26 MMI Engine #9 boost decay verify (re-resume cap stable, NU runaway)
- 8.27 Adherence Engine baseline ELIMINATED verify (real wire task_08 Phase 6)
- 8.28 Coach Director 8-field enrich integrity (task_06 Phase 6)
- 8.29 Pipeline order swap test (verify ordering matters — change order → different output)
- 8.30 Edge case input handling (0 sessions cold-start, 1000+ sessions long-tail user)
- 8.31 Engine output schema invariant (NU drift între versions silent)
- 8.32 Engine input validation (Constraint Object shape verified pre-pipeline)

## §9 Compliance Audit

- 9.1 Anti-paternalism ABSOLUTE (force-typing ELIMINATED ADR 013 §AMENDED hunt)
- 9.2 NO_DIACRITICS_RULE UI/tests/mockups: `grep -E "[ăâîșțĂÂÎȘȚ]" src/react/` zero hits
- 9.3 Wording autonomous compose D024 V1 review (post-Beta a-z Daniel scope, log all)
- 9.4 Romanian-first cultural specific (idiom, register, no stiff calque English)
- 9.5 Mobile-first 380px target preserved
- 9.6 4-tab nav LOCK V1 preserved (NU 6 taburi vanilla creep)
- 9.7 Engine SoT wording (NU UI hardcoded duplicate engine voice) — vezi §47 deep
- 9.8 Library 657 ex schema integrity (names, equipment, muscle groups, RO names) — vezi §40 deep
- 9.9 LOCK 4 Medical Disclaimer + T&C Mandatory wired functional
- 9.10 LOCK 8 Kcal Floor 1200 BN observation filter wired functional
- 9.11 Anti-surveillance branding voice (NU paranoid features creep) — vezi §44 deep
- 9.12 F5 AA-Friction Modal V2-deferred DROP V1 verify absent
- 9.13 F13 Rating Notes Anti-RE rule DROP V1 verify absent (free-text abuse)
- 9.14 Anti-RE rule free-text Daniel verbat compliance
- 9.15 Suflet Andura voice consistency (warm Romanian, NU corporate stiff)
- 9.16 Cognitive load Gigel test per screen (audit primat universal)
- 9.17 Anti-jargon technical (NO english tech terms în UI user-facing fără translation)
- 9.18 Tone of voice register (Daniel-direct + warm, NU formal/distant)
- 9.19 Persona-aware messaging (Gigel friendly default, Marius numerical precision, Maria 65 verbal cue)

## §10 LOCK V1 Chain-of-Trust Audit

- 10.1 `DECISIONS.md` D001-D029 ↔ source code match verify each
- 10.2 ~742 cumulative LOCKED V1 sample critical decisions verify (NU exhaustive — sample 30 critical cross-cluster)
- 10.3 ZERO REVOKE silent (anti-recurrence rules §AR.* respect — vezi §42 deep)
- 10.4 Authority citation tags D-LEGACY-* historical reference accurate
- 10.5 15 audit-driven V1 features spec ↔ implementation parity:
  - KEEP verbatim: F2 Last Session Memory + F4 Readiness Verdict + F6 PR Wall + F7 Coach Director + F8 Streak Counter + F10 Stats Grid 3-cell + F11 PRs Notification + F12 Rating Buttons 3-button + F15 Per-set RPE + Mode Detection
  - MODIFY simplified: F1 Patterns Banner 2 keep + F3 Fatigue Score single + F9 BMR Strip single line + F14 Ratings Window 90 sessions
  - DROP V1: F5 AA-Friction Modal V2-deferred + F13 Rating Notes Anti-RE absent
- 10.6 Wording autonomous D024 LOCKED V1 PERMANENT preserved (post-Beta Daniel scope)
- 10.7 **PRD Acceptance Criteria per Feature F1-F15 granular verified concrete:**
  - **F2 Last Session Memory:** shows top 3 same dayLabel + RPE per set + verdict; hides if no prior session; format `<exercitiu> RPE X / verdict Y`; tap → drill-down history
  - **F4 Readiness Verdict:** 5-state emoji (excelent/bun/ok/dificil/critic) + label RO + kcal/protein delta calculation correctness vs target
  - **F6 PR Wall:** weight/reps/volume PR detection accuracy + display format (cea mai recentă top); tap → drill-down per exercise PR history
  - **F7 Coach Director:** orchestrator output structure verified per ADR §42.10 — 8-field enrich (workout, fatigueScore, readiness, patterns, alerts, recoveryStatus, priorities, mmi)
  - **F8 Streak Counter:** rolling 7-day + timezone-aware day boundary; day boundary RO 00:00 Europe/Bucharest; resets correctly post 24h gap
  - **F10 Stats Grid 3-cell:** layout cell-1 streak + cell-2 sessions săptămână + cell-3 volume total; data sources real wire engineAggregate
  - **F11 PRs Notification:** per-PR notification format `Tip PR! <exercitiu> <metrica>: <new_value>`; dismiss persistent; NU spam (1× per PR)
  - **F12 Rating Buttons 3-button RO culture:** USOARA/NORMALA/GREA visible labels; persistence Tier 0; tap immediate next set advance
  - **F15 Per-set RPE:** input UX 0-10 scale + validation bounds + per-set persistence; default RPE last set fallback
  - **Mode Detection:** 5 moduri pure event listeners (idle/active/paused/completed/post-session) + transitions valid FSM — vezi §45 deep
  - **F1 Patterns Banner MODIFY:** LOW_ADHERENCE + STAGNATION 2 keep verified + 3 drop V2 paranoid (REPEATED_PR, OPTIMAL_TIMING, AGGRESSIVE_LOADING) absent codebase
  - **F3 Fatigue Score MODIFY:** single number 0-100 + culoare verde/galben/roșu; NU multi-component visual breakdown
  - **F9 BMR Strip MODIFY:** single line format `<TDEE> kcal / <target_protein>g proteină`; NU multi-line breakdown
  - **F14 Ratings Window EXTEND:** 90-day rolling window math verified (NU 20 sesiuni V1 legacy)
  - **F5 DROP V1:** verify absent component + route + reference în codebase
  - **F13 DROP V1:** verify absent component + route + reference; anti-RE rule free-text universal Pre-flight
- 10.8 **8 Coach Engines acceptance criteria each:** Periodization + GoalAdaptation + EnergyAdjustment + BayesianNutrition + Tempo/FormCues + Specialization + WarmupMobility + Deload + MMI Engine #9 — fiecare engine input/output contract + invariants
- 10.9 **Auxiliary engines acceptance criteria:** Muscle Recovery + Weakness Detector + PR Wall + Readiness + Streak Counter + Coach Director — fiecare engine real wire
- 10.10 **4 Auxiliary features acceptance criteria:** Auth Magic Link Phase 1+2 + Onboarding T0 Big 6 + Mode Detection + Tier Storage (Tier 0/1/2 + Dexie + Firebase archive)
- 10.11 **9 Cont sub-screens acceptance criteria each:** Profile (Big 6 edit) + Notifications (toggle + frequency + days + time) + Subscription (Beta gratuit info) + Appearance (theme + nav style) + Preferences (units + week start + locale) + Privacy (export + telemetry opt-in) + Terms (T&C + Medical Disclaimer 2-tab) + Export (local JSON download) + Danger (logout + reset + delete confirm modals)
- 10.12 **Onboarding T0 acceptance criteria:** Big 6 hard typing + bounds validation + demographic prior fallback + persona detection + completion celebration

## §11 i18n / Localization Audit

- 11.1 Date format `dd.MM.yyyy` Romanian convention
- 11.2 Decimal separator (virgulă RO vs punct EN)
- 11.3 Weekday names L/Ma/Mi/J/V/S/D LOCKED V1 strict
- 11.4 Currency RON dacă apare
- 11.5 Number formatting locale-aware (`Intl.NumberFormat('ro-RO')`)
- 11.6 Time format 24h Romanian standard
- 11.7 Timezone handling Europe/Bucharest implicit/explicit
- 11.8 **DST transition handling** (martie ultima duminică +1h forward, octombrie ultima duminică -1h backward) — streak counter day boundary math correct, calendar week boundary correct
- 11.9 **Midnight rollover behavior** (streak counter day boundary, calendar week boundary, session timestamp boundary)
- 11.10 **Leap year handling** (29 feb edge case, date arithmetic correct)
- 11.11 **25h/23h zile DST transition math** (date arithmetic correct across DST border — verify Dexie timestamps + Firebase server timestamps consistent)
- 11.12 **"Today" / "Yesterday" / "Acum o săptămână" definitions consistent app-wide** (NU mixed user-local + UTC)
- 11.13 Romanian glyphs render fallback chain (ș/ț/â/î/ă display correct cu font fallback; preserved în docs vault dar STRIP în UI)
- 11.14 Numeric string parsing locale-aware ("85,5kg" RO vs "85.5kg" EN, sanitize both formats input)
- 11.15 Internationalization pipeline future-proofing (string externalization layer dacă util en/de migration future — current state documented decision RO-only)
- 11.16 Plural rules RO (1 / 2-19 / 20+ Romanian plural form three-way)

## §12 Data Integrity / Migration Audit

- 12.1 Dexie schema versions migration scripts safe (ADR migration chain)
- 12.2 Three-tier log Tier 0/1/2 transitions correct (active → rolling → archive) — vezi §36 deep
- 12.3 IndexedDB quota handling overflow strategy
- 12.4 Backup integrity Firebase tier (sync correctness)
- 12.5 Rollback safety (migration fail recovery)
- 12.6 Tier 0 `wv2-*` localStorage keys NU breaking change verify
- 12.7 Schema 657 exercises invariant preserved
- 12.8 Cross-tab IndexedDB lock handling
- 12.9 Schema migration backwards-compatible (older client → newer schema graceful degradation)
- 12.10 Append-only event log integrity (CDL forensic replay capability)
- 12.11 Last-write-wins resolution policy documented + tested
- 12.12 Data corruption recovery (Dexie corruption, localStorage corruption, partial state)
- 12.13 Storage migration chain test (v1 → v2 → v3 schema upgrade path verified)
- 12.14 IndexedDB transaction atomicity (multi-table writes atomic, NU partial commits)
- 12.15 Serialization round-trip integrity (write → read → write reproduces identical)

## §13 Error Handling Cross-Cutting Audit

- 13.1 Async path fiecare defensive (Firebase write fail, IndexedDB quota, network timeout, JSON parse fail)
- 13.2 Toast UX la fail (consistent pattern app-wide)
- 13.3 Retry strategy network failures (exponential backoff)
- 13.4 Graceful degradation offline (Service Worker NetworkFirst Firebase)
- 13.5 Error boundary `Layout` LANDED Phase 6 task_20 verify functional (test trigger error)
- 13.6 Sentry config or fallback observability stub
- 13.7 Unhandled promise rejection global handler
- 13.8 Window error global handler
- 13.9 **Form validation Big 6 bounds** (age 13-95? weight 30-250kg? frequency 0-14 sesiuni/săpt? height 100-220cm? bounds enforcement input level)
- 13.10 **Input sanitization XSS** (user-typed free text trimmed + sanitized — even though F13 dropped, profile name + future fields)
- 13.11 **Numeric string parsing locale** ("85,5"/"85.5"/"85kg"/"85 kg" handle ambele formate RO/EN gracefully)
- 13.12 **Submit double-click protection** (debounce + disable state during async)
- 13.13 **Paste handling clipboard** (text paste sanitized, image paste rejected gracefully)
- 13.14 **Free-text length limits** (max chars enforced per field — anti-abuse)
- 13.15 **Error states UX consistent** (toast vs banner vs inline decisions documented)
- 13.16 **Required vs optional fields clearly indicated**
- 13.17 **Recovery UX clear** (retry buttons, support contact info dacă fail final)
- 13.18 **Offline error messages friendly** (NU "Network Error" raw, "Esti offline, reincercam automat")
- 13.19 **Concurrent modification handling** (server changed since fetch — conflict resolution)
- 13.20 **Optimistic UI update + rollback on error**

## §14 State Machine Integrity Audit

- 14.1 Workout state machine 5 moduri Mode Detection FSM transitions valid (idle/active/paused/completed/post-session) — vezi §45 deep
- 14.2 Race conditions multi-tab (Zustand persist sync)
- 14.3 Dead states unreachable (audit FSM diagram match implementation)
- 14.4 `sessionStart` / `pausedSnapshot` / `lastSession` state transitions
- 14.5 Mode detection event listeners cleanup (NU memory leak)
- 14.6 Antrenor pill state (`SessionPill` conditional `if (!active && !paused) return null`)
- 14.7 Discriminated unions FSM types (`type WorkoutState = { kind: 'idle' } | { kind: 'active', ... }`)
- 14.8 Exhaustiveness checks transitions (switch on `state.kind` cu `never` default branch)
- 14.9 Concurrency Zustand persist cross-tab (storage event listener verify)
- 14.10 BroadcastChannel sync (dacă utilizat — verify cleanup)
- 14.11 Last-write-wins resolution policy state divergence
- 14.12 State machine visualization documented (Mermaid diagram dacă util)
- 14.13 Invariants state machine documented (preconditions per transition)
- 14.14 Side effects per transition documented (NU implicit state change)
- 14.15 State persistence boundary (what persists Zustand persist vs ephemeral)
- 14.16 State rehydration integrity (post-reload state matches pre-reload)

## §15 Cross-Browser Compatibility Audit

- 15.1 Android Chrome primary (Daniel target) verified
- 15.2 Firefox/Edge fallback (Android secondary browsers)
- 15.3 Browser APIs supported (IndexedDB, Service Worker, `navigator.share`, `crypto.subtle`)
- 15.4 iOS Safari deferred PERMANENT v2/v3 (verify confirm NU partial wired — degrades gracefully, NU broken)
- 15.5 Polyfills appropriate (NU over-polyfill bundle bloat)
- 15.6 Caniuse coverage Android 12+ primary target
- 15.7 Safe area insets notches (`env(safe-area-inset-*)`)
- 15.8 Orientation lock decisions (portrait primary, landscape allowed?)
- 15.9 Pull-to-refresh handling (`overscroll-behavior: contain`)
- 15.10 Viewport meta correct (`width=device-width, initial-scale=1, viewport-fit=cover`)
- 15.11 Status bar color theme `theme-color` meta (browser chrome match brand)
- 15.12 PWA standalone mode chrome handling
- 15.13 Web Share API fallback (`navigator.share` not always available)
- 15.14 Clipboard API fallback (write/read availability detection)
- 15.15 Webview vs browser context detection (in-app browser Facebook/Instagram quirks)

## §16 PWA Spec Compliance Audit

- 16.1 `manifest.webmanifest` valid all fields (`name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`, `orientation`, `lang`)
- 16.2 Icons all sizes (16/32/72/96/128/144/152/192/384/512)
- 16.3 Maskable icons supplied
- 16.4 Offline support actual real test (`NetworkFirst` Firebase strategy LANDED Phase 6 task_21)
- 16.5 Install prompt UX (`beforeinstallprompt` event handling)
- 16.6 Update flow `UpdatePrompt` LANDED Phase 6 task_21 functional
- 16.7 Service Worker scope correct (root `/`)
- 16.8 Workbox cache strategies appropriate (static / runtime / Firebase)
- 16.9 PWA Lighthouse audit pass (installability + offline + manifest)
- 16.10 Update mechanism (`skipWaiting` + `clientsClaim` strategy verified)
- 16.11 SW versioning strategy (version bump on deploy, cache invalidation)
- 16.12 Cache invalidation strategy (`cleanupOutdatedCaches` enabled)
- 16.13 Background sync (dacă util pentru offline write queue)
- 16.14 Push notifications support state (current scope, future preparation)
- 16.15 Cross-tab SW state sync (clients.matchAll() broadcast)
- 16.16 App icons branding consistent across sizes
- 16.17 Splash screen iOS (deferred per D015 but verify NU broken)
- 16.18 PWA install criteria all met (manifest + SW + HTTPS + engagement heuristic)

## §17 Telemetry / Observability Audit

- 17.1 Opt-in telemetry default `FALSE` (anti-paternalism per Phase 6 task_14)
- 17.2 Events captured if opt-in respectful (NU PII leak)
- 17.3 k-anonymity preserve telemetry data
- 17.4 Sentry config or fallback documented
- 17.5 Logs NOT exposing sensitive data (production strip)
- 17.6 RUM WebVitals capture (LCP/FID/CLS/TBT/SI/INP prod monitored dacă opt-in)
- 17.7 INP (Interaction to Next Paint) tracked
- 17.8 TTFB tracked
- 17.9 Custom metrics app-specific (workout duration, engagement, etc — opt-in)
- 17.10 Error tracking Sentry stub or equivalent (production crash visibility)
- 17.11 Uptime monitoring stub (Pingdom/UptimeRobot/etc)
- 17.12 Production monitoring strategy documented (alerting, on-call, runbook) — vezi §35 deep
- 17.13 User behavior analytics (anti-surveillance compliant, opt-in)
- 17.14 Incident response runbook (procedure post-deploy issue) — vezi §35 deep
- 17.15 Performance regression detection alerting (Lighthouse-CI delta threshold)

## §18 Documentation Audit

- 18.1 `README.md` accurate up-to-date
- 18.2 ADR chain canonical sources immutable (`03-decisions/_FROZEN/`) — vezi §42 deep
- 18.3 `ANDURA_PRIMER.md` singular SSOT live truth-source
- 18.4 `DECISIONS.md` SSOT append-only integrity
- 18.5 Public API JSDoc TypeScript narrative
- 18.6 `CONTRIBUTING.md` (dacă există)
- 18.7 `LICENSE` present
- 18.8 `SECURITY.md` (dacă există)
- 18.9 `.env.example` template fără secrets
- 18.10 Vault SSOT integrity verify (ANDURA_PRIMER + DECISIONS cross-refs valid path:§ verifiable)
- 18.11 `03-decisions/_FROZEN/` immutable verify (NO post-2026-05-15 changes)
- 18.12 `07-meta/karpathy-skills-ref/` intact (4 principii core philosophy reference)
- 18.13 Cross-refs valid (all `path:§` references navigate correct)
- 18.14 Stale references hunt (legacy cross-refs pointing to renamed/deleted files)
- 18.15 PROJECT_VISION + SUFLET_ANDURA + MOAT_STRATEGY 01-vision integrity
- 18.16 04-architecture/mockups/andura-clasic.html DESIGN MASTER referenced correctly
- 18.17 08-workflows/HANDOVER_VERIFICATION_CHECKLIST integrity
- 18.18 99-archive/wiki-pre-2026-05-15/ STOP banners + immutable state
- 18.19 PROJECT_INSTRUCTIONS_V6 cross-refs accurate post structural updates

## §19 Visual Regression / Pixel Parity Audit

- 19.1 Mockup `andura-clasic.html` DESIGN MASTER vs React build pixel-perfect parity per screen
- 19.2 Screenshot diff baseline (Percy / Chromatic / manual side-by-side)
- 19.3 Color tokens consistency (CSS variables / Tailwind config)
- 19.4 Typography scale consistent
- 19.5 Spacing rhythm (4px/8px grid)
- 19.6 Border radius consistency
- 19.7 Animation timing curves consistent
- 19.8 Hover/focus/active states match mockup
- 19.9 Empty states visual match
- 19.10 Loading states visual (LoadingSkeleton Phase 5 task_19) match
- 19.11 Color tokens centralized (CSS vars / Tailwind theme.colors single source)
- 19.12 Typography scale tokens centralized
- 19.13 Spacing tokens centralized (4px / 8px grid enforced)
- 19.14 Border radius tokens centralized
- 19.15 Shadow tokens centralized (elevation system documented)
- 19.16 Animation duration/easing tokens centralized
- 19.17 Component library audit (atomic design level, reusability)
- 19.18 Dark mode visual parity (dacă supportat SettingsAppearance LANDED)
- 19.19 Touch target visual feedback consistent (`:active` state)
- 19.20 Focus ring visual consistent (`:focus-visible`)
- 19.21 Print stylesheet (dacă util — PR Wall print export future)
- 19.22 High contrast mode compatibility (`prefers-contrast: high`)

## §20 Bundle / Build Artifact / Supply Chain Audit

- 20.1 Tree-shaking effective production
- 20.2 Source maps appropriate (NU expose source production)
- 20.3 `console.*` strip production
- 20.4 Debug code strip
- 20.5 Env vars correct production keys (`VITE_*` Firebase config)
- 20.6 Asset optimization (images compressed, fonts subset)
- 20.7 Chunk strategy optimal (vendor split, route split)
- 20.8 Critical CSS inline
- 20.9 **License compliance OSS third-party scan** (license-checker tool report all deps)
- 20.10 **License compatibility** MIT/Apache/ISC/BSD compatible verify, NO GPL/AGPL/LGPL contamination în proprietary build
- 20.11 **Dependency pinning policy** (exact version `1.2.3` vs caret `^1.2.3` semver decision documented)
- 20.12 **Lockfile integrity verify** (`package-lock.json` committed, deterministic install)
- 20.13 **Postinstall scripts hunt** (supply chain attack surface, malicious deps inspect)
- 20.14 **Renovate/Dependabot policy documented**
- 20.15 **Supply chain attack surface** documented (third-party deps tree depth `npm ls --all`)
- 20.16 **Build reproducibility deterministic** (same input → same output dist artifact hashes)
- 20.17 **Node version pinned** (`engines.node` în package.json strict)
- 20.18 SRI Subresource Integrity hashes (third-party scripts CDN)
- 20.19 Build artifact size budget per chunk enforced CI (numeric thresholds)
- 20.20 Production secrets NOT în build artifact (`grep` hunt)
- 20.21 Unused deps hunt (`depcheck` report)
- 20.22 Circular imports hunt (`madge` report)

## §21 Git Hygiene Audit

- 21.1 Branch protection rules `main` (GH Pages auto-deploy from main per option 1)
- 21.2 CI pipeline `.github/workflows/deploy.yml` definitions — vezi §33 deep
- 21.3 Pre-push hooks
- 21.4 `.gitignore` comprehensive (no secrets, no node_modules, no dist artifacts)
- 21.5 Commit signing (GPG) if applicable
- 21.6 Secrets in git history (`git log --all -- '**/.env*'` + BFG scan)
- 21.7 Tag conventions consistent (milestone + backup pattern)
- 21.8 Branch cleanup remote (stale feature branches)
- 21.9 Branch protection rules verify GH settings (required reviews, status checks for main)
- 21.10 Tag conventions enforcement (date-based `pre-X-DATE` + `phase-N-batch-landed-DATE` documented)
- 21.11 Lockfile committed (`package-lock.json` in git verify)
- 21.12 Husky pre-commit hooks configured (lint + typecheck + tests verde mandatory)
- 21.13 Conventional Commits adherence (feat/fix/docs/refactor/test/chore prefix)
- 21.14 Git LFS dacă util (large assets) — documented decision
- 21.15 Submodules (dacă util) — documented

## §22 Refactor-Later-NEVER Scan

- 22.1 `TODO` / `FIXME` / `HACK` / `XXX` comments surface ALL
- 22.2 Commented-out code blocks
- 22.3 Dead code (unused exports, unreachable branches)
- 22.4 Magic numbers without constant declaration
- 22.5 Duplicate logic refactor candidates
- 22.6 200-line files could-be-50 simplify candidates
- 22.7 Premature abstractions
- 22.8 Speculative features unused
- 22.9 200 lines could-be 50 senior engineer "overcomplicated?" test
- 22.10 Empty function bodies hunt
- 22.11 Commented imports hunt
- 22.12 `console.log` / `console.debug` strip production
- 22.13 `debugger` statements hunt
- 22.14 Unused dependencies în package.json (`depcheck`)
- 22.15 Circular imports hunt (`madge`)
- 22.16 Code duplication % (jscpd dacă util)

## §23 Self-Correction Loop Verify

- 23.1 Accelerated learning wired prod path (`src/engine/acceleratedLearning.js` + adapter)
- 23.2 Pattern learning end-to-end FULFILLED LOCK 9 LOOP CLOSE
- 23.3 "Engine I'm wrong se vindeca 2-3 sesiuni" actual prod telemetry verify
- 23.4 Bayesian Nutrition Kalman convergence verify (posterior.mu stabilizes 90 days)
- 23.5 MMI Engine #9 boost decay verify (re-resume cap stable, NU runaway boost)
- 23.6 Aggressive Loading detection accuracy verify (4 module pure-function cumulative)
- 23.7 Periodization adapt to user-actual frequency (NU rigid template)
- 23.8 Specialization 4-gate auto-disable correctness

## §24 Configuration Management Audit

- 24.1 Environment vars Vite (`VITE_*` prefix proper conventions)
- 24.2 Build-time vs runtime config decision documented
- 24.3 Feature flags (dacă există) — strategy documented
- 24.4 A/B test infrastructure (dacă există) — strategy documented
- 24.5 Secrets management (NU în git, env vars only, `.env.local` ignored)
- 24.6 Config drift between envs documented (dev / staging / prod separate Firebase projects?)
- 24.7 `.env.example` template comprehensive (toate VITE_* keys documented placeholder)
- 24.8 Firebase project IDs separate per env (dev/prod isolation)
- 24.9 CI secrets via GitHub Actions secrets store (NU plaintext în workflow)
- 24.10 Local development setup documentation (README onboarding new dev)

## §25 API Contract Integrity Firebase REST

- 25.1 REST endpoint versioning strategy documented (Firebase REST API v1)
- 25.2 Fallback dacă Firebase REST API schimbă schema
- 25.3 Error response handling all paths (4xx/5xx mapping app-specific errors)
- 25.4 Rate limit headers respect (`Retry-After`)
- 25.5 Retry strategy with exponential backoff (jitter included)
- 25.6 Circuit breaker pattern (dacă util — degrade gracefully)
- 25.7 Mock for tests fidelity (test mock matches real API contract)
- 25.8 Idempotency keys (write operations safety)
- 25.9 Optimistic concurrency control (etag/version field dacă util)
- 25.10 Timeout handling per request (`AbortController` signal)
- 25.11 REST vs SDK decision rationale documented (ADR 002 verify preserved)

## §26 Backup / Disaster Recovery Dedicat

- 26.1 **Restore procedure tested fresh device** (Daniel pierde telefon → re-login → data restored complete end-to-end)
- 26.2 **Wipe scenario recovery** (factory reset → re-login → IndexedDB rebuilt from Firebase)
- 26.3 **User clear site data mid-session recovery** (browser settings clear → graceful re-auth + restore)
- 26.4 **Firebase backup schedule documented** (frequency, retention, region europe-west)
- 26.5 **Restore time SLA target documented** (e.g. typical user < 30s, large user < 2min)
- 26.6 **Conflict resolution post-restore** (divergent state local + Firebase — last-write-wins? user-prompt?)
- 26.7 **Test plan exercises restore live** (manual procedure documented step-by-step)
- 26.8 **Automated restore test fezabil** (dacă util — CI smoke test)
- 26.9 **Disaster recovery runbook** (procedure post catastrophic data loss user-side + server-side)
- 26.10 **Backup retention policy** (90 days? 1 year? compliant GDPR right-to-erasure timeline)
- 26.11 **Backup encryption at rest** (Firebase default vs explicit)
- 26.12 **Backup access controls** (NU public-readable, IAM rules)
- 26.13 **Data export user-initiated** (`SettingsExport` task_16 functional + verified format)
- 26.14 **Data export format compliant GDPR right-to-portability** (JSON structured machine-readable)
- 26.15 **Backup verification integrity** (periodic checksum, NU silent corruption)

## §27 Pricing / Monetization Future-Proofing

- 27.1 Free Beta scope clear (current state limitations documented)
- 27.2 Premium gate stubs (dacă există infrastructure pre-wired)
- 27.3 Subscription Settings UI (Phase 6 task_11 LANDED verify functional placeholder)
- 27.4 Payment integration stub (Stripe/etc — preparation level documented)
- 27.5 Tax handling stub (VAT RO/EU regulations preparation)
- 27.6 Receipt generation stub
- 27.7 Pricing tier definition documented (free vs premium vs enterprise dacă util)
- 27.8 Upgrade/downgrade flow stub
- 27.9 Cancellation flow stub (compliant EU consumer law)
- 27.10 Trial period handling (dacă util future)
- 27.11 Refund policy stub
- 27.12 Invoicing requirements RO (ANAF compliance preparation)

## §28 Legal / GDPR Compliance Comprehensive

- 28.1 Privacy Policy live link present + accurate
- 28.2 T&C live link present + accurate
- 28.3 Cookie banner GDPR consent (dacă util — PWA first-party may skip)
- 28.4 Data Processing Agreement (DPA) Firebase as processor documented
- 28.5 Sub-processor list documentation
- 28.6 Data residency RO/EU verify (Firebase region europe-west, NU US transfer)
- 28.7 DSR (Data Subject Request) handler runbook
- 28.8 Right-to-access GDPR data export verify functional
- 28.9 Right-to-portability JSON format compliant machine-readable
- 28.10 Right-to-erasure complete data wipe verify (NU partial — IndexedDB + Firebase + Auth profile + backups)
- 28.11 Right-to-rectification edit flow verify
- 28.12 Consent management (medical disclaimer + T&C consent timestamps stored)
- 28.13 Age verification GDPR (NU minors under 16 without parental consent — Big 6 age check)
- 28.14 Data minimization principle (NU collect over-broad data)
- 28.15 Purpose limitation (data used only for stated purpose documented)
- 28.16 Lawful basis documented (consent + legitimate interest split per data type)
- 28.17 Privacy by Design + Privacy by Default documented
- 28.18 Data breach notification procedure (72h notify per GDPR Art. 33)
- 28.19 Records of Processing Activities (ROPA) documented
- 28.20 DPO contact (Data Protection Officer dacă util Daniel ca controller)
- 28.21 EU-US Data Privacy Framework compliance dacă Firebase US-region used
- 28.22 Medical data special category Art. 9 GDPR considerations (fitness ≠ medical strict, but verify boundary)
- 28.23 ePrivacy Directive compliance (cookies + tracking)

## §29 Branding / Design System Tokens

- 29.1 Color palette tokens CSS vars (theme.colors Tailwind config single source)
- 29.2 Typography scale tokens (font-size + line-height + letter-spacing)
- 29.3 Spacing scale (4px/8px grid enforced)
- 29.4 Border radius tokens
- 29.5 Shadow tokens (elevation system)
- 29.6 Animation duration/easing tokens
- 29.7 Brand voice Suflet Andura consistency (warm Romanian, NU corporate stiff)
- 29.8 Logo / icon brand mark consistency (favicon + manifest icons + splash + UI logo)
- 29.9 Color blind safe palette verify (deuteranopia/protanopia/tritanopia simulate)
- 29.10 Design tokens documented (`design-tokens.md` sau equivalent)
- 29.11 Theme system architecture (CSS vars → Tailwind theme → component consume)
- 29.12 Dark mode token completeness (dacă SettingsAppearance dark mode LANDED)
- 29.13 Component variants documented (button primary/secondary/tertiary/destructive)
- 29.14 Iconography consistency (Lucide icons used consistently, NU mix random icon sets)

## §30 Onboarding T0 Anti-Bias Framework Deep

- 30.1 ADR 014 Big 6 hard typing verify (age/sex/goal/frequency/experience/weight)
- 30.2 ADR 017 demographic prior fallback verify wired
- 30.3 Force-typing eliminated ADR 013 §AMENDED verify (anti-paternalism ABSOLUTE)
- 30.4 Skip logic anti-paternalism preserved
- 30.5 Persona detection accuracy (Gigel / Marius / Maria 65 classification)
- 30.6 **Big 6 bounds enforcement** (age 13-95 minim+maxim, weight 30-250kg, frequency 0-14 sesiuni/săpt, height 100-220cm, etc — input level validation strict)
- 30.7 Edge case persona conflict (e.g. age 65 + goal hypertrophy advanced — graceful handle)
- 30.8 Onboarding completion celebration UX
- 30.9 Skip path T0 incomplete graceful (NU lock user out)
- 30.10 Back navigation between Big 6 steps preserves entered data
- 30.11 Resume incomplete onboarding (post-close mid-flow)
- 30.12 Demographic prior database lookup correctness (age × experience → starting weights)
- 30.13 Anti-RE rule free-text universal (NU rating notes, NU goal description free-text)

## §31 Auth Flow Edge Cases Comprehensive

- 31.1 Magic Link expired token UX (clear message, request new link option)
- 31.2 Magic Link replayed token UX (security message, request new)
- 31.3 Magic Link malformed token UX (graceful error, NU stack trace exposed)
- 31.4 Magic Link rate limiting verify (per email per minute, anti-abuse)
- 31.5 Session management refresh strategy (token refresh transparent)
- 31.6 Logout flow complete (clears state Zustand + IndexedDB ephemeral + Firebase Auth + redirects splash)
- 31.7 Multi-device auth simultaneous handling (login one device → other devices? sync state?)
- 31.8 Account deletion full data wipe verify (Auth + Firestore + Storage + IndexedDB cleanup)
- 31.9 OAuth Phase 3 PENDING verify NU partial wired exposing surface
- 31.10 Cross-tab session sync (login one tab → other tabs reflect via storage event)
- 31.11 Token storage decision (localStorage vs sessionStorage vs httpOnly cookie — security tradeoffs documented)
- 31.12 Re-authentication required for sensitive ops (account deletion, email change, password change dacă există)
- 31.13 Magic Link domain validation (email domain whitelist? typo detection?)
- 31.14 SMTP delivery reliability (Phase 2 RESOLVED — verify production deliverability rate)
- 31.15 Email content compliance (NU spam-flagged, SPF/DKIM/DMARC verified)

## §32 Notification System / In-App Toast

- 32.1 Toast UX consistent pattern app-wide (position, duration, dismiss)
- 32.2 Banner notifications priority hierarchy (critical > warning > info)
- 32.3 Permission request UX (`Notification.requestPermission()` flow gracious)
- 32.4 Quiet hours respect (anti-paternalism, user-configurable Phase 6 task_10)
- 32.5 Notification frequency limits enforced
- 32.6 Push notifications support state (current scope documented, future preparation)
- 32.7 In-app notification center (dacă util)
- 32.8 Notification preferences `SettingsNotifications` functional (Phase 6 task_10 LANDED)
- 32.9 Notification dismiss UX
- 32.10 Notification grouping logic (dacă util — multiple PRs same session aggregate)
- 32.11 Notification queue handling (rapid-fire deduplication)
- 32.12 Critical safety notifications NU dismissable easily (medical disclaimer etc)

---

## §33 CI/CD Pipeline GitHub Actions Deploy Workflow

- 33.1 `.github/workflows/deploy.yml` definition verify (steps clear, ordering correct)
- 33.2 Build stage isolation (clean env, NU leak from previous run)
- 33.3 Test stage gates (lint + typecheck + vitest + E2E Playwright)
- 33.4 Tests verde mandatory before deploy (block deploy on fail)
- 33.5 Deploy stage GH Pages auto-deploy from `main` (D028 PROC LOCKED V1 PERMANENT)
- 33.6 Rollback capability tested (manual revert + tag re-deploy procedure)
- 33.7 Environment promotion strategy (currently single env prod — document dacă staging adăugat)
- 33.8 Artifact storage GitHub Actions (build dist retained per run)
- 33.9 Pipeline secrets handling GitHub Actions secrets store (NU plaintext în .yml)
- 33.10 Pipeline cache strategy (npm cache, build cache, lint cache)
- 33.11 Pipeline performance (build time tracked, regression alert)
- 33.12 Parallel jobs strategy (lint + typecheck + tests parallel?)
- 33.13 Dependency caching (`actions/cache@v4` setup correct)
- 33.14 Node version matrix testing (dacă util — currently single Node version)
- 33.15 Pre-deploy smoke (post-deploy hook curl andura.app)
- 33.16 Deploy notification (Daniel manual review post-deploy currently)
- 33.17 Tag automation (milestone tags via workflow_dispatch?)
- 33.18 Branch trigger correct (only `main` triggers production deploy)
- 33.19 PR preview deploys (dacă util — currently NU)
- 33.20 Workflow concurrency limits (NU race condition multi-push)

## §34 Production Operations / Incident Response Runbook

- 34.1 Incident response procedures documented (severity classification, escalation)
- 34.2 Rollback procedure tested live (D028 PROC tag-based revert verified)
- 34.3 Hot-fix deployment process (urgent path, NU bypass tests)
- 34.4 Monitoring alerts thresholds (perf regression, error rate, uptime — dacă stubbed)
- 34.5 On-call rotation documented (solo Daniel — escalation NU applicable yet)
- 34.6 Status page (dacă util — andura.app/status endpoint?)
- 34.7 Communication template breach/outage (user notification draft)
- 34.8 Recovery objectives RTO (Recovery Time Objective < 1h target)
- 34.9 RPO (Recovery Point Objective < 24h target — Firebase backup frequency)
- 34.10 Post-mortem template documented (incident → root cause → action items)
- 34.11 Change management procedure (deploy windows, freeze periods)
- 34.12 Production access controls (Firebase IAM, GitHub repo permissions)
- 34.13 Secrets rotation procedure (Firebase API keys, etc)
- 34.14 Disaster recovery drill (simulate prod fail → verify procedure works)
- 34.15 Runbook accessibility (offline copy, NU only în vault if vault unreachable)

## §35 Database / Storage Tier 0/1/2 Specifics Deep

- 35.1 **Tier 0 transient** (last 24h în localStorage `wv2-*` keys) — schema fields, transition timing
- 35.2 **Tier 1 active** (last 90 days rolling în Dexie IndexedDB) — schema tables, indexes
- 35.3 **Tier 2 archive** (>90 days Firebase Firestore) — collection structure, aggregation pre-archive
- 35.4 **Transition timing exact** (when Tier 0 → Tier 1 promote, Tier 1 → Tier 2 archive)
- 35.5 **Aggregation pre-archive** (compress detailed → summary stats before Tier 2)
- 35.6 **Restore from Tier 2 logic** (user requests historical data older than 90 days)
- 35.7 **Storage size per tier monitored** (quota awareness per tier)
- 35.8 Dexie schema design normalization vs denormalization decisions
- 35.9 Dexie index strategy per table (compound indexes for hot queries)
- 35.10 Query performance hot paths (workout list, history scroll, PR lookup)
- 35.11 Pagination strategy long lists (Istoric scroll virtualization)
- 35.12 Bulk operations efficiency (Dexie `bulkPut`, batched writes)
- 35.13 Storage size estimation per user (Tier 0 ~KB, Tier 1 ~MB, Tier 2 long-tail)
- 35.14 Eviction policy Tier 2 archive (compress old data, NU delete unless GDPR erasure)
- 35.15 Firebase Firestore document size limits (1MB per doc — verify no overflow)
- 35.16 Firebase Auth user metadata (custom claims usage)
- 35.17 localStorage size limits hit possibility (5-10MB cap browser-dependent)
- 35.18 IndexedDB versioning migration deep (Dexie version chain v1 → v2 → v3 safe)
- 35.19 Cross-tier data consistency (Tier 0 ephemeral lost? acceptable?)
- 35.20 Schema 657 exercises invariant — fields documented schema (`name_ro`, `name_en`, `equipment[]`, `primary_muscle`, `secondary_muscles[]`, `difficulty`, `category`, `variations[]`)

## §36 Network Layer + Offline Sync Edge Cases

- 36.1 Request batching strategy (multiple Firebase writes → batched)
- 36.2 Request deduplication (NU duplicate fetch same data parallel)
- 36.3 Response caching strategy (Service Worker cache-first vs network-first per route)
- 36.4 Stale-while-revalidate patterns (Workbox strategy applied correctly)
- 36.5 ETag handling (HTTP cache validation)
- 36.6 Compression (gzip/brotli enabled GH Pages)
- 36.7 HTTP/2 vs HTTP/3 (GH Pages support level)
- 36.8 Connection pooling (Firebase SDK manages internal)
- 36.9 DNS prefetch hints (`<link rel="dns-prefetch">` Firebase domains)
- 36.10 Preconnect hints (`<link rel="preconnect">` critical origins)
- 36.11 **Sync conflict resolution offline → online** (local writes during offline → Firebase sync conflict)
- 36.12 **Queued operations replay** (offline writes queue → replay on reconnect)
- 36.13 **Long offline duration handling** (days/weeks offline → reconnect graceful)
- 36.14 **Partial connectivity** (slow 3G — timeout vs retry strategy)
- 36.15 **Captive portal detection** (hotel/airport WiFi — Service Worker handles?)
- 36.16 **Geographic routing** (Firebase region europe-west — latency RO users)
- 36.17 **Service worker update during offline** (defer update until online?)
- 36.18 Background sync API (dacă supported — queue writes when offline)
- 36.19 Network state detection (`navigator.onLine` + actual ping verification)
- 36.20 Reconnect UX (status indicator "se reconecteaza" toast)

## §37 Engineering Code Standards + Naming Conventions + Patterns

- 37.1 Naming conventions variables (camelCase consistent, no abbreviation puzzle)
- 37.2 Naming conventions functions (verb-noun pattern, e.g. `getUser`, `updateProfile`)
- 37.3 Naming conventions files (kebab-case `coach-director.ts` sau camelCase `coachDirector.ts` — decision documented)
- 37.4 Naming conventions components (PascalCase `CoachDirector.tsx`)
- 37.5 File organization patterns (atomic design? feature folders? layer folders?)
- 37.6 Component composition patterns (children prop vs render prop vs hooks)
- 37.7 Prop drilling vs Context vs Zustand decisions documented
- 37.8 Hook conventions (`use*` prefix, single responsibility, custom hook patterns)
- 37.9 Async patterns (async/await preferred vs promises raw)
- 37.10 Error propagation patterns (throw vs Result type vs Either)
- 37.11 Logging conventions (level info/warn/error, format structured, no PII)
- 37.12 Comment conventions (TSDoc/JSDoc/inline use cases)
- 37.13 Constant declaration patterns (`const` vs `enum` vs `as const`)
- 37.14 Type definitions location (co-located vs centralized types/ folder)
- 37.15 Test file co-location (`Component.tsx` + `Component.test.tsx` same folder)
- 37.16 Folder structure src/ organization (engine/coach/react/util/db.js decision)
- 37.17 Index barrel exports (intentional, NU auto-export everything)
- 37.18 Circular dependency prevention (madge enforced CI)
- 37.19 Magic strings centralized (constants file for string literals reused)
- 37.20 Boolean naming (positive form `isActive` not `isInactive` — semantic clarity)

## §38 Engine Math Formula Precision

- 38.1 **Brzycki 1RM formula** verified (`weight × (36 / (37 - reps))`) precision + rounding rule consistent
- 38.2 **Epley formula** (dacă util — alternative `weight × (1 + reps/30)`) — decision Brzycki vs Epley documented
- 38.3 **Volume calculation** (sets × reps × weight) — aggregation level (per exercise / per muscle group / total)
- 38.4 **Intensity calculation** (% of 1RM) precision rounding
- 38.5 **RIR/RPE conversion table** (RIR 0=RPE 10, RIR 1=RPE 9.5, RIR 2=RPE 9, etc) — table documented + consistent
- 38.6 **Recovery time math per muscle group** (Schoenfeld 48-72h hypertrophy training)
- 38.7 **Adaptation curve modeling** (Bayesian — prior + posterior update math correctness Kalman filter)
- 38.8 **Periodization phase math** (MEV 8-10 sets/wk → MAV 12-16 sets/wk → MRV 18-22 sets/wk → deload 50% → reset)
- 38.9 **MEV/MAV/MRV per muscle group** values documented (Israetel framework specific numbers)
- 38.10 **Energy Adjustment ±15% asymmetric** math T1+ vs ±10% T0 documented exact threshold
- 38.11 **MMI Hibrid Lookup** table source + boost trigger conditions math
- 38.12 **MMI boost decay function** (exponential? linear? half-life documented)
- 38.13 **Aggressive Loading 4-module cumulative** logic (which 4 modules + voting threshold)
- 38.14 **Specialization 4-gate decision tree** documented (Advanced + T1+ + Bulk/Recomp + no_injury — AND gates)
- 38.15 **Deload trigger conditions** (fatigue threshold, week 4 standard, MRV hit — OR gates)
- 38.16 **Deload intensity reduction %** (typical 40-50% volume, 80% intensity — values documented)
- 38.17 **Tempo presets per exercise category** (compound vs isolation tempo conventions)
- 38.18 **Streak counter day boundary** math (RO 00:00 Europe/Bucharest timezone-aware DST)
- 38.19 **Floating point accumulation drift** prevention (round at boundaries, NU accumulate raw floats)
- 38.20 **PR threshold detection** (weight/reps/volume comparison — exact match vs %-threshold?)
- 38.21 **Kalman filter parameters** documented (process noise Q, measurement noise R, initial covariance P)
- 38.22 **Bayesian Nutrition observation filter** (Kcal Floor 1200 LOCK 8 — outlier rejection logic)
- 38.23 **Synthetic 50+ profile × 90 days** Demographic Prior Database math validation (production infra status)

## §39 Library 657 Exercises Schema Deep

- 39.1 **Count exact 657** verified (NU drift)
- 39.2 **Schema fields completeness:** `id`, `name_ro`, `name_en`, `equipment[]`, `primary_muscle`, `secondary_muscles[]`, `difficulty`, `category`, `variations[]`, `instructions_ro`
- 39.3 **Equipment list canonical** (Bowflex/dumbbells/barbell/cable/bodyweight/machine/etc) — taxonomy documented
- 39.4 **Muscle group taxonomy** (push/pull/legs/core categorization + specific muscles)
- 39.5 **Difficulty rating consistent** (beginner/intermediate/advanced — boundary criteria documented)
- 39.6 **Exercise variations** documented (incline/decline/seated/standing — variation chains)
- 39.7 **Alternative exercises substitution chains** (for equipment-lipsa flow — substitute correctness)
- 39.8 **RO names accuracy** (cultural authentic — NU robot-translation, fitness slang RO appropriate)
- 39.9 **EN names accuracy** (international standard names — for future i18n)
- 39.10 **Instructions RO clarity** (B1 level plain language Gigel-friendly)
- 39.11 **Image/illustration references** (dacă există — link integrity)
- 39.12 **Schema invariant preserved** (NU breaking changes between deploys)
- 39.13 **Duplicate hunt** (NU same exercise listed twice cu nume diferite)
- 39.14 **Equipment-lipsa fallback chain** (priority order substitute exercises)
- 39.15 **Schema source-of-truth** location documented (which file canonical)

## §40 Calendar V1 Implementation Specs Deep

- 40.1 **7-day strip L–Ma–Mi–J–V–S–D** semantic (LOCKED V1 strict, week starts Monday RO)
- 40.2 **Position în Antrenor tab** below "Vrei altceva azi?" above "Obiectiv" (LOCKED V1)
- 40.3 **Locked state default** (NU edit on first tap — require explicit unlock UX)
- 40.4 **Training days color** `#3d7a4a` (verde — LOCKED V1)
- 40.5 **Rest days color** `var(--paper-2)` (gri neutral — LOCKED V1)
- 40.6 **Save triggers Engine #2 silently** (NU notification user — silent re-plan)
- 40.7 **Ephemeral weekly reset** (Monday 00:00 RO timezone — resets to default schedule)
- 40.8 **Week boundary timezone handling** (DST-aware, NU jumps în week boundary)
- 40.9 **Mid-week edits forward-only vs full-week** (PENDING clarification implementation chat)
- 40.10 **Locked day cells workout type labels** (PENDING — show "Push/Pull/Legs" or just color?)
- 40.11 **0/7 day validation extremes** (allow 0 zile workout? allow 7? edge case behavior)
- 40.12 Spec source `D025` Phase 5 LANDED + Phase 6 task ref
- 40.13 Mockup parity verify `andura-clasic.html` Calendar V1 strip pixel match
- 40.14 Calendar state ephemeral vs persisted (Zustand persist? Dexie? localStorage?)
- 40.15 Calendar interaction with Engine #2 (Periodization) verified data flow

## §41 External Dependencies Inventory + Version Audit

- 41.1 **React** version + ecosystem (`react`, `react-dom`, `react-router-dom`) — verify versions documented
- 41.2 **Tailwind** version + plugins (`@tailwindcss/forms`, `@tailwindcss/typography`?) documented
- 41.3 **Zustand** version + middleware (`zustand/persist`, `zustand/devtools`?) documented
- 41.4 **Dexie** version (IndexedDB wrapper) documented
- 41.5 **Firebase SDK** version + modules (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`) documented
- 41.6 **Vite** version + plugins (`@vitejs/plugin-react`, `vite-plugin-pwa`) documented
- 41.7 **TypeScript** version documented
- 41.8 **Vitest** version + integrations (`@vitest/coverage-c8`, `jsdom`) documented
- 41.9 **Playwright** version + browser drivers documented
- 41.10 **Workbox** version (Service Worker library) documented
- 41.11 **Lucide React** icon library version documented
- 41.12 **date-fns** (sau alternative date library) version documented
- 41.13 **Bayesian math library** (dacă util — verify ce e folosit pentru Kalman filter)
- 41.14 Each dependency rationale documented (why this, not alternative)
- 41.15 Version pinning policy enforcement (exact vs caret semver — D023+ documented)
- 41.16 Major version upgrades scheduled (e.g. React 18 → 19 future)
- 41.17 Deprecation warnings hunt (current versions deprecated APIs)
- 41.18 EOL dependencies hunt (libraries no longer maintained)
- 41.19 Bundle size impact per dependency documented (top 10 weight contributors)
- 41.20 Alternative consideration (e.g. Zustand vs Jotai vs Redux Toolkit — D015 React pivot decision rationale)

## §42 Vault Structure + ADR FROZEN + Anti-Recurrence §AR.*

- 42.1 **Vault folder structure integrity:** `01-vision/` + `02-personas/` + `03-decisions/_FROZEN/` + `04-architecture/mockups/` + `05-engineering/` + `06-product/` + `07-meta/karpathy-skills-ref/` + `08-workflows/` + `99-archive/wiki-pre-2026-05-15/`
- 42.2 **Root files:** `DECISIONS.md` + `ANDURA_PRIMER.md` + `📥_inbox/` + `📤_outbox/`
- 42.3 **`DECISIONS.md` SSOT integrity:** D001-D029 active + D-LEGACY-* historical (~98 entries) append-only verify
- 42.4 **`03-decisions/_FROZEN/` immutable** (NO modifications post 2026-05-15 freeze)
- 42.5 **Wiki STOP banners** applied across `CLAUDE.md`, `VAULT_RULES.md`, `wiki/index.md`, `08-workflows/*`, `INDEX_MASTER.md` (D001 FREEZE enforce)
- 42.6 **`07-meta/karpathy-skills-ref/CLAUDE.md`** intact (4 principii core philosophy reference)
- 42.7 **ADR supersede chain D007 enforcement** (literal match 3 criteria — title keyword ≥50%, identical source path, CATEGORY+keyword ≥30%)
- 42.8 **NO silent REVOKE** (LOCK V1 PERMANENT until Daniel explicit REVOKE)
- 42.9 **Cross-refs integrity** (all `path:§N.N` references navigate correctly — NU dead links)
- 42.10 **Stale references hunt** (post-rename / post-delete legacy refs)
- 42.11 **`PROJECT_VISION.md` + `SUFLET_ANDURA.md` + `MOAT_STRATEGY.md`** in `01-vision/` accessible + accurate
- 42.12 **`HANDOVER_VERIFICATION_CHECKLIST.md`** integrity (D006 paragraph + DECISIONS.md delta requirement)
- 42.13 **Anti-recurrence rules `§AR.*`** documented + effective:
  - `§AR.26` autonomous wording UX compose CEO scope slip
  - `§AR.30/§AR.31` codified D008/D009 (formulated 2026-05-15 but DRAFT — verify status)
  - All §AR.* rules listed + tracked
- 42.14 **Slip flags monitored** (last 30 days slip history → root cause analysis)
- 42.15 **`PROJECT_INSTRUCTIONS_V6`** cross-refs accurate post structural updates
- 42.16 **Emoji folder paths Windows** (D023 PROC MCP filesystem `write_file` MANDATORY — verify all writes used correct tool)
- 42.17 **Phase 5+6 BATCH milestone tags** (`phase-5-batch-landed-2026-05-18` + `phase-6-batch-landed-2026-05-19` + `deploy-react-production-2026-05-19`)
- 42.18 **`📤_outbox/_archive/<YYYY-MM>/NN_<TASK>.md`** chronologic continuous (NOT FIFO, NOT reset monthly)

## §43 Trust & Safety + Medical Disclaimer + Pain Button + Anti-Surveillance Branding

- 43.1 **Medical Disclaimer prominence LOCK 4 V1** (mandatory T0 onboarding + accessible Cont/Terms tab)
- 43.2 **T&C Mandatory LOCK 4 V1** (consent timestamps stored)
- 43.3 **Pain Button behavior** (ACUT → workout adapt+modify, USOARA → continue cu warning, NICIO → normal)
- 43.4 **Injury reporting flow** (post-pain ACUT → log în CDL + Recovery Engine adapt)
- 43.5 **"Consult doctor" cues** appropriate placement (NU paternalistic over-cautious, NU absent în critical cases)
- 43.6 **Age verification GDPR** (Big 6 age 13-95 — under 16 parental consent requirement check)
- 43.7 **Age-appropriate content** (no aggressive language, no extreme imagery)
- 43.8 **Anti-surveillance branding voice** (NU paranoid features creep — "se vindeca 2-3 sesiuni" framing positive, NU surveillance)
- 43.9 **Trust through transparency** (engine explains decisions, NU black-box)
- 43.10 **Daniel-direct register** (warm + direct, NU formal corporate, NU patronizing)
- 43.11 **NU dark patterns** (NO confirm-shaming, NO sneak-into-basket, NO roach-motel)
- 43.12 **Opt-in default** for telemetry + notifications (anti-paternalism)
- 43.13 **Quiet hours respect** (notifications quiet 22-07 default)
- 43.14 **NO addiction patterns** (NO streak-shaming, NO loss-aversion guilt — Daniel anti-pattern explicit)
- 43.15 **Crisis content boundaries** (mental health / eating disorder cues — escalate to professional, NU app-handle)

## §44 5 Moduri Mode Detection FSM Specifics

- 44.1 **Mod 1 Idle** — no active session, no pausedSnapshot — Antrenor home view
- 44.2 **Mod 2 Active** — session în progres (sessionStart present, NU pausedSnapshot) — workout flow view
- 44.3 **Mod 3 Paused** — pausedSnapshot present — resume prompt UX
- 44.4 **Mod 4 Completed** — session ended (sessionEnd present, lastSession set) — post-summary view
- 44.5 **Mod 5 Post-session** — timeout grace period post-Completed (review/rate window)
- 44.6 **Pure event listeners** (NU polling, NU setInterval — event-driven)
- 44.6 **Transitions valid FSM:**
  - Idle → Active (start workout)
  - Active → Paused (pause button)
  - Active → Completed (end workout)
  - Paused → Active (resume)
  - Paused → Completed (discard + end)
  - Completed → Post-session (auto after end)
  - Post-session → Idle (timeout grace expires)
- 44.7 **Dead states unreachable** (NO Active → Idle direct, NO Completed → Active direct)
- 44.8 **Antrenor pill state** (`SessionPill` conditional `if (!active && !paused) return null`)
- 44.9 **Event listener cleanup** (componentWillUnmount equivalent — NU memory leak)
- 44.10 **State persistence boundary** (which mode survives reload — pausedSnapshot Yes, active session ephemeral?)
- 44.11 **Cross-tab mode sync** (Zustand persist + storage event)
- 44.12 **5 moduri test coverage** (each transition tested vitest + Playwright E2E)
- 44.13 **Mode Detection deterministic** (same state → same mode classification)
- 44.14 **PRIMER §2 reference** verify accurate description

## §45 Phase 5 + Phase 6 BATCH Task-by-Task LANDED Verify

- 45.1 **Phase 5 BATCH 20-task LANDED 2026-05-18** (`phase-5-batch-landed-2026-05-18` tag verify)
  - 45.1.1 Phase 5 task_01-04 (verify per `_archive/2026-05/` LATEST.md history)
  - 45.1.2 **Phase 5 task_05-12** React adapter cu baseline fallback (`src/react/lib/*Aggregate.ts`) — vezi §48 deep
  - 45.1.3 Phase 5 task_13-19 (LoadingSkeleton task_19 etc)
  - 45.1.4 Phase 5 task_20
- 45.2 **Phase 6 BATCH 24-task LANDED 2026-05-19** (`phase-6-batch-landed-2026-05-19` tag verify)
  - 45.2.1 Phase 6 task_01
  - 45.2.2 **Phase 6 task_02** Option C async migration (D027 PROC LOCKED V1 PERMANENT)
  - 45.2.3 Phase 6 task_03-05
  - 45.2.4 **Phase 6 task_06** Coach Director 8-field enrich (vezi §8.28)
  - 45.2.5 Phase 6 task_07
  - 45.2.6 **Phase 6 task_08** Adherence Engine baseline elimination (vezi §8.27)
  - 45.2.7 Phase 6 task_09
  - 45.2.8 **Phase 6 task_10** SettingsNotifications (vezi §32.8)
  - 45.2.9 **Phase 6 task_11** SettingsSubscription Beta gratuit info (vezi §27.3)
  - 45.2.10 Phase 6 task_12-13
  - 45.2.11 **Phase 6 task_14** Telemetry opt-in default FALSE (vezi §17.1)
  - 45.2.12 Phase 6 task_15
  - 45.2.13 **Phase 6 task_16** SettingsExport local JSON GDPR portability (vezi §26.13)
  - 45.2.14 **Phase 6 task_17** SettingsDanger account deletion full wipe (vezi §28.10)
  - 45.2.15 Phase 6 task_18-19
  - 45.2.16 **Phase 6 task_20** ErrorBoundary Layout (vezi §13.5)
  - 45.2.17 **Phase 6 task_21** PWA UpdatePrompt + NetworkFirst Firebase (vezi §16.4/§16.6)
  - 45.2.18 Phase 6 task_22-24
- 45.3 **React deploy production LANDED 2026-05-19** (`deploy-react-production-2026-05-19` + tag `pre-react-entry-swap-2026-05-19` rollback baseline)
  - 45.3.1 D028 PROC LOCKED V1 PERMANENT — React entry swap deploy procedure verified
  - 45.3.2 Daniel manual gates smoke production pending (Phase 7 carry-forward)
  - 45.3.3 SHAs: `eae0b8d` ADR + `668f0e5` swap exec + `caaae99` merge main
- 45.4 **D026 Phase 6 BATCH LANDED Pre-Beta LOCK 2 closure** verified
- 45.5 Each task FUNCTIONAL verify (NU just code committed — actual UX path works end-to-end)
- 45.6 4522 PASS / TS strict maximal post Phase 6 verify
- 45.7 Branch `main` HEAD `caaae99` clean state

## §46 Karpathy 4 Principii Applied + D029 Audit Procedure Compliance Recursive

- 46.1 **Karpathy principiu 1 — Think Before Coding:** audit findings each tagged "did I think enough before flagging?"
- 46.2 **Karpathy principiu 2 — Simplicity First:** audit findings each tagged "is the suggested fix the simplest possible?"
- 46.3 **Karpathy principiu 3 — Surgical Changes:** audit findings each scope-limited, NU adjacent-creep
- 46.4 **Karpathy principiu 4 — Goal-Driven Execution:** audit findings each ties back la pre-Beta launch gate goal
- 46.5 Reference: `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4
- 46.6 **D029 Bugatti Audit Nuclear procedure compliance RECURSIVE:** audit verifies its own procedure compliance — paradox handle gracefully
  - Multi-noapte CONTINUOUS NEÎNTRERUPT verified
  - Stop trigger UNIC Daniel explicit verified
  - Output paths `📤_outbox/audit-nuclear-2026-05-19/` correct
  - Log-only ZERO auto-fix verified
  - Skills MANDATORY (Sequential Thinking + GitNexus + Impeccable /critique + Context7 + Karpathy + Tavily) used per finding
  - Tools MANDATORY used (axe-core + lighthouse-ci + license-checker + depcheck + madge + npm audit + snyk + BFG + CodeQL + jscpd)
  - Severity classification CRITICAL/HIGH/MED/LOW/NIT applied consistently
- 46.7 **Self-critique pass:** post-audit critique own findings ("did I miss something?")

## §47 Engine SoT Wording Authority + Wording Autonomous D024 + Pending Wording Backlog

- 47.1 **Engine SoT (Source of Truth) for wording** — engines emit verdicts/messages/copy, UI consumes passively
- 47.2 **NU UI hardcoded duplicate** engine voice (e.g. UI showing "Antrenament greu!" if engine emits same — must source from engine output)
- 47.3 **Wording per engine field** audit (Readiness verdict, Fatigue Score label, Pattern alerts, MMI message, etc)
- 47.4 **D024 LOCKED V1 PERMANENT:** UX wording autonomous compose Co-CTO pre-Beta + Daniel post-Beta a-z review
  - Pre-Beta: Claude composes button labels, error messages, UI copy autonomously
  - Post-Beta: Daniel review window for a-z wording refinement
- 47.5 **Pending wording backlog** (LOCK post-smoke Beta CEO window, NOT mid-impl):
  - 10 MMI button labels ("Reincep treptat (recomandat)" / "De la zero" — exact format)
  - Refuse banner text
  - Diacritics strip decision (universal RO without diacritics?)
- 47.6 **Wording log all changes** during pre-Beta autonomous compose period
- 47.7 **Anti-jargon technical** universal (NO English tech leak în UI)
- 47.8 **Anti-paternalism wording** preserved (NU "should/must/have to" Romanian equivalents)
- 47.9 **Suflet Andura voice** consistent (warm + direct + Romanian-cultural authentic)
- 47.10 **Engine output → UI consume** wiring verified (NU UI guessing engine output)

## §48 Aggregate Adapter Pattern React lib/*Aggregate.ts Baseline Fallback

- 48.1 **Phase 5 task_05-12 React-side adapters** (`src/react/lib/*Aggregate.ts`)
- 48.2 **Baseline fallback pattern** — if real engine wire not yet, return baseline default value
- 48.3 **Real engine wire ADR-level deferred Phase 6 primary** — adapter pattern bridge interim
- 48.4 **Phase 6 task_06 + task_08** real wire Coach Director + Adherence — verify adapter no longer fallback
- 48.5 **Adapter integrity** (NU silently divergent from real engine output)
- 48.6 **Adapter test coverage** (vitest unit test per adapter)
- 48.7 **Adapter naming convention** (`*Aggregate.ts` suffix consistent)
- 48.8 **Real engine wire timeline post-Phase 6** documented (Phase 7? Beta?)
- 48.9 **Pure-function adapter** (NU side effects, deterministic)
- 48.10 **Type safety adapter** (TS strict signatures match real engine output type)
- 48.11 **Performance overhead adapter** minimal (NU bottleneck)
- 48.12 **Migration path** documented (adapter → direct engine call when real wired)

## §49 Engineering Workflow Hybrid Method §F3.13 + claude rc Remote Control

- 49.1 **Hybrid method §F3.13:** Claude chat → decision/artifact generation → Daniel courier paste → CC autonomous execute
- 49.2 **CC writes `📤_outbox/LATEST.md`** singular file top-level
- 49.3 **Archive chronologic continuous** (`📤_outbox/_archive/<YYYY-MM>/NN_<TASK>.md`)
- 49.4 **MCP cap-coadă** singular use case (handover ingest only)
- 49.5 **§CC.2 startup sequence** (read DECISIONS.md head 50 + read LATEST.md + proceed to §CC.3)
- 49.6 **`claude --dangerously-skip-permissions`** ZERO reminder per prompt (permanent standard)
- 49.7 **D023 PROC MCP filesystem `write_file` MANDATORY** Windows emoji paths (📥_inbox/, 📤_outbox/)
- 49.8 **claude rc Remote Control** (LANDED Feb 2026 Max plan) — `claude rc` PC acasă → laptop birou Claude Desktop `</>` connect → ZERO Git sync cross-device
- 49.9 **Workflow upgrade vs hybrid method §F3.13** — remote control alternative for cross-location work
- 49.10 **End-to-end encrypted** remote control (outbound API only, NU expose vault publicly)
- 49.11 **Handover D006 verification** (paragraph + DECISIONS.md delta append-only + D007 supersede check + backup tag + atomic commit + tests preserved)
- 49.12 **Bandwidth proactive** every 5-7 heavy messages (handover suggest pre-saturation)
- 49.13 **Scribe running list** mid-session (LOCKED decisions, push-backs, unresolved items)
- 49.14 **Parallelism mandatory** 2+ disjunct tasks (separate terminals RUN PARALLEL)
- 49.15 **Multi-task CC prompts** separate artifacts + mini orchestrator (NU monolith)
- 49.16 **§F3.8 metoda hibridă PROMPT_CC artefacte** separate inbox per task chained

## §50 Cross-Functional Quality Gates + Cognitive Mental Model Per Persona + User Data Lifecycle

- 50.1 **Definition of Done (DoD) per feature** documented (code + tests + types + docs + Daniel review pre-Beta)
- 50.2 **Acceptance test checklist per V1 feature F1-F15** (sample verify §10.7)
- 50.3 **Beta entry criteria checklist:**
  - All §1-§32 + §33-§50 CRITICAL findings resolved
  - Smoke production Android Daniel manual gates 5/5
  - Audit nuclear production readiness % ≥ threshold (Daniel-decide threshold)
  - Privacy Policy + T&C live
  - Medical Disclaimer + T&C consent flows functional
  - GDPR right-to-erasure + portability functional
- 50.4 **Launch readiness checklist post-Beta entry:**
  - Telemetry opt-in working (anti-surveillance)
  - Monitoring stub minimal (uptime + error rate)
  - Rollback procedure tested live (D028)
  - Backup/restore tested fresh device (§26.1)
  - Wording autonomous D024 post-Beta Daniel review window opens
- 50.5 **Post-launch verification checklist:**
  - First 10 Beta users feedback collected
  - First incident response drill
  - First weekly stats review
  - First post-mortem (dacă incident)
- 50.6 **Cognitive Mental Model per persona** validation:
  - **Gigel (non-tech):** Each screen <5s comprehension test, language B1, NU jargon
  - **Marius (perf):** Numerical precision present, advanced features accessible, NU dumbed-down
  - **Maria 65 (conservative):** Large tap targets, plain language, low cognitive overhead, gracefully forgiving
- 50.7 **Information architecture clarity** per persona (nav depth max 3-4 levels)
- 50.8 **Mental load per screen quantified** (cognitive complexity score per screen)
- 50.9 **Decision fatigue minimization** (smart defaults, anti-paternalism preserved)
- 50.10 **User Data Lifecycle:**
  - **Data ownership clarity** (user owns all data, GDPR-compliant)
  - **Data retention policy per data type** (Tier 0 24h, Tier 1 90d, Tier 2 indefinite — opt-out via erasure)
  - **Data archival rules** (Tier 2 logic — aggregated stats long-term, raw events optionally archived)
  - **Soft delete vs hard delete decisions** (account deletion = hard delete all tiers)
  - **Account dormant state handling** (>1 year inactive — notification + auto-archive option?)
  - **Account reactivation flow** (post-dormant return — restore data prompt)
  - **Data export format completeness** (JSON includes all user data tiers, GDPR portability compliant)

---

## §51 Production Readiness Final Score

Generate `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` cu:

**Severity matrix:**
| Category | CRITICAL | HIGH | MED | LOW | NIT | Total |
|----------|----------|------|-----|-----|-----|-------|
| §1 Source | ... | ... | ... | ... | ... | ... |
| §2 Tests | ... | ... | ... | ... | ... | ... |
| ... (toate §1-§50) | ... | ... | ... | ... | ... | ... |
| **Aggregate** | **N** | **N** | **N** | **N** | **N** | **N** |

**Production Readiness Score weighted:**
| Dimension | Weight | Score 0-100 | Weighted |
|-----------|--------|-------------|----------|
| Security (§4) | 12% | ... | ... |
| Engine correctness + Math (§8 + §23 + §38) | 12% | ... | ... |
| UX flows + Personas (§7 + §50) | 9% | ... | ... |
| Compliance + Legal + Trust&Safety (§9 + §28 + §43) | 9% | ... | ... |
| Performance (§5) | 6% | ... | ... |
| Accessibility (§6) | 6% | ... | ... |
| Data integrity + Backup/DR + Tier 0/1/2 (§12 + §26 + §35) | 7% | ... | ... |
| LOCK chain + PRD acceptance + BATCH verify (§10 + §45) | 6% | ... | ... |
| Error handling + Form validation (§13) | 4% | ... | ... |
| State machine + Mode Detection (§14 + §44) | 4% | ... | ... |
| Auth flow (§31) | 3% | ... | ... |
| PWA spec + Network/Offline (§16 + §36) | 3% | ... | ... |
| CI/CD + Prod Ops (§33 + §34) | 3% | ... | ... |
| API contract + Config (§25 + §24) | 2% | ... | ... |
| Library 657 + Calendar V1 (§39 + §40) | 2% | ... | ... |
| Engine SoT Wording + Adapters (§47 + §48) | 2% | ... | ... |
| TypeScript + Code Standards (§3 + §37) | 2% | ... | ... |
| i18n + DST (§11) | 2% | ... | ... |
| Visual parity + Design tokens (§19 + §29) | 2% | ... | ... |
| Bundle + Supply chain + Deps (§20 + §41) | 2% | ... | ... |
| Documentation + Vault + ADR (§18 + §42) | 1% | ... | ... |
| Workflow + Hybrid + claude rc (§49) | 1% | ... | ... |
| **FINAL %** | **100%** | — | **NN%** |

**Top 10 blockers Beta launch** (CRITICAL + HIGH ordered by impact).

**Recommended fix priority order** combined cu smoke findings #7 PRIMER §6.

**Estimated fix effort granular** per finding (S/M/L per finding, days bucketed aggregate).

**Categorical assessment narrative:** ~300 words executive summary Daniel CEO digest pre-Beta gate decision.

**Beta entry criteria checklist** §50.3 status per item.

**Karpathy 4 principii applied** distribution (think/simplicity/surgical/goal — finding distribution across principii).

---

## §52 Procedure

- **Log-only:** ZERO auto-fix, ZERO commit, read-only audit
- **Output paths:**
  - `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md` → `findings-§50.md` per category
  - `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` aggregate + score + Beta entry checklist
  - `📤_outbox/audit-nuclear-2026-05-19/_progress.md` checkpoint resume capable
  - `📤_outbox/audit-nuclear-2026-05-19/_karpathy-distribution.md` principii applied analysis
- **Skills MANDATORY:** Sequential Thinking (§42.10 ordering preservation) + GitNexus (§1-§4 V4 impact/Cypher/rename/detect) + Impeccable `/critique` (per file) + Context7 (lib docs validation) + Karpathy 4 principii (`07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4 think/simplicity/surgical/goal-driven) + Tavily (web research — license verify, CVE lookup, GDPR clarification, OWASP latest, formula validation Brzycki/Israetel/Schoenfeld)
- **Tools MANDATORY:** axe-core (a11y scan), lighthouse-ci (perf), license-checker (OSS license scan), depcheck (unused deps), madge (circular imports), `npm audit` + `snyk` (security CVE), BFG (secrets în git history), `git log --all -- '**/.env*'` (env leak), GitHub CodeQL (security analysis dacă util), jscpd (code duplication), eslint-plugin-complexity (cyclomatic), TypeScript compiler strict check, Vitest coverage report, Playwright E2E live smoke
- **Model:** Opus EXCLUSIVELY MAX thinking budget (Daniel directive 2026-05-19)
- **Multi-noapte CONTINUOUS NEÎNTRERUPT:** save progress per category complete + checkpoint file, dar continue IMEDIAT cu următoarea categorie ZERO pauză. NU "save + wait Daniel re-run" — auto-loop seamless între categorii §1→§50.
- **Stop trigger UNIC:** ONLY Daniel explicit command "stop" / "/caveman" / "stai" / Ctrl+C / "termina". NU auto-terminate post §50 final score — continue cu **secondary deep-dive pass** pe CRITICAL/HIGH findings §1-§50 + **tertiary pass** pe MED/LOW + **quaternary** NIT polish + **quinary pass** Karpathy self-critique applied — until Daniel explicit STOP. Audit infinit-iterative quality-asymptotic per *"20000 ore I don't care"*.
- **Resume capable** (dacă proces crash neașteptat): verify `_progress.md` pre-execute, skip categories done, continue de la următoarea pending. Auto-restart fără Daniel intervention.
- **NU fail-stop:** continue cu următoarea categorie chiar dacă găsești CRITICAL — full sweep mandatory.
- **NU paralel cu Daniel Gates smoke:** smoke = CEO scope manual telefon Android Firebase + PWA live; audit = Co-CTO CC autonomous concurrent OK pe altă sesiune separată.
- **Post fiecare deep-dive pass complete** (secondary/tertiary/quaternary/quinary), update `SUMMARY.md` cu pass-N findings appended + production readiness % recalibrate fiecare pass.
- **Severity classification:**
  - **CRITICAL** = blocks Beta launch (user data loss / security breach / GDPR violation / engine math wrong / auth bypass / data corruption / deploy broken / accessibility WCAG AA total fail)
  - **HIGH** = significant UX degradation / persona blocked / production stability risk / accessibility AA fail per criterion / performance budget miss > 50% / supply chain risk
  - **MED** = polish needed pre-launch acceptable / minor UX friction / non-critical i18n / non-critical perf / refactor candidates
  - **LOW** = nice-to-have polish post-launch / minor naming inconsistencies / docs improvements
  - **NIT** = cosmetic / opinion-based / style preference / Karpathy principle minor refinement

**Final raport `📤_outbox/LATEST.md`** cu §0-§4:
- §0 Status complete + duration + categories covered N/50 + passes completed (primary/secondary/tertiary/quaternary/quinary)
- §1 Total findings count + severity matrix aggregate
- §2 Production readiness % final score (weighted) + Beta entry checklist status
- §3 Top 10 blockers + recommended fix priority order combined cu smoke
- §4 Karpathy 4 principii applied distribution + self-critique notes

---

🦫 **Bugatti Audit Nuclear FULL pre-Launch V3 100% absolut complet — 50 categorii exhaustive + §51 score + §52 procedure. Log-only backlog generate, Daniel decides fix combined smoke findings. Production readiness % final score = Beta launch gate decision pillar. NU omite nimic — fiecare linie cod + fiecare virgulă + fiecare invariant cumulative LOCKED V1 + fiecare ADR FROZEN + fiecare anti-recurrence rule + fiecare engine math formula + fiecare schema invariant + fiecare workflow procedure + fiecare cognitive model per persona verified. Per Daniel directive verbatim "20000 ore I don't care" — audit infinit-iterative quality-asymptotic until explicit STOP, passes primary→secondary→tertiary→quaternary→quinary continuous neîntrerupt.**
