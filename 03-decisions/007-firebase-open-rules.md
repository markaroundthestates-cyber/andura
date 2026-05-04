# ADR 007: Firebase RTDB Open Rules (Single-User Personal App)

**Status:** Accepted (amended 2026-05-02 — see §AMENDMENT 2026-05-02 — `database.rules.json` LOCKED schema landed pre-launch + Auth migration prerequisite documented).
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | FIREBASE_AUDIT_1_8 (audit closed, content absorbed în ADRs) | [[001-local-first-storage]] | [[002-firebase-rest-not-sdk]] | [[ADR_MULTI_TENANT_AUTH_v1]] | [[HANDOVER_GLOBAL_2026-04-30_evening]] §34.2

## Context

Firebase RTDB rules default to deny-all. Proper per-user auth would require Firebase Auth integration, adding complexity and SDK overhead.

## Decision

Use open rules (`".read": true, ".write": true`) for now. The database path `users/daniel` contains only fitness tracking data — no PII beyond body weight and workout history.

## Consequences

- **Positive:** Zero auth complexity. No login flow for personal device.
- **Negative:** Data is technically world-readable/writable to anyone with the URL.
- **Accepted risk:** The data is non-sensitive personal fitness data. The URL is not publicly shared. Firebase security rules are the only protection layer.
- **Future plan:** Migrate to per-UID scoped rules (`users/$uid`) with Firebase Auth when multi-user or sharing features are needed.

---

## AMENDMENT 2026-05-02 — `database.rules.json` Pre-Launch Lock + Activation Prerequisite

**Status:** Accepted (Sprint 4.x autonomous Batch A, Blocker 2 partial — file landed, activation blocked).
**Trigger:** [[HANDOVER_GLOBAL_2026-04-30_evening]] §34.2 — Blocker 2 Firebase Rules RTDB Lock pre-launch.
**Decision SSOT:** `database.rules.json` at repo root contains the locked target schema; activation gated on Auth migration completion.

### Locked schema (target state)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read":  "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    }
  }
}
```

### Activation prerequisites — DO NOT publish to Firebase Console until ALL satisfied

1. **Firebase Auth integration** — current `src/firebase.js` uses unauthenticated raw `fetch()` REST calls per [[002-firebase-rest-not-sdk]]. Per-uid rules require `auth.uid` in request, so all `fbGet`/`fbSet`/`fbRemove` callers must pass an auth token (ID token query string `?auth=<idToken>` or upgrade to Firebase JS SDK with implicit auth).
2. **Path migration `users/daniel` → `users/<uid>`** — `src/firebase.js:7` hardcodes `USER_PATH = 'users/daniel'`. Auth migration must replace literal `'daniel'` with `firebase.auth().currentUser.uid` (or a per-tenant equivalent), then perform a one-shot RTDB copy `users/daniel/*` → `users/<dan-uid>/*` so existing data is preserved.
3. **Cross-ref [[ADR_MULTI_TENANT_AUTH_v1]]** — full migration spec already captured (Email Magic Link primary + OAuth Google secondary). That work is the gating dependency for activation of these rules.

**Why land the file now anyway:** schema review by Daniel + audit trail in git + emulator-ready (`firebase emulators:start --only database` resolves it). Publishing to live Firebase Console without prerequisites #1–#2 would brick the production app instantly.

### Blast radius if rules are mis-published

If the file is uploaded to Firebase Console BEFORE Auth migration:
- Existing path `users/daniel/*` becomes unreadable (no `auth.uid` matches `"daniel"` literal).
- App reads return null → `syncFromFirebase()` no-ops → user sees empty state.
- Writes silently fail → all logged sessions lost on next reload.

**Mitigation:** keep current open rules in Firebase Console until [[ADR_MULTI_TENANT_AUTH_v1]] §Implementation Sprint completes. After Auth migration, run a manual `firebase emulators:start` smoke test against `database.rules.json`, then publish.

### Cross-references

- [[HANDOVER_GLOBAL_2026-04-30_evening]] §34.2 (Blocker 2 spec) + §34.1 (T&B Faza 2 — separate Blocker 1)
- [[ADR_MULTI_TENANT_AUTH_v1]] (Auth migration ADR — gates activation)
- [[002-firebase-rest-not-sdk]] (REST fetch posture, no SDK)
- Q-0352 / Q-0362 (RTDB confirm, NU Firestore)
