# §44 — 5 Moduri Mode Detection FSM Specifics

**Scope:** Mod 1 Idle + Mod 2 Active + Mod 3 Paused + Mod 4 Completed + Mod 5 Post-session + Pure event listeners + Transitions FSM valid + Dead states unreachable + SessionPill conditional + Listener cleanup + Persistence boundary + Cross-tab mode sync + Test coverage + Deterministic + PRIMER §2

## Severity matrix §44

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 4 |
| LOW | 4 (positive) |
| NIT | 1 |
| **Total** | **13** |

---

## CRITICAL findings

### §44-C1 — Mode Detection FSM lacks discriminated union (§3-H2 + §14-C1 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §14-C1.

---

## HIGH findings

### §44-H1 — Transitions FSM valid Idle→Active→Paused→Completed→Post-session→Idle (§44.6) — invariant test absent
**Severity:** HIGH
**Evidence:** Implementation in workoutStore actions. Test files exist (`coachStore.test.ts`, `workoutStore.test.ts`). Specific transition matrix test NOT verified.
**Fix log:** Add invariant test: each transition has source state + target state + action; invalid transitions throw.

### §44-H2 — Dead states unreachable (Active→Idle direct disabled) (§44.7) — depends FSM type safety §14-C1
**Severity:** HIGH

### §44-H3 — 5 moduri test coverage each transition vitest + Playwright (§44.12)
**Severity:** HIGH
**Evidence:** Workout E2E partially covered tests/e2e/scenarios/. Per-transition unit test verify needed.

---

## MED findings

### §44-M1 — Pure event listeners NOT polling NOT setInterval ✓ (§44.6)
**Severity:** MED — POSITIVE
**Evidence:** No setInterval observed in workoutStore. Event-driven via Zustand store actions ✓.

### §44-M2 — Antrenor pill state SessionPill `if (!active && !paused) return null` (§44.8)
**Severity:** MED — POSITIVE assumed; verify

### §44-M3 — State persistence boundary pausedSnapshot survives reload, active session ephemeral? (§44.10)
**Severity:** MED (§14-H2)
**Resolution:** Per §14-H2.

### §44-M4 — Cross-tab mode sync Zustand persist + storage event (§44.11) — covered §14-H1

---

## LOW (POSITIVE)

### §44-L1 — 5 moduri documented PRIMER §2 ✓ (§44.14)
### §44-L2 — Event listener cleanup pattern observed Antrenor.tsx ✓ (§44.9)
### §44-L3 — Mode Detection deterministic same state → same mode ✓ (§44.13) — pure function classifier
### §44-L4 — Architectural alignment with state machine principles (well-named transitions, clear bounds)

---

## NIT findings

### §44-N1 — Mod 5 Post-session timeout grace period — verify duration documented
**Resolution:** Defer secondary.

## Karpathy distribution §44
- Goal-Driven: 3 (C1, H1, H2)
- 4 LOW positive — FSM discipline emerging
