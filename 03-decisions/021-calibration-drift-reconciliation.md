# ADR 021: Calibration Drift Reconciliation (Version Vector + Max-Merge)

**Status:** Accepted
**Date:** 2026-04-30 (evening)
**See also:** [[009-calibration-tiers]] | [[011-coach-decision-log-architecture]] | [[014-onboarding-profile-typing]] | [[ADR_MULTI_TENANT_AUTH_v1]] | [[DECISION_LOG]]

---

## Context

Multi-device sync edge case identificat în Gemini 3 Pro cross-check 2026-04-30 evening **Q10 BLIND SPOT #2**:

> "Calibration Drift offline lung — fără mecanism reconciliere între devices. Device B offline 30+ zile la INITIAL tier, device A active la PERSONALIZED. Sync reconnect → drift cum se rezolvă fără pierdere progres?"

**Scenario concret:**

```
Device A (PC office): activ, sesiuni dense, atinge T1 PERSONALIZING (24 sesiuni, calibration_confidence avansat)
Device B (phone gym, offline 35 zile): rămâne la T0 INITIAL state
Sync reconnect:
  - Naive LWW (Last-Write-Wins) ar putea suprascrie A cu B → REGRESS catastrofal
  - Naive merge fără reconcile → split state ambiguu, engine confusion
  - Pierdere observații negative (yo-yo flag, AA HIGH events) = liability gap
```

**De ce e blocker pentru Faza 2 T&B (NU pre-launch immediate):**

1. ADR 011 amendment 2026-04-30 — LWW deprecated, T&B mandatory pre-launch + 90 zile retention. Reconciliation mecanism = prerequisite spec pentru implementation T&B Faza 2.
2. Multi-tenant Auth Sprint 3 introduce sync real cloud (vs local-only) → drift devine real problem.
3. Daniel folosește 2 anonymous accounts pre-launch (phone + PC, D12 = ✅ accounts merge pre-Faza-1) — testează deja scenariu.

**Existing relate context:**

- ADR 009 amendment 2026-04-30 — tier system SSOT cu 2 axe ortogonale: `engine_tier` (T0/T1/T2) + `calibration_confidence` (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED, 6 nivele post D1 decision).
- ADR 011 — Tombstone & Branching (T&B) replace LWW. Faza 2 T&B logs first per D13 routing.
- ADR 014 — Profile Typing reconciliation pattern (4-6 săpt, 1-click accept/decline) — separate axis, NU same mechanism.

---

## Decision (SSOT)

### Axa `engine_tier` (cantitate, T0/T1/T2)

**Strategy: Max Wins Monotonic.**

- Device cu mai multe `unique_session_count` câștigă tier la sync.
- Device offline adoptă scor mai mare (canonical) la sync.
- **Rationale:** session count e cantitate cumulativă reală. Nu există "regression" legitim — e fizic imposibil să "deja făcut" mai puține sesiuni decât ai făcut.

### Axa `calibration_confidence` (calitate, COLD_START → OPTIMIZED)

**Strategy: Monotonic Clock — observații negative NU pot fi șterse.**

