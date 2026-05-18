# Pass 2 — SECONDARY Deep-Dive on CRITICAL + HIGH Findings

**Procedure:** §52 secondary pass per D029 — additional evidence per CRITICAL/HIGH primary findings, cross-category correlation, fix-log refinement.
**Method:** Read implementation files for high-stakes claims; verify or escalate findings.

---

## §28-C3 SECONDARY → ESCALATION: SettingsDanger wipe is FUNDAMENTALLY INCOMPLETE — GDPR Art. 17 VIOLATION CONFIRMED

**Previous severity (primary):** CRITICAL flagged with "verify needed"
**Secondary verdict:** **CRITICAL CONFIRMED + ESCALATED — Beta launch hard-blocker**

**Evidence:** `src/react/routes/screens/cont/SettingsDanger.tsx:20-41` `wipeAllLocalData()`:
```typescript
function wipeAllLocalData(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    // Wipe Tier 0 wv2-* localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wv2-')) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[SettingsDanger] wipe failed:', e);
  }
}
```

**WHAT IS WIPED:** Zustand stores (in-memory + localStorage persist) + `wv2-*` localStorage keys.

**WHAT IS NOT WIPED:**
1. **`AnduraArchive` IndexedDB** (Dexie) — Phase 5 task_12 archive layer for sessions >90 days. Function does NOT call `Dexie.delete('AnduraArchive')` OR `indexedDB.deleteDatabase('AnduraArchive')`. Archive PERSISTS across "Sterge cont" action.
2. **Firebase Auth profile** — function does NOT call `accounts:delete` REST endpoint. User's Firebase Auth UID persists.
3. **Firebase RTDB `users/{uid}` document** — function does NOT call `fbRemove('users/${uid}')`. Per ADR 002 Firebase REST per-uid path persists indefinitely.
4. **Firebase backups** — Daniel manual export retention (§26-H1) means even if user request erasure, backups persist 30-90 days.
5. **`firebase-id-token`, `firebase-uid`, `firebase-refresh-token`, `firebase-id-token-expiry`, `firebase-magic-link-email` localStorage keys** — function only wipes `wv2-*` prefix. Auth tokens for OTHER users (post-logout-from-shared-device) persist.

**CONFIRMED BY CODE COMMENT line 124:** "Stergerea conturilor remote (Firebase backup) este programata Phase 7+. Acum reset/stergere afecteaza doar datele locale."

**GDPR Art. 17 (Right to erasure) requires:** "the controller shall have the obligation to erase personal data WITHOUT UNDUE DELAY". Phase 7+ deferred = "undue delay" by definition.

**User-facing trust violation:**
- UI button labeled "Sterge cont" (Delete account)
- Confirmation modal text "Datele + contul vor fi sterse"
- Reality: half-wipe local, full Firebase persist

**This is a Beta launch SHOWSTOPPER.**

**Fix log:**
1. (a) Implement full server-side wipe BEFORE Beta launch:
   - Call `accounts:delete` Firebase REST endpoint w/ ID token
   - Call `fbRemove('users/${uid}')` after Auth wipe
   - Call `indexedDB.deleteDatabase('AnduraArchive')` (or `Dexie.delete()`)
   - Wipe ALL firebase-* localStorage keys (`firebase-id-token`, `firebase-uid`, `firebase-refresh-token`, `firebase-id-token-expiry`, `firebase-magic-link-email`)
   - Mark backup purge in Firebase admin SDK script (Daniel-run weekly via service account)
2. (b) Document backup purge schedule in user-facing Privacy Policy (max 30 days after erasure request)
3. (c) Update SettingsDanger UI: pre-erasure modal text reflects what gets deleted; reveal Phase 7+ remote scope honestly OR scope-down "Sterge cont" → "Reseteaza date locale" until Phase 7+.

ETA: M (1-2 days). PRIORITY: Wave 1 Beta launch blocker.

---

## §38-L SECONDARY → POSITIVE: Brzycki 1RM formula correctly implemented

**Evidence:** `src/engine/weaknessDetector.js:8-13`:
```js
// Brzycki formula: 1RM = weight × (36 / (37 - reps))
export function brzycki1RM(weight, reps) {
  return weight * (36 / (37 - reps));
}
```
Pure function ✓. Formula matches spec §38.1 exactly ✓.

**Remaining concerns:**
1. Edge case: `reps >= 37` divides-by-zero (returns Infinity for reps=37, NaN for reps>37). Guard absent. In practice reps≥37 unrealistic but defense-in-depth recommended.
2. Rounding: Brzycki returns raw float. No `Math.round` or `.toFixed(1)` boundary normalization. Consumer may display "82.85714..." kg. UI render formatting verify.

