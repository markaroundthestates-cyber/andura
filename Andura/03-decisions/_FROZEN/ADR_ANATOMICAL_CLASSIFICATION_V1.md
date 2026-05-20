---
title: ADR ANATOMICAL_CLASSIFICATION V1 — 11 categorii canonical muscle_target_primary taxonomy (fese + core + antebrate NEW) + Big 8 engine refactor mapping
status: locked-v1
locked_date: 2026-05-13k
authors: Daniel CEO + Co-CTO autonomous chat ACASĂ 2026-05-13k
related_adrs:
  - ADR_SMART_ROUTING_EQUIPMENT_v2.md (LOCK V2 cascade ordered list pattern §2.1 §2.2)
  - ADR-026 Offline Coaching Tree (engines §9 pipeline foundation)
  - ADR-024 Goal-Driven Program Templates (Q6 D Hybrid streak counter §EXT-1 §EXT-2)
  - ADR-029 Engine Specialization (PARALLEL modifier Big N candidates)
  - ADR-032 Engine Deload Protocol (Engine 2 pipeline §42.10)
mandatory_pre_beta: true
scope_change_estimate: ~50-80 NEW tests + 4 entries migration Bundle 6.0.4.2 (separate C2 commit) + Big 8 engine refactor cluster (separate C3 commits) + Bundle 6.0.4.3 Glutes ~40-50 NEW canonical 'fese' (separate C4 commit)
supersedes: NONE (NEW ADR V1, first version anatomical taxonomy)
superseded_by: NONE (LOCK V1 active)
amendments: []
---

# ADR ANATOMICAL_CLASSIFICATION V1 — 11 categorii canonical muscle_target_primary taxonomy

## §1 Context

**Pre-2026-05-13k state schema field `muscle_target_primary`:** `src/schema/exerciseMetadata.js` (381 entries cumulative post Bundle 6.0.4.2) folosește implicit **Big 6** ad-hoc canonical strings inferate empiric din entries:

1. `piept`
2. `spate`
3. `umeri`
4. `picioare` (unified — quads + hams + glutes + calves toate sub un singur primary)
5. `biceps` / `brate` (mixed legacy naming — variabilă cross-entries V1 + Bundle 6.0.x)
6. `triceps`

Plus ad-hoc categories ocazionale pe entries individuale fără policy formal:
- `abdomen` izolat (ad-hoc legacy V1 dacă există — audit needed C2)
- `fese` ad-hoc unele Hip Thrust entries fără policy formal
- `gambe` ad-hoc Calf Raises baseline V1

**Bundle 6.0.4.2 Hamstrings LANDED 2026-05-13j surfaced gap:** 4 entries collision spate-primary preserved invariant per HARD CONSTRAINT §F3.12 ZERO existing mutation:
- `Single-Leg RDL`
- `Seated Good Morning`
- `Banded Good Morning`
- `Single-Leg RDL Bodyweight`

Anatomically defensible posterior chain dual-cluster (back-extensor + hamstring co-engage), DAR taxonomic indistincție Big 6 unified `picioare` masks granularitate engine routing fundamentală.

**Daniel CEO directive verbatim 2026-05-13j Bugatti FULL QUALITY no EXCUSES:**

> "muscle recovery are legatura atat cu 24-48 ore, cu cand a fost antrenat si cu cum a raspuns omul la antrenament si cum se simte. Iar noi aici facem FULL QUALITY no EXCUSES."

Tăiat compromise tactical (A) interim Pre-Beta shortcut "Refactor later NEVER happens" — preserved invariant cu acoperiș-pereți anti-filter activated.

**Daniel CEO correction verbatim 2026-05-13j Gigel-test schema NU UX surface:**

> "gigel nu o sa gaseasca nici o data exercitiile. Sunt invizibile pt utilizator... doar andura le stie"

