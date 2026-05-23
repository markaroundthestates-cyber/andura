// POST-RPE - Phase 3 task_09 §A Rewrite Stub -> Real
// Post-session RPE rating (la finalul ultimului exercitiu, before summary).
// 3-button RO: Usoara / Normala / Grea (workoutStore.lastRating taxonomy -
// distinct de per-set rating 'usor/potrivit/greu' which lives in
// ExerciseHistoryEntry).
//
// Mockup parity (andura-clasic.html L1593-1626 traffic-light per rating):
// usor -> green (U+1F7E2), potrivit -> yellow (U+1F7E1), greu -> red
// (U+1F534). Mockup 'usor/potrivit/greu' labels; React component uses
// 'usoara/normala/grea' SessionRating taxonomy - semantic 1:1 map. Emoji
// is aria-hidden decorative - preserves accessible name for tests.
//
// Submit pipeline:
//   1. workoutStore.setLastRating(rating)
//   2. Compute session summary (sets / volume / duration min)
//   3. workoutStore.finishSession(summary) clears history + sets lastSession
//   4. workoutStore.incrementStreak() (NU in PostSummary, avoid double-inc)
//   5. navigate('/app/antrenor/post-summary')
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-027 Energy Adjustment (calibrare per rating)
//   - DECISIONS.md §D-LEGACY-029 Specialization Engine (rating feeds learning)
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (rating descriptor copy)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html submitPostRpeV2()

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { SessionExerciseBreakdown } from '../../../stores/workoutStore';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';

export type SessionRating = 'usoara' | 'normala' | 'grea';

interface RatingOption {
  rating: SessionRating;
  emoji: string;
  label: string;
  description: string;
}

const GREEN = '\u{1F7E2}';
const YELLOW = '\u{1F7E1}';
const RED = '\u{1F534}';

const RATING_OPTIONS: readonly RatingOption[] = [
  { rating: 'usoara', emoji: GREEN, label: 'Usoara', description: 'Aveam mai mult in rezerva' },
  { rating: 'normala', emoji: YELLOW, label: 'Normala', description: 'Solid, echilibrat' },
  { rating: 'grea', emoji: RED, label: 'Grea', description: 'M-am dus la limita' },
];

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/,/g, ' ').replace(/\./g, ' ');
}

export function PostRpe(): JSX.Element {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const setLastRating = useWorkoutStore((s) => s.setLastRating);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const incrementStreak = useWorkoutStore((s) => s.incrementStreak);

  async function handleSubmit(rating: SessionRating): Promise<void> {
    setLastRating(rating);

    const entries = Object.values(history).flat();
    const setsDone = entries.length;
    const volume = entries.reduce((acc, h) => acc + h.kg * h.reps, 0);
    const dur =
      sessionStart !== null
        ? Math.max(1, Math.floor((Date.now() - sessionStart) / 60000))
        : 0;

    const planned = await getTodayWorkout();
    const title = planned?.workoutTitle ?? 'Push (piept si umeri)';
    const meta = `${setsDone} seturi · ${dur} min · ${formatKg(volume)} kg`;

    const exercises: SessionExerciseBreakdown[] = Object.entries(history)
      .map(([exIdxStr, sets]) => {
        const exIdx = Number(exIdxStr);
        const planEx = planned?.exercises[exIdx];
        const exerciseId = planEx?.id ?? `ex-${exIdx}`;
        const exerciseName = planEx?.name ?? `Exercitiu ${exIdx + 1}`;
        let totalVolume = 0;
        let peakOneRM = 0;
        const breakdownSets = sets.map((s) => {
          totalVolume += s.kg * s.reps;
          const oneRM = s.kg * (1 + s.reps / 30);
          if (oneRM > peakOneRM) peakOneRM = oneRM;
          return {
            kg: s.kg,
            reps: s.reps,
            rating: s.rating,
            timestamp: s.timestamp ?? Date.now(),
          };
        });
        return {
          exerciseId,
          exerciseName,
          sets: breakdownSets,
          totalVolume,
          peakOneRM: Math.round(peakOneRM * 10) / 10,
        };
      })
      .filter((bd) => bd.sets.length > 0);

    finishSession({
      title,
      meta,
      ts: Date.now(),
      sets: setsDone,
      durationMin: dur,
      volumeKg: volume,
      exercises,
    });
    incrementStreak();

    navigate(gotoPath('post-summary'));
  }

  return (
    <section className="p-6 bg-paper" data-testid="post-rpe">
      <h1 className="text-2xl font-semibold text-ink mb-2">Cum a fost sesiunea?</h1>
      {/* §F-post-rpe-01 (HIGH chat5 Wave 15) — coach quote Lora italic mockup
          andura-clasic.html#L1596 verbatim. Product personality signal Andura
          Suflet (D-LEGACY-052) — engine-transparent framing ("calibreaza
          sesiunea de maine") substitueste subtitle plain anterior. */}
      <p
        className="coach-quote text-base text-ink2 italic font-serif mb-6 leading-relaxed"
        data-testid="post-rpe-intro"
      >
        „Raspunsul tau calibreaza sesiunea de maine. O singura intrebare."
      </p>
      <div className="flex flex-col gap-3" role="list">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => { void handleSubmit(opt.rating); }}
            data-rating={opt.rating}
            className="flex items-center gap-4 p-4 rounded-xl border border-lineStrong bg-paper2 hover:bg-paper transition text-left"
          >
            <span className="text-3xl" aria-hidden="true">{opt.emoji}</span>
            <span className="flex flex-col items-start gap-1">
              <span className="text-base font-medium text-ink">{opt.label}</span>
              <span className="text-sm text-ink2">{opt.description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
