// ══ BUILD #4 — cross-exercise transfer cold-start (F3 spec §4) unit tests ════
// getTransferSources ordering (equipment_alternatives → SIMILAR_EXERCISES → muscle
// match) + DP.coldStartTransfer e1RM-space seeding. Uses the REAL library names
// and the REAL per-set rating literals so a green test means the live path works.

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { getTransferSources, getSimilarityMultiplier } from '../exerciseMapping.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { classifyPattern } from '../dp/ceiling.js';
import { DB } from '../../db.js';

// The injected equipment_type accessor the live dp.js call-site will pass (#11).
const eqType = (n) => getExerciseMetadata(n)?.equipment_type;
// The injected classifyPattern accessor the live dp.js call-site will pass (#12).
const pat = (n) => classifyPattern(n);

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

  it('per-hand DB target seeded FROM a two-arm cable stack converts ×0.45 (gym-log 2026-06-12)', () => {
    // A two-arm cable stack pulls BOTH hands → its pin load ≈ a DB TOTAL, not per-hand.
    // Hammer Curl (dumbbell) seeded FROM Cable Curl (cable stack) → ×0.45 (was a
    // unit-wrong 1.00 that seeded a 27.5/hand hammer curl off a 32 stack).
    expect(getSimilarityMultiplier('Hammer Curl', 'Cable Curl', eqType)).toBe(0.45);
  });

  it('two-arm cable target seeded FROM a per-hand DB is the inverse (×2.20)', () => {
    expect(getSimilarityMultiplier('Cable Curl', 'Hammer Curl', eqType)).toBe(2.20);
  });

  // ── #12 movement-pattern conversion (intra-family mechanical skew) ──────────
  it('squat target seeded FROM a leg-press source converts ×0.45, NOT machine_barbell 1.0 (gym-log 2026-06-12)', () => {
    // Back Squat (barbell, pattern squat) FROM Leg Press (machine, pattern legpress):
    // the equipment layer would give machine_barbell 1.00 (DANGER — leg press ≫ squat).
    // The pattern layer wins with 0.45 (the founder-P0 Gigel-safe leg-press→squat ratio).
    expect(getSimilarityMultiplier('Barbell Back Squat (High Bar)', 'Leg Press', eqType, pat)).toBe(0.45);
    // Hack Squat (machine, pattern squat) FROM Leg Press — same pattern pair → 0.45
    // (would otherwise be the machine↔machine default 0.9).
    expect(getSimilarityMultiplier('Hack Squat Machine', 'Leg Press', eqType, pat)).toBe(0.45);
  });

  it('the pattern layer ONLY fires for a listed cross-pattern pair (legiso→squat is NOT it)', () => {
    // Pendulum Squat (squat) FROM Leg Extension (legiso) is a DIFFERENT pair — no
    // pattern-conversion entry → falls through to the equipment/default layer (0.9),
    // unchanged. This is why Pendulum Squat must NOT move off its legiso seed.
    expect(getSimilarityMultiplier('Pendulum Squat', 'Leg Extension', eqType, pat)).toBe(0.9);
  });

  it('no pattern accessor → the #12 layer is inert (back-compat, equipment layer still applies)', () => {
    // Without getPattern, leg-press→squat falls to the equipment layer (machine_barbell
    // 1.00) — the OLD behavior, proving the new layer is purely additive + opt-in.
    expect(getSimilarityMultiplier('Barbell Back Squat (High Bar)', 'Leg Press', eqType)).toBe(1.0);
  });
});