`muscle_target_primary` schema field = **INTERNAL engine routing semantic** NU UX category navigation user-facing. Gigel nu vede aceste string-uri canonical. Engines folosesc intern routing:
- Muscle Recovery (24-48h per-group decay)
- Periodization (phase per cluster)
- Weakness Detector (Brzycki 1RM per force foundation)
- Specialization (PARALLEL modifier Big N candidates)
- Cascade Defense (composite signal orthogonal — anatomical agnostic)

**Engine refactor scope cascading 5+ engines:**
- Muscle Recovery + Periodization + Weakness Detector + Specialization + Cascade Defense (signal arbitration orthogonal) + Vitality Layer (behavioral mapping orthogonal)
- Justified strategic chat dedicat anti-acoperiș-pereți filter activated (similar Bundle 5 ADR_SMART_ROUTING_EQUIPMENT_v2 strategic 2026-05-13f pattern).

**Catalysator chat-current 2026-05-13k:** Daniel cooperative push-back productive *"De ce defer pe fese/core?"* recovery instant Co-CTO autonomous *"`fese`: ai dreptate, defer NU justificat — Hip Thrust + variants = force compound măsurabil 1RM. Include Big 7"* + *"`core`: defer rămâne justificat. Plank/dead bug/hollow body/ab wheel = isometric/endurance NU 1RM measurable... defer v1.5 cu metric dedicat"* + *"ok"* final agreement complete.

## §2 Decision LOCK V1

**11 categorii canonical V1 `muscle_target_primary` taxonomy:**

1. `piept`
2. `spate` (unified V1, NU split lats/upper-back/lower-back/traps — secondary tags V1.5 defer)
3. `umeri`
4. `biceps`
5. `triceps`
6. `antebrate` (NEW V1 — separate forearms from biceps/triceps secondary)
7. `core` (NEW V1 — separate from picioare/ad-hoc, includes abdomen + obliques + lower back stabilizers exercises like plank/dead bug/hollow body/ab wheel)
8. `picioare-quads`
9. `picioare-hamstrings`
10. `fese` (NEW V1 — glutes canonical, Hip Thrust + variants + Bret Contreras school + force compound measurable 1RM Brzycki)
11. `gambe` (calves)

**Schema field semantic INTERNAL engine routing NU UX surface:** `muscle_target_primary` valoarea string = unul din cele 11 canonical V1 values. ZERO user-facing presentation acestor strings (Gigel nu vede aceste valori — engines folosesc intern routing recovery + periodization + specialization + cascade defense). Per Daniel CEO correction verbatim 2026-05-13j.

**Secondary tags `muscle_target_secondary[]` array:** poate include orice subset cele 11 canonical V1 + future expansion v1.5+ (lats/upper-back/lower-back/traps split secondary tags + alte secundare anatomice). Bundle 6.0.4.2 collision 4 entries preserved invariant `spate` primary + `picioare-hamstrings` secondary anatomically defensible posterior chain dual-cluster valid (per HARD CONSTRAINT §F3.12 ZERO existing mutation invariant cross-bundle).

**Brate legacy field reconciliation:** `brate` legacy V1 baseline (biceps cluster sub Bundle 6.0.1/V1) = mapping → `biceps` canonical V1 post-C2 migration audit. NU split brate primary; brate = legacy alias biceps (audit C2 commit).

## §3 Rationale per categorie

### §3.1 `piept`

**Anatomical scope:** pectoralis major (sternal + clavicular fibers) + pectoralis minor — toate variants press orizontale + incline + decline + fly compound + isolation.

**Engine routing impact:** Muscle Recovery 24-48h decay independent per-group (push pattern primary). Periodization phase-cycle calibrated. Weakness Detector Brzycki 1RM bench/incline reference.

**Edge cases:** Close-Grip Bench Press = `triceps` primary + `piept` secondary (triceps-dominant variant per ADR_SMART_ROUTING v2 §2.2). Dip = `triceps` primary OR `piept` primary per stance (forward lean = piept-dominant).

### §3.2 `spate` (unified V1)