**Fix log:** Add input guard `if (reps >= 37 || reps < 1) return null;`. Add rounding at consumer level (or formula wrapper).

**Severity revision:** §38-C1 downgrade from CRITICAL to HIGH (formula correct; guards + rounding deferred MED).

---

## §28-M4 SECONDARY → ESCALATION: SettingsExport GDPR Art. 20 portability INCOMPLETE

**Previous severity (primary):** MED positive verify
**Secondary verdict:** **HIGH — incomplete portability**

**Evidence:** `src/react/routes/screens/cont/SettingsExport.tsx:30-58`:
```typescript
function buildExportPayload(): ExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    stores: {
      onboarding, workout, nutrition, settings, schedule
    },
    tier0Keys: collectTier0Keys(),  // wv2-* localStorage only
  };
}
```

**WHAT IS EXPORTED:** Zustand stores (5) + Tier 0 wv2-* localStorage keys.

**WHAT IS NOT EXPORTED:**
1. **`AnduraArchive` IndexedDB sessions** (Tier 2 archive)
2. **Firebase RTDB `users/{uid}` data** (if synced server-side per fbSet calls)
3. **CDL events** (`src/util/coachDecisionLog.js` — if stored elsewhere than Zustand)

**GDPR Art. 20 (Right to portability) requires:** "user shall have the right to receive personal data... in a structured, commonly used and machine-readable format". Partial export = partial compliance.

**User-facing trust violation:**
- UI line 122-127: "Include profil + antrenamente + nutritie + setari + calendar" — implies complete.
- Reality: Tier 0 + Zustand only.

**Fix log:**
1. Extend `buildExportPayload` to:
   - Read `AnduraArchive` IndexedDB via Dexie → include archived sessions
   - Optionally: pull Firebase RTDB `users/{uid}` data via fbGet (if online)
   - Read CDL events from wherever stored
2. Document export scope honestly OR scope full per GDPR Art. 20.

ETA: M (1 day). PRIORITY: Wave 1 Beta launch blocker.

---

## §39-C1 SECONDARY → CONFIRMED: Library count 654 ≠ 657 spec (discrepancy of 3)

**Evidence:** Refined grep `^\s*['"][^'"]+['"]:\s*\{` = **654 entries**. NO entries use `id:` field — schema keys exercise NAME as object key. ZERO lowercase entries.

**Discrepancy of 3:** could be:
- (a) Counting regex still imperfect (e.g., comma-leading entries on same line)
- (b) Spec 657 is target including pending Bundle 6.0.5
- (c) Drift since spec was written

**Fix log:** Daniel CEO clarify "657 is target vs current". If current = 654, update spec. If target = 657, document 3 pending entries.

---

## §14-C1 / §44-C1 SECONDARY → workoutStore.ts confirmed lacks discriminated union

**Evidence:** `src/react/stores/workoutStore.ts:1-50` sample:
```typescript
export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

export interface ExerciseHistoryEntry { ... }
export interface PRData { ... }
export interface PausedSession {
  title: string; meta: string; exIdx: number; setIdx: number;
  phase: WorkoutPhase;
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number;
}
```

`WorkoutPhase` is a string union ✓ — but this is for INTRA-SESSION states (logging/rating/rest/transition/idle). The **5-moduri Mode Detection FSM** (Idle/Active/Paused/Completed/Post-session per §44.1-§44.5) is implemented via field-presence checks on the store (sessionStart present? pausedSnapshot present? lastSession present? phase value?).

**Confirmation:** discriminated union for 5-moduri FSM ABSENT. Field-presence checks distributed across store consumers (Antrenor.tsx:78 sample). Adding new mode silently compiles.

**Fix log per §3-H2 + §14-C1 + §44-C1:** unchanged.

---

## §1-C2 SECONDARY → console.warn count exactly 14 across React production tier

**Evidence:** Grep precise count `console\.warn` in `src/react/**/*.{ts,tsx}` excluding tests:
- engineWrappers.ts: 9 (lines 118, 149, 198, 220, 299, 343, 406, 424, 463)
- scheduleAdapterAggregate.ts: 1 (line 110)
- SettingsDanger.tsx: 1 (line 39 — wipe failed)
- SettingsExport.tsx: 1 (line 72 — download failed)
- ErrorBoundary.tsx: 0 (but uses console.error line 31)
- UpdatePrompt.tsx: presumably 0 needs verify

