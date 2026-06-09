// W-Split (oracle grid GAP 1 + GAP 4, 2026-06-09) — the WEEK-LEVEL split + safety
// rebalance behind dp_split_rebalance_v1. These tests drive the REAL compose path
// (composePlannedWorkoutToday → 8-engine pipeline → dp.js) with the flag forced
// ON and assert the five fixes. The OFF arm is the gold-ref (the legacy split).
//
// Active days are taken from the ENGINE's own week (activeWeekForFrequency) — NOT
// the pm-run ACTIVE_DAYS offsets, which mismatch the engine week for freq 5 and
// would mis-attribute clusters (the harness artifact that inflated the audit's
// v-taper inversion). Composing over the real week measures the TRUE prescription.

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../../tests/engine/full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../util/featureFlags.js';
import { activeWeekForFrequency } from '../scheduleAdapter/frequencySplit.js';
import { ANDURA_ON_FLAGS } from '../../../../tests/engine/persona-matrix/pm-personas.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday

function setFlags(ids) {
  const obj = {};
  for (const f of FLIPPED_FLAGS) obj[f] = false;
  for (const f of ids) obj[f] = true;
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* */ }
}

// Drive the composer over the engine's real active days for a persona; return the
// per-day session types + per-RO-group weekly volume + max single-session sets.
async function composeWeek(data, flags) {
  resetWorld();
  setPathAFlags(false);
  setFlags(flags);
  const now0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...data,
      focusPresetPickedAt:
        data.focusPreset && data.focusPreset !== 'balanced' ? now0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: now0,
  });
  const aw = activeWeekForFrequency(data.frequency);
  const offsets = [];
  for (let i = 0; i < 7; i++) if (aw[i]) offsets.push(i);
  const weekly = {};
  const types = [];
  let maxSessionSets = 0;
  for (const off of offsets) {
    const plan = await world.composePlannedWorkoutToday(new Date(now0 + off * MS_DAY));
    if (!plan || plan.error) { types.push('REST'); continue; }
    const exs = plan.exercises || [];
    const total = exs.reduce((a, e) => a + (e.sets || 0), 0);
    maxSessionSets = Math.max(maxSessionSets, total);
    types.push(plan.sessionType);
    for (const e of exs) {
      const g = getExerciseMetadata(e.engineName || e.name).muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + (e.sets || 0);
    }
  }
  return { types, weekly, maxSessionSets };
}

const ON = Object.freeze([...ANDURA_ON_FLAGS, 'dp_split_rebalance_v1']);

describe('W-Split (dp_split_rebalance_v1) — week-level split + safety, flag ON', () => {
  beforeEach(() => { resetWorld(); });

  it('(a) v-taper 5d → back weekly volume ≥ chest, and pull day-count ≥ push day-count', async () => {
    const { types, weekly } = await composeWeek(
      { age: 30, sex: 'm', goal: 'masa', frequency: '5', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'v-taper' },
      ON,
    );
    const back = weekly.spate || 0;
    const chest = weekly.piept || 0;
    expect(back).toBeGreaterThanOrEqual(chest); // the V means the back LEADS
    const pushDays = types.filter((t) => t === 'PUSH').length;
    const pullDays = types.filter((t) => t === 'PULL').length;
    expect(pullDays).toBeGreaterThanOrEqual(pushDays); // pull-heavy week
  });

  it('(b) freq ≤2 → a FULL-BODY week that trains legs (legs sets > 0), never an upper/lower that zeroes a region', async () => {
    const { types, weekly } = await composeWeek(
      { age: 35, sex: 'm', goal: 'masa', frequency: '2', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'balanced' },
      ON,
    );
    const legs = (weekly['picioare-quads'] || 0) + (weekly['picioare-hamstrings'] || 0) + (weekly.fese || 0);
    expect(legs).toBeGreaterThan(0);
    // every session is full-body (no upper/lower split that drops a region)
    for (const t of types) expect(t).toBe('FULL');
    // and a major upper region is still trained (back > 0)
    expect(weekly.spate || 0).toBeGreaterThan(0);
  });

  it('(c) a 68yo beginner session is capped to the senior/novice volume ceiling', async () => {
    const { maxSessionSets } = await composeWeek(
      { age: 68, sex: 'm', goal: 'mentenanta', frequency: '3', experience: 'incepator', weight: 80, height: 175, focusPreset: 'balanced' },
      ON,
    );
    // elderly (≥70 is tighter); 68 → senior+beginner ceiling 15. Allow the
    // per-exercise MEV-floor headroom (count × 2): assert clearly under the
    // pre-fix ~19-23 the audit flagged.
    expect(maxSessionSets).toBeLessThanOrEqual(17);
  });

  it('(d) no MAJOR muscle collapses to ~0 for the tested personas (maintenance floor)', async () => {
    const personas = [
      { age: 30, sex: 'm', goal: 'masa', frequency: '5', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'v-taper' },
      { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'upper' },
      { age: 72, sex: 'f', goal: 'mentenanta', frequency: '2', experience: 'incepator', weight: 68, height: 162, focusPreset: 'balanced' },
    ];
    const MAJORS = ['piept', 'spate', 'umeri', 'picioare-quads'];
    for (const data of personas) {
      const { weekly } = await composeWeek(data, ON);
      for (const g of MAJORS) {
        expect(weekly[g] || 0, `${data.focusPreset} f${data.frequency}: major ${g} must not collapse to ~0`).toBeGreaterThan(0);
      }
    }
  });

  it('(e) balanced focus unchanged in spirit — proportional push/pull, no inversion', async () => {
    const { types, weekly } = await composeWeek(
      { age: 30, sex: 'm', goal: 'masa', frequency: '5', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'balanced' },
      ON,
    );
    const pushDays = types.filter((t) => t === 'PUSH').length;
    const pullDays = types.filter((t) => t === 'PULL').length;
    expect(Math.abs(pushDays - pullDays)).toBeLessThanOrEqual(1); // balanced day-mix
    // no antagonist inversion (back ≥ chest holds even for balanced here)
    expect(weekly.spate || 0).toBeGreaterThanOrEqual((weekly.piept || 0) - 1);
  });

  it('chest focus → push-leaning week + chest ≥ back (the mirror of v-taper)', async () => {
    const { types, weekly } = await composeWeek(
      { age: 30, sex: 'm', goal: 'masa', frequency: '5', experience: 'intermediar', weight: 85, height: 182, focusPreset: 'chest' },
      ON,
    );
    const pushDays = types.filter((t) => t === 'PUSH').length;
    const pullDays = types.filter((t) => t === 'PULL').length;
    expect(pushDays).toBeGreaterThanOrEqual(pullDays);
    expect(weekly.piept || 0).toBeGreaterThanOrEqual(weekly.spate || 0);
  });
});
