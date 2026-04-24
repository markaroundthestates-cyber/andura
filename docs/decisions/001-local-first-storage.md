# ADR 001: Local-First Storage with Firebase Sync

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | [[FIREBASE_AUDIT_1_8]] | [[007-firebase-open-rules]]

## Context

SalaFull needs to work offline (gym environments often have poor connectivity) while also supporting data backup and potential future multi-device use.

## Decision

All data is stored in `localStorage` as the primary source of truth. Firebase RTDB is used as a secondary, best-effort sync layer. The app functions fully without Firebase connectivity.

## Consequences

- **Positive:** Works offline. No loading spinners waiting for Firebase. User owns their data locally.
- **Positive:** Zero cost when Firebase is unavailable.
- **Negative:** Last-write-wins with local priority — if same date edited on two devices, local always wins regardless of recency. Proper per-entry timestamp resolution deferred.
- **Negative:** localStorage is limited to ~5MB; mitigation via TierStorage pruning for logs > 1 year.
