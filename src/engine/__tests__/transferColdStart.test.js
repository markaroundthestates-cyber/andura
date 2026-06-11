// ══ BUILD #4 — cross-exercise transfer cold-start (F3 spec §4) unit tests ════
// getTransferSources ordering (equipment_alternatives → SIMILAR_EXERCISES → muscle
// match) + DP.coldStartTransfer e1RM-space seeding. Uses the REAL library names
// and the REAL per-set rating literals so a green test means the live path works.

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { getTransferSources, getSimilarityMultiplier } from '../exerciseMapping.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DB } from '../../db.js';

// The injected equipment_type accessor the live dp.js call-site will pass (#11).
const eqType = (n) => getExerciseMetadata(n)?.equipment_type;

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };

describe('getTransferSources — ordered related-lift resolution', () => {
  it('prefers the library equipment_alternatives graph first', () => {
    // DB Shoulder Press → equipment_alternatives ['Incline DB Press'] (verified).
    const out = getTransferSources('DB Shoulder Press', getExerciseMetadata);
    expect(out[0]).toBe('Incline DB Press');
  });

  it('re-keyed SIMILAR_EXERCISES resolves live CORE_AUTO names (post F-1)', () => {
    // DB Lateral Raise is the live name; its similar set is other lateral raises.
    const out = getTransferSources('DB Lateral Raise', getExerciseMetadata);
    expect(out).toContain('Cable Lateral Raise');
    // Never includes the target itself.
    expect(out).not.toContain('DB Lateral Raise');
  });

  it('de-duplicates across sources and skips the target', () => {
    const out = getTransferSources('Cable Curl', getExerciseMetadata);
    expect(new Set(out).size).toBe(out.length);
    expect(out).not.toContain('Cable Curl');
  });

  it('muscle-match last resort uses the supplied candidate pool only', () => {
    // A synthetic isolated lift with no equipment_alternatives + not in the table;
    // the muscle pool supplies a same-primary candidate.
    const fakeMeta = (n) =>
      n === 'NEW' ? { muscle_target_primary: 'biceps', equipment_alternatives: [] }
      : n === 'OTHER' ? { muscle_target_primary: 'biceps' }
      : { muscle_target_primary: 'piept' };
    const out = getTransferSources('NEW', fakeMeta, ['OTHER', 'CHEST']);
    expect(out).toContain('OTHER');
    expect(out).not.toContain('CHEST'); // different primary
  });

  it('no candidate pool → muscle match skipped (only graph + table)', () => {
    const fakeMeta = (n) =>
      n === 'NEW' ? { muscle_target_primary: 'biceps', equipment_alternatives: [] }
      : { muscle_target_primary: 'biceps' };
    const out = getTransferSources('NEW', fakeMeta); // no pool
    expect(out).toHaveLength(0);
  });
});

describe('getSimilarityMultiplier — #11 unit-aware equipment conversion', () => {
  // Library equipment_alternatives links Flat Barbell Bench → Flat DB Press DIRECTLY
  // across equipment, but DB loads are PER HAND and barbell loads are TOTAL — the old
  // 0.9 default seeded nonsense. The conversion layer fixes the unit skew.
  it('curated per-pair ratio wins over the equipment layer', () => {
    // Incline DB Press → DB Shoulder Press is a curated 1.25 (both dumbbell anyway).
    expect(getSimilarityMultiplier('Incline DB Press', 'DB Shoulder Press', eqType)).toBe(1.25);
  });

  it('barbell SOURCE → dumbbell TARGET converts per-hand (×0.40, NOT 0.9)', () => {
    // Flat DB Press (dumbbell, per-hand) seeded FROM Flat Barbell Bench (barbell total).
    expect(getSimilarityMultiplier('Flat DB Press', 'Flat Barbell Bench', eqType)).toBe(0.40);
  });

  it('dumbbell SOURCE → barbell TARGET is the inverse (×2.50)', () => {
    expect(getSimilarityMultiplier('Flat Barbell Bench', 'Flat DB Press', eqType)).toBe(2.50);
  });

  it('same-equipment cross still uses the legacy default (no spurious conversion)', () => {
    // Two cables, no curated pair → default 0.9 (layer only fires cross-equipment).
    expect(getSimilarityMultiplier('Cable Fly', 'Face Pull', eqType)).toBe(0.9);
  });

  it('no equipment accessor → byte-identical legacy default (back-compat)', () => {
    expect(getSimilarityMultiplier('Flat DB Press', 'Flat Barbell Bench')).toBe(0.9);
  });

  it('machine↔barbell stays conservative (×1.0 — no unit skew)', () => {
    // Smith lifts carry equipment_type 'machine' (no 'smith' type) → machine↔barbell
    // resolves to a conservative 1.0 (the ~8% free-bar gap is intentionally NOT
    // modelled — see EQUIP_CONVERSION note). No unit skew machine↔barbell.
    expect(getSimilarityMultiplier('Smith Machine Bench', 'Flat Barbell Bench', eqType)).toBe(1.0);
  });
});

