# LATEST — Bundle 6.0.4.4 Calves Library Extension LANDED — `b9b7fba`

**Task:** Bundle 6.0.4.4 Calves library extension 32 NEW 'gambe' canonical V1 + fallback_cascade[] universal apply 5 step types canonical per ADR_SMART_ROUTING_EQUIPMENT_v2 §2.1 LOCK V2 + ADR_ANATOMICAL_CLASSIFICATION_V1 §3.11 'gambe' canonical V1 LOCK V1.
**Model:** claude-opus-4-7 (CC autonomous Co-CTO)
**Status:** LANDED clean
**Branch:** feature/v2-vanilla-port
**Date:** 2026-05-13l (continuation chat ACASĂ post Bundle 6.0.4.3 Glutes LANDED `6b5a4c4`)

---

## §0 Pre-Flight Grep Evidence Inline Verbatim §AR.20+§AR.21

```
$ grep -n "muscle_target_primary: 'gambe'" src/schema/exerciseMetadata.js  (pre-execute)
113:  'Calf Raises':             { ... muscle_target_primary: 'gambe', muscle_target_secondary: [] }
(1 match — baseline confirmed Calf Raises legacy V1)

$ grep -n "gambe" 03-decisions/ADR_ANATOMICAL_CLASSIFICATION_V1.md | head -10
35:- `gambe` ad-hoc Calf Raises baseline V1
82:11. `gambe` (calves)
180:### §3.11 `gambe`
200:NU subsume `picioare-quads` + `picioare-hamstrings` + `fese` + `gambe` sub unified `picioare`:
241:  'gambe',
252:`gambe` recovery: isolation pattern (decay 24h daily-frequency sustainable).
263:`antebrate` + `gambe` defer phase-cycle similar pattern
281:- `gambe` (calf 1RM less standard reference, high-rep volume typical)
314:- Bundle 6.0.4.4 Calves ~35 NEW (`gambe` primary)
(§2.11 + §3.11 references confirmed)

$ node -e "console.log(Object.keys(require('./src/schema/exerciseMetadata.js').EXERCISE_METADATA).length)"
428  (baseline confirmed via authoritative module load — Object.keys canonical; grep -c "muscle_target_primary:" hit 430 because of getExerciseMetadata sentinel + commented occurrences)

$ npx vitest run --reporter=dot | tail -5
Test Files 169 passed (169)
Tests 3260 passed (3260)
Duration 32.00s
(3260 PASS baseline confirmed)
```

ALL pre-flight evidence PASSED — execute proceed. NOTE: PROMPT_CC §0 expected `grep -c muscle_target_primary` baseline = 428, actual hit = 430 — discrepancy is non-entry occurrences (sentinel + cascade type-name pattern). Object.keys canonical = 428 confirmed. NOT a state mismatch.

---

## §1 Backup Tag Pushed Origin

`pre-bundle-6-0-4-4-calves-2026-05-13l` pushed origin (verified: `[new tag] pre-bundle-6-0-4-4-calves-2026-05-13l -> pre-bundle-6-0-4-4-calves-2026-05-13l`).

---

## §2 Schema Cumulative + Entries Added

- **Baseline:** 428 entries
- **Final:** 460 entries (+32 NEW)
- **'gambe' primary canonical V1:** 1 existing → 33 (+32 NEW)

Phase A-E distribution verified:
- Phase A — Tier 1 Standing Calf Raise Compound: **7 NEW** (Standing Calf Raise Machine / Smith Standing Calf Raise / Leg Press Calf Raise / Hack Squat Calf Raise / Standing Single-Leg Calf Raise / Standing DB Calf Raise / Standing Barbell Calf Raise)
- Phase B — Tier 2 Seated Calf Raise Soleus Isolation: **6 NEW** (Seated Calf Raise Machine / Seated DB Calf Raise / Seated BB Calf Raise / Seated Plate Calf Raise / Seated Single-Leg Calf Raise / Smith Seated Calf Raise)
- Phase C — Tier 1-2 Donkey Calf + Specialty: **6 NEW** (Donkey Calf Raise / Smith Donkey Calf Raise / Banded Donkey Calf Raise / Single-Leg Donkey Calf Raise / Bodyweight Donkey Calf Raise / Eccentric Slow Calf Raise)
- Phase D — Tier 2-3 Tibialis Anterior Reverse: **6 NEW** (Tibialis Raise / Standing Tibialis Raise / Reverse Calf Raise / Cable Tibialis Raise / Banded Tibialis Raise / DB Tibialis Raise)
- Phase E — Tier 1-3 Bodyweight + Cable + Specialty: **7 NEW** (Calf Raise Bodyweight / Single-Leg Calf Raise Bodyweight / Stair Calf Raise / Single-Leg Stair Calf Raise / Cable Calf Raise / Plate-Loaded Calf Raise / Wall Calf Raise)

