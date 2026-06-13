/**
 * dp_selection_dedup_v1 — FINER sub-family selection dedup (Daniel, eval 2026-06-13).
 *
 * THE DEFECT (the /10 eval flagged it on many solid configs): a single session
 * picked TWO near-identical movements of the same muscle + movement sub-family —
 * the canonical case being a chest day with "Smith Machine Bench" AND "Flat Chest
 * Press Machine", which are BOTH flat chest presses. The base movementKey dedup only
 * collapses same-TOKEN dups, but the base token list has NO "bench" entry, so a
 * "bench" name fell to a per-NAME unique key and slipped past the dedup. Worse, the
 * focus-policy resolver (minChestPressSlots) then keyed that bench as a non-press →
 * thought the day had no chest press → INJECTED a second flat press.
 *
 * THE FIX (LEAN — SWAP, never ADD): when ON, movementKey resolves a "bench" as a
 * chest PRESS with the SAME incline/decline angle split, and the SAME deep-family
 * keyer is handed to the resolver. So two FLAT presses collapse onto ONE press slot,
 * and the freed slot fills with the in-pool COMPLEMENTARY incline (a DISTINCT sub-
 * family that is KEPT). Same exercise count, no orphaned muscle.
 *
 * Part A drives the REAL compose path (where the resolver-injection half of the bug
 * lived) on the eval grid's canonical p1 UPPER day. Part B is a pure-buildSession
 * invariant: a chest cluster never lands two same-sub-family chest presses, the count
 * is unchanged vs OFF (swap not add), and the muscle is never orphaned.
 */

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../../../tests/engine/full-path-sim/fp-config.js';
import { buildSession, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const MS_DAY = 86400000;
const N0 = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon
const ACTIVE_4D = [0, 2, 4, 6]; // Lu, Mi, V, Du — the eval grid's 4d week
const SCHEDULE_STORE_KEY = 'wv2-schedule-store';
const SCHEDULE_4D = ['training', 'rest', 'training', 'rest', 'training', 'rest', 'training'];

// The live-default ON set the eval grid composes under, EXCEPT dp_selection_dedup_v1
// which we toggle per arm. Forced explicitly so the result is independent of any
// future default change.
const BASE_ON = Object.freeze([
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_rep_class_v1',
  'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  'dp_focus_contracts_v1', 'dp_week_ledger_v1', 'dp_triceps_fullbody_guarantee_v1',
]);

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false; // baseline everything OFF
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// Count, per session, how many exercises share the same DEEP-family movementKey —
// the real "two near-identical movements" signal. Returns {dupOccurrences, perDay}.
function deepFamilyDupsAcrossWeek(plans) {
  let dupOccurrences = 0;
  const perDay = [];
  for (const plan of plans) {
    const seen = {};
    for (const e of plan.exercises || []) {
      const meta = getExerciseMetadata(e.engineName || e.name) || {};
      const k = movementKey(e.engineName || e.name, meta, true);
      seen[k] = (seen[k] || 0) + 1;
    }
    let dayDup = 0;
    for (const k in seen) if (seen[k] >= 2) { dupOccurrences += 1; dayDup += 1; }
    perDay.push({ size: (plan.exercises || []).length, dayDup });
  }
  return { dupOccurrences, perDay };
}

async function composeP1UpperWeek(dedupOn) {
  resetWorld();
  setPathAFlags(false);
  const flags = [...BASE_ON];
  if (dedupOn) flags.push('dp_selection_dedup_v1');
  setFlags(flags);
  localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days: SCHEDULE_4D } }));
  // p1 Andrei-novice, balanced, freq 4 — the eval grid's p1_balanced_4d (its Lu UPPER
  // day composed Smith Machine Bench + Flat Chest Press Machine = two flat presses).
  world.useOnboardingStore.setState({
    data: {
      age: 19, sex: 'm', goal: 'masa', experience: 'incepator', weight: 64, height: 180,
      frequency: '4', focusPreset: 'balanced', focusPresetPickedAt: null,
    },
    completed: true,
    completedAt: N0,
  });
  const plans = [];
  for (const off of ACTIVE_4D) {
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(new Date(N0 + off * MS_DAY)); } catch { plan = null; }
    if (plan && !plan.error && Array.isArray(plan.exercises)) plans.push(plan);
  }
  return plans;
}