**Anatomical scope unified:** lats + upper back (rhomboids + mid-traps) + lower back (erectors stabilizers) + traps (upper/middle/lower) toate sub unified `spate` primary. V1.5 defer secondary tags split.

**Engine routing impact:** Muscle Recovery decay 24-48h unified spate cluster. Periodization phase-cycle pull pattern primary. Weakness Detector Brzycki 1RM Row + Pull-up reference.

**Edge cases:** Romanian Deadlift = `picioare-hamstrings` primary + `spate` secondary (lower back stabilizer co-engage). Hyperextension = `picioare-hamstrings` primary + `spate` secondary OR vice-versa per anatomical bias judgment (lower back focus vs glute-ham focus).

### §3.3 `umeri`

**Anatomical scope:** anterior deltoid + lateral deltoid + posterior deltoid + serratus anterior (scapular stabilizer) — toate variants OHP + lateral raise + front raise + rear delt fly + face pull.

**Engine routing impact:** Muscle Recovery decay independent. Periodization phase-cycle vertical push pattern. Weakness Detector Brzycki 1RM OHP reference.

**Edge cases:** Face Pull = `umeri` primary (rear delt emphasis) + `spate` secondary (mid-trap engage) — Bundle 6.0.2 Phase H classification preserved invariant.

### §3.4 `biceps`

**Anatomical scope:** biceps brachii (long + short head) + brachialis + coracobrachialis — toate variants curl + chin-up biceps-emphasized + cable curl + preacher.

**Engine routing impact:** Muscle Recovery decay isolation. Periodization phase-cycle pull pattern secondary. Weakness Detector Brzycki 1RM curl reference.

**Edge cases:** Chin-up = `spate` primary + `biceps` secondary (back-dominant compound), NU `biceps` primary.

### §3.5 `triceps`

**Anatomical scope:** triceps brachii (lateral + medial + long head) — toate variants pushdown + skull crusher + overhead extension + close-grip bench + dip triceps-dominant.

**Engine routing impact:** Muscle Recovery decay isolation. Periodization phase-cycle push pattern secondary. Weakness Detector Brzycki 1RM extension/dips reference.

**Edge cases:** Bench Press standard = `piept` primary + `triceps` secondary (chest-dominant), NU `triceps` primary.

### §3.6 `antebrate` (NEW V1)

**Anatomical scope NEW separate:** forearm flexors + extensors + brachioradialis (wrist + grip strength) — variants wrist curl + reverse curl + farmer carry + grip-specific exercises.

**Engine routing impact:** Muscle Recovery decay isolation. Periodization phase-cycle grip strength supplementary. Weakness Detector defer v1.5 (grip strength metric dedicat NU 1RM Brzycki force foundation).

**Why NEW separate NU biceps secondary:** forearm grip strength = **independent training stimulus** NU subsumed în biceps secondary tag. Bret Contreras + Mike Israetel hypertrophy training school consensus reference — forearm training specific (wrist curl + reverse curl + grip work) does NOT transfer from biceps direct compound work alone. Justifies primary category separate.

**Edge cases:** Farmer Carry = `antebrate` primary (grip-dominant) + `spate` secondary (trap engage) + `picioare-quads` secondary (leg drive). Hammer Curl = `biceps` primary + `antebrate` secondary (brachioradialis engage).

### §3.7 `core` (NEW V1)

**Anatomical scope NEW separate:** rectus abdominis + obliques (internal + external) + transverse abdominis + lower back stabilizers (multifidus + erectors stabilizer role) — toate variants plank + dead bug + hollow body + ab wheel + Russian twist + leg raise + Pallof press.

**Engine routing impact:** Muscle Recovery decay specific (isometric endurance recovery pattern DIFFERIT vs force-load recovery). Periodization defer phase-cycle = bodyweight high-frequency NU periodized (Bret Contreras school core training high-frequency 3-5x/week sustainable).

