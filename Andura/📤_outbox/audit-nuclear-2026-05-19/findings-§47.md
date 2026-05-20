# §47 — Engine SoT Wording Authority + Wording Autonomous D024 + Pending Wording Backlog

**Scope:** Engine SoT engines emit + NU UI hardcoded duplicate + Wording per engine field + D024 LOCKED V1 PERMANENT + Pending wording backlog + Wording log all changes + Anti-jargon technical + Anti-paternalism + Suflet Andura voice + Engine output → UI consume wired

## Severity matrix §47

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MED | 4 |
| LOW | 5 (positive) |
| NIT | 1 |
| **Total** | **12** |

---

## HIGH findings

### §47-H1 — Pending wording backlog 10 MMI button labels + Refuse banner + Diacritics strip decision (§47.5)
**Severity:** HIGH
**Evidence:** Per spec: "10 MMI button labels (Reincep treptat (recomandat) / De la zero — exact format)" + refuse banner text + diacritics strip universal decision.
**Reasoning:** D024 LOCKED V1 PERMANENT — pre-Beta autonomous compose by Co-CTO (Claude). Daniel post-Beta a-z review window.
**Fix log:** Defer to post-Beta D024 window. Document pending backlog item per §47.5 list.

### §47-H2 — Engine output → UI consume wiring verified per F2/F4/F6/F7/F8 (§47.10)
**Severity:** HIGH
**Evidence:** Sample observed:
- F4 Readiness Verdict: engine emits `{label, color, ...}` via `getReadinessVerdict()` (engine/readiness.js). UI ReadinessVerdict component renders `label` directly.
- F6 PR Wall: engine emits PR delta per exercise; UI PRWallRecent renders top 3.
- Pattern Banner: engine getPatternsBanner returns STAGNATION + LOW_ADHERENCE pattern objects with engine-side wording.

These flows look correct: Engine SoT → adapter → UI passive consume. But spot-checks pending.
**Fix log:** Sample audit each F-feature wiring → ensure UI doesn't hardcode duplicate engine message.

---

## MED findings

### §47-M1 — Wording per engine field audit (Readiness verdict + Fatigue Score label + Pattern alerts + MMI message) (§47.3)
**Severity:** MED
**Resolution:** Sample positive direction; deeper §47-H2.

### §47-M2 — Wording log all changes during pre-Beta autonomous (§47.6)
**Severity:** MED
**Evidence:** Code comments tag e.g. `Phase 5 task_02 wording autonomous compose per D024 LOCKED V1` (AaFrictionModal.tsx:29-32). Practice = inline log via comments. Centralized log NOT separate file. Could capture in `📤_outbox/_archive/wording-changes/`.

### §47-M3 — Anti-jargon technical universal (§47.7)
**Severity:** MED
**Evidence:** Per §9-M4 — "Mock login" + "Phase 1 Foundation" violations §7-C1 + §1-C1.

### §47-M4 — Engine SoT vs UI hardcoded duplicate sample (§47.1 + §47.2)
**Severity:** MED — POSITIVE
**Evidence:** Sample AaFrictionModal.tsx COPY object hardcoded — but for safety modal CTAs (Pauza/Continui), not engine voice. Acceptable separation: UI controls (buttons) vs engine messages (verdicts).

---

## LOW (POSITIVE)

### §47-L1 — D024 LOCKED V1 PERMANENT respected ✓ (§47.4)
### §47-L2 — Anti-paternalism wording preserved (§47.8 + §9-L2)
### §47-L3 — Suflet Andura voice consistent (§47.9 + §9-L6)
### §47-L4 — Engine SoT architecture in place (engineWrappers + adapters consume engines + UI consumes adapters)
### §47-L5 — Wording observed per Daniel-direct register + warm RO + no jargon (sample MedicalDisclaimer, Auth, Onboarding)

---

## NIT findings

### §47-N1 — Pending wording backlog should be tracked in 📤_outbox or new file `08-workflows/wording-backlog.md`
**Resolution:** Defer post-Beta when D024 review window opens.

## Karpathy distribution §47
- Goal-Driven: 2 (H1, H2)
- 5 LOW positive — wording discipline + Engine SoT pattern preserved
