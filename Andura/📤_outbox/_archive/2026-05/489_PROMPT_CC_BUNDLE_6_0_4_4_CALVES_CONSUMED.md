# PROMPT CC — Bundle 6.0.4.4 Calves Library Extension (~30-40 NEW 'gambe' canonical V1)

**Date:** 2026-05-13l (continuation chat ACASĂ post Bundle 6.0.4.3 Glutes LANDED `6b5a4c4`)
**Branch:** `feature/v2-vanilla-port`
**Model:** OPUS EXCLUSIVELY
**Skill orchestration:** `gsd-executor` agent fresh ~200k context
**Scope:** Pure schema additive Bundle 6.0.x sub-batch — NU justified GitNexus per V4 policy

## §-1 INBOX + LATEST CLEANUP MANDATORY PRE-EXECUTE

1. Verify `📥_inbox/` state — archive stale `PROMPT_CC_BUNDLE_6_0_4_3_GLUTES.md` (consumed) → `📤_outbox/_archive/2026-05/<NN>_PROMPT_CC_BUNDLE_6_0_4_3_GLUTES_CONSUMED.md` next-sequential.
2. Archive precedent `📤_outbox/LATEST.md` (Bundle 6.0.4.3 LANDED `6b5a4c4`) → `📤_outbox/_archive/2026-05/<NN>_LATEST_PREVIOUS_BUNDLE_6_0_4_3_GLUTES_LANDED_CONSUMED.md` next-sequential.
3. Save acest PROMPT_CC artefact la `📥_inbox/PROMPT_CC_BUNDLE_6_0_4_4_CALVES.md`.
4. Continue §0 pre-flight grep evidence post cleanup verified.

Find next sequence number under `📤_outbox/_archive/2026-05/` by listing existing files and using next available NN.

## §0 Pre-Flight Grep Evidence Inline Verbatim §AR.20+§AR.21 MANDATORY

```bash
grep -n "muscle_target_primary: 'gambe'" src/schema/exerciseMetadata.js
# Expected: 1 match baseline (Calf Raises legacy V1)

grep -n "gambe" 03-decisions/ADR_ANATOMICAL_CLASSIFICATION_V1.md | head -10
# Expected: §2.11 §3.11 references

grep -c "muscle_target_primary:" src/schema/exerciseMetadata.js
# Expected: 428 baseline post Bundle 6.0.4.3 Glutes LANDED 6b5a4c4

npx vitest run --reporter=dot 2>&1 | tail -5
# Expected: Test Files 169 passed (169) | Tests 3260 passed (3260)
```

**Fail any → ABORT execute, signal back chat-side mismatch.**

## §1 Scope LOCK V1

Extend `src/schema/exerciseMetadata.js` cu ~30-35 NEW calf exerciții `muscle_target_primary: 'gambe'` canonical V1 + fallback_cascade[] populated 5 step types canonical universal apply.

Schema cumulative target: 428 → ~458-465 entries.
Pre-Beta progress: 402/657 = ~61.2% → ~432-437/657 = ~65.8-66.5%.

Anatomical scope: gastrocnemius + soleus + tibialis anterior per ADR_ANATOMICAL_CLASSIFICATION_V1 §3.11.

Bret Contreras + Mike Israetel hypertrophy school reference — calf training high-frequency sustainable. Weakness Detector defer v1.5.

## §2 Constraints HARD §F3.12 STRICT

### §2.1 ZERO mutation existing 428 entries
- ZERO mutation existing 1 'gambe' primary entry (Calf Raises legacy) preserved EXACT
- ZERO mutation any existing entries cross-cluster

### §2.2 Cascade entries 5 step types canonical universal apply
≥70% lenient §20 threshold (target 100% per Bundle 6.0.4.3 precedent)

### §2.3 NU populate `session_sequence_priority`

### §2.4 ZERO src/ outside scope
`src/schema/exerciseMetadata.js` + `src/schema/__tests__/exerciseMetadata.test.js` ONLY

### §2.5 ZERO touch raw layer/wiki/CLAUDE/VAULT_RULES + ZERO 'core' secondary tag
Bundle 6.0.7 Core reserved invariant preserved.

## §3 Phase Split Discrete-Blocks A-E (§AR.22 7th Validation)

5-phase A-E atomic split (calves narrower scope justifies 5-way NU 7-way). Single atomic commit recommended.