**Why NEW separate NU subsumed picioare/abdomen ad-hoc:** comprehensive includes obliques + transverse + lower back stabilizers (NU doar abdomen rectus). Legacy ad-hoc `abdomen` entries (dacă există în current 381 entries schema) require audit C2 migration → `core` canonical migration.

**Weakness Detector defer v1.5:** isometric/endurance metric SEPARAT NU 1RM Brzycki (reps/duration measurable NU max force load). Daniel CEO chat-current verbatim *"Plank/dead bug/hollow body/ab wheel = isometric/endurance NU 1RM measurable... defer v1.5 cu metric dedicat"*.

### §3.8 `picioare-quads`

**Anatomical scope:** quadriceps (rectus femoris + vastus lateralis/medialis/intermedius) + hip flexors (iliopsoas secondary) — toate variants squat barbell/smith/DB/hack + leg press + lunge compound quad-emphasis + leg extension isolation + sissy squat + step-up + pistol/wall sit accessory.

**Engine routing impact:** Muscle Recovery decay 24-48h independent per-quad (NU unified picioare). Periodization phase-cycle quad-dominant (squat focus mesocycle 4-8 weeks). Weakness Detector Brzycki 1RM squat reference.

**Why NEW separate from `picioare` legacy unified:** quad fatigue pattern + recovery rate **diferit** vs ham vs glute vs calf. Engine routing recovery 24-48h granular per quad-vs-ham-vs-glute-vs-calf justifies primary split. Bundle 6.0.4.1 Quads LANDED 2026-05-13j commit `885fe9a` 45 NEW canonical foundation.

### §3.9 `picioare-hamstrings`

**Anatomical scope:** hamstrings (biceps femoris + semitendinosus + semimembranosus) — toate variants RDL barbell/smith/DB + leg curl variants + good morning + Nordic/GHR + posterior chain accessory.

**Engine routing impact:** Muscle Recovery decay specific (eccentric-heavy RDL Nordic curl pattern). Periodization phase-cycle hip-hinge dominant. Weakness Detector Brzycki 1RM RDL/deadlift reference.

**Edge cases:** Bundle 6.0.2 Phase I 4 entries preserved invariant `spate` primary + `picioare-hamstrings` secondary tag valid (anatomically defensible posterior chain dual-cluster) — per HARD CONSTRAINT §F3.12 ZERO mutation cross-bundle invariant. Bundle 6.0.4.2 Hamstrings LANDED 2026-05-13j commit `22ba9e8` 41 NEW (4 collisions skipped per HARD CONSTRAINT).

### §3.10 `fese` (NEW V1)

**Anatomical scope:** gluteus maximus + gluteus medius + gluteus minimus + tensor fasciae latae — toate variants Hip Thrust barbell/DB + Bret Contreras school + Glute Bridge variants + Cable Pull-Through + Banded Pull-Through + glute-isolated movements.

**Engine routing impact:** Muscle Recovery decay specific (hip-extension pattern distinct from quad squat OR ham RDL). Periodization phase-cycle glute-isolated focus mesocycle (4-6 weeks Bret Contreras Glute Lab school). Weakness Detector Brzycki 1RM **Hip Thrust force compound measurable** (Bret Contreras reference standard).

**Why NEW separate canonical:** Hip Thrust + variants = **force compound măsurabil 1RM Brzycki** distinct vs squat (`picioare-quads` Brzycki) vs deadlift (`picioare-hamstrings` Brzycki). Daniel CEO chat-current 2026-05-13k recovery instant *"ai dreptate, defer NU justificat — Hip Thrust + variants = force compound măsurabil 1RM. Include Big 7"*.

**Bret Contreras Glute Lab school reference:** glute isolation training high-volume specialty (3-5x/week sustainable, Bret Contreras periodization model) — justifies primary category separate from picioare-quads/hams cu engine routing diferit fatigue + recovery pattern.

