// ══ BUILD #10/E — learned per-gym equipment ladder tests (F4 spec §E) ════════
// (1) Pure inference: modal gap from distinct loads, min-distinct gate, sane band.
// (2) Persistence round-trip (synced dp-equipment-ladder).
// (3) Consumer: with the flag ON + a learned 2.5kg step, getNextWeight offers a
//     2.5kg increment where the hard-coded dumbbell table jumps more coarsely; flag
//     OFF → the hard-coded ladder (byte-identical).

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  learnedStepFromLogs,
  saveLearnedStep,
  learnedStep,
  LADDER_MIN_DISTINCT,
  EQUIPMENT_LADDER_KEY,
  observeLoggedWeight,
  matchTemplate,
  snapToLadder,
  activeTemplateId,
  EQUIPMENT_OBS_KEY,
  learnUserLadderFromLogs,
  saveUserLadder,
  learnedUserLadder,
  USER_LADDER_MIN_DISTINCT,
} from '../dp/equipmentLadder.js';
import { getNextWeight, roundToEquipmentWeight } from '../../config/weights.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

describe('learnedStepFromLogs — pure inference', () => {
  it('infers the modal gap from a 2.5kg ladder', () => {
    expect(learnedStepFromLogs([20, 22.5, 25, 27.5, 30])).toBe(2.5);
  });
  it('infers 5kg when that is the dominant gap', () => {
    expect(learnedStepFromLogs([60, 65, 70, 75, 80])).toBe(5);
  });
  it('returns 0 below the distinct-loads threshold (untrusted)', () => {
    const few = Array.from({ length: LADDER_MIN_DISTINCT - 1 }, (_, i) => 20 + i * 2.5);
    expect(learnedStepFromLogs(few)).toBe(0);
  });
  it('ignores out-of-band gaps (a big missed-session jump) and takes the real step', () => {
    // mostly 2.5kg steps + one 40kg outlier gap → modal 2.5kg wins.
    expect(learnedStepFromLogs([20, 22.5, 25, 27.5, 67.5])).toBe(2.5);
  });
});

describe('persistence — synced dp-equipment-ladder', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips the learned step', () => {
    saveLearnedStep('Flat DB Press', 2.5, 5);
    expect(learnedStep('Flat DB Press')).toBe(2.5);
    expect(/** @type {any} */ (DB.get(EQUIPMENT_LADDER_KEY))['Flat DB Press'].n).toBe(5);
  });
  it('returns 0 for an exercise with no learned step', () => {
    expect(learnedStep('Unknown Lift')).toBe(0);
  });
});

describe('weights.getNextWeight — learned ladder consumer', () => {
  const EX = 'Lat Pulldown'; // hard-coded bailib_stack = 5kg steps
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF (forced) — uses the hard-coded 5kg ladder (byte-identical)', () => {
    // dp_learned_ladder_v1 ships default-ON now; force it OFF to assert the legacy path.
    vi.spyOn(flags, 'isEnabled').mockReturnValue(false);
    saveLearnedStep(EX, 2.5, 6); // learned step present but flag off
    // hard-coded: ...20, 25... → next after 20 is 25.
    expect(getNextWeight(20, EX)).toBe(25);
  });

  it('FLAG ON + learned 2.5kg step — offers the finer 2.5kg increment', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    saveLearnedStep(EX, 2.5, 6);
    // Refined ladder from the bailib floor (5) at 2.5kg → next after 20 is 22.5.
    expect(getNextWeight(20, EX)).toBe(22.5);
  });

  it('FLAG ON but no learned step — falls back to hard-coded (byte-identical)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    expect(getNextWeight(20, EX)).toBe(25);
  });

  it('FLAG ON + a COARSER learned step than hard-coded — never coarsens (keeps hard-coded)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    saveLearnedStep(EX, 10, 6); // coarser than the 5kg hard-coded spacing
    expect(getNextWeight(20, EX)).toBe(25); // unchanged
  });
});

