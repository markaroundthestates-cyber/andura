# ADR 007: Firebase RTDB Open Rules (Single-User Personal App)

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | [[FIREBASE_AUDIT_1_8]] | [[001-local-first-storage]] | [[002-firebase-rest-not-sdk]]

## Context

Firebase RTDB rules default to deny-all. Proper per-user auth would require Firebase Auth integration, adding complexity and SDK overhead.

## Decision

Use open rules (`".read": true, ".write": true`) for now. The database path `users/daniel` contains only fitness tracking data — no PII beyond body weight and workout history.

## Consequences

- **Positive:** Zero auth complexity. No login flow for personal device.
- **Negative:** Data is technically world-readable/writable to anyone with the URL.
- **Accepted risk:** The data is non-sensitive personal fitness data. The URL is not publicly shared. Firebase security rules are the only protection layer.
- **Future plan:** Migrate to per-UID scoped rules (`users/$uid`) with Firebase Auth when multi-user or sharing features are needed.