**Edge cases:** Bundle 6.0.4.3 Glutes extension (C4 separate commit) target ~40-50 NEW entries canonical `fese` primary. Pre-C4 audit: existing 381 entries 4 collisions Bundle 6.0.4.2 Phase I (RDL/Good Morning posterior chain) NU `fese` primary — `spate` primary preserved invariant per HARD CONSTRAINT.

### §3.11 `gambe`

**Anatomical scope:** gastrocnemius + soleus + tibialis anterior (dorsiflexion secondary) — variants Calf Raises standing/seated + donkey calf raise + tibialis raise.

**Engine routing impact:** Muscle Recovery decay isolation specific (calf fatigue pattern distinct). Periodization phase-cycle calf supplementary (NOT primary mesocycle phase typically). Weakness Detector defer v1.5 (calf 1RM less standard reference, calf training high-rep volume typical NU 1RM Brzycki force foundation).

**Why NEW separate NU subsumed picioare unified:** calf fatigue + recovery **independent** vs quad/ham/glute. Standing calf raise daily-frequency sustainable (Bret Contreras + Mike Israetel hypertrophy school). Justifies primary category separate.

## §4 Anti-decisions explicit

### §4.1 NU split `spate` V1

NU split `spate` în lats/upper-back/lower-back/traps separate primary categories:

- **Gigel-test cascade routing NU cere granular acum** — Bret Contreras Big 6 standard sufficient cascade defense V1 (engines orchestrate spate unified workflow OK current 381 entries baseline).
- **Bundle 6.0.2 Phase I 4 entries spate-primary dual-cluster invariant preserved** per HARD CONSTRAINT §F3.12 ZERO existing mutation cross-bundle.
- **V1.5 defer cu secondary tags expansion** `muscle_target_secondary[]` array poate include `[lats, upper-back, lower-back, traps]` viitor (NU primary category split V1).

### §4.2 NU `picioare` unified primary

NU subsume `picioare-quads` + `picioare-hamstrings` + `fese` + `gambe` sub unified `picioare`:

- **Engine routing recovery 24-48h granular per quad vs ham vs glute different muscle fatigue patterns** — recovery rate calibration per persona (Maria conservative vs Marius performant) impossible cu unified single decay constant.
- **Periodization phases independent per quad-dominant (squat focus) vs hip-dominant (hinge focus) vs glute-isolated (thrust focus)** — mesocycle 4-8 weeks per cluster independent specialization.
- **Compromise tactical interim "Big 6 unified `picioare`" = "Refactor later NEVER happens"** Bugatti directive Daniel CEO 2026-05-13j violation. Bundle 6.0.4.1 Quads + Bundle 6.0.4.2 Hamstrings + Bundle 6.0.4.3 Glutes (C4) + Bundle 6.0.4.4 Calves split intern 4-way preserved invariant per ADR_SMART_ROUTING v2 §2.2 cumulative roadmap.

### §4.3 NU `abdomen` legacy ad-hoc

NU preserve `abdomen` legacy ad-hoc (înlocuit cu `core` canonical V1):

- **`core` cuprinde abdomen + obliques + lower back stabilizers comprehensive** — superset abdomen ad-hoc legacy.
- **Legacy ad-hoc entries (dacă există în current 381 entries schema) require audit C2 migration** → `core` canonical V1 migration.

### §4.4 NU `brate` legacy split

NU preserve `brate` legacy mixed naming biceps/triceps unified ambiguous:

- **`brate` legacy V1 baseline = ad-hoc mixed cluster** (variabilă cross-entries Bundle 6.0.x — some entries `biceps`, some `brate` legacy).
- **Audit C2 commit migration** → `biceps` canonical V1 reconciliation per entry anatomical bias judgment.
- **Hammer Curl, Cable Curl, Bayesian Curl, Preacher Curl, Incline DB Curl entries V1 baseline** → migration `biceps` canonical V1 (preserved invariant cu secondary tag `[antebrate]` pentru brachioradialis engage).

## §5 Engine impact mapping decision LOCK V1

