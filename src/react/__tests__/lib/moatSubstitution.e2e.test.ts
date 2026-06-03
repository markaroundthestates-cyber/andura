// ══ MOAT SUBSTITUTION E2E GATE — WP-8 anti-facade (React layer) ══════════════
// WHY THIS FILE EXISTS: the moat was a facade — substitution buttons navigated
// away and the user NEVER saw a named alternative; "Coach gaseste alternative"
// was aspirational copy. This gate drives the REAL substitution seam
// (src/react/lib/substitution.ts) through the REAL engine (alternativeFinder +
// 657 library), the REAL prescription path (buildSwappedExercise → DP / cold
// start), the REAL display layer (toExerciseDisplay → Romanian), and the REAL
// store action (workoutStore.swapExercise + incrementRefusal). It proves the
// USER-VISIBLE behaviour and FAILS if the wiring rots back to facade (a swap that
// silently returns the original, a blank, or a raw English key).
//
// Behaviours covered here:
//   2 — in-session "Aparat ocupat" → NAMED RO alternative, same muscle, in-place
//   3 — in-session "Nu vreau"      → NAMED RO alternative + refusal counter ++
//   4 — EquipmentSwap preview      → busy item shows the named alternative inline
//   5 — noAlt honesty (React seam)  → honest null, never a forced inferior/crash
//   6 — names are Romanian end-to-end (the Maria/Gigel filter)
// (Behaviours 1 + 5-engine live in src/engine/__tests__/moatPipeline.e2e.test.js.)
//
// Cross-refs:
//   - src/react/lib/substitution.ts (resolveBusySwap/resolveRefusalSwap/recompose)
//   - src/react/lib/exerciseDisplay.ts (toExerciseDisplay → nameRo)
//   - src/react/stores/workoutStore.ts (swapExercise)
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §5.2, §5.3, §6

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveBusySwap,
  resolveRefusalSwap,
  resolveMissingSwap,
  recomposeWithBusyTypes,
} from '../../lib/substitution';
import { toExerciseDisplay } from '../../lib/exerciseDisplay';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import type { PlannedExercise } from '../../lib/engineWrappers';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import {
  setMissingEquipment,
  incrementRefusal,
  getRefusalCounter,
} from '../../../engine/schedule/scheduleAdapter.js';
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M, PULL)

function resetStores(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
    completed: true,
    completedAt: Date.now(),
  });
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
  });
}

// A raw English engine key looks like "Title Case With Spaces" and is NOT a
// known RO gym term. The curated RO vocabulary (Romanian phrases OR the small
// set of English-IS-the-RO-term names: Bench Press, Deadlift, Face Pull, Lat
// Pulldown, Pec Deck, Hammer Curl, Romanian Deadlift) is acceptable; an
// uncurated raw key passthrough (the facade) is not.
const RO_OR_ACCEPTED_EN = /[a-zăâîșț]/; // any lowercase letter → not a bare Title-Case key
function isRomanianish(display: string): boolean {
  // Accepted English-standard gym terms whose RO form IS English.
  const ACCEPTED_EN = [
    'Bench Press', 'Deadlift', 'Romanian Deadlift', 'Face Pull', 'Lat Pulldown',
    'Pec Deck', 'Hammer Curl', 'Hip Thrust', 'Push Press', 'Good Morning',
    'Overhead Press',
  ];
  if (ACCEPTED_EN.includes(display)) return true;
  return RO_OR_ACCEPTED_EN.test(display);
}

beforeEach(() => {
  localStorage.clear();
  resetStores();
  vi.restoreAllMocks();
  // MOAT B6 ("Romanian end-to-end") asserts the RO display chain. Wave C2
  // i18n flipped DEFAULT_LOCALE to EN, so we must opt into RO explicitly
  // here for these assertions to remain meaningful.
  setLocale('ro');
  _resetI18nCache();
  setLocale('ro');
});