// ══ ROUNDING-UNIVERSAL — template MATCH (CEO design 2026-06-11) ════════════════
// REAL values from _GYMLOG_FINDINGS_2026-06-11.md (test-real-values).

describe('matchTemplate — pure template inference (findings values)', () => {
  it("Daniel's cable stack: {59,68} matches a 10lb stack (Lat Pulldown rungs)", () => {
    // §LADDERS: helcometru 10lb plates → 59 + 68 both on-ladder. Two distinct loads.
    const m = matchTemplate([59, 68]);
    expect(m.templateId).toBeTruthy();
    expect(m.confidence).toBeGreaterThan(0);
    // (that the matched ladder actually contains 59/68 is asserted via snapToLadder
    // below: snap(60)→59, snap(72)→73.)
  });

  it('tolerates ONE outlier: {59,68,77} still matches (Cable Row 77 fat-finger)', () => {
    // §findings: Cable Row 77 logged in a 73/78 gym = a single off-ladder entry; the
    // 59/68 rungs still pin the 10lb stack, the lone 77 is within OUTLIER_BUDGET.
    const m = matchTemplate([59, 68, 77]);
    expect(m.templateId).toBeTruthy();
  });

  it('dumbbells {22.5,25,30} match a fixed-DB set', () => {
    const m = matchTemplate([22.5, 25, 30]);
    expect(m.templateId).toBeTruthy();
  });

  it('below the distinct-loads gate (1 obs) → no match', () => {
    expect(matchTemplate([59]).templateId).toBeNull();
  });

  it('two BETWEEN-rungs loads (both off every ladder) → no match', () => {
    // 3.5 and 6.5 sit ~0.5kg from the nearest rung on every auto-match ladder
    // (just past RUNG_TOL) → no template matches (a too-dense ladder cannot claim
    // them). Guards the "1kg micro ladder matches everything" pathology.
    expect(matchTemplate([3.5, 6.5]).templateId).toBeNull();
  });
});

describe('observeLoggedWeight + activeTemplateId — synced accumulator', () => {
  beforeEach(() => localStorage.clear());

  it('accumulates distinct loads and resolves a template (Lat Pulldown 59,68)', () => {
    observeLoggedWeight('Lat Pulldown', 59);
    const res = observeLoggedWeight('Lat Pulldown', 68);
    expect(res.ok).toBe(true);
    expect(res.templateId).toBeTruthy();
    expect(activeTemplateId('Lat Pulldown')).toBe(res.templateId);
    const stored = /** @type {any} */ (DB.get(EQUIPMENT_OBS_KEY))['Lat Pulldown'];
    expect(stored.loads).toEqual([59, 68]); // distinct, sorted
  });

  it('is idempotent on a repeated load (distinct set, no duplicate rungs)', () => {
    observeLoggedWeight('Lat Pulldown', 59);
    observeLoggedWeight('Lat Pulldown', 59);
    expect(/** @type {any} */ (DB.get(EQUIPMENT_OBS_KEY))['Lat Pulldown'].loads).toEqual([59]);
  });

  it('rejects a bad load without writing', () => {
    expect(observeLoggedWeight('Lat Pulldown', NaN).ok).toBe(false);
    expect(observeLoggedWeight('', 50).ok).toBe(false);
  });
});

