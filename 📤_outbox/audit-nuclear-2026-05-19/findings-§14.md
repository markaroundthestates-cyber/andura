# §14 — State Machine Integrity Audit

**Scope:** Workout 5-moduri FSM + Mode Detection + race conditions + dead states + sessionStart/pausedSnapshot/lastSession transitions + listener cleanup + SessionPill conditional + discriminated unions + exhaustiveness + Zustand persist cross-tab + BroadcastChannel + last-write-wins + visualization + invariants + side effects + persistence boundary + rehydration

## Severity matrix §14

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 5 |
| LOW | 2 |
| NIT | 1 |
| **Total** | **12** |

---

## CRITICAL findings

### §14-C1 — WorkoutState FSM lacks discriminated union → 5-moduri mode detection fragile (§3-H2 reaffirmed)
**Severity:** CRITICAL (§14.1 + §14.7 + §44)
**Evidence:** Per §3-H2 — WorkoutState is shape with optional fields (`sessionStart?: number`, `pausedSnapshot?: PausedSession`, `lastSession?: LastSessionSummary`). Mode detection logic relies on field-presence checks. No `kind: 'idle'|'active'|'paused'|'completed'|'postSession'` tag.
**Fix log:** Per §3-H2 fix. Refactor workoutStore.ts to discriminated union + exhaustiveness checks in selectors.

---

## HIGH findings

### §14-H1 — Cross-tab Zustand persist sync via `storage` event NOT VERIFIED
**Severity:** HIGH (§14.2 + §14.9)
**Evidence:** Zustand `persist` middleware default uses localStorage. Cross-tab sync requires listening to `window.addEventListener('storage', ...)`. Default zustand/middleware persist DOES sync on storage event in v5 — verify implementation.
**Fix log:** Sample workoutStore.ts persist config; verify cross-tab behavior + manual test 2 tabs scenario.

### §14-H2 — `pausedSnapshot` persistence integrity (§14.4 + §7.12)
**Severity:** HIGH
**Evidence:** `pausedSnapshot: PausedSession | null` likely persisted via Zustand persist. Resume-session-card in Antrenor.tsx conditional render. Reload mid-session preserves pausedSnapshot ✓ probable but full E2E test needed.
**Fix log:** Add Playwright E2E `tests/e2e/scenarios/pause-resume.spec.js` (verify file exists in scenarios/).

### §14-H3 — Mode detection event listeners cleanup memory leak risk (§14.5 + §44.9)
**Severity:** HIGH
**Evidence:** Per §44.6 "Pure event listeners (NU polling, NU setInterval — event-driven)". Antrenor.tsx:67-73 `useEffect` w/ cleanup returns `cancelled = true` ✓. Other components NOT inspected. Risk: listener subscribed in component, not unsubscribed on unmount → leak.
**Fix log:** Audit each useEffect with event subscription. Add ESLint react-hooks/exhaustive-deps once §1-C4 lands.

---

## MED findings

### §14-M1 — SessionPill conditional `if (!active && !paused) return null` (§14.6 + §44.8)
**Severity:** MED
**Evidence:** Per §44.8 SessionPill component (src/react/components/SessionPill.tsx) hides when idle. NOT inspected this pass.

### §14-M2 — Dead states unreachable (Active→Idle direct, Completed→Active direct §14.3)
**Severity:** MED
**Evidence:** Per §44.7 spec. Implementation depends discriminated union §14-C1 fix.

### §14-M3 — BroadcastChannel cross-tab sync (§14.10)
**Severity:** MED
**Evidence:** Grep `BroadcastChannel` → not found. Reliance on Zustand persist + storage event only.

### §14-M4 — Last-write-wins resolution policy (§14.11)
**Severity:** MED
**Evidence:** Covered §12-H3.

### §14-M5 — State machine visualization documented (Mermaid?) (§14.12)
**Severity:** MED
**Evidence:** No Mermaid diagram observed. PRIMER §2 spec described 5 moduri verbally. Visual aid would help onboarding.

---

## LOW (POSITIVE)

### §14-L1 — Antrenor.tsx useEffect cleanup pattern correct (cancelled flag) ✓
**Resolution:** Sample OK.

### §14-L2 — workoutStore Zustand persist + createJSONStorage configured ✓
**Resolution:** Per file header sample.

---

## NIT findings

### §14-N1 — Mode detection naming PRIMER §2 vs implementation may diverge (§44.14)
**Resolution:** Defer secondary.

## Coverage map §14.x condensed

| Sub | Severity |
|-----|----------|
| 14.1 5 moduri FSM | §14-C1 |
| 14.2 Race multi-tab | §14-H1 |
| 14.3 Dead states | §14-M2 |
| 14.4 pausedSnapshot transitions | §14-H2 |
| 14.5 Listener cleanup | §14-H3 |
| 14.6 SessionPill conditional | §14-M1 |
| 14.7 Discriminated unions | §14-C1 |
| 14.8 Exhaustiveness | covered §3-M2 |
| 14.9 Zustand cross-tab | §14-H1 |
| 14.10 BroadcastChannel | §14-M3 |
| 14.11 Last-write-wins | §14-M4 |
| 14.12 Visualization Mermaid | §14-M5 |
| 14.13 Invariants documented | NOT INSPECTED |
| 14.14 Side effects per transition | NOT INSPECTED |
| 14.15 Persistence boundary | §14-L2 ✓ partial |
| 14.16 Rehydration integrity | §14-H2 covered |

## Karpathy distribution §14
- Think Before Coding: 1 (H1)
- Goal-Driven: 3 (C1, H2, H3)