### §3.1 Phase A — Tier 1 Standing Calf Raise Compound (~6-7)
### §3.2 Phase B — Tier 2 Seated Calf Raise Soleus Isolation (~5-6)
### §3.3 Phase C — Tier 1-2 Donkey Calf + Specialty (~5-6)
### §3.4 Phase D — Tier 2-3 Tibialis Anterior Reverse (~5-6)
### §3.5 Phase E — Tier 1-3 Bodyweight + Cable + Specialty (~7-8)

**Total Phase A-E:** ~30-35 NEW (Co-CTO discretion ±2). Target ~32 NEW middle.

## §4 Schema Fields Universal Per Entry

```js
'<Calf Exercise Name>': {
  equipment_type: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band',
  equipment_alternatives: ['<existing entry>'],
  force_demand: 'low' | 'medium' | 'high',
  tier: 1 | 2 | 3,
  muscle_target_primary: 'gambe',
  muscle_target_secondary: [],  // typically EMPTY; ZERO 'core' tag
  fallback_cascade: [
    { type: 'easier_machine', exercise_id: '<resolvable>' },
    { type: 'assisted_variant', exercise_id: '<resolvable>' },
    { type: 'muscle_group_compose', exercise_ids: ['<t1>', '<t2>'] },
    { type: 'bodyweight', exercise_id: '<resolvable>' },
    { type: 'light_variant', exercise_id: '<resolvable>' },
  ],
},
```

**`muscle_target_secondary: []` typical** — calves rarely have anatomically defensible secondary tags. ZERO 'core' invariant preserved (Bundle 6.0.7 reserved).

## §5 Test Invariants

### §5.1 §22 Cluster Canonical V1
- §22.11 `gambe` cluster — minimum 1 existing + ~32 NEW = 33+ entries verify
- §22 forEach Object.entries verify NO leak outside 11 canonical V1 strings

### §5.2 §20 Cascade Lenient ≥70% (target 100%)

### §5.3 §1 Schema Count Forward-Compat
```js
expect(Object.keys(EXERCISE_METADATA).length).toBeGreaterThanOrEqual(428 + 30)
```

### §5.4 §10 ZERO 'core' Secondary Tag Invariant Preserved

Expected: 3260 → ~3285-3295 PASS cumulative.

## §6 Test Plan

```bash
npx vitest run --reporter=dot
# Expected pre: 3260 PASS / post: ~3285-3295 PASS ZERO regression

npm run build
# Expected: ~4s 419 modules clean ZERO errors
```

## §7 Commit Format Atomic Single-Concern Bugatti

```
feat(schema): Bundle 6.0.4.4 Calves library extension — 30-35 NEW 'gambe' canonical V1 + fallback_cascade[] universal apply (3260 → ~<final> PASS)

Phase A-E discrete-blocks 5-way split atomic single-concern Bugatti single commit.

🦫 Bugatti craft
```

NU include `Co-Authored-By: Claude` trailer.

### §7.2 Backup Tag Pre-Execute Mandatory

```bash
git tag pre-bundle-6-0-4-4-calves-2026-05-13l
git push origin pre-bundle-6-0-4-4-calves-2026-05-13l
```

### §7.3 Pre-Commit Hook Verde Mandatory (ZERO --no-verify)

## §8 Output `📤_outbox/LATEST.md` §0-§N Structured Report

Mirror Bundle 6.0.4.3 LATEST `6b5a4c4` format §0-§11 sections.

## §9 HARD CONSTRAINT Final Checklist

- [ ] ZERO mutation existing 428 entries cross-cluster
- [ ] ZERO mutation existing 1 'gambe' primary (Calf Raises) preserved EXACT
- [ ] ZERO src/ outside `src/schema/exerciseMetadata.js` + tests file
- [ ] ZERO 'core' in muscle_target_secondary (Bundle 6.0.7 reserved)
- [ ] ZERO `--no-verify` bypass
- [ ] Tests 3260 → cumulative target ZERO regression
- [ ] Build clean ~4s 419 modules
- [ ] §AR.20+§AR.21 grep evidence verbatim inline LATEST.md §0
- [ ] Backup tag pushed origin pre-execute
- [ ] Atomic single-concern Bugatti single commit

**Fail any → ABORT execute, rollback backup tag, signal back.**