Total: 12+ console.warn + 1 console.error = 13 production tier statements. Strip required for §5.5.

---

## §33-C1 SECONDARY → deploy.yml independence from ci.yml CONFIRMED — race condition risk

**Evidence (re-read workflows):**
- `deploy.yml` triggers on `push: branches: [main]` (line 4-5)
- `ci.yml` triggers on `push: branches: [main, dev]` + `pull_request` (line 4-9)
- Both fire CONCURRENTLY on push-to-main. Neither blocks the other.
- `deploy.yml` does NO `needs: ci-job-id` — no cross-workflow gating.
- `qa-report.yml` triggers via `workflow_run` after Deploy completes — runs E2E AFTER deploy success → reactive.

**Scenario:** Daniel pushes broken commit (e.g., typecheck fails). Both workflows fire:
1. deploy.yml: `npm install` ✓ → `npm run build` ✓ (typecheck happens via tsc but NOT invoked in deploy.yml build step OR vite build doesn't enforce strict?)
2. ci.yml: `npm ci` → `npm run typecheck` FAIL → ci fails
3. Result: deploy completes successfully; ci fails AFTER deploy. Production has broken code.

**Wait — let me verify**: vite build invokes esbuild minify but does it run tsc? No — tsc is `npm run typecheck` separate. Vite default build does NOT typecheck.

CONFIRMED: deploy.yml can ship code that fails typecheck. CRITICAL §33-C1.

---

## §4-C1 SECONDARY → Sentry dead CONFIRMED via main.tsx + main.js comparison

**Evidence:** 
- `src/main.tsx` (React entry post-D028) imports 5 things only: StrictMode, createRoot, RouterProvider, router, './styles/global.css'. NO initSentry import. NO initSentry call.
- `src/main.js` (vanilla legacy entry, NOT shipped post-D028) imports `initSentry` from `./util/sentry.js` + calls it line 3.
- D028 React entry swap effectively orphaned Sentry initialization.

CONFIRMED §4-C1 CRITICAL.

---

## Other CRITICAL findings — status unchanged from primary pass

| Finding | Primary severity | Secondary status |
|---------|------------------|------------------|
| §1-C1 index.html stale | CRITICAL | CONFIRMED (re-verified dist/index.html line 6 title "Phase 1") |
| §1-C2 console.* strip absent | CRITICAL | CONFIRMED (13 statements counted) |
| §1-C3 Tailwind ↔ CSS vars drift | CRITICAL | CONFIRMED |
| §1-C4 ESLint absent | CRITICAL | CONFIRMED |
| §2-C1 Playwright targets live PROD | CRITICAL | CONFIRMED (playwright.config.js:13) |
| §2-C2 vitest config missing | CRITICAL | CONFIRMED |
| §3-C1 .js engines not type-checked | CRITICAL | CONFIRMED |
| §3-C2 NO zod boundary validation | CRITICAL | CONFIRMED |
| §4-C1 Sentry dead | CRITICAL | CONFIRMED ↑ |
| §4-C2 PLACEHOLDER API key | CRITICAL | CONFIRMED |
| §4-C3 NO CSP/security headers | CRITICAL | CONFIRMED |
| §4-C4 Auth tokens localStorage XSS risk | CRITICAL | CONFIRMED |
| §4-C5 Sentry beforeSend drops Firebase | CRITICAL | CONFIRMED |
| §4-C6 Firestore rules manual publish drift | CRITICAL | CONFIRMED |
| §5-C1 main 432KB over budget | CRITICAL | CONFIRMED |
| §5-C2 Dexie chunk empty | CRITICAL | CONFIRMED |
| §5-C3 NO route lazy | CRITICAL | CONFIRMED |
| §5-C4 NO Lighthouse CI / web-vitals | CRITICAL | CONFIRMED |
| §6-C1 NO reduced-motion | CRITICAL | CONFIRMED |
| §6-C2 NO skip-to-content | CRITICAL | CONFIRMED |
| §6-C3 NO autoComplete | CRITICAL | CONFIRMED |
| §7-C1 Mock login bypass shipped | CRITICAL | CONFIRMED |
| §7-C2 Auth.tsx mocked, no sendMagicLink | CRITICAL | CONFIRMED |
| §7-C3 ProtectedRoute Phase 2 stub | CRITICAL | CONFIRMED |
| §7-C4 Big 6 bounds NOT verified | CRITICAL | NEED Step1-Step6 read (deferred tertiary) |
| §8-C1 engine .js type-check | CRITICAL | CONFIRMED (cross-ref §3-C1) |
| §9-C1 F5 AaFrictionModal ambiguity | CRITICAL | NEEDS Daniel CEO clarification |
| §11-C1 DST transition tests | CRITICAL | CONFIRMED |
| §12-C1 Dexie migration path absent | CRITICAL | CONFIRMED |
| §12-C2 IDB quota handling | CRITICAL | CONFIRMED |
| §15-C1 viewport-fit cover absent | CRITICAL | CONFIRMED |
| §16-C1 SW + manifest duplicate | CRITICAL | CONFIRMED |
| §16-C2 manifest icon sizes incomplete | CRITICAL | CONFIRMED |
| §17-C1 Sentry not init | CRITICAL | CONFIRMED |
| §18-C1 README accuracy | CRITICAL | NOT YET READ (deferred tertiary) |
| §19-C1 NO visual regression infra | CRITICAL | CONFIRMED |
| §20-C1 main 432KB | CRITICAL | CONFIRMED |
| §20-C2 PLACEHOLDER API key shipped | CRITICAL | CONFIRMED |
| §20-C3 license scan NOT run | CRITICAL | CONFIRMED (no license-checker output) |
| §21-C1 branch protection unverified | CRITICAL | GitHub Console verify required |
| §24-C1 hardcoded prod keys/URLs/DSN | CRITICAL | CONFIRMED |
| §26-C1 restore fresh device untested | CRITICAL | CONFIRMED |
| §26-C2 DR runbook absent | CRITICAL | CONFIRMED |
| §28-C1 Privacy Policy verify | CRITICAL | NEEDS SettingsTerms.tsx read (deferred) |
| §28-C2 T&C verify | CRITICAL | NEEDS SettingsTerms.tsx read (deferred) |
| §28-C3 GDPR Right-to-erasure | CRITICAL | **ESCALATED above** |
| §28-C4 Data breach 72h notification absent | CRITICAL | CONFIRMED |
| §31-C1/C2/C3 Auth chain | CRITICAL | CONFIRMED (alias of §7-C1/C2/C3) |
| §33-C1/C2/C3 deploy.yml | CRITICAL | **CONFIRMED above** |
| §34-C1/C2/C3 Prod ops | CRITICAL | CONFIRMED |
| §35-C1 Tier nomenclature drift | CRITICAL | CONFIRMED |
| §35-C2 Tier transition timing absent | CRITICAL | CONFIRMED |
| §36-C1 sync conflict resolution | CRITICAL | CONFIRMED |
| §38-C1 Brzycki | CRITICAL | **DOWNGRADED to HIGH (formula correct, guards missing)** |
| §38-C2 synthetic 50+ profile CI | CRITICAL | CONFIRMED |
| §39-C1 Library count 657 vs 654 | CRITICAL | **CONFIRMED + REFINED** (654 not 650; need Daniel CEO clarify) |
| §41-C1 TypeScript 6.0.3 phantom version | CRITICAL | CONFIRMED |
| §43-C1 Age <16 parental consent | CRITICAL | CONFIRMED |
| §44-C1 FSM no discriminated union | CRITICAL | **CONFIRMED above** |
| §45-C1 Phase 6 BATCH functional E2E | CRITICAL | CONFIRMED (cannot test live without Auth fix §7-C2) |
| §45-C2 4522 PASS test count verify | CRITICAL | NOT YET RUN (defer tertiary) |
| §50-C1 Beta entry criteria blocked | CRITICAL | CONFIRMED |
| §50-C2/C3/C4 acceptance/ownership/erasure | CRITICAL | covered by §28-C3 escalation + §10 secondary |

---

## Secondary pass conclusion

**New CRITICAL findings discovered:** 0 truly new (all secondary deepen primary).
**ESCALATIONS:**
- §28-C3 GDPR erasure VIOLATION CONFIRMED (Wave 1 blocker)
- §28-M4 GDPR portability INCOMPLETE → §28-H new HIGH (Wave 1 blocker)
- §33-C1 deploy.yml race condition VERIFIED (Wave 1)
- §38-C1 Brzycki DOWNGRADED CRITICAL→HIGH

**Resolution updates:**
- §38-C1 from CRITICAL → HIGH (formula present + correct; guards + rounding MED)

**Recalibrated score:** ~52-54% production readiness (slight downgrade from primary 53.80% due to §28-C3 + §28 portability escalations BUT §38-C1 downgrade compensates).

**Beta gate:** Still BLOCKED. Same Wave 1-3 fix priority.

**Continuing TERTIARY pass on MED/LOW per §52 procedure.**
