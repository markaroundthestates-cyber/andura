// ══ BEGINNER CALF RESCUE GATE (cycle-13-edge-01) ══════════════════════════
// The beginner 5-slot cap (dp_beginner_session_size_v1) seats the most-coverage
// majors first — on a balanced full-body day that is chest/back/quads (compounds)
// + a shoulders-iso + a hams-iso, so calves (gambe, the 6th MAJOR) never land a
// slot and got ZERO sets ALL WEEK (no exercise tags gambe as a secondary, the
// leg-coverage trade excludes gambe, and the non-leg-major trade needs a leg
// surplus that does not exist at the cap). That contradicts the engine's own
// MAJOR_MUSCLES_SLOT_GUARANTEE + the "de-emphasized -> MAINTENANCE (MEV), never
// zero" policy (acute for the elderly — calf/ankle strength is balance + fall-
// prevention). dp_beginner_calf_rescue_v1 (default ON) seats a calf slot via a
// SWAP (displace a secondary-covered or non-major iso; never a compound, a leg-
// region group, or the focus; never grow past the cap).
//
// PRODUCTION-SHAPED: drives the REAL compose path (world.composePlannedWorkoutToday)
// over a beginner's training week with the registry-default flags (the true live
// state — NOT a synthetic buildSession ctx), the same harness the persona-matrix
// uses. The CONTROL is an intermediate (cap 8) whose calves were never the defect.

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld } from './full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../src/engine/exerciseLibrary.js';
import { activeWeekForFrequency } from '../../src/engine/schedule/scheduleAdapter/frequencySplit.js';
import { DEV_FLAGS_KEY } from '../../src/util/featureFlags.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday

function activeOffsets(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}

// Run a persona's week through the REAL compose path with the LIVE registry-default
// flags (clear any _devFlags override so default:true flags apply — the shipped state).
async function runWeek(data) {
  resetWorld();
  try { localStorage.removeItem(DEV_FLAGS_KEY); } catch { /* */ }
  world.useOnboardingStore.setState({
    data: { ...data, focusPresetPickedAt: null },
    completed: true,
    completedAt: COHORT_START,
  });
  const days = [];
  for (const off of activeOffsets(data.frequency)) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(COHORT_START + off * MS_DAY)); }
    catch (e) { plan = { error: String(e) }; }
    if (!plan || plan.error) { days.push({ off, rest: true }); continue; }
    const rows = (plan.exercises || []).map((e) => {
      const name = e.engineName || e.name;
      const m = getExerciseMetadata(name) || {};
      return { name, g: m.muscle_target_primary, tier: m.tier };
    });
    days.push({
      off,
      count: rows.length,
      sessionType: plan.sessionType,
      groups: rows.map((r) => r.g),
      rows,
    });
  }
  return days;
}

const BEGINNER_MARIA65 = {
  age: 65, sex: 'f', goal: 'mentenanta', frequency: '3', experience: 'incepator',
  weight: 70, height: 162, focusPreset: 'balanced',
};
const BEGINNER_YOUNG = {
  age: 22, sex: 'm', goal: 'masa', frequency: '3', experience: 'incepator',
  weight: 75, height: 178, focusPreset: 'balanced',
};
const CONTROL_INTERMEDIATE = {
  age: 50, sex: 'f', goal: 'mentenanta', frequency: '3', experience: 'intermediar',
  weight: 70, height: 162, focusPreset: 'balanced',
};

const CALF = 'gambe';
const MAJORS = new Set(['piept', 'spate', 'umeri', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']);

describe('beginner calf rescue (cycle-13-edge-01)', () => {
  beforeEach(() => {
    resetWorld();
  });

  it('Maria-65 beginner full-body gets calves (>=1 slot, non-zero weekly) — was 0 all week', async () => {
    const days = await runWeek(BEGINNER_MARIA65);
    const trained = days.filter((d) => !d.rest && d.sessionType === 'FULL');
    expect(trained.length).toBeGreaterThan(0);
    // The defect: calves ZERO on every full-body day -> 0 weekly. The rescue must
    // put calves on the week (>=1 training day), so calves are no longer orphaned.
    const calfDays = trained.filter((d) => d.groups.includes(CALF)).length;
    expect(calfDays).toBeGreaterThanOrEqual(1);
    // Bound — a SWAP, never a grow: every full-body day stays at the 5-slot cap.
    for (const d of trained) expect(d.count).toBeLessThanOrEqual(5);
    // The displaced victim is never a leg-region group (legs stay covered) and the
    // session never drops a compound to seat the calf iso (compound-first holds).
    for (const d of trained) {
      const compounds = d.rows.filter((r) => (r.tier ?? 2) <= 1).length;
      expect(compounds).toBeGreaterThanOrEqual(2); // chest/back/quads compounds survive
      const legRegion = d.groups.filter((g) => ['picioare-quads', 'picioare-hamstrings', 'fese'].includes(g)).length;
      expect(legRegion).toBeGreaterThanOrEqual(1); // legs never zeroed by the swap
    }
  });

  it('young beginner full-body also gets calves on the week', async () => {
    const days = await runWeek(BEGINNER_YOUNG);
    const trained = days.filter((d) => !d.rest && d.sessionType === 'FULL');
    expect(trained.length).toBeGreaterThan(0);
    const calfDays = trained.filter((d) => d.groups.includes(CALF)).length;
    expect(calfDays).toBeGreaterThanOrEqual(1);
    for (const d of trained) expect(d.count).toBeLessThanOrEqual(5);
  });

  it('CONTROL: intermediate (cap 8) is unchanged — calves covered every full-body day', async () => {
    const days = await runWeek(CONTROL_INTERMEDIATE);
    const trained = days.filter((d) => !d.rest && d.sessionType === 'FULL');
    expect(trained.length).toBeGreaterThan(0);
    for (const d of trained) {
      expect(d.count).toBeGreaterThan(5);          // not the beginner cap
      expect(d.groups).toContain(CALF);            // calves covered (never the defect here)
    }
  });
});
