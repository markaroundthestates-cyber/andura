# RECON CRIT OPEN — Chat 4 dispatch prep

**Generated:** 2026-05-22T15:10:00+03:00
**Source:** findings-ledger.json @ 2026-05-22T14:28:44+00:00
**Total CRIT open (ledger asserted):** 9
**Total CRIT open (post recon verify):** 3 genuine + 6 STALE (ledger lag — code fixed but ledger not flipped)
**Total findings ledger:** 941 (470 open / 468 fixed / 49.7%)

---

## STALE FINDINGS DETECTED (ledger lag — DO NOT DISPATCH FIX-AGENTS)

| Finding | Title | Evidence file fix landed |
|---------|-------|--------------------------|
| §29-C1 / §1-C3 | Token system drift Tailwind vs CSS vars | `tailwind.config.js:2-46` migrated to `var(--*)` |
| F-auth-03 | Google OAuth button missing | `Auth.tsx:178-192` `auth-google` button + `buildGoogleSignInUrl` |
| F-auth-04 | Skip-auth "Continua fara cont" missing | `Auth.tsx:195-203` `auth-skip` "Incearca fara cont" + `setSkipAuth` |
| F-pass2-confirms-all-7 | 7 confirm modals MISSING | 7 route files exist `cont/{DeleteAccount,Logout,RedoOnboarding,ResetCoach,ResetData,SchimbaFaza}Confirm.tsx` + `antrenor/FinishEarlyConfirm.tsx` D047 RIP-OUT drill-down LANDED |
| §45-C1 | Phase 6 BATCH functional verify end-to-end NOT done | Process finding (manual smoke) — NOT a code fix. Defer to Beta Gate audit. |
| §45-C2 | 4522 PASS test count claim verify | Process finding — run `npm run test:run` + count. NOT a code fix. |

**Recommendation:** Daniel-flag these 6 for ledger sync (mark status=fixed). NU spawn fix-agents.

---

## GENUINE CRIT OPEN (3 findings — dispatch-ready)

### §30-C1 — Big 6 bounds enforcement NOT VERIFIED at engine boundary
- **File:** `src/react/routes/screens/Onboarding.tsx:107-129, 254-275` (Step1/Step6 inline) + `src/react/stores/onboardingStore.ts` (setField)
- **Problem:** Step1 (age) declares `min={16} max={99}` HTML attrs + `Number.isFinite` guard. Step6 (weight) `min={30} max={250}` + same guard. BUT HTML min/max are advisory — browser does NOT block setField with out-of-range values; engine downstream receives age=8 or weight=999 → demographic prior fails → engine NaN. NO `setField` validation gate in store.
- **Fix:** Add explicit bounds check in `onboardingStore.setField` action: reject out-of-bounds before commit (age 13-95 per §30.6, weight 30-250kg, frequency 0-14, height 100-220cm if added later). Also align Step1 `min={16}` → `min={13}` (audit §30.6 spec lower bound).
- **Effort:** S (single store action + 4 bounds constants)
- **Source:** `📤_outbox/audit-nuclear-2026-05-19/findings-§30.md` + cross-ref §7-C4 + §13-H1

### §44-C1 — WorkoutState FSM lacks discriminated union → 5-moduri mode detection fragile
- **File:** `src/react/stores/workoutStore.ts:79-94` + Mode Detection selectors (consumers across SessionPill.tsx, Antrenor.tsx, Workout.tsx)
- **Problem:** `WorkoutState` is shape with optional fields (`sessionStart: number | null`, `pausedSnapshot: PausedSession | null`, `lastSession: LastSessionSummary | null`). Mode detection relies on field-presence checks (`if (!active && !paused) return null`). No `kind: 'idle' | 'active' | 'paused' | 'completed' | 'postSession'` tag → exhaustiveness compiler check absent → invalid transitions possible (Active→Idle direct, Completed→Active direct §14.3 dead states).
- **Fix:** Refactor `workoutStore.ts` `WorkoutState` → discriminated union by `mode: WorkoutMode` tag. Add `getCurrentMode(state): WorkoutMode` pure-function selector. Update consumers to switch on `mode` with exhaustive default. Add Vitest invariant test: each transition `(fromMode, action) → toMode` validated; invalid combos throw.
- **Effort:** L (workoutStore refactor + ~6-8 consumer updates + transition matrix test)
- **Source:** `📤_outbox/audit-nuclear-2026-05-19/findings-§44.md` + cross-ref §3-H2 + §14-C1

### F-workout-09 — Rest timer ring color states + last-10% pulse animation MISSING (partial fix landed)
- **File:** `src/react/components/Workout/SVGCountdownRing.tsx:48-71`
- **Problem:** SVGCountdownRing component LANDED (F-pass2-restoverlay-01 2026-05-22) with two concentric circles + dashOffset animation ✓. BUT mockup `restTimer.js` spec demands 3 color states: normal (`#c8412e` brick) / warning (`#f5b942` last 30%?) / urgent (`#ff4757` last 10%) + pulse animation last 10%. Current impl uses single `var(--brick)` stroke + linear transition — no color state machine + no pulse.
- **Fix:** Add `getRingColor(remainingSec, totalSec): string` returning brick/warn/danger CSS var based on progressRatio (~30% warn, ~10% danger). Wrap progress circle in CSS animation `@keyframes pulse-urgent` triggered when `progressRatio > 0.9` (last 10%). Update test snapshot.
- **Effort:** S (color logic + keyframes + 1-2 test updates)
- **Source:** `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-workout.md` F-workout-09

---

