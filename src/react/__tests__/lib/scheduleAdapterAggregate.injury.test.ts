// Injury safety signal wire tests (oracle-concern #2, SAFETY-adjacent).
//
// A known injury used to do NOTHING in the live path: scheduleAdapterAggregate
// passed `meta:{}` so the pipeline injury gates ran inert. These tests prove the
// fix wires the Pain CDL channel (DB('pain-cdl')) into the pipeline meta so the
// EXISTING gates actually fire for a known injury:
//   - deriveInjurySignal reads the Pain CDL within the lookback window + maps
//     regions → Big 11 muscle groups (canonical PAIN_REGION_GROUP_MAP)
//   - the derived meta makes the specialization engine return
//     INELIGIBLE_INJURY_OVERRIDE via the injury gate (Gate 4), NOT the persona
//     gate — a no-injury control reaches a non-injury state
//   - the derived recentSessions injury stamp engages the goalAdaptation
//     push-back recent-injury risk (risk_recent_injury_6w)
//
// Cross-refs:
//   - src/engine/specialization/activationGating.js (detectInjuryAutoDisable)
//   - src/engine/goalAdaptation/pushBackTiers.js (computeRiskScore injury check)
//   - src/react/routes/screens/antrenor/PainButton.tsx (Pain CDL write path)

import { describe, it, expect, beforeEach } from 'vitest';
import { deriveInjurySignal } from '../../lib/scheduleAdapterAggregate';
import { DB } from '../../../db.js';
import { MS_PER_DAY } from '../../../constants.js';
import { evaluate as evaluateSpecialization } from '../../../engine/specialization/index.js';
import { evaluate as evaluateGoalAdaptation } from '../../../engine/goalAdaptation/index.js';
import { ACTIVATION_STATE } from '../../../engine/specialization/constants.js';

const NOW = new Date(2026, 4, 25, 12, 0, 0).getTime();
const PAIN_CDL_KEY = 'pain-cdl';

// Logs producing predictable weak group "biceps" via weaknessDetector — same
// fixture shape the specialization engine tests use (1RM ratio << peers).
const weakBicepsLogs = () => [
  { ex: 'Bench Press', w: 120, reps: 5 },
  { ex: 'Barbell Row', w: 110, reps: 5 },
  { ex: 'Bicep Curl', w: 25, reps: 8 },
  { ex: 'Squat', w: 130, reps: 5 },
];

beforeEach(() => {
  localStorage.clear();
});

describe('deriveInjurySignal — Pain CDL → injury signal', () => {
  it('recent pain report (within window) → active + mapped muscle groups', () => {
    // cot (elbow) → biceps + triceps per canonical PAIN_REGION_GROUP_MAP.
    const sig = deriveInjurySignal(
      [{ type: 'pain', region: 'cot-drept', intensity: 2, ts: NOW - 5 * MS_PER_DAY }],
      NOW,
    );
    expect(sig.active).toBe(true);
    expect(sig.affectedGroups).toContain('biceps');
    expect(sig.affectedGroups).toContain('triceps');
  });

  it('umar pain → umeri group', () => {
    const sig = deriveInjurySignal(
      [{ type: 'pain', region: 'umar-stang', intensity: 1, ts: NOW - MS_PER_DAY }],
      NOW,
    );
    expect(sig.active).toBe(true);
    expect(sig.affectedGroups).toEqual(['umeri']);
  });

  it('stale report (older than 42d window) → inactive', () => {
    const sig = deriveInjurySignal(
      [{ type: 'pain', region: 'umar-stang', intensity: 3, ts: NOW - 50 * MS_PER_DAY }],
      NOW,
    );
    expect(sig.active).toBe(false);
    expect(sig.affectedGroups).toEqual([]);
  });

  it('dedupes groups across multiple reports', () => {
    const sig = deriveInjurySignal(
      [
        { type: 'pain', region: 'umar-stang', intensity: 1, ts: NOW - MS_PER_DAY },
        { type: 'pain', region: 'umar-drept', intensity: 2, ts: NOW - 2 * MS_PER_DAY },
      ],
      NOW,
    );
    expect(sig.affectedGroups).toEqual(['umeri']);
  });

  it('ignores malformed / non-pain entries + empty/null input', () => {
    expect(deriveInjurySignal(null, NOW).active).toBe(false);
    expect(deriveInjurySignal([], NOW).active).toBe(false);
    expect(
      deriveInjurySignal(
        [{ type: 'other', region: 'umar-stang', ts: NOW } as never],
        NOW,
      ).active,
    ).toBe(false);
    expect(
      deriveInjurySignal([{ type: 'pain', region: 'umar-stang' }], NOW).active,
    ).toBe(false); // no ts → skipped
  });
});

