import { describe, it, expect } from 'vitest';
import { findAlternatives, findRefusalPool, getFallbackCascade, buildSwapPickList } from '../alternativeFinder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

// Ported from archived smart-routing/__tests__/smartRouting.test.js (WP-2 MOAT revive).
// The archived handleEquipmentBusy case is NOT ported — v1 equipment-detection module
// is intentionally NOT revived (P3-MOAT-DESIGN.md §2). findAlternatives cases preserved
// verbatim; getFallbackCascade cases are NEW per design §5.1.

describe('findAlternatives §36.37 (ranking)', () => {
  it('Tier 1 forta (Lat Pulldown) returns alternatives all force_demand: high', () => {
    const r = findAlternatives('Lat Pulldown');
    expect(r.shouldSkip).toBe(false);
    expect(r.alternatives.length).toBeGreaterThan(0);
  });

  it('unknown exercise → shouldSkip', () => {
    const r = findAlternatives('UnknownExercise');
    expect(r.shouldSkip).toBe(true);
    expect(r.alternatives).toEqual([]);
  });

  // ACTIVE gate (Daniel SSOT 2026-06-05): findAlternatives now only OFFERS active
  // (CORE_AUTO) candidates. The prior source 'Lateral Raises' is untagged and its
  // single curated alt is the untagged 'Lateral Raises (cable)', so under the gate
  // it correctly returns []. Source switched to 'Incline DB Curl' (CORE_AUTO tier-2)
  // whose curated alts (Bayesian Curl, Cable Curl) are BOTH CORE_AUTO — a real
  // gated tier-2 isolation with active alternatives.
  it('Tier 2 isolation has alternatives ranked by similarity', () => {
    const r = findAlternatives('Incline DB Curl');
    expect(r.alternatives.length).toBeGreaterThan(0);
    // Ranked: same muscle_target_primary first
    r.alternatives.forEach(alt => {
      expect(alt.similarity).toBeGreaterThan(0);
      // ACTIVE gate: every offered alternative is CORE_AUTO.
      expect(getExerciseMetadata(alt.name).status).toBe('CORE_AUTO');
    });
  });

  it('alternatives are sorted descending by similarity', () => {
    const r = findAlternatives('Incline DB Curl');
    for (let i = 1; i < r.alternatives.length; i++) {
      expect(r.alternatives[i - 1].similarity).toBeGreaterThanOrEqual(r.alternatives[i].similarity);
    }
  });

  it('ACTIVE gate — untagged source whose only curated alt is also untagged → shouldSkip', () => {
    // 'Lateral Raises' (untagged) has a single curated alt 'Lateral Raises (cable)'
    // (also untagged). Under the active gate neither is offerable → honest skip.
    const r = findAlternatives('Lateral Raises');
    expect(r.shouldSkip).toBe(true);
    expect(r.alternatives).toEqual([]);
  });
});

