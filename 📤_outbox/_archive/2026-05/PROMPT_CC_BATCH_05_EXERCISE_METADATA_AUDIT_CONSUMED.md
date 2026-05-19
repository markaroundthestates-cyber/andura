# PROMPT_CC_BATCH_05_EXERCISE_METADATA_AUDIT

**Model:** Opus
**Order:** 5/10
**Dependencies:** none (independent EXERCISE_METADATA scope)
**Scope:** Manual audit conservative defaults pentru 26 exerciții EXERCISE_METADATA constant
**Estimate:** ~2-3h

---

## CONTEXT

Per ALIGNMENT_QUESTIONS Q6 deferred → REACTIVATED în acest cluster (Daniel: "nu conteaza ca e opus token waste, rezolvăm acum").

**Scope Daniel original:** 26 exerciții cu conservative defaults pentru pilot Beta. Audit acum = Sprint UI Integration consumă metadata corectă din start, NU refactor după Beta feedback.

**Out of scope:** adăugare exerciții noi sau categorii noi. STRICT review existing 26 entries.

---

## TASKS

### Task 5.1 — Locate EXERCISE_METADATA

Search exact path: `find . -name "*.ts" -o -name "*.js" | xargs grep -l "EXERCISE_METADATA" 2>/dev/null | head -5`

Likely location: `src/data/exercise-metadata.ts` sau `src/engine/exercise-metadata.ts`. Verify exact path.

---

### Task 5.2 — Audit each entry per criteria

For each of 26 exerciții, verify against criteria (per ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 din BATCH_01):

**Required fields per entry:**
- `id`: unique identifier
- `name_ro`: Romanian display name
- `muscle_target_primary`: e.g., 'chest', 'back', 'quads'
- `muscle_target_secondary`: array (optional)
- `force_demand`: 'low' | 'medium' | 'high'
- `equipment_type`: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'band'
- `tier`: 1 | 2 | 3 (forță / hypertrophy / accessory)
- `complexity`: 'beginner' | 'intermediate' | 'advanced'

**Conservative defaults audit checklist:**
1. **Force demand calibration:** Check că `force_demand: 'high'` reserved pentru compound heavy (squat, deadlift, bench, OHP, row). Isolation exercises = 'low' sau 'medium'.
2. **Tier coherence:** Tier 1 forță = compound multi-joint. Tier 2 hypertrophy = compound or major isolation. Tier 3 accessory = isolation small muscles.
3. **Complexity calibration:** 'advanced' DOAR pentru technical lifts (snatch, clean, kipping pull-up). 'beginner' = bodyweight or machine guided. 'intermediate' default safe pentru most.
4. **Muscle target accuracy:** Primary muscle = scientifically dominant prime mover. Secondary = significant assist.
5. **Equipment_type singular:** Each entry exact ONE equipment_type (use most common variant). Alternatives handled via `findAlternatives()` runtime.

---

### Task 5.3 — Generate audit report INLINE

For each entry needing change, document în comment block deasupra entry:

```typescript
// AUDIT 2026-05-02 (BATCH_05): force_demand 'medium' → 'high'
// Rationale: barbell row este compound heavy multi-joint, qualifies tier 1 forță
{
  id: 'barbell_row',
  name_ro: 'Ramat cu bara',
  muscle_target_primary: 'back',
  muscle_target_secondary: ['biceps', 'rear_delts'],
  force_demand: 'high', // changed from 'medium'
  equipment_type: 'barbell',
  tier: 1, // changed from 2
  complexity: 'intermediate'
},
```

For entries OK as-is (NO change), add minimal comment:

```typescript
// AUDIT 2026-05-02 (BATCH_05): OK conservative
{ id: '...', ... }
```

---

### Task 5.4 — Generate audit summary report

**Create file:** `📤_outbox/_archive/2026-05/BATCH_05_AUDIT_DETAILS.md`

```markdown
# Exercise Metadata Audit — Details (BATCH_05)

**Date:** 2026-05-02
**Scope:** 26 exerciții EXERCISE_METADATA constant
**Audit criteria:** force_demand calibration + tier coherence + complexity + muscle target + equipment_type singular

## Summary

- **Total entries:** 26
- **Changed:** <N>
- **OK as-is:** <26 - N>

## Changes detail

### Entry: <id>
- **Before:** force_demand 'X', tier Y
- **After:** force_demand 'X', tier Y
- **Rationale:** <one-line>

<repeat per changed entry>

## Verification

- [✅/❌] All 26 entries reviewed
- [✅/❌] Inline comments added
- [✅/❌] No structural breakage (npm test pass)

## Cross-refs

- ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 (BATCH_01)
- VAULT_RULES §BATCH_PROTOCOL (BATCH_02)
```

---

### Task 5.5 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry:

```markdown
### §36.66 EXERCISE_METADATA AUDIT 2026-05-02

26 exerciții reviewed per ADR_SMART_ROUTING_EQUIPMENT_v1 criteria (force_demand + tier + complexity + muscle_target + equipment_type).

- **Changed:** <N> entries (rationale inline + summary `BATCH_05_AUDIT_DETAILS.md`)
- **OK as-is:** <26-N> entries (conservative defaults validated)

Sprint UI Integration consumă metadata audited din start (NO post-Beta refactor needed).

**Cumulative LOCKED count:** 60 → 60 (data audit, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `grep -c "AUDIT 2026-05-02 (BATCH_05)" <path-to-exercise-metadata>` → expect 26 matches (1 per entry)
2. `ls 📤_outbox/_archive/2026-05/BATCH_05_AUDIT_DETAILS.md` → file exists
3. `grep "§36.66 EXERCISE_METADATA AUDIT" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
4. `npm test` → all pass (Golden Master tests from BATCH_03 may catch metadata changes — UPDATE snapshots dacă justified per audit, document în report)

---

## COMMIT

```
git add <path-to-exercise-metadata> 📤_outbox/_archive/2026-05/BATCH_05_AUDIT_DETAILS.md 06-sessions-log/HANDOVER_GLOBAL.md
git add src/__tests__/golden-master/__snapshots__/ # if updates needed
git commit -m "feat(batch-05): EXERCISE_METADATA audit 26 exerciții conservative defaults

- <N> entries changed (force_demand/tier/complexity calibration per ADR_SMART_ROUTING_v1)
- <26-N> entries OK as-is conservative
- Inline AUDIT comments per entry
- BATCH_05_AUDIT_DETAILS.md summary
- HANDOVER_GLOBAL §36.66 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_05_REPORT.md`:

```markdown
# BATCH_05_EXERCISE_METADATA_AUDIT — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- 26 exerciții reviewed (<N> changed + <26-N> OK as-is)
- Inline AUDIT comments per entry
- BATCH_05_AUDIT_DETAILS.md summary file
- HANDOVER_GLOBAL §36.66 entry
- Golden Master snapshots updated <Y/N>

## Verification gate
- [✅/❌] 26 AUDIT comments matches
- [✅/❌] BATCH_05_AUDIT_DETAILS.md exists
- [✅/❌] grep §36.66: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista — flag dacă changes detected force snapshot updates>

## Next batch
BATCH_06_DOCS_CROSS_REFS_AUDIT
```

Stop. Trigger BATCH_06.
