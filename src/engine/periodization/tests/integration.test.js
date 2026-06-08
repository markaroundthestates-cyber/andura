import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { HARD_CAP_INTENSITY_PCT_1RM, ISRAETEL_BASELINES } from '../constants.js';

const buildCtx = ({
  persona,
  age,
  goal,
  weeksElapsed = 0,
  profileTier = 'STABLE',
  recentSessions = [],
  earlySafetyTriggered = false,
  consecutiveExtensions = 0,
  recoveryGreen = false,
  deloadBias,
} = {}) => ({
  user: {
    ...(persona ? { persona } : {}),
    ...(age ? { age } : {}),
    ...(goal ? { goal } : {}),
  },
  recentSessions,
  weights: {},
  profileTier,
  flags: {},
  meta: {
    weeksElapsed,
    earlySafetyTriggered,
    consecutiveExtensions,
    ...(deloadBias !== undefined ? { deloadBias } : {}),
  },
  recoveryGreen,
});

describe('evaluate — integration end-to-end §9.1 ADR 026', () => {
  it('returns valid PeriodizationResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie' }));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('blueprint contains 5 fields per §9.2 Cluster 1', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie' }));
    expect(result.meta).toHaveProperty('mesocycle_phase');
    expect(result.meta).toHaveProperty('volume_target_pct');
    expect(result.meta).toHaveProperty('intensity_target_pct');
    expect(result.meta).toHaveProperty('macrocycle_block');
    expect(result.meta).toHaveProperty('deload_window');
  });

  it('total function — never throws on empty/null ctx', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('tier none + confidence low when ctx empty', async () => {
    const result = await evaluate(null);
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
  });

  it('deterministic — same ctx → same output', async () => {
    const ctx = buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 5 });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(r1.meta.mesocycle_phase).toBe(r2.meta.mesocycle_phase);
    expect(r1.meta.volume_target_pct).toEqual(r2.meta.volume_target_pct);
    expect(r1.meta.intensity_target_pct).toEqual(r2.meta.intensity_target_pct);
  });

  it('pure — does NOT mutate ctx', async () => {
    const ctx = buildCtx({ persona: 'maria', goal: 'sanatate' });
    const before = JSON.stringify(ctx);
    await evaluate(ctx);
    expect(JSON.stringify(ctx)).toBe(before);
  });

  it('weeksElapsed=0 → M1 W1 LOAD phase', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 0 }));
    expect(result.meta.mesocycle_phase).toBe('LOAD');
    expect(result.meta.macrocycle_block.mesocycleIdx).toBe(1);
    expect(result.meta.macrocycle_block.weekInMesocycle).toBe(1);
  });

  it('weeksElapsed=3 → M1 W4 DELOAD phase', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 3 }));
    expect(result.meta.mesocycle_phase).toBe('DELOAD');
  });

  it('DELOAD phase emits deload_window CALENDAR', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 3 }));
    expect(result.meta.deload_window).toEqual({ trigger: 'CALENDAR', days: 7 });
  });

  it('EARLY_SAFETY triggered overrides everything → deload_window EARLY_SAFETY', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius',
      goal: 'hipertrofie',
      weeksElapsed: 0, // not deload phase
      earlySafetyTriggered: true,
    }));
    expect(result.meta.deload_window).toEqual({ trigger: 'EARLY_SAFETY', days: 7 });
  });

  // ── #76 deloadBias → deload CADENCE pull-forward (dp_energy_volume_v1 ON by
  // default). A strong sustained-deficit bias on the PEAK week (W3) advances the
  // deload one week early; bounded to W3→W4-equivalent only. ──────────────────
  it('#76 deloadBias ≥0.75 on W3 (PEAK) pulls the deload FORWARD to DELOAD', async () => {
    const base = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 2 }));
    expect(base.meta.mesocycle_phase).toBe('PEAK'); // W3 baseline, no bias
    const pulled = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 2, deloadBias: 0.8 }));
    expect(pulled.meta.mesocycle_phase).toBe('DELOAD');
    expect(pulled.meta.deload_window).toEqual({ trigger: 'CALENDAR', days: 7 });
    expect(pulled.signals).toContain('deload_cadence_pull_forward_w3_to_w4_energy_deficit_bias_76');
  });

  it('#76 deloadBias below threshold (0.5) does NOT pull forward — W3 stays PEAK', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 2, deloadBias: 0.5 }));
    expect(result.meta.mesocycle_phase).toBe('PEAK');
    expect(result.signals).not.toContain('deload_cadence_pull_forward_w3_to_w4_energy_deficit_bias_76');
  });

  it('#76 deloadBias never pulls W1/W2 forward (too early to deload)', async () => {
    const w1 = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 0, deloadBias: 0.9 }));
    expect(w1.meta.mesocycle_phase).toBe('LOAD');
    const w2 = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 1, deloadBias: 0.9 }));
    expect(w2.meta.mesocycle_phase).toBe('LOAD+');
  });

  it('#76 no deloadBias field → byte-identical PEAK at W3 (off-state contract)', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie', weeksElapsed: 2 }));
    expect(result.meta.mesocycle_phase).toBe('PEAK');
  });

  it('Marius dual-signal green at W4 → extension granted, deload_window null', async () => {
    const greenTrail = [];
    for (let w = 1; w <= 4; w++) greenTrail.push({ rir: 1, weekIdx: w });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });

    const result = await evaluate(buildCtx({
      persona: 'marius',
      goal: 'hipertrofie',
      weeksElapsed: 3, // would be DELOAD W4
      recentSessions: greenTrail,
      consecutiveExtensions: 0,
    }));
    expect(result.meta.deload_window).toBeNull();
    expect(result.signals).toContain('marius_extension_granted_no_deload');
  });

  it('Maria persona blocked at M1 even when weeksElapsed implies M2', async () => {
    const result = await evaluate(buildCtx({
      persona: 'maria',
      goal: 'sanatate',
      weeksElapsed: 4, // would be M2 W1
      profileTier: 'COLD_START', // blocks advance
    }));
    // Block computed M2, but scaling effective should be M1 (1.00)
    expect(result.signals).toContain('maria_advance_gate_blocked_tier');
  });

  it('intensity ceiling hard-capped at 90% 1RM', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'forta', weeksElapsed: 0 }));
    expect(result.meta.intensity_target_pct.ceiling).toBeLessThanOrEqual(HARD_CAP_INTENSITY_PCT_1RM);
  });

  it('volume_target_pct contains 11 Israetel muscle groups', async () => {
    const result = await evaluate(buildCtx({ persona: 'marius', goal: 'hipertrofie' }));
    expect(Object.keys(result.meta.volume_target_pct).length).toBe(11);
    for (const mg of Object.keys(ISRAETEL_BASELINES)) {
      expect(result.meta.volume_target_pct).toHaveProperty(mg);
    }
  });

  // 15 scenarios baseline: 3 personas × 5 goals
  describe('15-scenario baseline matrix (3 personas × 5 goals)', () => {
    const personas = ['maria', 'gigica', 'marius'];
    const goals = ['hipertrofie', 'forta', 'recompozitie', 'longevitate', 'sanatate'];

    for (const persona of personas) {
      for (const goal of goals) {
        it(`${persona} × ${goal} → produces valid blueprint NEVER throws`, async () => {
          const result = await evaluate(buildCtx({ persona, goal, weeksElapsed: 0 }));
          // Blueprint complete
          expect(result.meta.mesocycle_phase).toBe('LOAD');
          expect(Object.keys(result.meta.volume_target_pct).length).toBe(11);
          expect(result.meta.intensity_target_pct.floor).toBeGreaterThanOrEqual(0);
          expect(result.meta.intensity_target_pct.ceiling).toBeLessThanOrEqual(HARD_CAP_INTENSITY_PCT_1RM);
          expect(result.meta.macrocycle_block.mesocycleIdx).toBe(1);

          // Block length per goal §9.5 verbatim
          if (goal === 'forta') {
            expect(result.meta.macrocycle_block.blockLengthWeeks).toBe(21);
          } else {
            expect(result.meta.macrocycle_block.blockLengthWeeks).toBe(12);
          }

          // 4 invariants §42.9 + 5th Medical Safety:
          // Invariant 1: V ≤ MRV per muscle group (cap respected)
          for (const [muscle, sets] of Object.entries(result.meta.volume_target_pct)) {
            const baseline = ISRAETEL_BASELINES[muscle];
            if (baseline) {
              expect(sets).toBeLessThanOrEqual(baseline.MRV);
            }
          }
          // Invariant 3: Frecventa ≤ 6 sessions/week per muscle group — V1 not enforced inside engine
          //   (orchestrator concern); we verify volume capped
        });
      }
    }
  });

  // Property-based partial: 50 random ctx → invariants hold
  describe('Property-based partial (50 random ctx) — 4 invariants §42.9 + 5th Medical Safety', () => {
    const personas = ['maria', 'gigica', 'marius'];
    const goals = ['hipertrofie', 'forta', 'recompozitie', 'longevitate', 'sanatate'];
    const tiers = ['COLD_START', 'DEVELOPING', 'STABLE', 'OPTIMIZED'];

    for (let i = 0; i < 50; i++) {
      it(`random ctx #${i + 1} → invariants 1+2+5 hold`, async () => {
        // Deterministic pseudo-random via seed (NU Math.random — preserve test
        // determinism for CI replay)
        const seed = (i * 13 + 7) % 1000;
        const persona = personas[seed % personas.length];
        const goal = goals[(seed * 3) % goals.length];
        const tier = tiers[(seed * 7) % tiers.length];
        const weeksElapsed = (seed * 11) % 30;
        const recoveryGreen = ((seed * 17) % 2) === 1;

        const result = await evaluate(buildCtx({
          persona,
          goal,
          profileTier: tier,
          weeksElapsed,
          recoveryGreen,
        }));

        // Invariant 1: V ≤ MRV per muscle group (Cluster 4 hard cap)
        for (const [muscle, sets] of Object.entries(result.meta.volume_target_pct)) {
          const baseline = ISRAETEL_BASELINES[muscle];
          if (baseline) {
            expect(sets).toBeLessThanOrEqual(baseline.MRV);
          }
        }
        // Invariant 2: RIR ≥ 0 (mesocycle.rirTargetForPhase enforces floor 0)
        // — V1 not exposed in blueprint directly; covered in mesocycle.test.js

        // Invariant 5 Medical Safety: NO injury override possible if blocked
        // — gate logic verified mesocycle.test.js + macrocycle.test.js

        // Intensity hard cap 90% Layer C
        expect(result.meta.intensity_target_pct.ceiling).toBeLessThanOrEqual(HARD_CAP_INTENSITY_PCT_1RM);
        expect(result.meta.intensity_target_pct.floor).toBeGreaterThanOrEqual(0);
        expect(result.meta.intensity_target_pct.floor).toBeLessThanOrEqual(result.meta.intensity_target_pct.ceiling);
      });
    }
  });

  it('persona age fallback — age 65 (no explicit persona) → maria modifiers', async () => {
    const r = await evaluate(buildCtx({ age: 65, goal: 'sanatate' }));
    expect(r.trace.personaId).toBe('maria');
  });

  it('persona age fallback — age 35 → gigica', async () => {
    const r = await evaluate(buildCtx({ age: 35, goal: 'hipertrofie' }));
    expect(r.trace.personaId).toBe('gigica');
  });

  it('persona age fallback — age 25 → marius', async () => {
    const r = await evaluate(buildCtx({ age: 25, goal: 'forta' }));
    expect(r.trace.personaId).toBe('marius');
  });

  it('Forta goal → 21-week block (BUILD+PEAK+TRANSITION)', async () => {
    const r = await evaluate(buildCtx({ persona: 'marius', goal: 'forta' }));
    expect(r.meta.macrocycle_block.blockLengthWeeks).toBe(21);
  });

  it('non-Forta goals → 12-week block (BUILD-only)', async () => {
    for (const goal of ['hipertrofie', 'recompozitie', 'longevitate', 'sanatate']) {
      const r = await evaluate(buildCtx({ persona: 'marius', goal }));
      expect(r.meta.macrocycle_block.blockLengthWeeks).toBe(12);
    }
  });
});
