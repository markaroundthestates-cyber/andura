# ADR Cross-Reference Consistency Audit — 2026-04-26 NIGHT

**Scope:** ADR 001-014 + PATCH file — cross-references, status consistency, known drift  
**Total ADRs reviewed:** 14 + 1 patch file

---

## ADR Status Summary

| ADR | Title | Status | Format | Issues |
|---|---|---|---|---|
| 001 | Local-First Storage | Accepted | Standard | OK |
| 002 | Firebase REST not SDK | Accepted | Standard | OK |
| 003 | Double Progression Engine | Accepted | Standard | OK |
| 004 | Rule Engine Numeric Priorities | Accepted | Standard | OK |
| 005 | Vanilla JS + Vite | Accepted | Standard | OK |
| 006 | Three-Tier Log Storage | Accepted | Standard | OK |
| 007 | Firebase Open Rules | Accepted | Standard | OK |
| 008 | Vitest + Playwright | Accepted | Standard | OK |
| 009 | Calibration Tiers | Accepted | **Non-standard** | Status as `## section`, not `**Status:**` bold field |
| 010 | No Anthropic Trademark | **Active** | Standard | Status "Active" vs "Accepted" terminology divergence |
| 011 | Coach Decision Log | Accepted (extended) | Standard | PATCH file co-exists, possible confusion |
| 012 | Tier Decay on Inactivity | Accepted | Standard | OK |
| 013 | Auto-Aggression Detection | Accepted | Standard | Implementation drift from status |
| 014 | Onboarding Profile Typing | Accepted | Standard | Implementation drift from status |
| ADR-011-PATCH | Schema Extension | Apply-as-patch | Non-standard | Separate file, not removed after application |

---

## Issue 1: ADR-011-PATCH file — stale separate file

`docs/decisions/ADR-011-PATCH-2026-04-26.md` exists as a how-to-apply instruction.  
ADR 011 header confirms the patch WAS applied ("Status: Accepted (schema extended 2026-04-26)").

**Problema:** Patch file co-exists cu ADR 011 updated. Future reader may not know if patch was applied.

**Recomandare:** Add note la top of PATCH file: "Patch applied 2026-04-26 to 011-coach-decision-log-architecture.md. This file is kept as historical record."

---

## Issue 2: ADR 009 — non-standard format

ADR 009 uses `## Status` section header instead of `**Status:** Accepted` inline.  
All other ADRs use inline bold format.

**Severitate:** LOW — cosmetic, does not affect content.  
**Recomandare:** Standardize at next edit pass.

---

## Issue 3: ADR 010 — "Active" vs "Accepted"

ADR 010 uses `**Status:** Active` while all others use `**Status:** Accepted`.  
"Active" and "Accepted" are semantically equivalent here but terminology inconsistency.

**Severitate:** LOW — cosmetic.

---

## Issue 4: ADR 013 — implementation drift

ADR 013 tracks implementation order/status:
```
6. Tests — coverage similar cu ADR 011/012 ✓ (completed)
```

**BUT:** Integration steps (coachContext, endSession, UI intervention layer) are NOT marked done  
and are verified NOT implemented (per AA Integration Audit NIGHT).

ADR 013 says: "ready pentru spec EXEC_QUEUE" — but spec was NOT fully executed.

**Specific drift items:**
- `detectAutoAggression` never called from production code
- `aggregateAutoAggression` never called from coachContext
- CDL entries have no `autoAggression` field populated
- ADR 013 "Integration coachContext, e2e UI flows" → NOT done

**Severitate:** HIGH — ADR status "Accepted" implies design complete, but core integration missing.  
**Recomandare:** Add section to ADR 013: "Integration Status — 2026-04-27: Module complete, integration PENDING (see AA_INTEGRATION_AUDIT)"

---

## Issue 5: ADR 014 — implementation drift + dependency claim

ADR 014 Implementation Notes:
```
**ADR 013** — DONE prerequisite — AA detection signals referenced în friction modal
```

**BUT:** AA integration is NOT done (per Task 5 audit).  
Friction modal trigger depends on AA tier in context, which is absent.

Additionally, ADR 014 status: "ready pentru spec EXEC_QUEUE follow-up"  
BUT onboarding Q1-Q5 component, reconciliation prompt, friction modal — all unimplemented.

**Severitate:** HIGH — forward-looking prerequisite marked "DONE" is actually "DONE module only, NOT integration".

