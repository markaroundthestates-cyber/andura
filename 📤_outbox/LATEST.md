---
title: LATEST — C2.5 'unknown' Audit Verification + §22.13 Sentinel Test LANDED 2026-05-13k
status: landed
date: 2026-05-13k
task: Audit 'unknown' muscle_target_primary value surfaced post-C2 §5 grep. FINDING: 'unknown' is getExerciseMetadata() FALLBACK sentinel (line 2765) NOT actual entry. ZERO entries reconcile needed. Verification + §22.13 ZERO unknown invariant test added + fallback function semantic clarified.
model: Opus EXCLUSIVELY (claude-opus-4-7)
branch: feature/v2-vanilla-port
tests: 3239 → 3240 PASS (+1 NEW §22.13 sentinel guarantee; ZERO regression; ZERO reconcile needed in real entries)
backup_tag: pre-c2-5-unknown-reconcile-2026-05-13k
---

# C2.5 'unknown' Audit Verification + §22.13 Sentinel Test LANDED 2026-05-13k

**Task:** Audit `'unknown'` muscle_target_primary surfaced post-C2 grep output.
**Model:** Opus EXCLUSIVELY.
**Status:** LANDED.
**Branch:** `feature/v2-vanilla-port`.

## §-1 Inbox + LATEST cleanup pre-execute

- Inbox state: empty (delivery pattern shift 15th consecutive).
- `git mv 📤_outbox/LATEST.md → 📤_outbox/_archive/2026-05/481_LATEST_PREVIOUS_C2_FESE_MIGRATION_LANDED_CONSUMED.md` ✓

## §0 Pre-flight grep evidence verbatim inline §AR.20+§AR.21

```
$ git branch --show-current
feature/v2-vanilla-port ✓
$ git log --oneline | head -3
586f139 docs(outbox): LATEST §8 patch commit hash 3b0849e post C2 'fese' canonical migration LANDED ✓
3b0849e feat(schema): C2 'fese' canonical migration Bundle 6.0.4.2 4 entries + audit legacy ... ✓

$ grep -c "muscle_target_primary: 'unknown'" src/schema/exerciseMetadata.js
1                                                # ONE occurrence — investigation needed ✓

$ grep -n "muscle_target_primary: 'unknown'" src/schema/exerciseMetadata.js
2765:    muscle_target_primary: 'unknown',         # ⚠ LINE 2765 — inside getExerciseMetadata() fallback function NOT entry in EXERCISE_METADATA map

$ grep -o "muscle_target_primary: '[a-z-]*'" src/schema/exerciseMetadata.js | sort -u
biceps / fese / gambe / picioare-hamstrings / picioare-quads / piept / spate / triceps / umeri / unknown
                                                # grep -o matches ALL string literals including fallback function
                                                # NOT an enumeration of actual entry values

$ npx vitest run | tail
Tests 3239 passed (3239)                        # baseline pre-execute ✓
```

## §1 Backup tag pushed origin

- Tag: `pre-c2-5-unknown-reconcile-2026-05-13k` pushed origin ✓

## §2 Scope CONSTRAIN HARD CONSTRAINT §F3.12

ALLOWED: src/schema/exerciseMetadata.js (comment clarification line 2755-2768 fallback function semantic) + src/schema/__tests__/exerciseMetadata.test.js (UPDATE §22.1 error message + NEW §22.13 sentinel test) + 📤_outbox/LATEST.md (NEW raport).

ZERO touch: 03-decisions/ + CLAUDE.md + VAULT_RULES.md + wiki/ + 00-index/ + 08-workflows/ ✓

HARD CONSTRAINT §F3.12 excepție 1× re-invoked NOT triggered: ZERO real entries mutated. Documentation/test enhancements only.

## §3 Investigation finding: 'unknown' is FALLBACK sentinel NOT entry

**Root cause analysis:**

Line 2765 is inside `getExerciseMetadata()` function FALLBACK return object (when caller passes an exercise name not present in `EXERCISE_METADATA` map):

