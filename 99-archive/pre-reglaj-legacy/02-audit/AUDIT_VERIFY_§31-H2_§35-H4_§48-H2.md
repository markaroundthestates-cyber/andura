# Audit verify-only — §31-H2 OAuth Phase 3 + §35-H4 Firebase doc limit + §48-H2 adapter no-fallback

**Status:** AUDIT-COMPLETE
**Date:** 2026-05-23
**Authority:** §31.9 + §35.15 + §48.4 audit-nuclear-2026-05-19 closure
**Scope:** Three verify-only HIGH items consolidated — verify codebase claims match documented expectations. Pure audit doc; ZERO code change.

---

## §1 — §31-H2 OAuth Phase 3 PENDING verify

**Question:** Verify NO partial Google OAuth wired surface exposing pre-Daniel-setup.

**Evidence:** `src/react/routes/screens/Auth.tsx`
- Line 13: `import { sendMagicLink, buildGoogleSignInUrl } from '../../../auth.js';`
- Line 67: `function handleGoogleSignIn(): void { const url = buildGoogleSignInUrl(GOOGLE_OAUTH_CLIENT_ID); ... }`
- Line 77: `const showGoogle = GOOGLE_OAUTH_CLIENT_ID !== '';`
- Line 189: `{showGoogle && (<button onClick={handleGoogleSignIn} ...>...)}`

**Gating logic:** `GOOGLE_OAUTH_CLIENT_ID` env var imported via `import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID` (Vite build-time injection). If secret unset:
- `GOOGLE_OAUTH_CLIENT_ID === ''`
- `showGoogle === false`
- Google button NOT rendered

**Build pipeline:** `.github/workflows/deploy.yml:120` env passes `VITE_GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.VITE_GOOGLE_OAUTH_CLIENT_ID }}` — if Daniel hasn't configured the secret, build still succeeds (graceful missing-secret tolerance).

**Verdict §31-H2:** VERIFIED PASS. NO partial wire exposing. OAuth is FULLY implemented but gracefully gated behind Daniel-controlled GitHub Secret. Per RECON §31-H2 spec: "Audit Auth.tsx; confirm OK (no Google button visible currently)" — confirmed via env gate.

**Cross-ref:** D-2 audit fix (B005) Google OAuth Slice 1.x LANDED commit `81d4bb33`. Live `andura.app` should show Google button if Daniel has configured secret; else Magic Link only.

---

## §2 — §35-H4 Firebase Firestore 1MB doc limit verify

**Question:** Verify which Firebase product used for Tier 2 archive — RTDB (256MB/node) vs Firestore (1MB/doc).

**Evidence:** `src/firebase.js:3-10` (inline JSDoc comment):

```js
// §35-H4 audit note — Andura uses Firebase Realtime Database (RTDB), NOT
// Firestore. Limits: per-node max payload 256MB (RTDB) — NOT Firestore 1MB/doc.
// `users/{uid}` whole-tree PUT in syncToFirebase below stays well under
// realistic per-user volumes (~10-100KB typical SYNC_KEYS payload). Tier 2
// archive (>180d) deferred per ADR 020 + tier2Stub.js — when shipped, archive
// path WILL use Firestore (per ADR 002 REST) — at that point document size
// limit 1MB/doc applies; mitigation via sub-collection chunking per uid.
```

**Endpoint pattern:** `FIREBASE_URL = https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/` — RTDB endpoint pattern (`-rtdb.europe-west1.firebasedatabase.app`).

**Document limit reality:**
- Current Andura V1 = RTDB only. Limit per node = 256MB (Firebase docs Q4 2024). Typical user payload `~10-100KB` × ~2-3 orders below limit. SAFE pre-Beta.
- Future Tier 2 archive (post 180d sessions) = Firestore (per ADR 002 REST architecture choice). Limit per doc = 1MB. Mitigation = sub-collection chunking per uid documented.

**Verdict §35-H4:** VERIFIED PASS. Andura runs on RTDB; 256MB node limit ample. Firestore 1MB limit applies only to future Tier 2 archive (deferred per ADR 020 + tier2Stub.js); mitigation strategy (sub-collection chunking) documented in src/firebase.js inline comment.

**Cross-ref:** ADR 002 REST + ADR 020 Tier 2 archive + tier2Stub.js scaffold.

---

## §3 — §48-H2 Adapter NO LONGER fallback verify

**Question:** Verify adapter (coachDirectorAggregate / engineSignalsAggregate) returns REAL engine output path, NOT silent baseline fallback.

**Evidence path 1 — coachDirectorAggregate.ts:**