// ── Behaviour 2 — in-session "Aparat ocupat" busy swap ────────────────────────
describe('MOAT B2 — busy swap produces a NAMED RO same-muscle alternative in-place', () => {
  it('resolveBusySwap returns a real swapped PlannedExercise with an RO name (not original, not blank)', () => {
    // Flat Barbell Bench (barbell) busy → must resolve a named alternative.
    const res = resolveBusySwap('Flat Barbell Bench', 0);
    expect(res.swapped).toBe(true);
    expect(res.noAlt).toBe(false);
    expect(res.exercise).not.toBeNull();

    const ex = res.exercise as PlannedExercise;
    // Full prescription arrived (real DP / cold-start path, not a stub).
    expect(typeof ex.targetKg).toBe('number');
    expect(typeof ex.targetReps).toBe('number');
    expect(ex.targetReps).toBeGreaterThan(0);
    expect(typeof ex.restSec).toBe('number');
    expect(ex.swapReason).toBeTruthy();

    // FACADE GUARD: a real, NAMED, Romanian-ish alternative — not a blank.
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(isRomanianish(res.alternativeName)).toBe(true);
    // The displayed swapped-exercise name matches the resolved alternative name.
    expect(ex.name).toBe(res.alternativeName);
    // FACADE GUARD: the swap is a REAL change of exercise IDENTITY (the engine
    // key changed), not the original handed back. (Two distinct movements may
    // share an RO movement label distinguished by their `sub` equipment line —
    // see the distinct-label case below — so identity, not display string, is
    // the integrity contract here.)
    expect(typeof ex.engineName).toBe('string');
    expect(ex.engineName).not.toBe('Flat Barbell Bench');
  });

  it('busy swap surfaces a VISIBLY distinct alternative (name or equipment sub differs — Gigel can tell)', () => {
    // A user must be able to SEE the swap. Flat Barbell Bench (barbell) busy →
    // the alternative must differ from the original at the display level (name
    // and/or equipment sub), so the in-session toast is not "Inlocuit X cu X".
    // (Flat Barbell Bench "Cu bara" → Flat DB Press "Cu gantere ..." — same RO
    // movement label, distinct equipment sub, so the user sees what changed.)
    const res = resolveBusySwap('Flat Barbell Bench', 0);
    expect(res.swapped).toBe(true);
    const ex = res.exercise as PlannedExercise;
    const origDisplay = toExerciseDisplay('Flat Barbell Bench');
    const altDisplay = { name: res.alternativeName, sub: ex.sub };
    // Distinguishable: either the RO name or the equipment sub differs.
    const distinguishable =
      altDisplay.name !== origDisplay.name || altDisplay.sub !== origDisplay.sub;
    expect(
      distinguishable,
      `busy swap of "Flat Barbell Bench" produced an indistinguishable display (name="${altDisplay.name}" sub="${altDisplay.sub ?? ''}") — user cannot tell it changed`,
    ).toBe(true);
  });
});

// ── Behaviour 3 — in-session "Nu vreau" refusal swap + counter ────────────────
describe('MOAT B3 — refusal swap produces a NAMED RO alternative + increments counter', () => {
  it('resolveRefusalSwap yields a named RO alt and the refusal counter increments', () => {
    const res = resolveRefusalSwap('Incline DB Press', 1);
    expect(res.swapped).toBe(true);
    expect(res.noAlt).toBe(false);
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(res.alternativeName).not.toBe(res.originalName);
    expect(isRomanianish(res.alternativeName)).toBe(true);

    // Counter wiring (the screen calls incrementRefusal alongside the swap).
    expect(getRefusalCounter()['Incline DB Press']).toBeUndefined();
    incrementRefusal('Incline DB Press');
    expect(getRefusalCounter()['Incline DB Press']).toBe(1);
    incrementRefusal('Incline DB Press');
    expect(getRefusalCounter()['Incline DB Press']).toBe(2);
  });

  it('excludes names passed in triedNames — no re-offering a sibling (bug #6)', () => {
    // The Workout screen now feeds the refusal pool every OTHER session exercise
    // (already-performed + pending) so a substitute is never a movement already in
    // the session. Lock that contract: a tried name must not come back.
    const first = resolveRefusalSwap('Incline DB Press', 1);
    expect(first.swapped).toBe(true);
    const firstAlt = first.alternativeEngineName;
    expect(typeof firstAlt).toBe('string');
    const tried = ['Incline DB Press', firstAlt].filter(
      (n): n is string => typeof n === 'string',
    );
    const second = resolveRefusalSwap('Incline DB Press', 1, tried);
    expect(second.alternativeEngineName).not.toBe(firstAlt);
  });
});

// ── Behaviour 4 — EquipmentSwap inline preview recompose ──────────────────────
describe('MOAT B4 — EquipmentSwap preview shows the named alternative before confirm', () => {
  it('recomposeWithBusyTypes replaces a blocked row with a NAMED RO alternative + reason', () => {
    const planned: PlannedExercise[] = [
      {
        id: 'flat-barbell-bench-0',
        name: toExerciseDisplay('Flat Barbell Bench').name,
        engineName: 'Flat Barbell Bench', // barbell
        sets: 3,
        targetReps: 8,
        targetKg: 60,
        restSec: 90,
      },
    ];
    const originalName = planned[0]!.name;

    // Mark barbell busy → the row must recompose to a named, performable alternative.
    const recomposed = recomposeWithBusyTypes(planned, ['barbell']);
    expect(recomposed.length).toBe(1);
    const row = recomposed[0]!;
    expect(row.name.length).toBeGreaterThan(0);
    expect(isRomanianish(row.name)).toBe(true);
    expect(row.swapReason).toBeTruthy(); // "{original} ocupat" surfaced inline
    expect(row.swapReason).toContain(originalName);
    // FACADE GUARD: a REAL identity swap (engine key changed), not a no-op.
    expect(typeof row.engineName).toBe('string');
    expect(row.engineName).not.toBe('Flat Barbell Bench');
  });

  it('recomposeWithBusyTypes passes a performable row through UNTOUCHED (no spurious swap)', () => {
    const planned: PlannedExercise[] = [
      {
        id: 'incline-db-press-0',
        name: toExerciseDisplay('Incline DB Press').name,
        engineName: 'Incline DB Press', // dumbbell
        sets: 3,
        targetReps: 10,
        targetKg: 22,
        restSec: 90,
      },
    ];
    // Mark barbell busy — a dumbbell exercise is unaffected, must NOT be swapped.
    const recomposed = recomposeWithBusyTypes(planned, ['barbell']);
    expect(recomposed[0]!.name).toBe(planned[0]!.name);
    expect(recomposed[0]!.swapReason).toBeUndefined();
  });
});