describe('injury gate fires from derived meta — specialization (Gate 4, NOT persona)', () => {
  // Build the specialization ctx the way the live wire feeds it: meta carries
  // the derived painButtonActive/painAffectedGroups. Marius + T1 + BULK pass
  // Gates 1-3 so Gate 4 (injury) is the one that blocks. lifetimeLogs/recentLogs
  // supply the weakness target the injury overlaps (biceps).
  const buildSpecCtx = (painButtonActive: boolean, painAffectedGroups: string[]) => ({
    user: {},
    recentSessions: [],
    profileTier: 'T1',
    meta: {
      persona: 'marius',
      goalPhase: 'BULK',
      periodizationPhase: 'LOAD',
      lifetimeLogs: weakBicepsLogs(),
      recentLogs: weakBicepsLogs(),
      painButtonActive,
      painAffectedGroups,
    },
  });

  it('known biceps-region injury → INELIGIBLE_INJURY_OVERRIDE', async () => {
    // cot pain report → biceps in affectedGroups → overlaps weak target biceps.
    const sig = deriveInjurySignal(
      [{ type: 'pain', region: 'cot-drept', intensity: 2, ts: NOW - 3 * MS_PER_DAY }],
      NOW,
    );
    const result = await evaluateSpecialization(
      buildSpecCtx(sig.active, sig.affectedGroups),
    );
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE);
  });

  it('no injury (empty Pain CDL) → does NOT hit injury gate (control)', async () => {
    const sig = deriveInjurySignal([], NOW);
    const result = await evaluateSpecialization(
      buildSpecCtx(sig.active, sig.affectedGroups),
    );
    // Proves the block above is the INJURY gate, not the persona gate: with no
    // injury the same Marius/T1/BULK ctx reaches a non-injury activation state.
    expect(result.meta.activation_state).not.toBe(
      ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE,
    );
    expect(result.meta.activation_state).not.toBe(
      ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS,
    );
  });
});

describe('push-back injury path engaged from derived recentSessions stamp — goalAdaptation', () => {
  // The live wire stamps injury:true on sessions inside the lookback window. Feed
  // that shape (as buildUserStateForPipeline produces) to the goalAdaptation
  // engine and assert the recent-injury risk reason fires.
  const buildGoalCtx = (recentSessions: Array<Record<string, unknown>>) => ({
    user: { age: 30, goal: 'masa', kg: 80, bfPct: 0.15, sex: 'male', trainingWeeks: 100 },
    recentSessions,
    weights: {},
    flags: {},
    meta: { periodizationConstraint: null, tdeeKcal: 2400, aggressiveOptIn: false },
  });

  it('recent injury-stamped session → risk_recent_injury_6w + elevated tier', async () => {
    const result = await evaluateGoalAdaptation(
      buildGoalCtx([{ daysAgo: 5, injury: true }]),
    );
    expect(result.signals).toContain('risk_recent_injury_6w');
    // Score >=1 (injury) → at least Tier 2 banner (not the silent Tier 1).
    expect(result.signals).not.toContain('pushback_tier_1_silent');
  });

  it('no injury stamp → no recent-injury risk (control)', async () => {
    const result = await evaluateGoalAdaptation(buildGoalCtx([{ daysAgo: 5 }]));
    expect(result.signals).not.toContain('risk_recent_injury_6w');
  });
});

describe('end-to-end — Pain CDL persisted via DB reads back through deriveInjurySignal', () => {
  it('DB-persisted pain report is read by the live derive helper', () => {
    DB.set(PAIN_CDL_KEY, [
      { type: 'pain', region: 'umar-drept', intensity: 2, ts: Date.now() - MS_PER_DAY },
    ]);
    const sig = deriveInjurySignal(DB.get(PAIN_CDL_KEY));
    expect(sig.active).toBe(true);
    expect(sig.affectedGroups).toEqual(['umeri']);
  });
});
