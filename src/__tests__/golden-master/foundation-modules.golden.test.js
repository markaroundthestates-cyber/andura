// Golden Master — Foundation modules deterministic outputs
// Composite Signal Layer + Smart Routing + Bias Detection + Pain Button + Goal Shift.
// Per ADRs LOCKED V1 (BATCH_01 cluster 10-batch).

import { describe, it } from 'vitest';
import { captureSnapshot } from './setup.js';
import {
  detectCompositeSignal, advanceLifecycle,
} from '../../engine/composite-signal/index.js';
import { findAlternatives } from '../../engine/smart-routing/index.js';
import { detectBiasDrift, cascadeArbitrate } from '../../engine/suflet-andura/index.js';
import {
  PAIN_OPTIONS, processPainInput, buildOverrideAuditEntry,
} from '../../engine/pain-button/index.js';
import {
  initiateGoalShift, advancePostShiftSession, buildCalibrationPlaceholderData,
} from '../../engine/self-correction/index.js';

describe('Golden Master — Composite Signal Layer (3/3 simultaneous threshold)', () => {
  it('all clean — no trigger', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.05,
      restTimeMultiplier: 1.0,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 10,
    });
    captureSnapshot('composite_signal_all_clean', r);
  });

  it('one flag (only performance drop) — no trigger', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.20,
      restTimeMultiplier: 1.0,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 10,
    });
    captureSnapshot('composite_signal_one_flag', r);
  });

  it('two flags — no trigger (3/3 strict)', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.20,
      restTimeMultiplier: 1.6,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 10,
    });
    captureSnapshot('composite_signal_two_flags', r);
  });

  it('three flags — trigger', () => {
    const r = detectCompositeSignal({
      performanceDropPct: 0.20,
      restTimeMultiplier: 1.6,
      expectedRepsAtRir: 10,
      actualRepsAtFailure: 7,
    });
    captureSnapshot('composite_signal_three_flags_trigger', r);
  });

  it('lifecycle idle → flagged → cooldown → resolving → idle', () => {
    let s = { status: 'idle', sessionsInState: 0 };
    s = advanceLifecycle(s, { triggerDetected: true });
    captureSnapshot('lifecycle_step1_flagged', s);
    s = advanceLifecycle(s, { triggerDetected: false });
    captureSnapshot('lifecycle_step2_cooldown', s);
    s = advanceLifecycle(s, { triggerDetected: false });
    s = advanceLifecycle(s, { triggerDetected: false });
    captureSnapshot('lifecycle_step4_resolving', s);
    s = advanceLifecycle(s, { triggerDetected: false });
    s = advanceLifecycle(s, { triggerDetected: false });
    captureSnapshot('lifecycle_step6_idle', s);
  });
});

describe('Golden Master — Smart Routing Equipment (tier-aware filtering)', () => {
  it('Tier 1 forta (Lat Pulldown) → strict force_demand: high', () => {
    const r = findAlternatives('Lat Pulldown');
    captureSnapshot('smart_routing_tier1_lat_pulldown', r);
  });

  it('Tier 2 isolation (Lateral Raises) → muscle_target match flexibility', () => {
    const r = findAlternatives('Lateral Raises');
    captureSnapshot('smart_routing_tier2_lateral_raises', r);
  });

  it('Unknown exercise → shouldSkip = true', () => {
    const r = findAlternatives('NonExistentExercise');
    captureSnapshot('smart_routing_unknown', r);
  });
});

describe('Golden Master — Bias Detection 3/3 simultaneous', () => {
  it('EXECUTOR + 3 high signals → trigger', () => {
    const r = detectBiasDrift({
      whyTapRate: 0.10,
      avgSummaryDwellMs: 20000,
      repRangeOverrideRate: 0.40,
      declaredMode: 'EXECUTOR',
    });
    captureSnapshot('bias_drift_executor_3of3', r);
  });

  it('EXECUTOR + 2 high signals → no trigger', () => {
    const r = detectBiasDrift({
      whyTapRate: 0.10,
      avgSummaryDwellMs: 20000,
      repRangeOverrideRate: 0.10,
      declaredMode: 'EXECUTOR',
    });
    captureSnapshot('bias_drift_executor_2of3', r);
  });

  it('STRATEGIC + 3 low signals → trigger', () => {
    const r = detectBiasDrift({
      whyTapRate: 0.01,
      avgSummaryDwellMs: 3000,
      repRangeOverrideRate: 0.02,
      declaredMode: 'STRATEGIC',
    });
    captureSnapshot('bias_drift_strategic_3of3', r);
  });
});

describe('Golden Master — Cascade Defense priority order', () => {
  it('safety > recovery > progression > optimization', () => {
    const recs = [
      { engine: 'A', layer: 'progression',  action: 'increase', priority: 5 },
      { engine: 'B', layer: 'safety',       action: 'rest_day', priority: 1 },
      { engine: 'C', layer: 'optimization', action: 'tweak',    priority: 9 },
      { engine: 'D', layer: 'recovery',     action: 'deload',   priority: 3 },
    ];
    const r = cascadeArbitrate(recs);
    captureSnapshot('cascade_arbitrate_full', { winner: r.winner.engine, runnerUps: r.runnerUps.map(x => x.engine) });
  });
});

describe('Golden Master — Pain Discomfort Button (§36.38 + EXT-1 LOCKED V1)', () => {
  it('3 PAIN_OPTIONS exposed (general/specific/technical)', () => {
    captureSnapshot('pain_options_full', PAIN_OPTIONS);
  });

  it('processPainInput per key', () => {
    ['discomfort_general', 'discomfort_specific', 'doms_severe'].forEach(key => {
      captureSnapshot(`pain_input_${key}`, processPainInput(key));
    });
  });

  it('buildOverrideAuditEntry sets user_override_pain_redflag', () => {
    const entry = buildOverrideAuditEntry({
      exerciseName: 'Squat',
      painKey: 'discomfort_specific',
      userOverride: true,
    });
    // ts is dynamic — strip for stable snapshot
    const { ts, ...stable } = entry;
    captureSnapshot('pain_override_entry', stable);
  });
});

describe('Golden Master — Goal Shift Calibration (§36.35 + ADR_OUTLIER EXT-2)', () => {
  it('initiateGoalShift CUT → BULK', () => {
    const s = initiateGoalShift('CUT', 'BULK');
    captureSnapshot('goal_shift_init', s);
  });

  it('advancePostShiftSession lifecycle', () => {
    let s = initiateGoalShift('CUT', 'BULK');
    s = advancePostShiftSession(s);
    captureSnapshot('goal_shift_after_session_1', s);
    s = advancePostShiftSession(s);
    captureSnapshot('goal_shift_after_session_2', s);
  });

  it('GOAL_SHIFT_CALIBRATION_PLACEHOLDER LOCKED V1 wording', () => {
    const data = buildCalibrationPlaceholderData({
      minKg: 50, maxKg: 60, reps: 8, current: 1,
    });
    captureSnapshot('goal_shift_placeholder_data', data);
  });
});
