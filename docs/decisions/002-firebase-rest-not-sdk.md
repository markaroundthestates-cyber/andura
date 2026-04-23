# ADR 002: Firebase via REST API, Not SDK

**Status:** Accepted  
**Date:** 2026-04-23

## Context

Firebase offers an official JavaScript SDK. Using it would add ~150KB gzipped to the bundle.

## Decision

Use Firebase RTDB's REST API directly (`fetch` to `.json` endpoints) instead of the Firebase JS SDK.

## Consequences

- **Positive:** Bundle stays small (~50KB total vs. ~200KB with SDK).
- **Positive:** No Firebase auth complexity; uses open rules for single-user personal app.
- **Negative:** No real-time listeners — sync is pull-based (on app start) + push-based (debounced 3s after any write).
- **Negative:** Open Firebase rules (intentional for personal use; scoped per-UID auth deferred).
- **Note:** Rule open by design — see ADR 007 for security posture.