describe('snapToLadder — precedence curated > matched > fallback (findings values)', () => {
  beforeEach(() => localStorage.clear());
  const fb = (w) => Math.round(w); // a trivial, distinguishable generic fallback

  it('matched 10lb stack: snap(60)→59 and snap(72)→73 (Lat Pulldown, 60 not on stack)', () => {
    observeLoggedWeight('Lat Pulldown', 59);
    observeLoggedWeight('Lat Pulldown', 68);
    // §findings core case: prescribed 60 does NOT exist on the helcometru → 59.
    expect(snapToLadder('Lat Pulldown', 60, fb)).toBe(59);
    expect(snapToLadder('Lat Pulldown', 72, fb)).toBe(73);
  });

  it('matched even WITH the 77 outlier present: snap(60)→59 still holds', () => {
    observeLoggedWeight('Lat Pulldown', 59);
    observeLoggedWeight('Lat Pulldown', 68);
    observeLoggedWeight('Lat Pulldown', 77);
    expect(snapToLadder('Lat Pulldown', 60, fb)).toBe(59);
  });

  it('matched DB set: snap(28)→27.5 (gantere 22.5/25/30 observed)', () => {
    observeLoggedWeight('Seated DB Press', 22.5);
    observeLoggedWeight('Seated DB Press', 25);
    observeLoggedWeight('Seated DB Press', 30);
    expect(snapToLadder('Seated DB Press', 28, fb)).toBe(27.5);
  });

  it('NO observations → falls back to the generic round (fb)', () => {
    expect(snapToLadder('Lat Pulldown', 60.4, fb)).toBe(60); // fb = Math.round
  });

  it('curated steps WIN over a matched template', () => {
    observeLoggedWeight('Lat Pulldown', 59);
    observeLoggedWeight('Lat Pulldown', 68);
    // a photo says this machine actually only has {50,75} → curated wins → 50.
    expect(snapToLadder('Lat Pulldown', 60, fb, [50, 75])).toBe(50);
  });

  it('is defensive: bad weight / throwing fallback never throw', () => {
    expect(() => snapToLadder('Lat Pulldown', NaN, fb)).not.toThrow();
    const boom = () => { throw new Error('x'); };
    expect(() => snapToLadder('Nope', 50, boom)).not.toThrow();
  });
});

describe('snapToLadder — no-under-credit floor (Bug 3c, dp_ladder_no_undercredit_v1)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());
  const fb = (w) => Math.round(w);

  // matchTemplate is FAMILY-BLIND: these cable loads match a DUMBBELL 2.5-cadence
  // template (..15,17.5,20..); 18 is a load the founder actually logged on the cable
  // tower → the family-blind snap drops it to 17.5 ("18 -> 17.5" he complained about).
  function seedCableFly() {
    for (const w of [12.5, 15, 17.5, 20, 18]) observeLoggedWeight('Cable Fly', w);
  }

  it('flag OFF: the family-blind snap drops a logged 18 BELOW 18 (the bug)', () => {
    seedCableFly();
    vi.spyOn(flags, 'isEnabled').mockReturnValue(false);
    expect(snapToLadder('Cable Fly', 18, fb)).toBeLessThan(18);
  });

  it('flag ON: the no-under-credit floor keeps the logged 18 at 18 (never demote a proven load)', () => {
    seedCableFly();
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_ladder_no_undercredit_v1');
    expect(snapToLadder('Cable Fly', 18, fb)).toBe(18);
  });

  it('flag ON: off-rung values BELOW every owned load still snap normally (guard only raises)', () => {
    seedCableFly();
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_ladder_no_undercredit_v1');
    // 16.2: highest owned load <= 16.2 is 15, and the nearest rung (15) is not below it
    // → the guard does NOT lift it; normal snap stands.
    expect(snapToLadder('Cable Fly', 16.2, fb)).toBe(15);
  });

  it('flag ON: no obs → byte-identical generic fallback (guard inert)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_ladder_no_undercredit_v1');
    expect(snapToLadder('Cable Fly', 18, fb)).toBe(18); // fb = Math.round(18) = 18, no ladder
  });
});

