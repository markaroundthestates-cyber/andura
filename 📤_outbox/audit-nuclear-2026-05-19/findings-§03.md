# §3 — TypeScript Strict Audit

**Scope:** tsconfig.json strict flags + cast/any/unknown hunt + JSDoc + .d.ts + discriminated unions + branded types + exhaustiveness + utility types + zod boundary validation
**Method:** tsconfig review + grep aggregated + sample .d.ts ambient files

## Severity matrix §3

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 3 |
| MED | 4 |
| LOW | 3 |
| NIT | 2 |
| **Total** | **14** |

---

## CRITICAL findings

### §3-C1 — `allowJs: true, checkJs: false` → 231 engine .js files NOT type-checked
**Severity:** CRITICAL (§3 overall foundation + §8 engine correctness)
**Evidence:** `tsconfig.json:9-10` `"allowJs": true, "checkJs": false`. `src/engine/**` = 231 .js files (all engines: Bayesian Nutrition, Periodization, Energy Adjustment, Deload, Coach Director, MMI, Aggressive Loading, etc.). `tsc --noEmit` skips them entirely. Only `.d.ts` companions (fatigue.d.ts, prEngine.d.ts, readiness.d.ts, scheduleAdapter.d.ts) provide external type surface.
**Karpathy:** Goal-Driven Execution — engine math correctness §38 is the Beta launch blocker.
**Reasoning:**
- Engine internal logic (Kalman filter posterior update, Brzycki 1RM formula, MEV→MAV→MRV transitions) runs in untyped JS. A typo like `posterior.mui` (instead of `mu`) silently `undefined`, propagated downstream as NaN → kcal target NaN → UI displays "NaN kcal" or 0.
- Engine output types declared in .d.ts may DRIFT from .js implementation silently (no compiler check enforces match).
- Refactor risk: rename a property in .js → .d.ts stale → consumer code (engineWrappers.ts) compiles fine but runtime mismatch.
- Test files catch SOME but mutation testing not in CI (§2-H5).
**Fix log:** Either:
- (a) Migrate engines to TypeScript incrementally. Start with high-stakes: bayesianNutrition (Kalman), periodization (MEV/MAV/MRV), energyAdjustment (±15% asymmetric), coachDirector (8-field enrich). ETA: L per engine.
- (b) Enable `checkJs: true` + add JSDoc type annotations widely. Cheaper migration path. Run incrementally per-engine. ETA: M-L cumulative.
- (c) Lower-cost interim: add stronger .d.ts coverage for ALL engines consumed by React; flip `checkJs: true` for high-stakes engines via per-file `// @ts-check`.
- Choose (c) pre-Beta as quickest gain; plan (a) post-Beta.

### §3-C2 — NO runtime validation at boundaries (Firebase/IndexedDB/localStorage reads = blind `as` casts)
**Severity:** CRITICAL (§3.10 + §4 security)
**Evidence:**
- package.json: NO zod, NO yup, NO io-ts, NO valibot, NO joi.
- Boundary reads: `src/firebase.js`, `src/db.js`, `src/util/tierStorage.js`, `src/react/lib/dexieMigration.ts`, `src/util/coachDecisionLog.js` — all parse JSON / Dexie tables / Firebase REST results then return WITHOUT shape validation.
- Sample `src/react/stores/scheduleStore.ts:63` `return { days: next as unknown as WeekDays }` — double cast bypasses TS check + has NO runtime guarantee.
- `src/react/lib/engineWrappers.ts:279` — `evaluateBN(ctx as any) as { tier?: string; ... }` — engine output trusted.
**Karpathy:** Think Before Coding + Goal-Driven — Pre-Beta launch with untrusted boundary data is risk.
**Reasoning:**
- Firebase Firestore returns `DocumentData = { [key: string]: any }`. Without zod parse, downstream code assumes shape; if Firebase document key got renamed or migrated → silent NaN/undefined cascades.
- IndexedDB Dexie tables: schema migration v1 → v2 (§12) → user has old data shape, app casts to new shape, fields are `undefined` → engine consume → NaN.
- LocalStorage Tier 0 `wv2-*` keys: JSON.parse returns `any` → no shape check.
- Beta launch with 50+ testers = real-world divergent state. Without zod, debugging "user X sees NaN kcal" requires manual data forensics each time.
**Fix log:** Install `zod@^3.23` or `valibot@^0.30` (smaller bundle). Define schemas at each I/O boundary:
- `src/firebase.js` — `UserDocSchema.parse(rawDoc.data())` before returning.
- `src/db.js` — Dexie hook `.hook('reading', ...)` validates each row.
- `src/util/tierStorage.js` — JSON.parse + schema parse pipeline.
- Engine outputs: schema validate `evaluateBN` result before adapter consumes.
ETA: M (zod schemas for ~10 critical boundaries).