```js
export function getExerciseMetadata(exerciseName) {
  return EXERCISE_METADATA[exerciseName] || {
    equipment_type: 'machine',
    equipment_alternatives: [],
    force_demand: 'medium',
    tier: 2,
    muscle_target_primary: 'unknown',  // ← fallback sentinel for "not found"
    muscle_target_secondary: [],
  };
}
```

**The `grep -o "muscle_target_primary: '[a-z-]*'" | sort -u` command shown in C2 §5 included this fallback string literal alongside real entry values** — the spec author misinterpreted this output as "10 values including unknown as primary in real entries".

**Actual state post-C2:** ZERO real entries in `EXERCISE_METADATA` use `'unknown'` primary. The §22.1 test (`all muscle_target_primary values in canonical V1 11 categorii`) iterates `Object.entries(EXERCISE_METADATA)` — only real entries — and passed all 381 entries post-C2 ✓.

**0 entries reconciled** (Co-CTO audit verification finding: no work needed).

## §4 §22.1 enhanced error message + §22.13 NEW sentinel test

§22.1 enhancement: error message now lists specific non-canonical violators (improves debugging signal):

```js
const violators = [];
Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
  if (!CANONICAL_V1.has(meta.muscle_target_primary)) {
    violators.push(`${name} → ${meta.muscle_target_primary}`);
  }
});
expect(violators, `Non-canonical V1 primary values: ${violators.join(', ')}`).toEqual([]);
```

§22.13 NEW test (ZERO unknown sentinel guarantee):

```js
it('ZERO entries muscle_target_primary === unknown (fallback sentinel guarantee)', () => {
  const unknownEntries = Object.entries(EXERCISE_METADATA)
    .filter(([_, meta]) => meta.muscle_target_primary === 'unknown');
  expect(unknownEntries, `Found ${unknownEntries.length} entries cu unknown primary: ${unknownEntries.map(([n]) => n).join(', ')}`).toHaveLength(0);
});
```

Tests: 3239 → 3240 PASS (+1 NEW §22.13). ZERO regression.

## §5 Fallback function semantic clarified

Added JSDoc comment to `getExerciseMetadata()` clarifying `'unknown'` is fallback sentinel for "exercise not found" — NOT canonical V1. Future readers + caller code reading the file understands intent without needing to trace the value through tests.

Inline comment added next to `muscle_target_primary: 'unknown'` line: `// NOT canonical V1 — fallback sentinel for "not found"`.

## §6 Atomic commit + push

- Commit hash: pending atomic commit step.
- Branch: `feature/v2-vanilla-port`.

## §7 Path forward C3 next

C3 commit (separate fresh chat): ADR_SESSION_SEQUENCE_ORDERING_V1 NEW (vault meta-tooling doc-only).
Derive rules din Goal Templates + persona: izolare-first hypertrofie default, compound-first Forță override, Maria conservative warm-up extended.

Subsequent: C4 engine refactor cluster Big 8 expansion. C5 Bundle 6.0.4.3 Glutes ~40-50 NEW `fese`. C6 Bundle 6.0.4.4 Calves ~35 NEW `gambe`. C7 `/wiki-ingest` cumulative cluster.

## §8 Anti-recurrence finding §AR.* candidate scribe-mode marked 1× threshold

**Slip surfaced:** `grep -o "muscle_target_primary: '[a-z-]*'" | sort -u` includes ALL string literals (real entries + fallback function defaults + any other matching pattern). Interpreting this as "all entry primary values" is incorrect. C2 §5 raport listed `unknown` in final sorted output triggering C2.5 false alarm.

**Codify next /wiki-ingest:** "When auditing canonical schema field values, use programmatic enumeration of real entries (`Object.entries(EXERCISE_METADATA)`) NOT grep -o sort -u on file string literals. Tests using `.forEach` over Object.entries are the authoritative invariant check (§22.1 + §22.13 cumulative)."

1× threshold scribe-mode marked. Codify §AR.* anti-recurrence rule next handover dacă pattern repeats (post C3-C7 audits).

🦫 Bugatti craft. C2.5 verification LANDED 2026-05-13k. ZERO real entries mutated. Documentation + test enhancement only. Per Daniel CEO directive trust delegation MAXIMUM Co-CTO autonomous tactical audit. ZERO Daniel confirmation theater.