describe('roundToEquipmentWeight — ladder-aware ctx (back-compat + gated)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());
  const EX = 'Lat Pulldown'; // bailib_stack: ...55,60,65... (60 IS a hard-coded rung)

  it('NO ctx → byte-identical legacy generic rounding', () => {
    // legacy nearest-rung on bailib_stack: 60.4 → 60.
    expect(roundToEquipmentWeight(60.4, EX)).toBe(60);
  });

  it('ctx but flag OFF → byte-identical legacy', () => {
    // dp_equipment_ladder_v1 ships default-ON now; force it OFF to assert legacy rung.
    vi.spyOn(flags, 'isEnabled').mockReturnValue(false);
    observeLoggedWeight(EX, 59); observeLoggedWeight(EX, 68);
    expect(roundToEquipmentWeight(60, EX, { ladderAware: true })).toBe(60); // legacy rung
  });

  it('ctx + flag ON + matched 10lb stack → snaps to the LEARNED rung (60→59)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_equipment_ladder_v1');
    observeLoggedWeight(EX, 59); observeLoggedWeight(EX, 68);
    expect(roundToEquipmentWeight(60, EX, { ladderAware: true })).toBe(59);
  });

  it('ctx + flag ON but NO learned ladder → generic fallback (byte-identical)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_equipment_ladder_v1');
    expect(roundToEquipmentWeight(60.4, EX, { ladderAware: true })).toBe(60);
  });
});

// ══ PER-USER STATION LADDER (founder goal 2026-06-12) ════════════════════════════
// "Andura must know, after 2-3-4 logs, the user's REAL rungs on THAT station — PER
// USER." The hard-coded realMachineStacks are the FOUNDER's gym (keyed by name only),
// so a DIFFERENT user got the founder's rungs. These lock: (a) Mark (a different gym,
// a different increment) learns HIS ladder + snaps to it, not the founder's 6..90;
// (b) the founder cold-start (no logs) still uses his seed; (c) below threshold →
// fallback unchanged; (d) flag OFF → byte-identical; (e) same-weight-repeated → no
// false learning; (f) the founder's own on-grid history converges to his real 6..90.

describe('learnUserLadderFromLogs — pure inference (friendlier per-user rule)', () => {
  it('learns step+range from 4 distinct rungs (Mark 5kg metric stack)', () => {
    const s = learnUserLadderFromLogs([40, 45, 50, 55]);
    expect(s).toEqual({ step: 5, min: 40, max: 55, nDistinct: 4, modalGaps: 3 });
  });

  it('learns from EXACTLY 3 distinct rungs (responsive after ~3 logs)', () => {
    // 3 distinct → 2 gaps, both 5kg → corroborated (>= USER_LADDER_MIN_MODAL_GAPS).
    const s = learnUserLadderFromLogs([45, 50, 55]);
    expect(s).toBeTruthy();
    expect(s.step).toBe(5);
    expect(s.nDistinct).toBe(USER_LADDER_MIN_DISTINCT);
    expect(s.modalGaps).toBe(2);
  });

  it('2 distinct (a single gap = a guess) is NOT trusted', () => {
    expect(learnUserLadderFromLogs([50, 55])).toBeNull();
  });

  it('same-weight-repeated (1 distinct, 0 gaps) → no false learning', () => {
    expect(learnUserLadderFromLogs([50, 50, 50, 50, 50])).toBeNull();
  });

  it('3 distinct but only 1 modal gap (inconsistent rungs) is NOT trusted', () => {
    // gaps 5 then 8 → no gap reaches >= 2 corroboration → not trusted.
    expect(learnUserLadderFromLogs([45, 50, 58])).toBeNull();
  });
});

describe('learnedUserLadder — the user station ladder (synced, range-walked)', () => {
  beforeEach(() => localStorage.clear());

  it("Mark's 5kg stack: range 40..55 → walked 30..65 at step 5 (anchored on real rungs)", () => {
    expect(saveUserLadder('Cable Row', [40, 45, 50, 55]).learned).toBe(true);
    expect(learnedUserLadder('Cable Row')).toEqual([30, 35, 40, 45, 50, 55, 60, 65]);
  });

  it('an old {step,n}-only record (no range) is NOT a trusted user ladder → null', () => {
    saveLearnedStep('Cable Row', 5, 6); // legacy 3-arg write, no range fields
    expect(learnedUserLadder('Cable Row')).toBeNull();
  });

  it('below the distinct threshold → not persisted → null', () => {
    expect(saveUserLadder('Cable Row', [50, 55]).learned).toBe(false);
    expect(learnedUserLadder('Cable Row')).toBeNull();
  });

  it("the founder's on-grid Cable Row history converges to his real 6..90 span", () => {
    // Once dp_real_ladder_snap_v1 snaps his recs onto the 6-step stack he LOGS on-grid
    // (60/66/72/78). The learned user ladder must AGREE with his real stack rungs.
    saveUserLadder('Cable Row', [60, 66, 72, 78]);
    const ladder = learnedUserLadder('Cable Row');
    expect(ladder).toEqual([48, 54, 60, 66, 72, 78, 84, 90]);
    // every learned rung is a real founder-stack rung (subset of 6..90 step-6).
    const realStack = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90];
    for (const r of ladder) expect(realStack).toContain(r);
  });
});

