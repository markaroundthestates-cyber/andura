// ══ POST-RPE — Phase 3 task_09 §A Rewrite Stub → Real ════════════════════
// Post-session RPE rating (la finalul ultimului exercitiu, before summary).
// 3-button RO: Usoara / Normala / Grea (workoutStore.lastRating taxonomy —
// distinct de per-set rating 'usor/potrivit/greu' which lives în
// ExerciseHistoryEntry).
//
// Submit pipeline:
//   1. workoutStore.setLastRating(rating)
//   2. Compute session summary (sets / volume / duration min)
//   3. workoutStore.finishSession(summary) clears history + sets lastSession
//   4. workoutStore.incrementStreak() (NU în PostSummary, avoid double-inc)
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
import { getTodayWorkout } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';

export type SessionRating = 'usoara' | 'normala' | 'grea';

interface RatingOption {
  rating: SessionRating;
  label: string;
  description: string;
}

const RATING_OPTIONS: readonly RatingOption[] = [
  { rating: 'usoara', label: 'Usoara', description: 'Aveam mai mult in rezerva' },
  { rating: 'normala', label: 'Normala', description: 'Solid, echilibrat' },
  { rating: 'grea', label: 'Grea', description: 'M-am dus la limita' },
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

  function handleSubmit(rating: SessionRating): void {
    setLastRating(rating);

    const entries = Object.values(history).flat();
    const setsDone = entries.length;
    const volume = entries.reduce((acc, h) => acc + h.kg * h.reps, 0);
    const dur =
      sessionStart !== null
        ? Math.max(1, Math.floor((Date.now() - sessionStart) / 60000))
        : 0;

    // Phase 4 task_10: derive title din planned workout aggregate; fallback
    // hardcoded cand engineWrappers returns null.
    const planned = getTodayWorkout();
    const title = planned?.workoutTitle ?? 'Push (piept si umeri)';
    const meta = `${setsDone} seturi · ${dur} min · ${formatKg(volume)} kg`;

    finishSession({ title, meta, ts: Date.now() });
    incrementStreak();

    navigate(gotoPath('post-summary'));
  }

  return (
    <section className="p-6 bg-paper" data-testid="post-rpe">
      <h1 className="text-2xl font-semibold text-ink mb-2">Cum a fost sesiunea?</h1>
      <p className="text-base text-ink2 mb-6">
        Coach calibreaza pentru data viitoare.
      </p>
      <div className="flex flex-col gap-3" role="list">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => handleSubmit(opt.rating)}
            data-rating={opt.rating}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-[var(--line-strong)] bg-paper2 hover:bg-paper transition text-left"
          >
            <span className="text-base font-medium text-ink">{opt.label}</span>
            <span className="text-sm text-ink2">{opt.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