```ts
// src/react/lib/coachDirectorAggregate.ts:60-94
export async function getCoachToday(opts: { isInCut?: boolean } = {}): Promise<CoachTodayOutput> {
  const readiness = getReadiness(opts);       // engine
  const fatigue = getFatigue();                // engine
  const plannedWorkout = await getTodayWorkout(); // engine async
  const isRestDay = plannedWorkout === null;
  const patternsBanner = getPatternsBanner();  // engine
  const allPRs = getPRHistoryAll();            // engine
  // ...
  const alerts = getProactiveAlerts({});       // engine
  const restReason = isRestDay ? getCoachRestReason() : null; // engine
  const hasEngineData = ...;
  return {
    readiness, fatigue, plannedWorkout, isRestDay,
    patternsBanner, prWallRecent, alerts, restReason,
    source: hasEngineData ? 'engine' : 'baseline',
  };
}
```

All sub-calls go through `src/react/lib/engineWrappers.ts` which wraps `src/engine/*` REAL engine modules. The `source: 'engine' | 'baseline'` flag is computed AFTER all engine calls — `baseline` ONLY when ALL composers return empty (T0 fresh user with zero data). This is correct semantics.

**Evidence path 2 — engineSignalsAggregate.ts:**

```ts
// src/react/lib/engineSignalsAggregate.ts:34-58
export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();           // engine via engineWrappers
  const fatigue = getFatigue();                // engine
  const adherence = getAdherenceOutput();      // Phase 6 task_08 REAL Adherence Engine wire (LANDED)
  // ...
  const anyEngine = readiness !== null || fatigue !== null || adherence.source === 'engine';
  return { vitalityScore, adherenceScore, energyDirection, source: anyEngine ? 'engine' : 'baseline' };
}
```

**Adherence Engine real wire verify (§45-H3 cumulative):**
- engineSignalsAggregate.ts:8-9 inline comment: "Phase 6 task_08: adherenceScore real wired via getAdherenceOutput engine (4-component score: kcal + protein + workout + weight, DB-backed via coachDecisionLog). BASELINE_ADHERENCE constant ELIMINATED — sole baseline fallback path este în getAdherenceOutput defensive (engine throws)."

The baseline fallback IS REACHABLE only via engineWrappers.ts:418-431 catch path:
```ts
} catch (e) {
  console.warn('[engineWrappers] getAdherenceOutput failed:', e);
  captureException(e, { tags: { source: 'engine-adapter-fallback', adapter: 'getAdherenceOutput' } });
  return BASELINE_ADHERENCE_OUTPUT;
}
```

Per §48-H1 LANDED (commit `631ff655`), Sentry alert NOW captures any fallback trigger in production. Silent divergence risk neutralized.

**Verdict §48-H2:** VERIFIED PASS. Adapter path uses REAL engine. Baseline fallback ONLY on engine throw (defensive); Sentry instrumented via §48-H1 LANDED. Coach Director 8-field bundle (§45-H2) + Adherence Engine baseline elimination (§45-H3) cumulative verified.

**Cross-ref:**
- src/react/lib/engineWrappers.ts (commit `631ff655` §48-H1 Sentry instrumentation).
- 02-audit/AUDIT_§47-H2_ENGINE_UI_WIRING.md (engine → UI passive consume invariant).
- 02-audit/AUDIT_§45-H1_ASYNC_MIGRATION_VERIFY.md (async consumer pattern).
- DECISIONS.md §D027 LOCKED V1 Option C async migration.

---

## §4 — Findings summary

**Total verify-only items audited:** 3 (§31-H2 + §35-H4 + §48-H2).

**Drift incidents:** 0.

**Verify-PASS:**
- §31-H2 OAuth Phase 3: NO partial wire exposing. Gated via env var build-time injection. Daniel-controlled GitHub Secret.
- §35-H4 Firebase doc limit: RTDB 256MB/node confirmed. Firestore 1MB/doc applies only to future Tier 2 archive (deferred). Mitigation documented.
- §48-H2 Adapter NO LONGER fallback: REAL engine path verified. Baseline ONLY on defensive engine-throw. Sentry instrumented (§48-H1 LANDED).

---

## §5 — Cross-references

- Auth.tsx + auth.js — OAuth provider wire (env-gated).
- src/firebase.js — RTDB endpoint + Tier 2 archive note.
- src/react/lib/coachDirectorAggregate.ts — Phase 6 task_06 8-field bundle.
- src/react/lib/engineSignalsAggregate.ts — Phase 6 task_08 Adherence real wire.
- src/react/lib/engineWrappers.ts — adapter try/catch + Sentry instrumentation (§48-H1).
- 02-audit/AUDIT_§47-H2_ENGINE_UI_WIRING.md — engine SoT → UI passive.
- 02-audit/AUDIT_§45-H1_ASYNC_MIGRATION_VERIFY.md — async consumer pattern.

---

## §6 — Audit verdict LOCKED

**§31-H2 + §35-H4 + §48-H2 = VERIFIED PASS per audit posture.**

Authority: Co-CTO autonomous per D024 LOCKED V1 PERMANENT. Cross-cluster verify-only consolidated for chat 5 Wave 3-B substrate audit closure batch.