describe('roundToEquipmentWeight — per-user ladder PRIMACY over the founder stacks', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('(a) Mark snaps to HIS gym, not the founder 6..90: 52 → 50 (real-stack would say 54)', () => {
    // both flags ON: per-user ladder must WIN over the founder real-stack snap.
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_user_ladder_v1' || id === 'dp_real_ladder_snap_v1',
    );
    saveUserLadder('Cable Row', [40, 45, 50, 55]); // Mark's 5kg gym
    // founder ROW_STACK (6..90) would snap 52 → 54; Mark's own ladder snaps 52 → 50.
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(50);
  });

  it('(b) founder COLD-START (no user logs) still uses his seed stack: 52 → 54', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_user_ladder_v1' || id === 'dp_real_ladder_snap_v1',
    );
    // no saveUserLadder → no trusted user ladder → falls through to the founder seed.
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(54);
  });

  it('(c) BELOW threshold (2 distinct) → user ladder inert → founder seed unchanged', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_user_ladder_v1' || id === 'dp_real_ladder_snap_v1',
    );
    saveUserLadder('Cable Row', [50, 55]); // not trusted
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(54); // founder seed
  });

  it('(d) user-ladder flag OFF → byte-identical (founder seed only): 52 → 54', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_real_ladder_snap_v1');
    saveUserLadder('Cable Row', [40, 45, 50, 55]); // present but flag off
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(54);
  });

  it('(d2) ALL ladder flags OFF → byte-identical legacy generic rounding', () => {
    vi.spyOn(flags, 'isEnabled').mockReturnValue(false);
    saveUserLadder('Cable Row', [40, 45, 50, 55]);
    // legacy bailib_stack nearest rung for 52 = 50 (rungs ...45,50,55...).
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(50);
  });

  it('(e) same-weight-repeated → no false ladder → founder seed unchanged', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_user_ladder_v1' || id === 'dp_real_ladder_snap_v1',
    );
    saveUserLadder('Cable Row', [55, 55, 55, 55]); // flat → no ladder
    expect(roundToEquipmentWeight(52, 'Cable Row')).toBe(54); // founder seed
  });

  it('(f) founder no-regress: his on-grid history snaps 70 → 72 (== his real stack)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_user_ladder_v1' || id === 'dp_real_ladder_snap_v1',
    );
    saveUserLadder('Cable Row', [60, 66, 72, 78]);
    // his learned ladder AND the founder real-stack both put 70 on 72 — no regression.
    expect(roundToEquipmentWeight(70, 'Cable Row')).toBe(72);
  });

  it('per-user ladder works WITHOUT the founder seed (a non-founder station): 52 → 50', () => {
    // Lat Pulldown is NOT a founder realMachineStacks station → only the user ladder
    // applies. A user with a 5kg gym snaps to it; flag-off → generic.
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_user_ladder_v1');
    saveUserLadder('Lat Pulldown', [40, 45, 50, 55]);
    expect(roundToEquipmentWeight(52, 'Lat Pulldown')).toBe(50);
    expect(roundToEquipmentWeight(63, 'Lat Pulldown')).toBe(65); // walked to 65
  });
});