**Big 8 expansion (Big 6 → Big 8 conventional inclusive `core`):** adăugat `fese` + `antebrate` + `core` (technical Big 9 count strict, conventional Big 8 inclusive `core`).

### §5.1 Muscle Recovery Engine (`engine-muscle-recovery`)

Extend recovery state per-group `GROUP_LABELS_RO` constant **Big 8** (11 keys total):

```
GROUP_LABELS_RO_V1 = [
  'piept',
  'spate',
  'umeri',
  'biceps',
  'triceps',
  'antebrate',
  'core',
  'picioare-quads',
  'picioare-hamstrings',
  'fese',
  'gambe',
]
```

Recovery thresholds 24-48h per group calibrated per persona:
- Maria 65 conservative: 72h+ per Big 8 force foundation groups (`piept`, `spate`, `umeri`, `picioare-quads`, `picioare-hamstrings`, `fese`)
- Gigica 35 moderate: 48-60h per Big 8
- Marius 25 performant: 24-36h per Big 8

`core` recovery: high-frequency bodyweight pattern (decay independent 12-24h cycle short, NU 24-48h force foundation pattern).
`antebrate` recovery: isolation pattern (decay 24-36h independent).
`gambe` recovery: isolation pattern (decay 24h daily-frequency sustainable).

### §5.2 Periodization Engine (`engine-periodization`)

Phase config Big 8 per persona:
- Maria phase 4-week mesocycle per Big 8 force foundation groups
- Gigica 6-week mesocycle
- Marius 8-week mesocycle

`core` defer phase-cycle = bodyweight high-frequency NU periodized (Bret Contreras school core training high-frequency 3-5x/week sustainable, NU mesocycle phase rotation).

`antebrate` + `gambe` defer phase-cycle similar pattern (supplementary high-frequency NU periodized mesocycle phases).

### §5.3 Weakness Detector Engine (`engine-weakness-detector`)

**Big 7 force foundation Brzycki 1RM:**

1. `piept` (bench + OHP)
2. `spate` (row + pull-up)
3. `umeri` (OHP)
4. `picioare-quads` (squat)
5. `picioare-hamstrings` (deadlift + RDL)
6. `fese` (Hip Thrust — Bret Contreras force compound măsurabil reference)
7. `biceps` (curl 1RM)
8. `triceps` (close-grip bench + extension)

**Defer v1.5 (metric dedicat separat):**
- `core` (isometric metric reps/duration NU 1RM)
- `antebrate` (grip strength metric dedicat NU 1RM Brzycki)
- `gambe` (calf 1RM less standard reference, high-rep volume typical)

### §5.4 Specialization Engine (`engine-specialization`)

PARALLEL modifier extend **Big 8 candidates** (Marius Advanced gate per ADR-029).

Tier-aware per persona unchanged (Gigel-test cascade routing orthogonal anatomical taxonomy — Tier 1/2/3 cascade ordered list per ADR_SMART_ROUTING_EQUIPMENT_v2 §2.1 preserved invariant).

### §5.5 Cascade Defense Engine (`engine-cascade-defense`)

**Composite signal arbitration unchanged** (orthogonal anatomical taxonomy):
- Works on signals (Pain Button, Mid-Session Refusal, Streak Counter, Composite Signal) NOT muscle groups.
- Anatomical-agnostic gate logic preserved invariant.

### §5.6 Vitality Layer (`engine-vitality`)

**6 questions behavioral mapping unchanged** (orthogonal anatomical):
- Sleep + Stress + Mood + Soreness + Energy + Motivation = behavioral NU anatomical.
- Soreness mapping per Big 8 group (poate fi extins post-C3 cu granular per-group soreness, V1 unchanged unified body soreness check).

## §6 Consequences

**Tests baseline impact estimate cumulative:**