describe('getFallbackCascade §5.1 (cascade traversal)', () => {
  it('returns original (no swap) when its equipment_type is available', () => {
    const r = getFallbackCascade('Incline Barbell Bench', ['barbell', 'machine', 'dumbbell', 'bodyweight']);
    expect(r.isAlternative).toBe(false);
    expect(r.exercise).toBe('Incline Barbell Bench');
  });

  it('traverses cascade to first available step (easier_machine) when original equip missing', () => {
    // Incline Barbell Bench is barbell; barbell unavailable, machine available
    // → first cascade step easier_machine (Smith Incline Bench, equipment_type machine).
    const r = getFallbackCascade('Incline Barbell Bench', ['machine', 'dumbbell', 'bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.exercise).toBe('Smith Incline Bench');
    expect(r.cascadeStep).toBe('easier_machine');
    expect(r.original).toBe('Incline Barbell Bench');
  });

  it('skips unavailable steps and lands on bodyweight step when only bodyweight available', () => {
    const r = getFallbackCascade('Incline Barbell Bench', ['bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('bodyweight');
    expect(r.exercise).toBe('Pike Push-up');
  });

  it('muscle_group_compose step returns an all-active exercises array (1-2 exercises)', () => {
    // ACTIVE gate (Daniel SSOT 2026-06-05): a compose step is only taken when ALL
    // its exercises are active (CORE_AUTO) — never surface a hidden variant even
    // bundled. Source switched to 'Smith Machine Bench' whose compose step is
    // [Flat DB Press, Cable Fly] (both CORE_AUTO, dumbbell/cable). Equipment =
    // dumbbell+cable+bodyweight (no machine): original + the two machine steps
    // skip → compose lands before bodyweight. (Incline Barbell Bench's compose is
    // [Incline DB Press(CORE_AUTO), Incline DB Fly(untagged)] → correctly skipped
    // by the gate now, falling through to its bodyweight step.)
    const r = getFallbackCascade('Smith Machine Bench', ['dumbbell', 'cable', 'bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('muscle_group_compose');
    expect(Array.isArray(r.exercises)).toBe(true);
    expect(r.exercises.length).toBeGreaterThan(0);
    expect(r.exercises.length).toBeLessThanOrEqual(2);
    // Every composed exercise is active.
    r.exercises.forEach((n) => expect(getExerciseMetadata(n).status).toBe('CORE_AUTO'));
  });

  it('ACTIVE gate — compose step with a hidden member is SKIPPED, never surfaced', () => {
    // Incline Barbell Bench's compose step = [Incline DB Press (CORE_AUTO),
    // Incline DB Fly (untagged/hidden)]. With dumbbell-only the gate rejects the
    // compose (one member hidden) and falls through to a later ACTIVE step — the
    // result must NOT be that compose, and whatever it returns is active.
    const r = getFallbackCascade('Incline Barbell Bench', ['dumbbell']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).not.toBe('muscle_group_compose');
    const offered = r.exercise ?? (Array.isArray(r.exercises) ? r.exercises[0] : undefined);
    expect(getExerciseMetadata(offered).status).toBe('CORE_AUTO');
  });

  it('degrades to ranking when no cascade and original equip missing but a ranked alt is available', () => {
    // Flat Barbell Bench (barbell) has no fallback_cascade; ranked alt Flat DB Press is
    // dumbbell. barbell unavailable, dumbbell available → degrade to ranking → Flat DB Press.
    const r = getFallbackCascade('Flat Barbell Bench', ['dumbbell']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('ranking');
    expect(r.exercise).toBe('Flat DB Press');
    expect(r.original).toBe('Flat Barbell Bench');
  });

  it('no cascade + only bodyweight → broad-library finds a same-muscle bodyweight alt', () => {
    // Lat Pulldown (cable, spate, tier-1 high force) with nothing but bodyweight:
    // the thin curated alts (Cable Row) are not performable, but the broad library
    // has high-force bodyweight back movements (e.g. Pull-up) → NAMED swap, not a
    // premature noAlt (anchor-on-missing-equipment gate gap).
    const r = getFallbackCascade('Lat Pulldown', []);
    expect(r.isAlternative).toBe(true);
    expect(r.noAlt).toBeFalsy();
    expect(r.cascadeStep).toBe('broad_library');
    expect(r.original).toBe('Lat Pulldown');
  });

  it('anchor lift (Leg Press, machine missing) → NAMED same-muscle high-force alt (was noAlt)', () => {
    // Leg Press: no fallback_cascade, thin curated alts (Leg Extension only).
    // machine gone → thin path dead-ends; broad search over picioare-quads lands a
    // real named high-force alternative (tier-1 strength stays high-force).
    const r = getFallbackCascade('Leg Press', ['barbell', 'dumbbell', 'cable', 'bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.noAlt).toBeFalsy();
    expect(r.cascadeStep).toBe('broad_library');
    expect(typeof r.exercise).toBe('string');
    expect(r.exercise).not.toBe('Leg Press');
  });

  it('anchor lift (Incline DB Press, dumbbells missing) → NAMED non-dumbbell same-muscle alt', () => {
    const r = getFallbackCascade('Incline DB Press', ['barbell', 'machine', 'cable', 'bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.noAlt).toBeFalsy();
    expect(typeof r.exercise).toBe('string');
    expect(r.exercise).not.toBe('Incline DB Press');
  });

  it('genuinely-impossible anchor case still returns honest noAlt (Leg Press, only band)', () => {
    // No band-performable high-force quads movement exists → tier-1-strict broad
    // search finds nothing → honest skip (anti-paternalism, NU forteaza inferior).
    const r = getFallbackCascade('Leg Press', ['band']);
    expect(r.isAlternative).toBe(false);
    expect(r.noAlt).toBe(true);
    expect(r.original).toBe('Leg Press');
  });

  it('unknown exercise → honest noAlt skip (anti-paternalism, NU forteaza inferior)', () => {
    const r = getFallbackCascade('UnknownExercise', ['barbell', 'machine']);
    expect(r.isAlternative).toBe(false);
    expect(r.noAlt).toBe(true);
  });

  it('bodyweight original is always available (no equipment needed)', () => {
    const r = getFallbackCascade('Pike Push-up', []);
    expect(r.isAlternative).toBe(false);
    expect(r.exercise).toBe('Pike Push-up');
  });
});

// Daniel smoke 2026-05-28 (#2 + #6 + #3.2) — exhaustive same-muscle pool for the
// "Nu vreau" path. Equipment ignored; tier-1 strict bypassed; tried-set filters
// out already-offered candidates so the UI can cycle through every alternative
// once before reporting exhaustion.
describe('findRefusalPool — exhaustive preference cycle (Nu vreau)', () => {
  it('biceps tier-1 (Cheat Curl Barbell) yields a non-empty same-muscle pool', () => {
    const r = findRefusalPool('Cheat Curl Barbell', []);
    expect(r.muscleGroup).toBe('biceps');
    expect(r.candidates.length).toBeGreaterThan(2); // broad library, not 2 curated
    // The original is NOT in the returned pool.
    expect(r.candidates.find((c) => c.name === 'Cheat Curl Barbell')).toBeUndefined();
  });

  it('triedNames filter removes already-offered candidates (no repeats)', () => {
    const all = findRefusalPool('Incline DB Press', []).candidates.map((c) => c.name);
    const skipFirst = findRefusalPool('Incline DB Press', [all[0]]).candidates.map((c) => c.name);
    expect(skipFirst).not.toContain(all[0]);
    expect(skipFirst.length).toBe(all.length - 1);
  });

  it('exhausted pool returns candidates=[] (caller surfaces poolExhausted copy)', () => {
    const all = findRefusalPool('Incline DB Press', []).candidates.map((c) => c.name);
    const r = findRefusalPool('Incline DB Press', all);
    expect(r.candidates).toEqual([]);
    // muscleGroup still returned so the caller can label the exhaustion message.
    expect(r.muscleGroup.length).toBeGreaterThan(0);
  });

  it('unknown exercise → muscleGroup "unknown" + empty pool', () => {
    const r = findRefusalPool('Totally Not Real', []);
    expect(r.muscleGroup).toBe('unknown');
    expect(r.candidates).toEqual([]);
  });

  it('bypasses tier-1 strict — different force_demand candidates still surface', () => {
    // Cheat Curl Barbell is tier 1 / force_demand:'high'. findRefusalPool MUST
    // include force_demand:'medium' biceps alternatives (refusal != equipment
    // failure, the "don't degrade heavy compound" rule does not apply).
    const r = findRefusalPool('Cheat Curl Barbell', []);
    const hasMedium = r.candidates.some((c) => {
      // We can't reach metadata directly here without importing — assert via
      // name surface: at least one common medium-force biceps movement appears.
      return c.name === 'Cable Curl' || c.name === 'Incline DB Curl' || c.name === 'Preacher Curl';
    });
    expect(hasMedium).toBe(true);
  });
});

// ══ SWAP PICK-LIST — founder redesign 2026-06-05 (manual short list) ════════
// Contract: a SHORT (4-5 row) ranked same-muscle list, active-only, minus the
// session; row 1 is a distinct (non-near-duplicate) smart pre-pick; EXACTLY one
// bodyweight when the muscle has one; ranked by effectiveness; diversify-modality
// on repeat busy; umeri sub-bucketed (press vs lateral vs rear). Real data.
describe('buildSwapPickList (founder manual pick-list)', () => {
  it('returns a SHORT decidable list (4-5 rows) of active same-muscle options', () => {
    const { items, muscleGroup } = buildSwapPickList('OHP');
    expect(muscleGroup).toBe('umeri');
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.length).toBeLessThanOrEqual(5);
    // exactly one pre-pick, and it is row 1
    expect(items[0].prePick).toBe(true);
    expect(items.filter((i) => i.prePick).length).toBe(1);
  });

  it('PRE-PICK is NOT a near-duplicate twin of the busy exercise', () => {
    // "Pec Deck / Cable Fly" (machine) busy must NOT pre-pick "Cable Fly" (its
    // near-identical fly twin). The pre-pick must be a genuinely distinct chest
    // movement (a press, a different fly station, etc).
    const { items } = buildSwapPickList('Pec Deck / Cable Fly', ['Flat DB Press']);
    expect(items[0].prePick).toBe(true);
    expect(items[0].name).not.toBe('Cable Fly');
    // sanity: pre-pick is a real chest exercise, not the original
    expect(items[0].name).not.toBe('Pec Deck / Cable Fly');
  });

  it('ranks by effectiveness — same sub-movement scores above off-movement', () => {
    // For a shoulder PRESS, a press alternative must rank above a lateral raise
    // (off-movement). Find both in the full pool (no cap) by widening exclude=[].
    const { items } = buildSwapPickList('OHP');
    const pressIdx = items.findIndex((i) => /press|ohp/i.test(i.name));
    const lateralIdx = items.findIndex((i) => /lateral/i.test(i.name));
    // A press option exists and, when a lateral also made the short list, it
    // never outranks the press (effectiveness-first).
    expect(pressIdx).toBeGreaterThanOrEqual(0);
    if (lateralIdx >= 0) expect(pressIdx).toBeLessThan(lateralIdx);
  });

  it('guarantees EXACTLY ONE bodyweight row when the muscle has one (chest)', () => {
    const { items } = buildSwapPickList('Flat Barbell Bench');
    const bw = items.filter((i) => i.isBodyweight);
    expect(bw.length).toBe(1); // chest has Push-up/Dip — exactly one surfaces
  });

  it('OMITS bodyweight (never fabricates) when the muscle has none (biceps)', () => {
    const { items } = buildSwapPickList('Cable Curl');
    const bw = items.filter((i) => i.isBodyweight);
    expect(bw.length).toBe(0); // biceps has zero bodyweight in the curated set
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('never offers an exercise already in today’s session', () => {
    const inSession = ['Cable Fly', 'Flat DB Press', 'Incline DB Press'];
    const { items } = buildSwapPickList('Flat Barbell Bench', inSession);
    for (const it of items) expect(inSession).not.toContain(it.name);
  });

  it('umeri sub-bucket: a PRESS refusal keeps the pre-pick a press (not a lateral/rear)', () => {
    const { items } = buildSwapPickList('OHP');
    expect(/press|ohp/i.test(items[0].name)).toBe(true);
  });

  it('umeri sub-bucket: a LATERAL refusal keeps the pre-pick a lateral', () => {
    const { items } = buildSwapPickList('DB Lateral Raise');
    expect(/lateral|y raise/i.test(items[0].name)).toBe(true);
  });

  it('DIVERSIFY MODALITY: a run of busy machine-skips pivots the pre-pick to a free weight', () => {
    // Two machine/cable station tries at this slot → infer machine-poor gym →
    // pivot firmly toward free weights (dumbbell/barbell/bodyweight).
    const tried = ['Smith Machine Bench', 'Flat Chest Press Machine'];
    const { items } = buildSwapPickList('Incline Barbell Bench', [], tried);
    const freeTypes = ['dumbbell', 'barbell', 'bodyweight'];
    expect(freeTypes).toContain(items[0].equipmentType);
  });

  it('never re-offers a name already tried at this slot (tried-set excluded)', () => {
    const tried = ['Flat DB Press', 'Incline DB Press'];
    const { items } = buildSwapPickList('Flat Barbell Bench', [], tried);
    for (const it of items) expect(tried).not.toContain(it.name);
  });

  it('unknown / no-metadata exercise → empty list (honest, no fabrication)', () => {
    const { items, muscleGroup } = buildSwapPickList('Totally Fake Exercise');
    expect(items).toEqual([]);
    expect(muscleGroup).toBe('unknown');
  });
});
