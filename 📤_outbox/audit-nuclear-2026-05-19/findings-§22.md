# §22 — Refactor-Later-NEVER Scan

**Scope:** TODO/FIXME/HACK/XXX comments + commented-out code + dead code + magic numbers + duplicate logic + 200-line files + premature abstractions + speculative features + 200-line could-be-50 + empty function bodies + commented imports + console.log strip + debugger statements + unused deps + circular imports + jscpd duplication

## Severity matrix §22

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MED | 4 |
| LOW | 4 (positive) |
| NIT | 2 |
| **Total** | **12** |

---

## HIGH findings

### §22-H1 — Vanilla legacy `src/pages/` + `src/components/` dead code at scale (§22.3 reaffirmed §1-H2)
**Severity:** HIGH
**Resolution:** Per §1-H2.

### §22-H2 — `src/App.tsx` Phase 1 placeholder dead code (§22.3 + §1-H1)
**Severity:** HIGH
**Resolution:** Per §1-H1.

---

## MED findings

### §22-M1 — TODO/FIXME concentrated in vanilla legacy + 1 in observationFilter wording backlog (§22.1 + §1-M2)
**Severity:** MED
**Resolution:** Per §1-M2. React production code: ZERO TODO/FIXME ✓.

### §22-M2 — Magic numbers (constants) without declaration: e.g., Antrenor.tsx `FOURTEEN_DAYS_MS = 14 * 86400000` — actually DECLARED at module level ✓
**Severity:** MED — POSITIVE
**Evidence:** Sample Antrenor.tsx:48 `const FOURTEEN_DAYS_MS = 14 * 86400000` named. AaFrictionModal `COPY` + `REASON_LABEL` named. Engine constants in constants.js per engine sub-dir. Discipline preserved.

### §22-M3 — Code duplication % jscpd NOT RUN
**Severity:** MED (§22.16)
**Fix log:** `npx jscpd src/` audit.

### §22-M4 — Circular imports madge audit NOT RUN (§22.15) — covered §20-M4
**Severity:** MED

---

## LOW (POSITIVE)

### §22-L1 — ZERO TODO/FIXME in src/react/ React production code ✓
**Severity:** LOW positive
**Evidence:** Grep confirmed.

### §22-L2 — ZERO `debugger` statements (§22.13) ✓
**Severity:** LOW positive
**Evidence:** Grep returned 0 hits across src/.

### §22-L3 — ZERO `console.log` in src/react/ (TS/TSX) ✓ (§22.12)
**Severity:** LOW positive
**Evidence:** Grep `console.log` in src/react/ → 0 hits. Only console.warn (defensive catch) + console.error (ErrorBoundary). Per §1-C2 those need strip too.

### §22-L4 — Empty function bodies (§22.10) — sample OK; no `function() {}` placeholder leftovers in production code
**Severity:** LOW positive

---

## NIT findings

### §22-N1 — Premature abstractions (§22.7) — engineWrappers 466 LOC could split but acceptable (§1-M8)
**Resolution:** OK Karpathy Simplicity First.

### §22-N2 — Speculative features unused (§22.8) — none observed in sample
**Resolution:** OK pre-Beta scope discipline.

## Karpathy distribution §22
- Simplicity First: 4 (LOW positive findings)
- Surgical Changes: 2 (H1, H2)