## Cluster ALFA — Workout state FSM + ring polish (2 findings, S+L mix)

**File ownership EXCLUSIVE:** `src/react/stores/workoutStore.ts`, `src/react/components/Workout/SVGCountdownRing.tsx`, `src/react/components/SessionPill.tsx`, `src/react/routes/screens/antrenor/Workout.tsx`, `src/react/routes/screens/antrenor/Antrenor.tsx`, `src/react/__tests__/stores/workoutStore.test.ts`, `src/react/__tests__/components/Workout/SVGCountdownRing.test.tsx` (if exists)
**Estimate cluster:** ~3-4h (FSM refactor dominates)
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none

### §44-C1 — WorkoutState FSM lacks discriminated union
- **File:** `src/react/stores/workoutStore.ts:79-94` + consumers
- **Problem:** WorkoutState optional fields; no `kind` tag → exhaustiveness check absent.
- **Fix:** Add discriminated union by `mode` tag + pure selector + transition matrix test.
- **Effort:** L
- **Source:** `📤_outbox/audit-nuclear-2026-05-19/findings-§44.md`

### F-workout-09 — Rest timer ring color states + pulse MISSING
- **File:** `src/react/components/Workout/SVGCountdownRing.tsx:48-71`
- **Problem:** Single brick stroke; no normal/warning/urgent color states; no last-10% pulse.
- **Fix:** Add `getRingColor` + CSS keyframe pulse triggered progressRatio > 0.9.
- **Effort:** S
- **Source:** `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-workout.md`

---

## Cluster BETA — Onboarding bounds enforcement (1 finding, S)

**File ownership EXCLUSIVE:** `src/react/stores/onboardingStore.ts`, `src/react/routes/screens/Onboarding.tsx`, `src/react/__tests__/stores/onboardingStore.test.ts`
**Estimate cluster:** ~30-45min
**Spawn isolation:** worktree mandatory (D049)
**Dependencies:** none

### §30-C1 — Big 6 bounds enforcement NOT VERIFIED
- **File:** `src/react/routes/screens/Onboarding.tsx:107-129, 254-275` + `onboardingStore.ts` setField action
- **Problem:** HTML min/max advisory only; no setField guard → engine NaN risk on out-of-bounds.
- **Fix:** Bounds validation in setField action + align Step1 min=13 (audit §30.6 spec).
- **Effort:** S
- **Source:** `📤_outbox/audit-nuclear-2026-05-19/findings-§30.md`

---

## Cluster GAMMA — Ledger sync (6 STALE flips, NU code work)

**Action:** Daniel-decision flip ledger entries `status: open → fixed` for 6 STALE findings (§29-C1, F-auth-03, F-auth-04, F-pass2-confirms-all-7, §45-C1, §45-C2). NOT a fix-agent task — recon dashboard sync only.

---

## Dispatch summary table

| Cluster | Findings | Files | Est | Dependencies | Parallel safe |
|---------|---------|-------|-----|--------------|---------------|
| ALFA | 2 (§44-C1 + F-workout-09) | 7 (`workoutStore.ts`, `SVGCountdownRing.tsx`, `SessionPill.tsx`, `Workout.tsx`, `Antrenor.tsx`, 2 test files) | ~3-4h | none | yes |
| BETA | 1 (§30-C1) | 3 (`onboardingStore.ts`, `Onboarding.tsx`, store test) | ~30-45min | none | yes (no file overlap cu ALFA) |
| GAMMA | 6 STALE | 0 code files | ~5min | Daniel manual flip | n/a (ledger sync only) |
| **Total** | **3 code + 6 ledger** | **10 unique files** | **~4-5h code** | | **ALFA + BETA parallelizable** |

**Parallel safe wave-1 (no file overlap):** [ALFA, BETA]
**Sequential required:** none
**Ambiguous flags (Daniel review):** 
- 6 STALE findings (Cluster GAMMA) — confirm ledger flip pre-dispatch
- §44-C1 effort L vs ALFA bundle: solo-agent OR split §44-C1 into solo agent + F-workout-09 cu fresh sub-agent? Daniel discretion. Recommend solo agent if ALFA cluster — file ownership clean.

---

## Recon notes

**Anti-hallucination verifies executed (per CLAUDE.md regula #1):**
- Read 9 ledger CRIT-open entries + 7 source findings files (§01, §07, §13, §14, §29, §30, §44, §45 + findings-auth.md, findings-pass2-final-workout-plus-waveg.md, findings-workout.md)
- Verified live source files: `Auth.tsx` (Google OAuth + skip-auth LANDED), `tailwind.config.js` (CSS vars migration LANDED), `Onboarding.tsx` (HTML min/max + NaN guard only — store-level enforcement missing), `RestOverlay.tsx` + `SVGCountdownRing.tsx` (Pass 2 fix landed; color states + pulse absent), `workoutStore.ts` (no discriminated union), 2 confirm screens (`DeleteAccountConfirm.tsx` + `LogoutConfirm.tsx` D047 RIP-OUT LANDED)

**File ownership conflicts detected:** ZERO between ALFA + BETA (different stores/components).

**Karpathy distribution:**
- §30-C1: Goal-Driven (engine math correctness)
- §44-C1: Think Before Coding (FSM type safety)
- F-workout-09: Surgical Changes (small additive polish)

**Ready for dispatch:** Wave-1 = ALFA + BETA parallel spawn 2 agents (worktree isolation). Wave-2 = GAMMA ledger flip post-Daniel confirmation. 9 CRIT open ledger entries → 3 real fixes + 6 ledger lag.
