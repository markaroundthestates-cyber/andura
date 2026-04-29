# Manual Crafted Profiles — Daniel curate, Sprint 2-3

**Target:** 100 edge case profile **NOT** covered by `generated/` distribution. Per chat strategic 2026-04-29 lock decision #7 — hybrid Golden Master Suite (150 generated + 100 manual = 250 total).

**Sprint 2 status:** acest folder = **gol intenționat**. Daniel adaugă profile incremental Sprint 2-3 pe măsură ce identifică edge cases reale din populația target.

## Format

JSON files cu același schema ca `../fixtures/sample-profile.json`. Naming convention: `manual-XXX-<short-tag>.json` (ex: `manual-001-pregnancy-postpartum.json`).

Diferență față de `generated/`:
- `tags` include `["manual", "edge_case"]`
- `_metadata.intentional_edge_case = true`
- `_metadata.intentional_edge_case_doc` = paragraph despre de ce profile-ul e edge case + ce engine response e expected (ground truth)

## Edge case categories prioritare (Daniel craft pe order priority)

### 1. Safety tripwire activations (ADR 013 + PRODUCT_STRATEGY §5)

- **manual-001-pregnancy-postpartum** — femeie 32y, postpartum 3 luni, return mode. Expected: SAFETY_TRIPWIRE_GLOBAL active → Passive Mode, NO PUSH/PROGRESSIVE OVERLOAD.
- **manual-002-heart-condition-disclosed** — bărbat 48y, BP medication. Expected: red disclaimer screen acknowledged, Passive Mode.
- **manual-003-eating-disorder-pattern** — femeie 22y, weight drop 6kg în 4 săpt + volume max. Expected: AA detection HIGH tier + Passive Mode forced (per Safety Asymmetric §5.11).

### 2. Profile typing edge cases (ADR 013 §4)

- **manual-004-yo-yo-on-and-off** — bărbat 35y, 6 săpt commitment + 4 săpt drop pattern. Expected: profile typing Yo-yo + reconciliation prompt 4-6 săpt.
- **manual-005-sprinter-frustration-spiral** — bărbat 28y, low rating + add volume next session, 4+ săptămâni. Expected: AA detection MED tier (volume creep + frustration markers).
- **manual-006-marathon-steady** — bărbat 40y, 18 luni consistency, low variance. Expected: profile typing Marathon, low intervention rate.

### 3. Demographic outliers (ADR 017 cohort)

- **manual-007-60plus-joint-replacement** — bărbat 62y, knee replacement 18 luni, low impact only. Expected: weak_groups locked legs heavy, exercise substitution forced.
- **manual-008-female-postmenopausal** — femeie 55y, hormonal shift, recovery 2× longer. Expected: volume recommendation conservative, RPE cap 7.
- **manual-009-teenager-developing** — bărbat 17y (≥16 minimum age threshold), bone growth ongoing. Expected: cap 1RM%, volume conservative.

### 4. Medication / health confounds

- **manual-010-antidepressant-fatigue** — femeie 30y, SSRI 6 luni, fatigue baseline higher. Expected: REALTIME readiness emoji weight ↑, fatigue inference confidence calibrated lower threshold.
- **manual-011-steroid-PED-user** — bărbat 32y, exogenous (disclosed onboarding). Expected: recovery enhanced confound, AA thresholds reweighted, NU intervenție on volume creep (legitimate enhanced recovery).
- **manual-012-diabetic-insulin** — bărbat 45y, T1 diabetic. Expected: kcal metabolism context flag, hypo risk warning at fatigue ≥ threshold.

### 5. Lifestyle context

- **manual-013-IF-ramadan** — bărbat 28y, Ramadan fasting period. Expected: Fasting Mode toggle ON, RPE cap 8, volume conservative.
- **manual-014-night-shift-worker** — femeie 35y, shift work, sleep <6h regular. Expected: REALTIME 4-emoji always low, recovery debt threshold relaxed (chronic baseline NOT acute warning).
- **manual-015-multi-gym-switcher** — bărbat 30y, 3 gym-uri / săpt (home + work + travel). Expected: equipment availability dynamic, exercise substitution ready.

### 6. Injury history

- **manual-016-chronic-shoulder-injury** — bărbat 38y, supraspinatus tear 2y. Expected: weak_groups blocked overhead pressing, alt biomechanic substitution.
- **manual-017-disc-herniation-recovery** — bărbat 42y, L4-L5 herniation, returning post 6 luni. Expected: deadlift blocked, hip hinge alt only.

### 7. Powerlifter / Strength athlete

- **manual-018-powerlifter-meet-prep** — bărbat 28y, meet 6 săpt away, peak block. Expected: volume reduce + intensity peak, RPE management strict.

### 8. Beginner / Demographic prior heavy

- **manual-019-beginner-female-no-experience** — femeie 25y, zero gym history. Expected: T0 + COLD_START + demographic prior ADR 017 active (cohort prior 'female_beginner_25').
- **manual-020-elderly-rehab** — femeie 70y, rehab post-fall. Expected: SAFETY_TRIPWIRE_GLOBAL + Passive Mode + bodyweight focus.

## Daniel review process

Pentru fiecare profile manual adăugat:
1. Validate JSON cu `node tests/golden-master/runner.js --profile path/to/profile.json --dry-run`
2. Compare expected_arbitrator_output cu engine actual output runtime
3. Update `expected_arbitrator_output` în profile JSON dacă engine math evolved și e new ground truth
4. Commit cu mesaj: `test(golden-master): add manual profile <short-tag>`

## Sprint 3+ expansion

Sprint 2 livrează 30 generated + 0 manual = 30 total. Target Sprint 3-4 = 150 generated + 100 manual = 250 total. Generator script (`generate.js`) re-rulează cu `--count 150` pentru expansion.
