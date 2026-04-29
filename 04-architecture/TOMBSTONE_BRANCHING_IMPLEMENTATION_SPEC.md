# Tombstone & Branching Implementation Design Spec

**Status:** DRAFT spec ready pentru Sprint 3 implementation
**Date:** 2026-04-30 (Sprint 3 partial scaffold)
**Companion ADRs:** [[011-coach-decision-log-architecture]] (amendment §Firebase sync) | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q9
**See also:** [[018-engine-extensibility-architecture]] §4 Schema Versioning | [[ADR_MULTI_TENANT_AUTH_v1]] | [[001-local-first-storage]]
**Cross-ref:** chat strategic 2026-04-29 lock decision #1 + memory paradox bug HANDOVER §Firebase Sync Re-Pull

---

## Goal

Înlocuiește current Last-Write-Wins (LWW) sync logic cu Tombstone & Branching (T&B) pattern care:
1. Preserve **all writes** (zero data loss principle)
2. Detect și surface conflicts cu UI prompt (user agency)
3. Tombstone retention 90 zile (per ADR 011 amendment)
4. Auto-cleanup Cloud Function lunar
5. Multi-device safe (phone offline 7 zile + desktop concurrent NO data loss)

---

## Components

### Component 1 — Append-only event log invariant

**Current state (LWW):**
- `firebase.js` writes overwrite existing values: `db.ref(path).set(newValue)` — old data lost.
- Conflicting writes from 2 devices = last one wins, other lost silent.

**Target state (T&B):**
- All writes go through `appendEvent(path, event)` instead of `set(path, value)`.
- Each event has unique `id`, `parentId` (for ordering), `timestamp`, `device_id`, payload.
- Reading a path = reduce events to current state.

**Schema event:**
```js
{
  id: 'evt_<timestamp>_<deviceId>_<random>',
  parentId: '<previous_event_id_or_null>',
  ts: 1714515600000,
  deviceId: 'dev-abc123',
  type: 'SET' | 'DELETE' | 'TOMBSTONE',
  payload: {...}, // value being set OR null for DELETE/TOMBSTONE
  schemaVersion: 3, // per ADR 018 §4
}
```

**Storage path:**
```
users/{firebase.uid}/_events/<storage-key>/
  <event.id>: { id, parentId, ts, deviceId, type, payload, schemaVersion }
```

**Reduction logic:**
```js
function reduceEvents(events) {
  // Sort by ts asc + deviceId tiebreaker
  const sorted = [...events].sort((a, b) => a.ts - b.ts || a.deviceId.localeCompare(b.deviceId));

  // Detect branches: 2+ events cu same parentId
  const branches = detectBranches(sorted);
  if (branches.length > 0) {
    return { state: null, conflict: true, branches };
  }

  // Linear reduction
  let state = null;
  for (const evt of sorted) {
    if (evt.type === 'SET') state = evt.payload;
    else if (evt.type === 'DELETE') state = null;
    else if (evt.type === 'TOMBSTONE') state = { _tombstoned: true, retention_until: evt.ts + 90*86400000 };
  }
  return { state, conflict: false };
}
```

### Component 2 — Branch detection algorithm

**Trigger:** 2+ events arrive with same `parentId` from different `deviceId` AND `ts` within sync window (e.g., < 5 min apart).

**Detection logic:**
```js
function detectBranches(sortedEvents) {
  const byParent = new Map();
  for (const evt of sortedEvents) {
    if (!byParent.has(evt.parentId)) byParent.set(evt.parentId, []);
    byParent.get(evt.parentId).push(evt);
  }

  const branches = [];
  for (const [parentId, children] of byParent.entries()) {
    if (children.length > 1) {
      // Multiple events same parent = branch detected
      branches.push({
        parentId,
        children: children.map(c => ({
          id: c.id,
          deviceId: c.deviceId,
          ts: c.ts,
          payload: c.payload,
          summary: summarizePayload(c.payload), // human-readable for UI
        })),
      });
    }
  }
  return branches;
}
```

**Sync window 5 min rationale:** within sync window = legitimate concurrent edit (multi-device active simultan). Outside window = clock skew or offline-then-resync (treat as branch detected too — UI prompt user să aleagă).

### Component 3 — Tombstone schema

**When created:**
- User explicitly deletes (e.g., delete log entry, delete weight reading)
- User account sunset (auth migration — see `ADR_MULTI_TENANT_AUTH_v1` Faza 3)
- Admin force-delete (GDPR Article 17 right to erasure)