- **C1 (acest commit) ADR creation** ZERO test impact (vault meta-tooling doc-only). Tests 3227 PASS preserved EXACT.
- **C2 migration** 4 entries Bundle 6.0.4.2 collision + audit legacy `abdomen`/`brate` entries: ~10-20 NEW tests migration validation + invocation excepție HARD CONSTRAINT §F3.12 1× explicit (anatomical fix legitim NU recurrent — Daniel CEO directive Bugatti FULL QUALITY).
- **C3 engine refactor cluster sub-batches:** ~30-50 NEW tests per engine expansion (Muscle Recovery Big 8 + Periodization Big 8 + Weakness Detector Big 7 + Specialization PARALLEL Big 8).
- **C4 Bundle 6.0.4.3 Glutes extension** ~40-50 NEW entries cu `fese` primary canonical: ~15-20 NEW tests.

**Cumulative goal post: 3227 → ~3280-3320 PASS** (estimated +50-90 NEW tests cumulative C2 + C3 + C4 commits separate sequence).

**Pre-Beta progress impact:** scope library 600-700 ex MANDATORY PRE-BETA preserved invariant. Roadmap remaining post C4:
- Bundle 6.0.4.3 Glutes ~40-50 NEW (`fese` primary canonical)
- Bundle 6.0.4.4 Calves ~35 NEW (`gambe` primary)
- Bundle 6.0.5 Arms ~120 NEW (biceps + triceps + antebrate NEW)
- Bundle 6.0.6 Specialty ~40-60 NEW
- Bundle 6.0.7 Core ~60 NEW (`core` primary canonical)
- Total cumulative ~302+ NEW remaining post C4 to reach 657+ target floor minim Pre-Beta MANDATORY scope library.

**Wiki layer impact:** NEW concept page `99-archive/wiki-pre-2026-05-15/concepts/anatomical-classification-v1.md` + UPDATE existing `99-archive/wiki-pre-2026-05-15/entities/adrs/adr-smart-routing-equipment.md` frontmatter `amendments[]` (cross-ref ADR ANATOMICAL_CLASSIFICATION_V1) distributed via `/wiki-ingest` C3/C4 sequence later (NU acest C1 commit — vault meta-tooling doc-only ADR creation).

## §7 Cross-refs raw layer

- [[03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md]] §2.1 §2.2 cascade ordered list pattern 5 step types canonical (LOCK V2 2026-05-13f)
- [[03-decisions/ADR-026-offline-coaching-tree.md]] §9 pipeline §42.10 8 engines foundation
- [[03-decisions/ADR-029-engine-specialization.md]] PARALLEL modifier Big N candidates extension
- [[03-decisions/ADR-024-goal-driven-program-templates.md]] Q6 D Hybrid streak counter §EXT-1 §EXT-2
- [[03-decisions/ADR-032-engine-deload-protocol.md]] Engine 2 pipeline §42.10
- [[03-decisions/ADR-031-engine-warmup-mobility.md]] Engine 7 pipeline §42.10
- [[99-archive/wiki-pre-2026-05-15/concepts/cascade-engines-overview.md]] cumulative pipeline summary
- [[99-archive/wiki-pre-2026-05-15/summaries/handover-2026-05-13j-bundle-6-0-4-1-quads-plus-6-0-4-2-hams-landed-plus-fese-canonical-strategic-pending.md]] strategic chat dedicat catalysator chat-current 13j
- [[src/schema/exerciseMetadata.js]] schema field `muscle_target_primary` semantic INTERNAL engine routing (post-C2 migration target)
- [[src/schema/__tests__/exerciseMetadata.test.js]] §20 self-reference test invariant cross-bundle + §1 lenient threshold (post-C2 migration impact)

---

🦫 **ADR ANATOMICAL_CLASSIFICATION V1 LOCK V1 2026-05-13k.** Daniel CEO directive Bugatti FULL QUALITY no EXCUSES preserved invariant. Co-CTO autonomous chat ACASĂ strategic discussion `fese` canonical recovery instant + `core` defer justified + `antebrate` NEW separate validation cooperative push-back productive. Per metoda hibridă §F3.13 LOCKED V1 + Gigel-test correction schema field internal engine routing NU UX surface.