- State only progresses sau retains, never regresses.
- Observații negative (yo-yo detected, frustration markers > threshold, AA tier HIGH event, plateau >2 săpt) **persistă** chiar dacă device offline lung.
- Sync conflict: max-progress wins per ordering enum.
- **Rationale:** confidence = signal quality. Pierderea unei detection negative = liability gap (Gemini Q10 BLIND SPOT #3 cross-link). Engine învață din erori; ștergerea = regresie product knowledge.

### Version Vector pe object calibration

- Fiecare schimbare tier (engine_tier sau calibration_confidence) = increment version per device.
- Sync conflict resolution:
  - Device cu version mai mare = canonical state.
  - **DAR** date din branch "pierzător" (session_count, observations) sunt **merged** în istoric (zero progres loss).
  - Result: canonical state cu integration totală (no-loss merge).

---

## T&B interaction (ADR 011 cross-ref)

La branch conflict resolution în T&B (Faza 2):

- Arbitrator compare snapshot calibration din ambele branches.
- **Newer/more sessions = canonical engine_tier** (Max Wins).
- **calibration_confidence păstrează cel mai progresat state** (max-merge per ordering enum).
- Reconciliation event log în CDL pentru audit trail (`outcome.reconciliation = { event: "tier_merge", from_branches: [A, B], canonical: ... }`).

T&B = mecanism general (logs, profile, config). Calibration_state = subset specific cu reguli max-merge. Coerență prin Arbitrator central.

---

## Schema

```json
{
  "calibration_state": {
    "engine_tier": "T1",
    "calibration_confidence": "PERSONALIZING",
    "version_vector": {
      "device_A_uuid": 12,
      "device_B_uuid": 8
    },
    "last_updated": "2026-04-30T18:00:00Z",
    "session_count": 24,
    "observations": {
      "yo_yo_detected": false,
      "aa_high_events": [],
      "frustration_markers_count": 2,
      "plateau_streaks_weeks": 0
    }
  }
}
```

**Field guarantees:**

- `engine_tier` — enum, monotonic non-decreasing per Max Wins.
- `calibration_confidence` — enum ordering COLD_START < INITIAL < DEVELOPING < PERSONALIZING < PERSONALIZED < OPTIMIZED, monotonic non-decreasing per max-merge.
- `version_vector` — element-wise non-decreasing on each device, MAX-merge on sync.
- `session_count` — monotonic non-decreasing, sum-or-max-merge (decizie spec implementation: prefer SUM cu de-dup pe `session_id` real).
- `observations` — monotonic accumulation, never delete.

---

## Reconciliation algorithm pseudocode

```
on sync(branch_A, branch_B):
  # Cantitate
  max_session_count = MAX(branch_A.session_count, branch_B.session_count)
  canonical_engine_tier = compute_tier(max_session_count)  # per ADR 009 thresholds

  # Calitate (max-merge per ordering enum)
  canonical_confidence = max_progress(
    branch_A.calibration_confidence,
    branch_B.calibration_confidence,
    ordering = [COLD_START, INITIAL, DEVELOPING, PERSONALIZING, PERSONALIZED, OPTIMIZED]
  )

  # Version vector element-wise MAX
  canonical_version_vector = {
    device: MAX(branch_A.vv.get(device, 0), branch_B.vv.get(device, 0))
    for device in (branch_A.vv.keys() | branch_B.vv.keys())
  }

  # Observations — union-merge (monotonic accumulation)
  canonical_observations = {
    yo_yo_detected: branch_A.obs.yo_yo OR branch_B.obs.yo_yo,
    aa_high_events: dedupe(branch_A.obs.aa_events + branch_B.obs.aa_events, by="event_id"),
    frustration_markers_count: MAX(branch_A.obs.frustration, branch_B.obs.frustration),
    plateau_streaks_weeks: MAX(branch_A.obs.plateau, branch_B.obs.plateau)
  }

  # Persist canonical
  persist({
    engine_tier: canonical_engine_tier,
    calibration_confidence: canonical_confidence,
    version_vector: canonical_version_vector,
    session_count: max_session_count,
    observations: canonical_observations,
    last_updated: now()
  })

  # Audit
  log_reconciliation_event_in_CDL({
    branches: [branch_A.id, branch_B.id],
    canonical_summary: {...},
    timestamp: now()
  })
```

---

## Edge cases

**EC-1: Both branches same `session_count` + different `calibration_confidence`**
- Max progress wins (per ordering enum).
- Log reconciliation event (audit trail visibility — Daniel can debug "why tier X not Y").

**EC-2: Branch_B has yo-yo flag set, branch_A doesn't**
- Flag preserved (monotonic negative observation, never deleted).
- Engine continuă să trateze user ca "yo-yo profile" indiferent de branch dominance.

**EC-3: Network partition during sync (mid-write)**
- Idempotent retry (pseudocod above e pure function — same input = same output).
- Last successful canonical wins.
- Dacă ambele devices retry simultan → deterministic result via Arbitrator central T&B.

**EC-4: User clear localStorage on device**
- `calibration_state` lost local, restored from Firebase next sync (Tier 2 archive per ADR 020).
- **NU** re-baseline from 0 — restore canonical state din cloud.
- Edge: dacă user clear ÎNAINTE de prima sync → engine restart from COLD_START (acceptable, rare scenario).

**EC-5: Anonymous → Auth migration (Multi-tenant ADR cross-ref)**
- Pre-Auth: 2 anonymous UUIDs (phone + PC) cu state separate.
- Post-Auth: merge cele 2 UUIDs sub un singur `auth.uid` ownership.
- Reconciliation: aplică algorithm above pe cele 2 anonymous calibration_states.
- Daniel foloseste exact acest scenario pre-launch (D12 routing).

**EC-6: Clock skew (device A 2h ahead device B)**
- `last_updated` NU e tie-breaker. Version vector + max-merge handle conflict.
- Acceptable: clock skew nu afectează correctness (doar audit log timestamp).

---

## Implementation phasing

### Pre-Faza-2 T&B (Sprint 3 full bagaj — spec must be done)

- ADR 021 spec accepted (acest fișier).
- Schema versioning bump (engine_tier + calibration_confidence + version_vector + observations).
- Migration runner pre-fill `version_vector` pentru existing users (init = `{ <device_uuid>: 1 }`).

### Faza 2 T&B logs first (D13 routing — high-frequency write, blast radius low)

- Reconciliation algorithm implementat în Arbitrator T&B core.
- Tests Golden Master Suite multi-device scenarios (Sprint 3 full required):
  - 2-device divergence + reconcile.
  - 3-device chain conflict (rare but possible).
  - Anonymous → Auth migration scenario.
  - Negative observation preservation (yo-yo flag preserved).

### Faza 3 decommission LWW

- Reconciliation fully active.
- LWW code paths removed.
- Telemetry observabil pentru reconciliation events frequency.

---

## Open Items pentru Sprint 3 full implementation

1. **Version Vector siguranță Anonymous → Auth migration** — UUID anonymous vs `auth.uid` namespacing strategy. Spec Sprint 3 detail.
2. **Cloud Function cleanup** — vechiul `calibration_state` post-reconciliation? (90 zile grace per ADR 011 retention, after which delete archived state).
3. **Telemetry reconciliation events** — frequency, conflict types, manual override frequency. Sentry events pentru observability.
4. **`session_count` merge strategy** — SUM cu dedupe pe `session_id` (preferred) vs MAX (simpler dar pierde count cumulat real). Spec Sprint 3 decision.
5. **UI surface reconciliation outcome?** — silent (default) vs notification user "Datele de pe phone + PC au fost combinate". Decizie design Sprint 3.
6. **Conflict cu Profile Typing reconciliation (ADR 014)** — separate axis, dar overlap timing? Spec verify că NU rulează simultan.

---

## Consequences (positive)

- **Multi-device sync robust + zero progress loss.**
- **Foundation pentru Profile Typing reconciliation extension** (ADR 014 cross-ref) — same Version Vector pattern aplicat altui domain.
- **Liability protection** — observații negative (AA HIGH, yo-yo) preservate → audit trail complete pentru injury liability case (per ADR 013 Liability Flag pattern).
- **Standard distributed systems pattern** — Version Vector battle-tested (Riak, Cassandra, Voldemort) — zero invention risk.
- **Anonymous → Auth migration smooth** (D12 scenario Daniel pre-launch testabil).

## Consequences (negative)

- **Effort 8-12h spec → impl Sprint 3 full** (reconciliation algorithm + tests Golden Master multi-device + migration runner schema bump).
- **Storage overhead per `calibration_state`** — ~200 bytes/device în version_vector + observations. Negligible (chiar la 10 devices/user = 2KB).
- **Reconciliation logic complexity** — debugging hard fără tests dense. Mitigation: Golden Master Suite Sprint 3 mandatory.
- **Non-deterministic UI** — la sync, tier user poate "salta" (T0 → T1) instant pe device B. UX acceptable (positive event), dar surprins user. Considerăm UI prompt opt-in Sprint 3.

---

## Risks + mitigation

1. **Version Vector grow unbounded** (multi-device sequence increments).
   - **Mitigation:** cap N=10 devices per user (realistic limit — useri reali NU au 50 devices). Garbage collect older entries cu `last_seen > 1 year`.

2. **Reconciliation bugs hard to test**.
   - **Mitigation:** Golden Master Suite multi-device scenarios required (Sprint 3 full). Stryker mutation testing pe reconciliation core (D7 routing — autonomous overnight).

3. **Race condition mid-sync** (device A + device B syncing simultaneously, timestamp tie).
   - **Mitigation:** Arbitrator T&B = central serialization point. Idempotent algorithm (retry-safe).

4. **Schema migration breaks existing users** (pre-ADR 021 calibration_state without version_vector).
   - **Mitigation:** migration runner init `version_vector = { <device_uuid>: 1 }` pentru toți users existing. Backfill safe.

5. **User confusion "tier reset"** post-sync (T1 PC pare să "reset" la T0 dacă phone offline lung).
   - **Mitigation:** logic explicit Max Wins → tier NU regresează. Dacă apare aparent regression = bug (test catch-all în Golden Master).

---

## Reconsideration triggers

1. **Useri raportează "tier reset" post-sync** → revisit Max Wins logic, audit edge case.
2. **Version Vector overhead crește** (>10KB pe user) → migrate la CRDT alternative (e.g., Last-Writer-Wins per field cu vector clock simplified).
3. **Reconciliation events frequency >5%/sync** → investigate why drift atât de des, redesign sync intervals.
4. **Multi-tenant Auth scope schimbă** → revisit version_vector keying (UUID vs auth.uid).
5. **Profile Typing reconciliation conflict observed** → unify cu ADR 014 reconciliation timing/window.

---

## Cross-references

- [[009-calibration-tiers]] — calibration tiers SSOT (2 axe ortogonale, 6 nivele post D1).
- [[011-coach-decision-log-architecture]] — CDL T&B foundation, audit trail reconciliation events.
- [[014-onboarding-profile-typing]] — Profile Typing reconciliation pattern (separate axis).
- [[018-engine-extensibility-architecture]] — schema versioning + migration runner pattern.
- [[020-storage-tiering-strategy]] — Tier 2 Firebase archive pentru calibration_state (EC-4 restore).
- [[ADR_MULTI_TENANT_AUTH_v1]] — UUID Anonymous → auth.uid namespacing (EC-5 migration).
- HANDOVER_GLOBAL_2026-04-30_evening §6.7 — effort total update.

---

🦫 **ADR 021 — Calibration Drift Reconciliation. Multi-device robust, zero progress loss.**