**Schema:**
```js
{
  id: 'tomb_<timestamp>_<deviceId>_<random>',
  parentId: '<event_id_being_tombstoned>',
  ts: 1714515600000,
  deviceId: 'dev-abc123',
  type: 'TOMBSTONE',
  payload: null,
  retention_until: 1714515600000 + (90 * 86400000), // 90 zile per ADR 011 amendment
  reason: 'user_delete' | 'account_sunset' | 'gdpr_erasure',
  schemaVersion: 3,
}
```

**Reduction respect:**
- Tombstoned events filtered out din state computation post `retention_until`
- Pre-retention_until: tombstoned event preserved in storage but NOT reflected in current state (allows undo within window)

### Component 4 — UI prompt component (`<BranchConflictModal />`)

**Trigger:** `reduceEvents()` returns `{ conflict: true, branches: [...] }` la app load OR mid-session sync pull.

**UI behavior:**
- Modal blocking, NO scroll-skip (similar la current AA friction modal pattern)
- Title: "Avem versiuni diferite ale acestor date"
- Body per branch: side-by-side compare `branches[i].summary` cu device name + timestamp human-readable
- Buttons:
  - "Folosesc varianta de pe phone" → resolve cu branches[i] selected
  - "Folosesc varianta de pe desktop" → resolve cu branches[j] selected
  - "Păstrez ambele" → split into 2 separate entries (e.g., 2 weight readings same date kept ambele cu suffix "(phone)" / "(desktop)")
  - "Decid mai târziu" → snooze, app uses fallback (most recent timestamp), modal re-appears next sync

**Resolution event:**
- User choice → emit `RESOLVE_CONFLICT` event cu `parentId = conflict_set_root` + `payload = chosen_branch_data`
- Other branches → tombstoned automatically

### Component 5 — Tombstone GC Cloud Function

**Schedule:** monthly cron `0 3 1 * *` (1st of month, 3 AM UTC).

**Function:**
```javascript
// functions/src/tombstoneGC.js
exports.tombstoneGC = functions.pubsub.schedule('0 3 1 * *').onRun(async () => {
  const now = Date.now();
  const allEventsSnap = await db.ref('users').once('value');
  const allUsers = allEventsSnap.val() || {};

  let deletedCount = 0;
  for (const uid of Object.keys(allUsers)) {
    const eventsRef = db.ref(`users/${uid}/_events`);
    const eventsSnap = await eventsRef.once('value');
    const events = eventsSnap.val() || {};

    for (const [storageKey, eventsByKey] of Object.entries(events)) {
      for (const [eventId, evt] of Object.entries(eventsByKey || {})) {
        if (evt.type === 'TOMBSTONE' && evt.retention_until < now) {
          // Delete tombstone + all events with same parentId chain
          await eventsRef.child(`${storageKey}/${eventId}`).remove();
          // TODO: cascade delete tombstoned events (parentId chain)
          deletedCount++;
        }
      }
    }
  }

  console.log(`[tombstoneGC] Deleted ${deletedCount} expired tombstones`);
  return { deletedCount };
});
```

---

## Multi-device test scenarios

Per `tests/golden-master/profiles/manual/` adăugare Sprint 3 (manual-026..030):

### Scenario 1: Phone offline 7 zile + Desktop concurrent writes