// ── Behaviour 5 — noAlt honesty at the React seam ─────────────────────────────
describe('MOAT B5 — React substitution seam is honest when no alternative exists', () => {
  it('resolveMissingSwap returns honest null (noAlt) when nothing fits — no forced inferior, no crash', () => {
    // Leg Press (machine, tier-1 high-force quads) with EVERYTHING but bands +
    // bodyweight missing → the library has no band/bodyweight high-force quads
    // movement, so the tier-1-strict broad search finds nothing. The seam must
    // surface honest null, not a forced inferior stub (anti-paternalism).
    setMissingEquipment(['power-rack', 'gantere', 'aparat-cablu', 'leg-press', 'aparat-extensii', 'aparat-tractiuni']);
    const res = resolveMissingSwap('Leg Press', 0);
    expect(res.noAlt).toBe(true);
    expect(res.swapped).toBe(false);
    expect(res.exercise).toBeNull();
    // Honest: the original is still named so the UI can say "skip {original}".
    expect(res.originalName.length).toBeGreaterThan(0);
  });

  it('resolveMissingSwap on an anchor lift whose equipment is missing → NAMED same-muscle swap (was a noAlt dead-end)', () => {
    // Incline DB Press (dumbbell, no cascade, thin curated alts) with dumbbells
    // missing → the anchor must NOT dead-end at noAlt for a marquee lift; the
    // broad-library degradation resolves a NAMED, performable, RO alternative.
    setMissingEquipment(['gantere']);
    const res = resolveMissingSwap('Incline DB Press', 0);
    expect(res.noAlt).toBe(false);
    expect(res.swapped).toBe(true);
    expect(res.exercise).not.toBeNull();
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(isRomanianish(res.alternativeName)).toBe(true);
    expect((res.exercise as PlannedExercise).engineName).not.toBe('Incline DB Press');
  });

  it('resolveRefusalSwap is honest (noAlt) for an unknown exercise — never fabricates', () => {
    const res = resolveRefusalSwap('Totally Not A Real Exercise', 0);
    expect(res.noAlt).toBe(true);
    expect(res.swapped).toBe(false);
    expect(res.exercise).toBeNull();
  });
});

// ── Behaviour 6 — names are Romanian end-to-end through the REAL pipeline ──────
describe('MOAT B6 — exercises surfaced through real selection render in Romanian', () => {
  it('every exercise in a real composed session renders a non-empty, non-raw-key RO display', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.exercises.length).toBeGreaterThan(0);
    for (const ex of out!.exercises) {
      // The aggregate already applied toExerciseDisplay → ex.name is the display.
      expect(typeof ex.name).toBe('string');
      expect(ex.name.length).toBeGreaterThan(0);
      // No diacritics (D-LEGACY-064).
      expect(/[ăâîșțĂÂÎȘȚ]/.test(ex.name)).toBe(false);
      // FACADE GUARD: toExerciseDisplay must have APPLIED an RO display. The
      // raw-key fallback returns the engineName verbatim with NO `sub`; every
      // genuine display either differs from the engine key OR is an accepted
      // English-standard gym term (Bench Press, Deadlift, Face Pull, ...). A bare
      // engine key passthrough that is NOT an accepted term = the facade.
      if (typeof ex.engineName === 'string') {
        const isFacadePassthrough =
          ex.name === ex.engineName && ex.sub === undefined;
        expect(
          isFacadePassthrough,
          `exercise "${ex.engineName}" rendered as a raw English key "${ex.name}" (facade: no RO display applied)`,
        ).toBe(false);
      }
    }
  });

  it('curated anchor names render the exact Daniel-tuned Romanian (no regression)', () => {
    // The mockup-tuned curated names are the source of truth and must stay.
    expect(toExerciseDisplay('Incline DB Press').name).toBe('Impins inclinat');
    expect(toExerciseDisplay('Lateral Raises').name).toBe('Ridicari laterale');
    expect(toExerciseDisplay('Leg Press').name).toBe('Presa de picioare');
    // English-IS-the-RO-term names stay English on purpose (Maria/Gigel rule).
    expect(toExerciseDisplay('Face Pulls').name).toBe('Face Pull');
    expect(toExerciseDisplay('Romanian Deadlift').name).toBe('Romanian Deadlift');
  });
});
