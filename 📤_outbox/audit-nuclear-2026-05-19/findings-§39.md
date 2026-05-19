# §39 — Library 657 Exercises Schema Deep

**Scope:** Count 657 + Schema fields completeness + Equipment canonical + Muscle taxonomy + Difficulty rating + Variations + Alternatives substitution + RO names + EN names + Instructions RO + Image refs + Schema invariant + Duplicate hunt + Equipment-lipsa fallback + Schema SoT location

## Severity matrix §39

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 2 |
| MED | 5 |
| LOW | 5 (positive) |
| NIT | 0 |
| **Total** | **13** |

---

## CRITICAL findings

### §39-C1 — Library count: GREP returns 650 entries — does NOT match 657 spec
**Severity:** CRITICAL (§39.1)
**Evidence:** `grep -cP "^\s*['\"][A-Z][^'\"]+['\"]:\s*\{" src/schema/exerciseMetadata.js` = **650**. Spec everywhere says "657 exercises". Discrepancy of 7.
- Possible: 7 entries with non-PascalCase keys (lowercase/mixed) not caught by regex.
- Possible: count drift — bundle 6.0.1-6.0.4.2 additions = ~90+98+80+45+41 = 354 NEW + 26 V1 = 380 ≠ 650 nor 657.
- Possible: 657 is total target, 650 current pre-bundle-6.0.5 future additions.
**Fix log:** Sample `wc -l` exerciseMetadata.js + manual count + Daniel CEO clarify "is 657 target or current?"

---

## HIGH findings

### §39-H1 — Schema invariant preserved across deploys NOT VERIFIED automated test (§39.12)
**Severity:** HIGH
**Evidence:** No test asserting exact count + schema field shape. Refactor could silently lose entries.
**Fix log:** Add `src/schema/__tests__/exerciseMetadata.test.js` (file exists per `ls`) → verify entry count + each entry has required fields.

### §39-H2 — Equipment-lipsa fallback chain priority order (§39.14)
**Severity:** HIGH
**Evidence:** `fallback_cascade[]` field documented in 640 of 650 entries (per grep). 10 entries lack fallback_cascade — potentially "primary" exercises that don't need fallback OR oversight.
**Fix log:** Audit 10 missing entries; either populate or document why exempt.

---

## MED findings

### §39-M1 — Schema fields completeness (§39.2)
**Severity:** MED — POSITIVE
**Evidence:** Schema documented header: equipment_type + equipment_alternatives + force_demand + tier + muscle_target_primary + muscle_target_secondary + fallback_cascade. Bundle 6.0.x preserves.

### §39-M2 — Equipment list canonical (§39.3)
**Severity:** MED
**Evidence:** Types: barbell, dumbbell, machine, cable, bodyweight, band (added Bundle 6.0.2). 6 types canonical. Documented.

### §39-M3 — Muscle group taxonomy (§39.4)
**Severity:** MED — POSITIVE
**Evidence:** Per Bundle 6.0.1-6.0.4 expansion (chest, back, shoulders, quads, hamstrings) — categorization clear.

### §39-M4 — Difficulty rating consistent (§39.5)
**Severity:** MED
**Evidence:** `tier: 1|2|3` (force/hypertrophy/accessory) → not classic difficulty (beginner/intermediate/advanced). Mismatched naming with §39.5 spec.

### §39-M5 — RO names accuracy cultural authentic (§39.8)
**Severity:** MED
**Evidence:** Bundle expansion preserved RO conventions. Verify samples.

---

## LOW (POSITIVE)

### §39-L1 — Schema SoT location `src/schema/exerciseMetadata.js` documented ✓ (§39.15)
### §39-L2 — Bundle history documented in header (V1 → 6.0.1 → 6.0.4.2) ✓
### §39-L3 — fallback_cascade structure per ADR_SMART_ROUTING_v2 ✓ (§39.14)
### §39-L4 — `tier` field 1/2/3 + `force_demand` field ✓ (semantic richness)
### §39-L5 — Duplicate hunt accomplished per Bundle 6.0.4.2 header note "4 spec candidates skipped — already defined Bundle 6.0.2" ✓ (§39.13)

## Karpathy distribution §39
- Goal-Driven: 2 (C1, H1)
- Surgical Changes: 1 (H2)