- **Setup:** Daniel's phone goes offline (airplane mode). Desktop online.
- **Day 1-7 desktop writes:** 5 logs entries (workout sessions), 3 weight readings, 2 calorie targets adjusted
- **Day 7 phone reconnects:** sync pull
- **Expected behavior:** Phone receives all 10 desktop events, applies linearly (no branches because phone hasn't written during offline)
- **Conflict scenario:** Phone wrote 1 weight reading offline same date as desktop → branch detected → UI prompt
- **Resolution:** User chooses one OR keeps both with suffix → tombstone other(s)

### Scenario 2: 3-way concurrent edit (phone + desktop + tablet)

- **Setup:** All 3 devices online, all 3 update settings.kcal_target într-un interval 2-min
- **Expected:** 3 events with same parentId arrive at sync. branches = 3 children
- **UI:** Modal cu 3 versiuni (phone, desktop, tablet) side-by-side
- **Resolution:** User picks 1 → 2 tombstoned

### Scenario 3: Tombstone race condition (delete simultan pe 2 devices)

- **Setup:** Phone delete log entry A. Desktop delete log entry A. Both within sync window.
- **Expected:** 2 TOMBSTONE events same parentId (the original entry A).
- **Reduction:** Both tombstones present, idempotent → state = tombstoned (correct outcome).
- **NU branches detected** (both devices agree on outcome).

### Scenario 4: User clear localStorage post-tombstone creation

- **Setup:** Phone: user logs entry → user deletes entry (TOMBSTONE event) → user clears localStorage.
- **Phone reload:** local state empty.
- **Phone sync pull:** receives all events including TOMBSTONE.
- **Expected:** Reduction shows entry as tombstoned (NOT restored). Tombstone preserved in cloud cu retention 90 zile.
- **NU data loss** — entry was intentionally deleted, tombstone honored.

### Scenario 5: Cloud Function GC failure mid-run

- **Setup:** Cloud Function throws on user X mid-iteration.
- **Expected:** Sentry alert + retry next month + idempotent (already-deleted entries NOT re-deleted, throw on missing OK)
- **No silent data loss.**

---

## Migration path (Strangler pattern, similar la ADR 011 §Decommissioning)

### Faza 1 — Implement T&B alongside LWW (parallel feature flag)

- Build `appendEvent(path, event)` API in new `src/util/eventLog.js`
- Build `reduceEvents(events)` reduction logic
- Feature flag `tnb_pattern_v1` (per ADR 018 §5) — initially rollout 0%
- Existing LWW writes continue working
- Parallel write: every LWW `set(path, value)` ALSO emits `appendEvent` for shadow comparison

### Faza 2 — Strangler swap LWW → T&B per write path

- Sequential migration: weights → kcals → logs → settings → coach-decisions
- Per write path:
  - Enable feature flag `tnb_pattern_v1` rollout 1.0 pentru this path
  - Read path uses `reduceEvents` instead of direct `db.ref(path).get()`
  - LWW write path retired post-validation
  - Test goldenMaster scenarios (manual-026..030 pass)

### Faza 3 — Decommission LWW + verify tests

- All write paths migrated to T&B
- LWW logic removed from `firebase.js`
- Feature flag `tnb_pattern_v1` removed (always on)
- ADR 011 amendment §Reconsideration Trigger #9 marked CLOSED

### Faza 4 — Tombstone GC enable

- Cloud Function deploy `tombstoneGC` cron
- Monitor first month run via Sentry
- Verify deleted count vs expected

---

## Effort estimate

- **Sprint 3 implementation:** ~50-80h total
  - Component 1 (append-only event log): ~10-15h (refactor firebase.js + new eventLog.js + tests)
  - Component 2 (branch detection): ~5-10h (detection algorithm + tests)
  - Component 3 (tombstone schema): ~5h (schema + retention logic)
  - Component 4 (UI prompt component): ~10-15h (modal + side-by-side compare + resolution UX)
  - Component 5 (Cloud Function GC): ~3-5h (function + cron + monitoring)
  - Faza 1-3 strangler migration: ~10-20h (sequential per write path + parallel run validation + decommission)
  - Tests + Golden Master Suite manual additions: ~5-10h

**Sprint 3 partial (acest spec):** **0h code** — design only.

---

## Schema versioning impact (ADR 018 §4)

T&B implementation = schema change major. Migration runner steps:

1. **v_X→v_Y migration:** existing single-value writes (e.g., `weights['2026-04-29'] = 75.5`) → wrap as event log:
   ```js
   {
     id: 'evt_2026-04-29_legacy_<random>',
     parentId: null,
     ts: <inferred from key>,
     deviceId: localStorage.getItem('device-id') || 'unknown_legacy',
     type: 'SET',
     payload: 75.5,
     schemaVersion: 3,
   }
   ```
2. Migration runner eager pe app load (per ADR 018 DP-5 sign-off)
3. Migration log via Sentry pentru entries > threshold

---

## Cross-references

- ADR 011 amendment §Firebase sync (LWW deprecated → T&B mandatory pre-launch)
- COGNITIVE_ARCHITECTURE_SPEC_v1 §Q9 (DB Split-Brain Event Sourcing + T&B)
- ADR 018 §4 Schema Versioning (migration runner) + §5 Feature Flags (tnb_pattern_v1)
- ADR_MULTI_TENANT_AUTH_v1 (auth_migration_map paralel pattern cu auth migration)
- HANDOVER 2026-04-29 §1 chat strategic memory paradox bug
- AUDIT_5000Q Q-0125 / Q-0126 (LWW vs T&B contradiction)
