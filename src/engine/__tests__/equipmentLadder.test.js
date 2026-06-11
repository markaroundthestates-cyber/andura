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