---

## HIGH findings

### §3-H1 — NO branded types for User UID, Exercise ID, Session ID
**Severity:** HIGH (§3.12)
**Evidence:** Grep `__brand` ZERO hits in src/. User UID flows as plain `string` through Firebase auth → state → IndexedDB writes. Exercise ID likewise plain string.
**Karpathy:** Surgical Changes — single utility type + cast on creation sites.
**Reasoning:** Mistakes possible: `function getSession(userUid: string)` could accept `exerciseId` string by mistake (both `string`). Branded types `type UserUid = string & { readonly __brand: 'UserUid' }` prevent.
**Fix log:** Define branded types in `src/react/types/branded.ts`:
```ts
export type UserUid = string & { readonly __brand: 'UserUid' };
export type ExerciseId = string & { readonly __brand: 'ExerciseId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export const asUserUid = (s: string): UserUid => s as UserUid;
```
Migrate firebase auth getCurrentUser() to return `UserUid`, Dexie session.id to `SessionId`. Propagate.

### §3-H2 — Discriminated unions absent for WorkoutState FSM (5 moduri Mode Detection §44)
**Severity:** HIGH (§3.11 + §14 + §44)
**Evidence:** Grep `type.*= {.*kind:.*}` returns ZERO hits in src/react/. WorkoutState shape (idle/active/paused/completed/post-session) per §44 should be discriminated union for safe FSM transitions + exhaustiveness checks.
- `src/react/stores/workoutStore.ts:246` `as Partial<WorkoutState & WorkoutActions>` — Zustand store types intersected, not discriminated.
- Current pattern likely: WorkoutState has all fields optional `sessionStart?: number, pausedSnapshot?: Snapshot, lastSession?: SessionEnd`; consumer code (Antrenor.tsx:78) checks `lastSession !== null && pausedSnapshot === null` — boolean logic on multiple fields = error-prone vs `state.kind === 'idle'` single check.
**Karpathy:** Think Before Coding.
**Reasoning:** Per §44.6 transitions Idle→Active→Paused→Completed→Post-session→Idle. Without discriminated union + exhaustiveness check, adding a new mode (e.g., "warmup-pending") silently compiles → bugs.
**Fix log:** Refactor workoutStore types:
```ts
type WorkoutState =
  | { kind: 'idle' }
  | { kind: 'active'; sessionStart: number; sets: SetEntry[] }
  | { kind: 'paused'; pausedSnapshot: Snapshot }
  | { kind: 'completed'; sessionEnd: number; lastSession: LastSession }
  | { kind: 'postSession'; lastSession: LastSession; reviewExpiry: number };
```
Add exhaustive `switch (state.kind) { ... default: const _: never = state; ... }` in selectors. ETA: M (touches multiple consumers).

### §3-H3 — `src/react/stores/scheduleStore.ts:81` runtime dynamic import with double-cast = NO type safety
**Severity:** HIGH (§3.3 cast abuse)
**Evidence:** `const commitFn = (mod as unknown as { commitCalendarEdit?: (days: readonly DayKind[]) => unknown }).commitCalendarEdit;` — dynamic `await import('...')` result coerced through `unknown`. Real module shape unverified.
**Karpathy:** Simplicity First — async export pattern unfamiliar.
**Reasoning:** If `commitCalendarEdit` is renamed in source, this cast still compiles. Runtime check `typeof commitFn === 'function'` likely follows but defensive only.
**Fix log:** Move scheduleAdapter to TS or add type-safe import map. Replace `as unknown as { ... }` with proper module typing.

---

## MED findings

### §3-M1 — Form element coercion casts in SettingsProfile.tsx (acceptable HTML5 pattern but documents intent)
**Severity:** MED (§3.3 + §3.18 utility types)
**Evidence:** `SettingsProfile.tsx:118,136,141,149,154,162,167` — `(e.target.value || null) as Sex | null`, `(Object.keys(GOAL_LABELS) as Goal[])`. Object.keys returns `string[]`, branded as `Goal[]` requires runtime knowledge keys are GOAL members.
**Karpathy:** Surgical Changes — encapsulate.
**Fix log:** Replace `Object.keys(GOAL_LABELS) as Goal[]` with `(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>)` (already used in `Onboarding.tsx:155`) — more accurate. Or wrap utility `goalKeys(): Goal[]` runtime validated.