Total: 7+6+6+6+7 = **32 NEW** entries (within PROMPT_CC §1 target ~30-35 ±2 Co-CTO discretion middle).

Anatomical scope per ADR_ANATOMICAL_CLASSIFICATION_V1 §3.11: gastrocnemius (Standing variants) + soleus (Seated variants) + tibialis anterior (Phase D dorsiflexion). Bret Contreras + Mike Israetel hypertrophy school reference — calf training high-frequency sustainable.

---

## §3 fallback_cascade[] Universal Apply

- 100% NEW entries (32/32) fallback_cascade[] populated 5 step types canonical (easier_machine + assisted_variant + muscle_group_compose + bodyweight + light_variant)
- Cascade refs resolve **100%** (192/192 total refs all resolve to existing entries — baseline 428 OR cumulative Bundle 6.0.4.4 NEW entries)
- §17 lenient ≥70% threshold preserved invariant (target met cu margin substanțial)
- ZERO self-reference via muscle_group_compose or any other step type
- muscle_group_compose 1-2 exercise_ids per ADR v2 §2.1 LOCK "fie 1 exercitiu sau 2"

---

## §4 HARD CONSTRAINT §F3.12 Strict Verify

- [x] ZERO mutation existing 428 entries verified (Object.keys count baseline preserved cross-cluster)
- [x] ZERO mutation existing 1 'gambe' primary entry (Calf Raises legacy V1) preserved EXACT — equipment_type: machine, force_demand: low, tier: 3, muscle_target_primary: 'gambe', muscle_target_secondary: []
- [x] ZERO mutation Bundle 6.0.4.3 Glutes 47 entries preserved invariant (Hip Thrust + variants + Sumo Deadlift + Glute Bridge + Cable Glute Kickback etc)
- [x] ZERO mutation Bundle 6.0.4.2 Hamstrings preserved invariant (Sumo RDL 'picioare-hamstrings' preserved cross-cluster distinct from Sumo Deadlift 'fese')
- [x] ZERO src/ outside scope (only `src/schema/exerciseMetadata.js` + `src/schema/__tests__/exerciseMetadata.test.js`)
- [x] ZERO touch raw layer (`03-decisions/*.md`) / wiki/ / CLAUDE.md / VAULT_RULES.md / 04-architecture/mockups/
- [x] ZERO touch engines/state/router/coach/main/pages/storage/orchestrator
- [x] ZERO `session_sequence_priority` populated baseline (engine-side runtime concern per PROMPT_CC §2.3)
- [x] ZERO 'core' in any muscle_target_secondary (Bundle 6.0.7 Core reserved invariant test §15 preserved — all 32 NEW entries muscle_target_secondary: [] typical for calves anatomically defensible)
- [x] ZERO `--no-verify` bypass — pre-commit hook verde

---

## §5 Tests Baseline Cumulative

- **Pre-execute:** 3260 PASS (169 files)
- **Post-execute:** 3280 PASS (169 files) — **+20 NEW Bundle 6.0.4.4 tests** ZERO regression cross-cluster
- Schema test file: 154 → 174 tests (+20 — §1-§20 Bundle 6.0.4.4 describe block)

Test invariants verified green:
- §1 Library count ≥458 post Bundle 6.0.4.4 (32 NEW; actual 460)
- §2-§6 Phase A-E presence + cascade populated cu length ≥5 sample tier 1
- §7 32 NEW entries muscle_target_primary === 'gambe' canonical V1
- §8 fallback_cascade step types canonical 5 types valid
- §9 muscle_group_compose 1-2 exercise_ids
- §10 Tier 1 calf compound 5-step cascade
- §11-§12-§13 tier + force_demand + equipment_type distribution 6 canonical
- §14-§15 existing 1 'gambe' Calf Raises + V1/Bundle 6.0.1-4.3 preserved invariant ZERO mutation
- §16 NEW entries NEVER self-reference parent name
- §17 cascade references resolve ≥70% (actual: 100%)
- §18 gambe canonical V1 entries count post Bundle 6.0.4.4 ≥33
- §19 ZERO 'core' in muscle_target_secondary (Bundle 6.0.7 reserved invariant)
- §20 muscle_target_secondary typically empty array (calves anatomically defensible secondary tags rare)

---

## §6 §AR.22 DISCRETE-BLOCKS DISCIPLINE 7th Validation Cumulative