describe('dp_selection_dedup_v1 — full path (p1 balanced 4d, the eval grid case)', () => {
  it('OFF → the week has at least one same-sub-family duplicate (the eval defect)', async () => {
    const plans = await composeP1UpperWeek(false);
    expect(plans.length).toBeGreaterThan(0);
    const { dupOccurrences } = deepFamilyDupsAcrossWeek(plans);
    expect(dupOccurrences).toBeGreaterThanOrEqual(1);
  });

  it('ON → NO session has two exercises of the same muscle + movement sub-family', async () => {
    const plans = await composeP1UpperWeek(true);
    expect(plans.length).toBeGreaterThan(0);
    const { dupOccurrences } = deepFamilyDupsAcrossWeek(plans);
    expect(dupOccurrences).toBe(0);
  });

  it('LEAN — ON never increases any session exercise count vs OFF (SWAP, not ADD)', async () => {
    const off = await composeP1UpperWeek(false);
    const on = await composeP1UpperWeek(true);
    const offSizes = off.map((p) => (p.exercises || []).length);
    const onSizes = on.map((p) => (p.exercises || []).length);
    expect(onSizes.length).toBe(offSizes.length);
    for (let i = 0; i < onSizes.length; i++) {
      expect(onSizes[i]).toBeLessThanOrEqual(offSizes[i]);
    }
  });

  it('SWAP target — the redundant flat press becomes a complementary incline (same chest count)', async () => {
    const off = await composeP1UpperWeek(false);
    const on = await composeP1UpperWeek(true);
    const chestNames = (plan) => (plan.exercises || [])
      .filter((e) => getExerciseMetadata(e.engineName || e.name)?.muscle_target_primary === 'piept')
      .map((e) => e.engineName || e.name);
    const offUpper = off.find((p) => chestNames(p).length >= 2);
    expect(offUpper).toBeTruthy();
    const offChest = chestNames(offUpper);
    // OFF: two flat presses on the same chest day (deep-key piept::press x2).
    const offPressFlats = offChest.filter(
      (n) => movementKey(n, getExerciseMetadata(n), true) === 'piept::press',
    );
    expect(offPressFlats.length).toBeGreaterThanOrEqual(2);
    // ON: the matching day keeps the SAME chest count but only ONE flat press, and
    // gains a distinct sub-family (the complementary incline).
    const onUpper = on.find((p) => chestNames(p).length === offChest.length);
    expect(onUpper).toBeTruthy();
    const onChest = chestNames(onUpper);
    expect(onChest.length).toBe(offChest.length); // same count — a SWAP
    const onPressFlats = onChest.filter(
      (n) => movementKey(n, getExerciseMetadata(n), true) === 'piept::press',
    );
    expect(onPressFlats.length).toBe(1); // the redundant flat is gone
    const onKeys = new Set(onChest.map((n) => movementKey(n, getExerciseMetadata(n), true)));
    expect(onKeys.size).toBe(onChest.length); // every chest movement is a distinct sub-family
  });
});

// ── Part B — pure buildSession invariant on a chest-heavy cluster. ──────────────
const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const VOLUME = {
  chest: 16, back: 12, shoulders: 10, biceps: 8, triceps: 8,
  quads: 10, hamstrings: 8, glutes: 6, calves: 6, abs: 4, forearms: 2,
};
const SESSIONS_PER_GROUP = {
  piept: 1, spate: 1, umeri: 1, biceps: 1, triceps: 1,
  'picioare-quads': 1, 'picioare-hamstrings': 1, fese: 1, gambe: 1, core: 1, antebrate: 1,
};
const ctx = (over = {}) => ({
  equipment: { available: allEquip },
  weakGroups: [],
  profileTier: 'T2',
  prNames: [],
  seed: 'user-1|2026-06-15|0',
  volumeTargets: VOLUME,
  weeklySessionsPerGroup: SESSIONS_PER_GROUP,
  ...over,
});

function chestSubFamilyDups(session, deep) {
  const seen = {};
  for (const e of session.exercises) {
    const meta = getExerciseMetadata(e.name) || {};
    if (meta.muscle_target_primary !== 'piept') continue;
    const k = movementKey(e.name, meta, deep);
    seen[k] = (seen[k] || 0) + 1;
  }
  let dup = 0;
  for (const k in seen) if (seen[k] >= 2) dup += 1;
  return dup;
}

describe('dp_selection_dedup_v1 — pure buildSession invariant (push cluster)', () => {
  it('deterministic', () => {
    const a = buildSession('push', ctx({ selectionDedup: true }));
    const b = buildSession('push', ctx({ selectionDedup: true }));
    expect(a.exercises.map((e) => e.name)).toEqual(b.exercises.map((e) => e.name));
  });

  it('ON → no two chest exercises share a deep movement sub-family', () => {
    const s = buildSession('push', ctx({ selectionDedup: true }));
    expect(chestSubFamilyDups(s, true)).toBe(0);
  });

  it('LEAN — ON never adds exercises vs OFF (same total count, a SWAP)', () => {
    const off = buildSession('push', ctx({ selectionDedup: false }));
    const on = buildSession('push', ctx({ selectionDedup: true }));
    expect(on.exercises.length).toBe(off.exercises.length);
  });

  it('never orphans the chest muscle (always at least one chest movement)', () => {
    const on = buildSession('push', ctx({ selectionDedup: true }));
    const chest = on.exercises.filter(
      (e) => getExerciseMetadata(e.name)?.muscle_target_primary === 'piept',
    );
    expect(chest.length).toBeGreaterThanOrEqual(1);
  });
});

describe('movementKey — bench sub-family (deepFamily flag)', () => {
  it('OFF → a bench with no base token falls to a per-name key (byte-identical legacy)', () => {
    const m = { muscle_target_primary: 'piept' };
    expect(movementKey('Smith Machine Bench', m)).toBe('piept::name:smith machine bench');
    expect(movementKey('Smith Incline Bench', m)).toBe('piept::name:smith incline bench');
  });

  it('ON → a flat bench keys as the chest press family; incline/decline stay distinct', () => {
    const m = { muscle_target_primary: 'piept' };
    expect(movementKey('Smith Machine Bench', m, true)).toBe('piept::press');
    expect(movementKey('Flat Chest Press Machine', m, true)).toBe('piept::press'); // collides with the flat bench
    expect(movementKey('Smith Incline Bench', m, true)).toBe('piept::incline-press'); // complementary, distinct
    expect(movementKey('Decline Bench', m, true)).toBe('piept::decline-press');
  });

  it('ON → a base-token name is unaffected by the bench pass (an "incline curl" is still a curl)', () => {
    const biceps = { muscle_target_primary: 'biceps' };
    expect(movementKey('Incline DB Curl', biceps, true)).toBe(movementKey('Incline DB Curl', biceps));
  });
});
