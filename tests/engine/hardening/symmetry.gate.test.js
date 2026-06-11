// ══ HARDENING — structural symmetry gate (audit-hardening arc 2026-06-11) ══
// A competent coach keeps a NO-FOCUS (balanced) week structurally symmetric:
// pressing is mirrored by pulling, legs carry a real share, arms never dominate.
// The focus-signature gates police what each FOCUS must contain; THIS gate
// polices what balanced must NOT drift into — the symmetry seams (push↔pull,
// upper↔lower) where past regressions hid (v-taper 3push:1pull artefact class).
//
// Mechanics mirror split-rebalance-maintenance.gate.test.js: the REAL compose
// path (world.composePlannedWorkoutToday) with the Andura-ON flag set, weekly
// aggregation over the ACTIVE days of the schedule.
//
// BANDS: calibrated against the real composed output (test-real-values house
// rule) — generous enough to allow coaching variation, tight enough that a
// push/pull collapse or a legs blackout fails loudly.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { deriveExerciseTags } from '../../../src/engine/focusPolicy.js';
import { movementKey } from '../../../src/engine/sessionBuilder.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { ACTIVE_DAYS } from '../persona-matrix/pm-run.js';
import { ANDURA_ON_FLAGS, COHORT_START } from '../persona-matrix/pm-personas.js';

const MS_DAY = 86400000;

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// Neutral balanced adult — no pain, no time cap, no senior volume caps, so the
// symmetry we measure is the COMPOSER's, not a constraint artifact.
const BALANCED_BASE = {
  age: 30, sex: 'm', goal: 'masa', experience: 'intermediar',
  weight: 80, height: 178, focusPreset: 'balanced',
};

/** Compose the active week; return per-group weekly sets + per-exercise rows. */
async function composeWeek(frequency) {
  resetWorld();
  setPathAFlags(false);
  setFlags([...ANDURA_ON_FLAGS, 'dp_split_rebalance_v1']);
  const n0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: { ...BALANCED_BASE, frequency, focusPresetPickedAt: null },
    completed: true,
    completedAt: n0,
  });
  const offsets = ACTIVE_DAYS[frequency] || ACTIVE_DAYS['4'];
  const weekly = {};
  const rows = [];
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error) continue;
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const meta = getExerciseMetadata(name);
      const g = meta.muscle_target_primary;
      const sets = e.sets || 0;
      weekly[g] = (weekly[g] || 0) + sets;
      rows.push({ name, group: g, sets, tags: deriveExerciseTags(name, meta, movementKey) });
    }
  }
  return { weekly, rows };
}

const sum = (weekly, groups) => groups.reduce((n, g) => n + (weekly[g] || 0), 0);

describe.each(['2', '3', '4', '5'])('symmetry gate — balanced, %s days/week', (frequency) => {
  it('push↔pull mirrored, legs carry a real share, arms never dominate', async () => {
    const { weekly, rows } = await composeWeek(frequency);
    const total = sum(weekly, Object.keys(weekly));
    expect(total, `week composed (weekly=${JSON.stringify(weekly)})`).toBeGreaterThan(0);

    // (1) PUSH ↔ PULL — horizontal+vertical pressing volume (piept + umeri) is
    // mirrored by pulling volume (spate + rear-delt work counts under umeri, so
    // the muscle-level proxy is piept↔spate): back is never starved below chest
    // ×0.75, chest is never starved below back ×0.4.
    const chest = weekly.piept || 0;
    const back = weekly.spate || 0;
    expect(back, `back vs chest (weekly=${JSON.stringify(weekly)})`).toBeGreaterThanOrEqual(chest * 0.75);
    expect(chest, `chest vs back (weekly=${JSON.stringify(weekly)})`).toBeGreaterThanOrEqual(back * 0.4);

    // (2) PATTERN mirror — a week that presses must pull: any chest/vertical
    // press in the week requires at least one vertical pull OR horizontal row.
    const has = (tag) => rows.some((r) => r.tags.has(tag));
    if (has('chest_press') || has('vertical_press')) {
      expect(
        has('vertical_pull') || has('horizontal_row'),
        `press without any pull (rows=${rows.map((r) => r.name).join(' | ')})`,
      ).toBe(true);
    }

    // (3) LEGS share — the leg region (quads+hams+glutes) carries a real share
    // of a balanced week: never below 20% of total sets, never above 55%.
    const legs = sum(weekly, ['picioare-quads', 'picioare-hamstrings', 'fese']);
    expect(legs / total, `legs share (weekly=${JSON.stringify(weekly)})`).toBeGreaterThanOrEqual(0.2);
    expect(legs / total, `legs share (weekly=${JSON.stringify(weekly)})`).toBeLessThanOrEqual(0.55);

    // (4) ARMS never dominate a balanced week — direct biceps+triceps stay
    // under 30% of total sets (they also ride secondary volume from presses
    // and pulls, so direct work past this is focus territory, not balance).
    const arms = sum(weekly, ['biceps', 'triceps']);
    expect(arms / total, `arms share (weekly=${JSON.stringify(weekly)})`).toBeLessThanOrEqual(0.3);
  }, 120000);
});