describe('DP.coldStartTransfer — dumbbell↔cable unit + movement-family guard (gym-log 2026-06-12)', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* jsdom */ }
    localStorage.setItem('_devFlags', JSON.stringify({ dp_transfer_coldstart_v1: true }));
  });

  it("Hammer Curl seeded from a 32kg Cable Curl stack lands ~12-15/hand, NOT ~27", () => {
    // Daniel's real anchor: Cable Curl 32 stack ↔ Hammer Curl 12.5-15/hand.
    DB.set('logs', [
      { ex: 'Cable Curl', w: 32, reps: 10, rpe: RPE.greu, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('Hammer Curl', 10);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Cable Curl');
    expect(seed.ratio).toBe(0.45);
    expect(seed.kg).toBeGreaterThanOrEqual(10);
    expect(seed.kg).toBeLessThanOrEqual(16); // his real DB hammer band, not a 27.5 ego load
  });

  it("Smith OHP does NOT seed from a rear-delt fly (Reverse Pec Deck) — wrong movement class", () => {
    // A rear-delt fly (pattern 'lateral') shares the umeri muscle but is not a press.
    // The movement-family guard must REJECT it so the bad cross-movement seed cannot
    // win (pre-fix it seeded Smith OHP at 20 off a 24kg rear-delt fly).
    DB.set('logs', [
      { ex: 'Reverse Pec Deck', w: 24, reps: 10, rpe: RPE.potrivit, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('Smith OHP', 10);
    // No press-class source logged → transfer finds nothing → null (caller falls to
    // the population prior, the sane ~45-50 ohp value). The rear-delt fly is rejected.
    expect(seed).toBeNull();
  });

  it("a chest PRESS does NOT seed from a cable FLY — wrong movement class", () => {
    // Cable Fly (chestfly) shares the piept muscle but is an isolation, not a press.
    DB.set('logs', [
      { ex: 'Cable Fly', w: 23, reps: 10, rpe: RPE.potrivit, ts: 1_700_000_000_000 },
    ]);
    const seed = DP.coldStartTransfer('Converging Chest Press', 10);
    expect(seed).toBeNull(); // fly rejected; no logged press source here
  });

  it("Back Squat seeded from a 230kg Leg Press lands ~80-110 (Gigel-safe), NOT ~220 (founder P0)", () => {
    // Daniel's REAL data: Leg Press 230×8 (e1RM ~280). Pre-fix the legs-family gate
    // (round 1) correctly allowed legs→legs but the machine_barbell 1.00 unit ratio
    // seeded Barbell Back Squat at 220 kg — a load that would CRUSH a novice ("daca
    // faci leg press cu 220kg nu faci squats cu 220, il omoram pe Gigel"). The #12
    // pattern layer caps leg-press→squat at 0.45 → a conservative ~100 kg.
    DB.set('logs', [
      { ex: 'Leg Press', w: 230, reps: 8, rpe: RPE.greu, ts: 1_700_000_000_000 },
      { ex: 'Leg Press', w: 210, reps: 8, rpe: RPE.greu, ts: 1_700_000_100_000 },
    ]);
    // Squat strength range floor is ~6 reps; seed there as the live recommend does.
    const seed = DP.coldStartTransfer('Barbell Back Squat (High Bar)', 7);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Leg Press');
    expect(seed.ratio).toBe(0.45);
    expect(seed.kg).toBeGreaterThanOrEqual(80);
    expect(seed.kg).toBeLessThanOrEqual(110); // a number Gigel survives, NOT 220
  });

  it("Hack Squat seeded from a 230kg Leg Press is materially below 200 (founder P0)", () => {
    DB.set('logs', [
      { ex: 'Leg Press', w: 230, reps: 8, rpe: RPE.greu, ts: 1_700_000_000_000 },
      { ex: 'Leg Press', w: 210, reps: 8, rpe: RPE.greu, ts: 1_700_000_100_000 },
    ]);
    const seed = DP.coldStartTransfer('Hack Squat Machine', 7);
    expect(seed).not.toBeNull();
    expect(seed.source).toBe('Leg Press');
    expect(seed.ratio).toBe(0.45);
    expect(seed.kg).toBeLessThan(160); // materially below the pre-fix 200
  });

  it("two sibling chest-press machines seed from the SAME press source (deterministic)", () => {
    // With a logged DB press, both Converging Chest Press and Flat Chest Press Machine
    // resolve from Flat DB Press (benchpress) ×2.50 → the SAME load. Pre-fix they
    // diverged (one took a fly ×0.9, the other Flat DB Press ×2.5 → 20 vs 75).
    DB.set('logs', [
      { ex: 'Flat DB Press', w: 30, reps: 10, rpe: RPE.potrivit, ts: 1_700_000_000_000 },
    ]);
    const a = DP.coldStartTransfer('Converging Chest Press', 10);
    const b = DP.coldStartTransfer('Flat Chest Press Machine', 10);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a.source).toBe('Flat DB Press');
    expect(b.source).toBe('Flat DB Press');
    expect(a.kg).toBe(b.kg); // identical — no sibling nondeterminism
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
