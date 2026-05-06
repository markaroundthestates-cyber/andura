import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import {
  CUE_DELIVERY_TIMING,
  PERSONA,
  NOTATION_STYLE,
  TONE_STYLE,
} from '../constants.js';

const buildPeriodConstraint = (phase = 'LOAD') => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  volume_per_muscle: {
    chest: { floor: 8, ceiling: 14 },
  },
  phase,
  deload_window: null,
  immutable_snapshot: true,
});

const buildCtx = ({
  persona,
  profileTier = 'T0',
  movementId = 'squat',
  periodizationConstraint = null,
  energyDirection,
  formBreakdownReported,
  rirActual,
  rirExpected,
  postSetContext,
  userInitiatedExpand,
  userToggleAcquired,
  recentSessionsForMovement = [],
} = {}) => ({
  user: {
    ...(persona ? { persona } : {}),
  },
  profileTier,
  meta: {
    movementId,
    periodizationConstraint,
    energyDirection,
    formBreakdownReported,
    rirActual,
    rirExpected,
    postSetContext,
    userInitiatedExpand,
    userToggleAcquired,
    recentSessionsForMovement,
  },
});

describe('evaluate — integration end-to-end §9.5 ADR 026', () => {
  it('returns valid TempoResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('blueprint contains 4 fields + signals per §9.5.1 Cluster A', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.meta).toHaveProperty('tempo_prescription');
    expect(result.meta).toHaveProperty('form_cue');
    expect(result.meta).toHaveProperty('mind_muscle_active');
    expect(result.meta).toHaveProperty('cue_delivery_timing');
    expect(result.meta).toHaveProperty('signals');
  });

  it('total function — never throws on empty/null ctx', async () => {
    await expect(evaluate()).resolves.toBeDefined();
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
    await expect(evaluate({ user: null })).resolves.toBeDefined();
  });

  it('empty ctx → tier none, confidence low', async () => {
    const result = await evaluate({});
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
  });

  it('deterministic — identical ctx → identical output (10 invocations)', async () => {
    const ctx = buildCtx({
      persona: 'maria',
      profileTier: 'T1',
      movementId: 'squat',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    });
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(await evaluate(ctx));
    }
    const json = results.map((r) => JSON.stringify(r));
    expect(new Set(json).size).toBe(1);
  });

  it('Maria zero notation strict — display_text NEVER contains numeric Tempo (Q3 Daniel push-back invariant)', async () => {
    const result = await evaluate(buildCtx({
      persona: 'maria',
      profileTier: 'T1',
      movementId: 'squat',
    }));
    expect(result.meta.tempo_prescription.display_text).not.toMatch(/Tempo \d/);
    expect(result.meta.tempo_prescription.display_text).not.toMatch(/\d-\d/);
    expect(result.meta.form_cue.notation_style).toBe(NOTATION_STYLE.VERBAL);
  });

  it('Marius numeric pure — display_text is "Tempo X-Y-Z-W" format strict', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius',
      movementId: 'squat',
    }));
    expect(result.meta.tempo_prescription.display_text).toMatch(/^Tempo /);
    expect(result.meta.form_cue.tone).toBe(TONE_STYLE.IMPERATIVE);
  });

  it('T0 cold start → mind_muscle_active false (Cluster C5 Q5=C)', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T0',
      movementId: 'squat',
    }));
    expect(result.meta.mind_muscle_active).toBe(false);
  });

  it('T1+ → mind_muscle_active true', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      movementId: 'squat',
    }));
    expect(result.meta.mind_muscle_active).toBe(true);
  });

  it('Periodization PEAK → form-conservative amplification signal + eccentric ≥3s', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius',
      movementId: 'squat',
      periodizationConstraint: buildPeriodConstraint('PEAK'),
    }));
    expect(result.signals).toContain('tempo_form_conservative_amplification_high_intensity');
    expect(result.meta.tempo_prescription.notation.eccentric_s).toBeGreaterThanOrEqual(3);
  });

  it('Periodization DELOAD → mind_muscle unlock signal (T0 + DELOAD → active)', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T0',
      movementId: 'squat',
      periodizationConstraint: buildPeriodConstraint('DELOAD'),
    }));
    expect(result.signals).toContain('mind_muscle_unlock_deload');
    expect(result.meta.mind_muscle_active).toBe(true);
  });

  it('Energy DOWN → slow eccentric universal signal (Q13=B NU ROM partial)', async () => {
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      energyDirection: 'DOWN',
    }));
    expect(result.signals).toContain('energy_down_slow_eccentric_universal');
  });

  it('Energy UP / NONE → NU slow eccentric override', async () => {
    const r1 = await evaluate(buildCtx({ movementId: 'squat', energyDirection: 'UP' }));
    const r2 = await evaluate(buildCtx({ movementId: 'squat', energyDirection: 'NONE' }));
    expect(r1.signals).not.toContain('energy_down_slow_eccentric_universal');
    expect(r2.signals).not.toContain('energy_down_slow_eccentric_universal');
  });

  it('RIR Matrix form breakdown → +1 auto-bump signal (Cluster D14 Q14=B)', async () => {
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      formBreakdownReported: true,
    }));
    expect(result.signals).toContain('rir_auto_bump_form_breakdown_plus_1');
  });

  it('RIR mismatch silent telemetry — signal present but NU active trigger (Q4=A)', async () => {
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      rirActual: 0,
      rirExpected: 3,
    }));
    expect(result.signals).toContain('rir_mismatch_silent_telemetry_only_v1');
    expect(result.trace.rirMismatchTelemetry.activeTrigger).toBe(false);
    expect(result.trace.rirMismatchTelemetry.telemetryOnly).toBe(true);
  });

  it('cue_delivery_timing default PRE_SET (NU INTRA_SET Q8=D invariant)', async () => {
    const result = await evaluate(buildCtx({ movementId: 'squat' }));
    expect(result.meta.cue_delivery_timing).toBe(CUE_DELIVERY_TIMING.PRE_SET);
    // Verify enum doesn't even contain INTRA_SET (Q8=D invariant)
    const enumValues = Object.values(CUE_DELIVERY_TIMING);
    expect(enumValues).not.toContain('INTRA_SET');
  });

  it('postSetContext → POST_SET timing', async () => {
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      postSetContext: true,
    }));
    expect(result.meta.cue_delivery_timing).toBe(CUE_DELIVERY_TIMING.POST_SET);
  });

  it('userInitiatedExpand → MID_REST timing (Cluster B1 Q1=C reactive)', async () => {
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      userInitiatedExpand: true,
    }));
    expect(result.meta.cue_delivery_timing).toBe(CUE_DELIVERY_TIMING.MID_REST);
  });

  it('Adaptive frequency — explicit "știu" → cue_suppressed signal', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T1',
      movementId: 'squat',
      userToggleAcquired: true,
    }));
    expect(result.signals).toContain('adaptive_frequency_acquired_user_toggle_explicit_stiu');
    expect(result.signals).toContain('cue_suppressed_hard');
  });

  it('Adaptive frequency — implicit N=10 sessions clean → soft auto-retire signal T2', async () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const result = await evaluate(buildCtx({
      profileTier: 'T2',
      movementId: 'squat',
      recentSessionsForMovement: sessions,
    }));
    expect(result.signals).toContain('adaptive_frequency_acquired_implicit_n10_sessions_clean');
    expect(result.signals).toContain('cue_suppressed_soft_auto_retire');
  });

  it('confidence high când movement + persona + periodConstraint toate prezente', async () => {
    const result = await evaluate(buildCtx({
      persona: 'marius',
      movementId: 'bench_press',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
    }));
    expect(result.confidence).toBe('high');
  });

  it('forward_constraint_object pass-through frozen Hook 4 (anti-cascade)', async () => {
    const constraint = buildPeriodConstraint('LOAD');
    const result = await evaluate(buildCtx({
      movementId: 'squat',
      periodizationConstraint: constraint,
    }));
    expect(result.trace.forwardedConstraint).toBe(true);
  });

  it('reactive_expand_available always true (Cluster B1 Q1=C + B6 Q6=D 💡)', async () => {
    const result = await evaluate(buildCtx({ movementId: 'squat' }));
    expect(result.meta.tempo_prescription.reactive_expand_available).toBe(true);
  });

  it('pipeline 5th canonical engine ID confirmed', () => {
    expect(ENGINE_ID).toBe('tempo');
  });

  it('Maria persona Cluster D18 — tone rationale_first preserved', async () => {
    const result = await evaluate(buildCtx({
      persona: 'maria',
      profileTier: 'T1',
      movementId: 'squat',
    }));
    expect(result.meta.form_cue.tone).toBe(TONE_STYLE.RATIONALE_FIRST);
  });

  it('Gigica persona Cluster D18 — tone suggestion preserved', async () => {
    const result = await evaluate(buildCtx({
      persona: 'gigica',
      movementId: 'squat',
    }));
    expect(result.meta.form_cue.tone).toBe(TONE_STYLE.SUGGESTION);
  });

  it('top-30 compound override (squat) cue distinct from top-30 (bench_press)', async () => {
    const r1 = await evaluate(buildCtx({
      profileTier: 'T1',
      movementId: 'squat',
    }));
    const r2 = await evaluate(buildCtx({
      profileTier: 'T1',
      movementId: 'bench_press',
    }));
    expect(r1.meta.form_cue.text).not.toBe(r2.meta.form_cue.text);
  });
});