Phase A-E 5-way split atomic single-concern Bugatti single commit pattern confirmed (per ADR v2 LOCK V2 + Bundle 6.0.1/6.0.2/6.0.3/6.0.4.1/6.0.4.2/6.0.4.3 precedent threads). Calves narrower anatomical scope justified 5-way NU 7-way split (gastrocnemius + soleus + tibialis anterior subset vs glutes 7-way Phase A-G). Discrete-blocks discipline 7th cumulative validation reinforce.

---

## §7 Pre-Beta Progress

- Baseline: 402/657 = ~61.2%
- Post-Bundle 6.0.4.4: **434/657 = ~66.1%** cumulative
- Increment: **+32 entries (+4.9pp)**

Bundle 6.0.4 hyperthrophy cluster (picioare + fese + gambe) progress:
- Bundle 6.0.4.1 Quads: 45 NEW
- Bundle 6.0.4.2 Hamstrings: 41 NEW
- Bundle 6.0.4.3 Glutes: 47 NEW
- Bundle 6.0.4.4 Calves: 32 NEW
- **Bundle 6.0.4 cumulative: 165 NEW** lower-body exerciții canonical V1 4-cluster split per ADR v2 §2.2 cumulative roadmap.

---

## §8 Anti-Recurrence Considerations

§AR.1-§AR.24 LOCKED V1 preserved invariant:
- §AR.1 pre-flight grep filesystem ÎNAINTE reference paths — applied pre-execute (1 'gambe' baseline + ADR cross-refs + cascade resolve verification)
- §AR.3 ground truth git verify — branch confirmed feature/v2-vanilla-port
- §AR.4 anti-distructive recommendation default — backup tag pre-execute pushed origin
- §AR.20+§AR.21 grep evidence verbatim inline §0 mandatory — applied
- §AR.22 7th validation discrete-blocks discipline reinforce — applied

Anti-Bundle 6.0.1-style 'core' regression preserved invariant: ALL 32 NEW calf entries muscle_target_secondary: [] typical (calves rarely anatomically justify secondary tags — gastrocnemius/soleus/tibialis anterior isolated). ZERO 'core' tag risk eliminated by design. ZERO --no-verify bypass; pre-commit hook would have caught regardless.

§AR.21 PROMPT_CC documentation discrepancy noted (grep -c expected 428 vs actual 430) reconciled inline §0 — non-entry occurrences (sentinel default in `getExerciseMetadata` + cascade type-name patterns). Object.keys canonical authority = 428 baseline confirmed; NOT state mismatch. PROMPT_CC author's grep-c approach inherently off-by-N for files with sentinel fallback objects.

---

## §9 Build Verify Clean

`npm run build` → **built in 3.91s** ✅ ZERO errors. Pre-existing dynamic-import warning (`src/ui/nav.js` from settings.js + main.js) NOT introduced by this change — out of scope per scope boundary rule.

---

## §10 Cross-Refs Authority

- [[../../03-decisions/ADR_ANATOMICAL_CLASSIFICATION_V1.md]] §3.11 'gambe' canonical V1 LOCK V1 (gastrocnemius + soleus + tibialis anterior; Bret Contreras + Israetel hypertrophy school calf high-frequency reference)
- [[../../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md]] §2.1 §2.2 LOCK V2 cascade ordered list 5 step types canonical universal apply
- [[../../03-decisions/008-vitest-playwright-testing.md]] LOCK V1 test infrastructure
- [[../../CLAUDE.md]] §0 output style + §7 Bugatti craft principle
- [[../../VAULT_RULES.md]] §F3.1-§F3.13 + §AR.1-§AR.24 anti-recurrence rules
- [[../../wiki/concepts/anti-recurrence-rules.md]] §AR.20-§AR.24
- [[../../📤_outbox/_archive/2026-05/487_LATEST_PREVIOUS_BUNDLE_6_0_4_3_GLUTES_LANDED_CONSUMED.md]] precedent thread Bundle 6.0.4.3 Glutes LANDED `6b5a4c4`

---

🦫 **Bugatti craft. Bundle 6.0.4.4 Calves LANDED clean. 32 NEW 'gambe' canonical V1 (Phase A-E 5-way discrete-blocks). 428 → 460 cumulative. 3260 → 3280 PASS ZERO regression. Build 3.91s clean. Pre-Beta progress 402/657 → 434/657 (+4.9pp). Bundle 6.0.4 lower-body cumulative cluster: 165 NEW exerciții (Quads 45 + Hams 41 + Glutes 47 + Calves 32).**