### §3-M2 — Exhaustiveness check appears only ONCE in src/react (`navigation.ts:99`)
**Severity:** MED (§3.13)
**Evidence:** Grep `_exhaustive: never` returns 1 hit in `src/react/lib/navigation.ts:99`. Other switch statements (likely many across handlers, screens, store reducers) lack `never` exhaustiveness branch.
**Karpathy:** Surgical Changes — one-line guard per switch.
**Fix log:** Audit each switch statement in src/react/ → add `default: const _: never = key; throw new Error(...)`.

### §3-M3 — Const assertions consistent in literals but not centralized
**Severity:** MED (§3.15)
**Evidence:** `AaFrictionModal.tsx:38` `as const`. Other COPY/LABEL objects (e.g., GOAL_LABELS, FREQUENCY_LABELS, EXPERIENCE_LABELS) — verify `as const` usage. Inconsistency could cause Object.keys narrowing variance.
**Resolution:** Sample audit per UI string constant module.

### §3-M4 — Generic constraint correctness sample OK but no comprehensive verify
**Severity:** MED (§3.6)
**Evidence:** Generic usage observed minimal in screens. Engineering staff convention pattern. NIT-tier acceptable for pre-Beta single-dev codebase.
**Resolution:** Defer to secondary pass for breadth.

---

## LOW findings

### §3-L1 — Type imports separated from value imports (good pattern observed)
**Severity:** LOW — POSITIVE finding (§3.17)
**Evidence:** `92 import type` lines vs `76 regular import` lines in src/react. High proportion of `import type { JSX } from 'react'`, `import type { Goal, Sex, ... } from '...'`. Indicates discipline.
**Resolution:** Continue.

### §3-L2 — `vite-env.d.ts` minimal, sufficient
**Resolution:** OK.

### §3-L3 — `.d.ts` companions cover only 4 engines (readiness, fatigue, prEngine, scheduleAdapter) out of ~30+ engines
**Severity:** LOW (§3.9 ambient declarations + §3-C1 root cause)
**Evidence:** `src/engine/*.d.ts` = 4 files. Engines like coachDirector, bayesianNutrition (folder), periodization, energyAdjustment, deload, MMI, dimensionRegistry, aggressiveLoadingThreshold lack .d.ts → consumers cast or use any.
**Fix log:** Generate .d.ts companions for top-10 critical engines.

---

## NIT findings

### §3-N1 — `import type` syntax used (preferred over `import { type X }`) — consistent
**Resolution:** Style preference; codebase chose first form. OK.

### §3-N2 — Interface vs type alias usage mixed
**Evidence:** `engineWrappers.ts` uses both `interface X { ... }` and `type Y = { ... }`. Not strictly inconsistent (interface for extension, type for unions/intersections). Sample sufficient.
**Resolution:** OK pre-Beta.

---

## Coverage map §3.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 3.1 | noUncheckedIndexedAccess | ENABLED ✓ tsconfig | — |
| 3.2 | exactOptionalPropertyTypes | ENABLED ✓ tsconfig | — |
| 3.3 | `as` cast hunt + justify | §3-M1 — acceptable; §3-H3 risky | HIGH |
| 3.4 | any/unknown unjustified | §1-M1 — 1 `as any` w/ eslint-disable; few `as unknown` justified pattern | MED (resolved §1) |
| 3.5 | Interface vs type consistency | §3-N2 mixed acceptable | NIT |
| 3.6 | Generic constraints | §3-M4 sample sufficient | MED |
| 3.7 | Discriminated unions | §3-H2 — absent for WorkoutState | HIGH |
| 3.8 | Public API JSDoc | sample rich (engineWrappers) but variance §1-M6 | covered §1 |
| 3.9 | `.d.ts` ambient | §3-L3 — 4 of ~30+ engines | LOW |
| 3.10 | Runtime validation zod/yup at boundaries | §3-C2 — ZERO | CRITICAL |
| 3.11 | FSM types discriminated unions | §3-H2 | HIGH |
| 3.12 | Branded types for IDs | §3-H1 — absent | HIGH |
| 3.13 | Exhaustiveness checks | §3-M2 — only 1 hit | MED |
| 3.14 | Type guards properly narrowing | observed pattern correct sample | — |
| 3.15 | Const assertions | §3-M3 — inconsistent | MED |
| 3.16 | tsconfig.strict ALL flags | ALL ENABLED ✓ verify | — |
| 3.17 | Type imports separated | §3-L1 — POSITIVE | LOW |
| 3.18 | Utility types appropriate | sample OK Parameters/Partial usage observed | NIT |

## Karpathy 4 principii distribution §3

- Think Before Coding: 3 (C2, H2, M2)
- Simplicity First: 2 (H3, M1)
- Surgical Changes: 3 (H1, M3, M4)
- Goal-Driven Execution: 2 (C1, C2)
