# PROMPT_CC — Bugatti Audit Nuclear FULL pre-Launch (Absolut Complete)

**Date generated:** 2026-05-19
**Authority:** Daniel CEO directive verbatim *"FULL AUDIT. Fiecare linie de cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"* + *"absolut full"* 2026-05-19 chat Co-CTO ACASĂ
**Scope:** ALL on HEAD `main` post `deploy-react-production-2026-05-19` tag (post Phase 6 BATCH 24-task LANDED + deploy production live `andura.app`)
**Procedure:** Log-only backlog generate, ZERO auto-fix, ZERO commit (Daniel decides fix combined smoke #7 per PRIMER §6)
**Output:** `📤_outbox/audit-nuclear-2026-05-19/findings-§N.md` per category + `SUMMARY.md` aggregate severity matrix + production readiness % final score
**Model:** Opus EXCLUSIVELY MAX thinking budget
**Multi-noapte:** OK — checkpoint file `_progress.md` resume capable

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

## §2 Test Files Audit (251 files)

- 2.1 Coverage gap detection (branches/edge cases missing)
- 2.2 Assert quality real invariant verify (NU smoke-only)
- 2.3 Mock fidelity NU over-mock obscuring bugs
- 2.4 Flake risk patterns (Date.now / Math.random / timing-dependent)
- 2.5 Test data fixtures realistic NU synthetic divorced reality
- 2.6 E2E Playwright disclaimer dismiss helper backlog (23 fails LOCK 4 regression per D019)
- 2.7 Vitest jsdom vs Playwright E2E coverage split appropriate
- 2.8 Vitest config `testTimeout` + `hookTimeout` reasonable

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

## §4 Security Audit

- 4.1 XSS injection vectors (`innerHTML` / `dangerouslySetInnerHTML` hunt)
- 4.2 Firebase rules production-grade enforcement (Firestore + Storage + Auth)
- 4.3 Auth Magic Link flow vulnerabilities (token leak, replay attack, expiry handling)
- 4.4 OAuth Firebase Phase 3 state (PENDING per PRIMER §3 — verify NU partial wired exposing surface)
- 4.5 localStorage/IndexedDB exposure sensitive data (Big 6 personal)
- 4.6 CSP headers Content Security Policy enforcement
- 4.7 Service Worker scope + cache invalidation strategy
- 4.8 Dependency vulnerabilities `npm audit` + `snyk` scan
- 4.9 Bundle inspection secrets/env leak production build
- 4.10 Cross-tab session sync race conditions
- 4.11 IndexedDB quota handling overflow strategy
- 4.12 Encryption at rest considerations (sensitive personal data)
- 4.13 CDL append-only tamper-proof verify (ADR 011 invariant)
- 4.14 GDPR right-to-erasure complete data wipe verify (SettingsDanger LANDED Phase 6 task_17)
- 4.15 k-anonymity k=5 minim validation enforcement (ADR 019)
- 4.16 Magic Link rate limiting / abuse protection

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

## §6 Accessibility Audit (WCAG 2.1 AA)

- 6.1 WCAG 2.1 AA compliance comprehensive
- 6.2 Keyboard nav full app (Tab + Enter + Esc + Space)
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

## §9 Compliance Audit

- 9.1 Anti-paternalism ABSOLUTE (force-typing ELIMINATED ADR 013 §AMENDED hunt)
- 9.2 NO_DIACRITICS_RULE UI/tests/mockups: `grep -E "[ăâîșțĂÂÎȘȚ]" src/react/` zero hits
- 9.3 Wording autonomous compose D024 V1 review (post-Beta a-z Daniel scope, log all)
- 9.4 Romanian-first cultural specific (idiom, register, no stiff calque English)
- 9.5 Mobile-first 380px target preserved
- 9.6 4-tab nav LOCK V1 preserved (NU 6 taburi vanilla creep)
- 9.7 Engine SoT wording (NU UI hardcoded duplicate engine voice)
- 9.8 Library 657 ex schema integrity (names, equipment, muscle groups, RO names)
- 9.9 LOCK 4 Medical Disclaimer + T&C Mandatory wired functional
- 9.10 LOCK 8 Kcal Floor 1200 BN observation filter wired functional
- 9.11 Anti-surveillance branding voice (NU paranoid features creep)
- 9.12 F5 AA-Friction Modal V2-deferred DROP V1 verify absent
- 9.13 F13 Rating Notes Anti-RE rule DROP V1 verify absent (free-text abuse)
- 9.14 Anti-RE rule free-text Daniel verbat compliance

## §10 LOCK V1 Chain-of-Trust Audit

- 10.1 `DECISIONS.md` D001-D028 ↔ source code match verify each
- 10.2 ~742 cumulative LOCKED V1 sample critical decisions verify (NU exhaustive — sample 30 critical cross-cluster)
- 10.3 ZERO REVOKE silent (anti-recurrence rules §AR.* respect)
- 10.4 Authority citation tags D-LEGACY-* historical reference accurate
- 10.5 15 audit-driven V1 features spec ↔ implementation parity:
  - KEEP verbatim: F2 Last Session Memory + F4 Readiness Verdict + F6 PR Wall + F7 Coach Director + F8 Streak Counter + F10 Stats Grid 3-cell + F11 PRs Notification + F12 Rating Buttons 3-button + F15 Per-set RPE + Mode Detection
  - MODIFY simplified: F1 Patterns Banner 2 keep + F3 Fatigue Score single + F9 BMR Strip single line + F14 Ratings Window 90 sessions
  - DROP V1: F5 AA-Friction Modal V2-deferred + F13 Rating Notes Anti-RE absent
- 10.6 Wording autonomous D024 LOCKED V1 PERMANENT preserved (post-Beta Daniel scope)

## §11 i18n / Localization Audit

- 11.1 Date format `dd.MM.yyyy` Romanian convention
- 11.2 Decimal separator (virgulă RO vs punct EN)
- 11.3 Weekday names L/Ma/Mi/J/V/S/D LOCKED V1 strict
- 11.4 Currency RON dacă apare
- 11.5 Number formatting locale-aware (`Intl.NumberFormat('ro-RO')`)
- 11.6 Time format 24h Romanian standard
- 11.7 Timezone handling Europe/Bucharest implicit/explicit

## §12 Data Integrity / Migration Audit

- 12.1 Dexie schema versions migration scripts safe (ADR migration chain)
- 12.2 Three-tier log Tier 0/1/2 transitions correct (active → rolling → archive)
- 12.3 IndexedDB quota handling overflow strategy
- 12.4 Backup integrity Firebase tier (sync correctness)
- 12.5 Rollback safety (migration fail recovery)
- 12.6 Tier 0 `wv2-*` localStorage keys NU breaking change verify
- 12.7 Schema 657 exercises invariant preserved
- 12.8 Cross-tab IndexedDB lock handling

## §13 Error Handling Cross-Cutting Audit

- 13.1 Async path fiecare defensive (Firebase write fail, IndexedDB quota, network timeout, JSON parse fail)
- 13.2 Toast UX la fail (consistent pattern app-wide)
- 13.3 Retry strategy network failures (exponential backoff)
- 13.4 Graceful degradation offline (Service Worker NetworkFirst Firebase)
- 13.5 Error boundary `Layout` LANDED Phase 6 task_20 verify functional (test trigger error)
- 13.6 Sentry config or fallback observability stub
- 13.7 Unhandled promise rejection global handler
- 13.8 Window error global handler

## §14 State Machine Integrity Audit

- 14.1 Workout state machine 5 moduri Mode Detection FSM transitions valid (idle/active/paused/completed/post-session)
- 14.2 Race conditions multi-tab (Zustand persist sync)
- 14.3 Dead states unreachable (audit FSM diagram match implementation)
- 14.4 `sessionStart` / `pausedSnapshot` / `lastSession` state transitions
- 14.5 Mode detection event listeners cleanup (NU memory leak)
- 14.6 Antrenor pill state (`SessionPill` conditional `if (!active && !paused) return null`)

## §15 Cross-Browser Compatibility Audit

- 15.1 Android Chrome primary (Daniel target) verified
- 15.2 Firefox/Edge fallback (Android secondary browsers)
- 15.3 Browser APIs supported (IndexedDB, Service Worker, `navigator.share`, `crypto.subtle`)
- 15.4 iOS Safari deferred PERMANENT v2/v3 (verify confirm NU partial wired)
- 15.5 Polyfills appropriate (NU over-polyfill bundle bloat)
- 15.6 Caniuse coverage Android 12+ primary target

## §16 PWA Spec Compliance Audit

- 16.1 `manifest.webmanifest` valid all fields (`name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`)
- 16.2 Icons all sizes (16/32/72/96/128/144/152/192/384/512)
- 16.3 Maskable icons supplied
- 16.4 Offline support actual real test (`NetworkFirst` Firebase strategy LANDED Phase 6 task_21)
- 16.5 Install prompt UX (`beforeinstallprompt` event handling)
- 16.6 Update flow `UpdatePrompt` LANDED Phase 6 task_21 functional
- 16.7 Service Worker scope correct (root `/`)
- 16.8 Workbox cache strategies appropriate (static / runtime / Firebase)
- 16.9 PWA Lighthouse audit pass (installability + offline + manifest)

## §17 Telemetry / Observability Audit

- 17.1 Opt-in telemetry default `FALSE` (anti-paternalism per Phase 6 task_14)
- 17.2 Events captured if opt-in respectful (NU PII leak)
- 17.3 k-anonymity preserve telemetry data
- 17.4 Sentry config or fallback documented
- 17.5 Logs NOT exposing sensitive data (production strip)

## §18 Documentation Audit

- 18.1 `README.md` accurate up-to-date
- 18.2 ADR chain canonical sources immutable (`03-decisions/_FROZEN/`)
- 18.3 `ANDURA_PRIMER.md` singular SSOT live truth-source
- 18.4 `DECISIONS.md` SSOT append-only integrity
- 18.5 Public API JSDoc TypeScript narrative
- 18.6 `CONTRIBUTING.md` (dacă există)
- 18.7 `LICENSE` present
- 18.8 `SECURITY.md` (dacă există)
- 18.9 `.env.example` template fără secrets

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

## §20 Bundle / Build Artifact Audit

- 20.1 Tree-shaking effective production
- 20.2 Source maps appropriate (NU expose source production)
- 20.3 `console.*` strip production
- 20.4 Debug code strip
- 20.5 Env vars correct production keys (`VITE_*` Firebase config)
- 20.6 Asset optimization (images compressed, fonts subset)
- 20.7 Chunk strategy optimal (vendor split, route split)
- 20.8 Critical CSS inline

## §21 Git Hygiene Audit

- 21.1 Branch protection rules `main` (GH Pages auto-deploy from main per option 1)
- 21.2 CI pipeline `.github/workflows/deploy.yml` definitions
- 21.3 Pre-push hooks
- 21.4 `.gitignore` comprehensive (no secrets, no node_modules, no dist artifacts)
- 21.5 Commit signing (GPG) if applicable
- 21.6 Secrets in git history (`git log --all -- '**/.env*'` + BFG scan)
- 21.7 Tag conventions consistent (milestone + backup pattern)
- 21.8 Branch cleanup remote (stale feature branches)

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

## §23 Self-Correction Loop Verify

- 23.1 Accelerated learning wired prod path (`src/engine/acceleratedLearning.js` + adapter)
- 23.2 Pattern learning end-to-end FULFILLED LOCK 9 LOOP CLOSE
- 23.3 "Engine I'm wrong se vindeca 2-3 sesiuni" actual prod telemetry verify

## §24 Production Readiness Final Score

Generate `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` cu:

**Severity matrix:**
| Category | CRITICAL | HIGH | MED | LOW | NIT | Total |
|----------|----------|------|-----|-----|-----|-------|
| §1 Source | ... | ... | ... | ... | ... | ... |
| §2 Tests | ... | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... | ... |
| **Aggregate** | **N** | **N** | **N** | **N** | **N** | **N** |

**Production Readiness Score weighted:**
| Dimension | Weight | Score 0-100 | Weighted |
|-----------|--------|-------------|----------|
| Security (§4) | 18% | ... | ... |
| Engine correctness (§8) | 15% | ... | ... |
| UX flows (§7) | 12% | ... | ... |
| Compliance (§9 + §10) | 12% | ... | ... |
| Performance (§5) | 8% | ... | ... |
| Accessibility (§6) | 8% | ... | ... |
| Data integrity (§12) | 6% | ... | ... |
| Error handling (§13) | 5% | ... | ... |
| State machine (§14) | 4% | ... | ... |
| PWA spec (§16) | 4% | ... | ... |
| TypeScript (§3) | 3% | ... | ... |
| i18n (§11) | 2% | ... | ... |
| Visual parity (§19) | 2% | ... | ... |
| Documentation (§18) | 1% | ... | ... |
| **FINAL %** | **100%** | — | **NN%** |

**Top 10 blockers Beta launch** (CRITICAL + HIGH ordered by impact).

**Recommended fix priority order** combined cu smoke findings #7 PRIMER §6.

**Estimated fix effort granular** per finding (S/M/L per finding, days bucketed aggregate).

**Categorical assessment narrative:** ~200 words executive summary Daniel CEO digest pre-Beta gate decision.

---

## §25 Procedure

- **Log-only:** ZERO auto-fix, ZERO commit, read-only audit
- **Output paths:**
  - `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md` → `findings-§23.md` per category
  - `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` aggregate + score
  - `📤_outbox/audit-nuclear-2026-05-19/_progress.md` checkpoint resume capable
- **Skills MANDATORY:** Sequential Thinking (§42.10 ordering preservation) + GitNexus (§1-§4 V4 impact/Cypher/rename/detect) + Impeccable `/critique` (per file) + Context7 (lib docs validation) + Karpathy 4 principii (`07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4 think/simplicity/surgical/goal-driven)
- **Model:** Opus EXCLUSIVELY MAX thinking budget (Daniel directive 2026-05-19)
- **Multi-noapte CONTINUOUS NEÎNTRERUPT:** save progress per category complete + checkpoint file, dar continue IMEDIAT cu următoarea categorie ZERO pauză. NU "save + wait Daniel re-run" — auto-loop seamless între categorii §1→§24.
- **Stop trigger UNIC:** ONLY Daniel explicit command "stop" / "/caveman" / "stai" / Ctrl+C. NU auto-terminate post §24 final score — continue cu **secondary deep-dive pass** pe CRITICAL/HIGH findings §1-§23 + **tertiary pass** pe MED/LOW + **quaternary** NIT polish — until Daniel explicit STOP. Audit infinit-iterative quality-asymptotic per *"20000 ore I don't care"*.
- **Resume capable** (dacă proces crash neașteptat): verify `_progress.md` pre-execute, skip categories done, continue de la următoarea pending. Auto-restart fără Daniel intervention.
- **NU fail-stop:** continue cu următoarea categorie chiar dacă găsești CRITICAL — full sweep mandatory.
- **NU paralel cu Daniel Gates smoke:** smoke = CEO scope manual telefon Android Firebase + PWA live; audit = Co-CTO CC autonomous concurrent OK pe altă sesiune.
- **Post fiecare deep-dive pass complete** (secondary/tertiary/quaternary), update `SUMMARY.md` cu pass-N findings appended + production readiness % recalibrate fiecare pass.

**Final raport `📤_outbox/LATEST.md`** cu §0-§3:
- §0 Status complete + duration + categories covered N/24
- §1 Total findings count + severity matrix aggregate
- §2 Production readiness % final score (weighted)
- §3 Top 10 blockers + recommended fix priority order

---

🦫 **Bugatti Audit Nuclear FULL pre-Launch — fiecare linie cod + fiecare virgulă, 25 secțiuni exhaustive. Log-only backlog generate, Daniel decides fix combined smoke findings. Production readiness % final score = Beta launch gate decision pillar.**
