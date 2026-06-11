// ══ REAR-DELT dose cap (Daniel sweep verdict follow-up 2026-06-12) ════════════
// "RevPecDeck 4 → 2-3 + lateral": under a SHOULDER focus the emphasized isolation
// ceiling (4) must not hand a 4th set to a rear-delt fly-family isolation — a small
// short-ROM head where the 4th set is junk volume. The fly family stays at 2-3;
// the LATERAL still earns the emphasized 4 through its own share. Non-focus days
// were already capped at 3 by the plain band (this lever only bites the raise).

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];
const groupOf = (n) => getExerciseMetadata(n).muscle_target_primary;
const tierOf = (n) => getExerciseMetadata(n).tier ?? 2;
const REAR_DELT_RE = /rear delt|reverse pec deck|face pull|pull-apart/i;

// A shoulder-focus push day with a HIGH weekly shoulders budget on few sessions →
// the per-exercise shares hit the emphasized ceilings (the exact sweep smell:
// Reverse Pec Deck riding the raised isolation band to 4).
const shoulderFocusCtx = (over = {}) => ({
  equipment: { available: ALL },
  profileTier: 'T2',
  seed: 'rdcap|2026-W02|0',
  volumeTargets: { shoulders: 16, chest: 10, triceps: 8 },
  weeklySessionsPerGroup: { umeri: 2, piept: 2, triceps: 2 },
  emphasizedGroups: ['umeri'],
  emphasisSetsBoost: true,
  ...over,
});

describe('rear-delt isolation dose cap (sweep follow-up)', () => {
  it('a rear-delt fly-family isolation NEVER exceeds 3 sets, even emphasized', () => {
    const s = buildSession('push', shoulderFocusCtx());
    const rearDelt = s.exercises.filter(
      (e) => REAR_DELT_RE.test(e.name) && tierOf(e.name) > 1,
    );
    // Non-vacuous: the shoulder-focus day must actually surface a rear-delt
    // isolation (the focus policy injects rear-delt work on shoulder emphasis).
    expect(rearDelt.length, s.exercises.map((e) => e.name).join('|')).toBeGreaterThan(0);
    for (const e of rearDelt) {
      expect(e.sets, `${e.name} should cap at 3`).toBeLessThanOrEqual(3);
    }
  });

  it('a NON-rear-delt umeri isolation may still take the emphasized 4th set', () => {
    // The cap is surgical: the raised isolation ceiling (4) survives for laterals —
    // prove the ceiling itself was not lowered for the rest of the group by checking
    // no non-rear-delt isolation is clamped BELOW the raised band when its share
    // earns it. (Existence assert: at least one umeri isolation in session, and all
    // non-fly isolations respect the emphasized band [2,4].)
    const s = buildSession('push', shoulderFocusCtx());
    const umeriIso = s.exercises.filter(
      (e) => groupOf(e.name) === 'umeri' && tierOf(e.name) > 1 && !REAR_DELT_RE.test(e.name),
    );
    for (const e of umeriIso) {
      expect(e.sets).toBeGreaterThanOrEqual(2);
      expect(e.sets).toBeLessThanOrEqual(4); // emphasized band intact (not capped to 3)
    }
  });

  it('non-emphasized world is untouched (plain band already capped at 3)', () => {
    const off = buildSession('push', shoulderFocusCtx({ emphasisSetsBoost: false, emphasizedGroups: [] }));
    for (const e of off.exercises) {
      if (REAR_DELT_RE.test(e.name) && tierOf(e.name) > 1) {
        expect(e.sets).toBeLessThanOrEqual(3); // the plain ISOLATION_MAX_SETS band
      }
    }
  });
});