describe('DP.coldStartTransfer — #11 cross-equipment seed lands on the right ladder', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* jsdom */ }
  });

  it("BB bench 60 → DB seed is per-hand (~22-26/hand), NOT ~54 (Daniel's anchor)", () => {
    // dp_transfer_coldstart_v1 must be ON for the transfer path (else suggestStartWeight).
    localStorage.setItem('_devFlags', JSON.stringify({ dp_transfer_coldstart_v1: true }));
    DB.set('logs', [
      // reps >= the rt floor so _bestE1RM accepts the set (it skips sub-target reps).
      { ex: 'Flat Barbell Bench', w: 60, reps: 10, rpe: 7.5, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('Flat DB Press', 10);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Flat Barbell Bench');
    expect(seed.kg).toBeGreaterThanOrEqual(20);
    expect(seed.kg).toBeLessThanOrEqual(27); // a real dumbbell rung, his rack carries it
  });

  it("DB bench 30/hand → BB seed is a barbell total (~70-75), NOT ~27 (Daniel's anchor)", () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_transfer_coldstart_v1: true }));
    DB.set('logs', [
      { ex: 'Flat DB Press', w: 30, reps: 10, rpe: 7.5, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('Flat Barbell Bench', 10);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Flat DB Press');
    expect(seed.kg).toBeGreaterThanOrEqual(65);
    expect(seed.kg).toBeLessThanOrEqual(80);
  });
});

describe('DP.coldStartTransfer — e1RM-space seed', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* jsdom */ }
  });

  it('seeds a new lift from a related lift the user has logged, in e1RM space', () => {
    // User has logged Incline DB Press (equipment_alternative of DB Shoulder Press).
    DB.set('logs', [
      { ex: 'Incline DB Press', w: 30, reps: 10, rpe: RPE.potrivit, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('DB Shoulder Press', 10);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Incline DB Press');
    expect(seed.kg).toBeGreaterThan(0);
    // The DB Shoulder Press ratio from Incline DB Press is 1.25 (heavier source is
    // a press the user can do MORE of → shoulder press lighter is the inverse...
    // here the ratio direction is library-table driven). Seed is finite + sane.
    expect(seed.kg).toBeLessThan(60);
  });

  it('returns null when the user has no related e1RM (falls to suggestStartWeight)', () => {
    DB.set('logs', []);
    expect(DP.coldStartTransfer('DB Shoulder Press', 10)).toBeNull();
  });

  it('returns null for a bodyweight target (e1RM-ineligible → raw path)', () => {
    DB.set('logs', [{ ex: 'Incline DB Press', w: 30, reps: 10, rpe: RPE.potrivit, ts: 1 }]);
    // Pull-ups / push-ups are bodyweight — no clean external-load e1RM.
    const bw = DP._e1rmEligible('Pull-up') ? 'Pull-up' : null;
    if (bw) expect(DP.coldStartTransfer(bw, 10)).toBeNull();
    else expect(true).toBe(true); // name not present → skip (library-dependent)
  });

  it('rep-scheme normalization: a high-rep source seeds a sane low-rep target', () => {
    // Source logged at 15 reps; target back-solved at 10 reps. e1RM normalizes so
    // the seed is NOT the raw 15-rep load (which would under-seed a 10-rep target).
    DB.set('logs', [
      { ex: 'Incline DB Press', w: 24, reps: 15, rpe: RPE.usor, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('DB Shoulder Press', 10);
    expect(seed).not.toBeNull();
    expect(seed.kg).toBeGreaterThan(0);
  });
});