**Recomandare:** Clarify in ADR 013/014 that "DONE" = "module + tests DONE" ≠ "integration DONE".

---

## Issue 6: ADR 011 forward references 013 and 014

ADR 011 "See also" includes `[[013-auto-aggression-detection]] | [[014-onboarding-profile-typing]]`.

ADR 011 was created 2026-04-25, extended 2026-04-26 when ADR 013+014 were added.  
The forward references are valid (added via PATCH).

**Severitate:** NONE — correct references post-extension.

---

## Cross-Reference Validity Check

All "See also" references were verified:

| Reference | Target | Exists? | Valid? |
|---|---|---|---|
| [[001]] | 001-local-first-storage.md | ✓ | Valid |
| [[002]] | 002-firebase-rest-not-sdk.md | ✓ | Valid |
| [[003]] | 003-double-progression-engine.md | ✓ | Valid |
| [[004]] | 004-rule-engine-numeric-priorities.md | ✓ | Valid |
| [[005]] | 005-vanilla-js-no-framework.md | ✓ | Valid |
| [[006]] | 006-tier-storage-for-logs.md | ✓ | Valid |
| [[007]] | 007-firebase-open-rules.md | ✓ | Valid |
| [[008]] | 008-vitest-playwright-testing.md | ✓ | Valid |
| [[009]] | 009-calibration-tiers.md | ✓ | Valid |
| [[011]] | 011-coach-decision-log-architecture.md | ✓ | Valid |
| [[012]] | 012-tier-decay-on-inactivity.md | ✓ | Valid |
| [[013]] | 013-auto-aggression-detection.md | ✓ | Valid |
| [[014]] | 014-onboarding-profile-typing.md | ✓ | Valid |
| [[DECISION_LOG]] | docs/ (referenced vault) | ✓ | Valid |
| [[ENGINE_ARCHITECTURE]] | ENGINE_ARCHITECTURE.md | ✓ | Valid |
| [[FIREBASE_AUDIT_1_8]] | docs/FIREBASE_AUDIT_1_8.md | ✓ | Valid |
| [[FAZA_1_FINAL_REPORT]] | docs/FAZA_1_FINAL_REPORT.md | ✓ | Valid |
| [[CTX_ALLLOGS_AUDIT_1_5]] | docs/CTX_ALLLOGS_AUDIT_1_5.md | ✓ | Valid |
| [[OPUS_NUCLEAR_AUDIT_25APR]] | docs/OPUS_NUCLEAR_AUDIT_25APR.md | ✓ | Valid |
| [[LOG_SCHEMA_AUDIT_1_3]] | docs/LOG_SCHEMA_AUDIT_1_3.md | ✓ | Valid |
| [[PROJECT_VISION]] | 01-vision/ (referenced vault) | ✓ | Valid |
| [[STACK_CURRENT]] | 00-index/ (referenced vault) | ✓ (inferred) | Valid |
| [[FINDINGS_MASTER]] | 06-findings-tracker/ (referenced vault) | ✓ | Valid |

**Result:** ZERO broken cross-references. All vault docs referenced exist.

---

## ADR Dependency Graph

```
001 (Local-First)
 └── 002 (Firebase REST) → 007 (Open Rules)
 └── 006 (Tier Storage) → 011 (CDL) → 013 (AA Detection) → 014 (Onboarding)
003 (DP Engine) → 004 (Rule Engine)
009 (Calibration) → 012 (Tier Decay) → 013 (AA Detection)
005 (Vanilla JS) → 008 (Vitest)
010 (No Trademark) — standalone
```

**Observations:**
- ADR 011 is the most connected node (hub) — referenced by 013 and 014
- ADR 013 depends on 011 (CDL schema) and 009 (calibration tiers)
- ADR 014 depends on 013 (profile signals) and 011 (CDL schema extension)
- Removing or significantly changing ADR 011 would cascade to 013 and 014

---

## Summary of Issues by Severity

| Severity | Count | Issues |
|---|---|---|
| HIGH | 2 | ADR 013 implementation drift, ADR 014 dependency drift |
| MEDIUM | 0 | — |
| LOW | 3 | ADR 009 format, ADR 010 terminology, ADR-011-PATCH stale file |

**Overall:** Cross-references are valid and complete. Primary risk is implementation drift on ADR 013+014 — ADR text implies completion, reality is module-only (no integration).

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
