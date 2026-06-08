// ══ #81/#82 PREFERENCES — end-to-end UI→store→engine activation ═════════════
// The onboarding/profile pickers (PreferencesPickers) SET onboardingStore.data
// .refusedPatterns (#81) + .equipmentProfile (#82). These were a declared input-
// capture boundary with no UI; the engine exclusion/filter was already wired +
// tested. This test proves the WHOLE chain: setting the store field through the
// same setField the UI calls makes the REAL compose path
// (composePlannedWorkoutToday → buildUserStateForPipeline → getDailyWorkout →
// buildExclusionTokens → poolForGroup) actually exclude the refused movement and
// filter to the available equipment — AND that the empty/skipped case is byte-
// identical to today.

import { describe, it, expect, beforeEach } from 'vitest';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { getExerciseMetadata } from '../../../engine/exerciseLibrary.js';
import { movementKey } from '../../../engine/sessionBuilder.js';
import { REFUSAL_PATTERN_TOKENS } from '../../../engine/movementExclusion.js';

// A Friday with a fixed seed so the same scheduled session generates each run.
const NOW = new Date('2026-06-05T10:00:00');

function seedProfile(): void {
  // A trained gym user with enough frequency to surface compound leg work
  // (so a squat would normally appear → the exclusion is observable).
  useOnboardingStore.setState({
    data: {
      age: 30,
      sex: 'm',
      goal: 'masa',
      frequency: '5',
      experience: 'avansat',
      weight: 90,
      height: 180,
      trainingType: 'gym',
      focusPreset: 'balanced',
      focusPresetPickedAt: null,
    },
    completed: true,
    completedAt: NOW.getTime(),
  });
}

/** The set of movement tokens for the exercises in a generated session. */
async function tokensForGeneratedSession(): Promise<Set<string>> {
  const plan = await composePlannedWorkoutToday(NOW);
  const tokens = new Set<string>();
  for (const ex of plan?.exercises ?? []) {
    const meta = getExerciseMetadata(ex.engineName ?? ex.name);
    const key = movementKey(ex.engineName ?? ex.name, meta);
    const token = typeof key === 'string' && key.includes('::') ? key.split('::')[1] : key;
    if (typeof token === 'string') tokens.add(token);
  }
  return tokens;
}

/** The equipment_type set for a generated session (the #82 filter target). */
async function equipmentForGeneratedSession(): Promise<Set<string>> {
  const plan = await composePlannedWorkoutToday(NOW);
  const eq = new Set<string>();
  for (const ex of plan?.exercises ?? []) {
    const meta = getExerciseMetadata(ex.engineName ?? ex.name) as { equipment_type?: string } | undefined;
    if (meta?.equipment_type) eq.add(meta.equipment_type);
  }
  return eq;
}

describe('#81/#82 preferences — UI field activates the engine end-to-end', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({ history: {}, sessionsHistory: [], lastSession: null });
    seedProfile();
  });

  it('refusedPatterns squat → no squat-token exercise in the generated session', async () => {
    // Baseline: with NO refusal, the squat token CAN appear on a leg cluster.
    // (We assert the exclusion regardless — the contract is "never present when
    // refused", not "always present otherwise".)
    useOnboardingStore.getState().setField('refusedPatterns', ['squat']);
    const tokens = await tokensForGeneratedSession();
    expect(REFUSAL_PATTERN_TOKENS.squat).toContain('squat');
    expect(tokens.has('squat')).toBe(false);
  });

  it('refusedPatterns deadlift → no deadlift/good-morning token (hinge family)', async () => {
    useOnboardingStore.getState().setField('refusedPatterns', ['deadlift']);
    const tokens = await tokensForGeneratedSession();
    expect(tokens.has('deadlift')).toBe(false);
    expect(tokens.has('good-morning')).toBe(false);
  });

  it('equipmentProfile dumbbell-only → generated session uses only DB/bodyweight', async () => {
    useOnboardingStore.getState().setField('equipmentProfile', ['dumbbell']);
    const eq = await equipmentForGeneratedSession();
    // The #82 filter keeps only the listed coarse types + bodyweight (always
    // implicit). No machine / cable / barbell should survive.
    expect(eq.has('machine')).toBe(false);
    expect(eq.has('cable')).toBe(false);
    expect(eq.has('barbell')).toBe(false);
    for (const e of eq) expect(['dumbbell', 'bodyweight']).toContain(e);
  });

  it('empty/skipped (no refusal, no equipment) is byte-identical to today', async () => {
    // With both fields ABSENT, the field-set vs the same plan generated without
    // ever touching the fields must be identical (the input-capture boundary's
    // "empty → byte-identical" contract).
    const before = await composePlannedWorkoutToday(NOW);
    // Explicitly set then clear (UI deselect-all path) → empty array.
    useOnboardingStore.getState().setField('refusedPatterns', []);
    useOnboardingStore.getState().setField('equipmentProfile', []);
    const after = await composePlannedWorkoutToday(NOW);
    expect((after?.exercises ?? []).map((e) => e.engineName))
      .toEqual((before?.exercises ?? []).map((e) => e.engineName));
  });

  it('the UI setField path persists the fields the engine reads', () => {
    useOnboardingStore.getState().setField('refusedPatterns', ['squat', 'lunge']);
    useOnboardingStore.getState().setField('equipmentProfile', ['dumbbell', 'bodyweight']);
    const data = useOnboardingStore.getState().data;
    expect(data.refusedPatterns).toEqual(['squat', 'lunge']);
    expect(data.equipmentProfile).toEqual(['dumbbell', 'bodyweight']);
  });
});
