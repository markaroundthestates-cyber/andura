// ══ POST-SUMMARY — Phase 3 task_09 §B Rewrite Stub → Real ════════════════
// Session closure summary screen — capstone Phase 3 Antrenor flow.
//
// 4 zone:
//   1. Header: lastSession.title + coach felicitare line (coachPick endSession
//      by rating cu taxonomy alias 'usoara/normala/grea' → 'usor/potrivit/greu')
//   2. F11 PR banner conditional (prHit flag — Phase 3 stub, Phase 4+ wires
//      engineWrappers.getPRDelta pe logSet în Workout.tsx)
//   3. F8 stats grid 4-cell (Seturi / Durata / Tonaj / Kcal estimate)
//   4. Streak counter F8 + Terminat CTA → reset store + navigate antrenor
//
// Phase 4 task_10: prefer numeric fields LastSessionSummary.sets /
// durationMin / volumeKg (populated explicit de PostRpe.finishSession).
// parseMeta retained as fallback pentru sesiuni persisted pre-migration
// (cand only display meta string present, NU numeric fields).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (coach felicitare)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html screen-post-summary summary-* cells

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { coachPick, type CoachVoiceEndSessionRating } from '../../../lib/coachVoice';
import { gotoPath } from '../../../lib/navigation';
import type { SessionRating } from './PostRpe';

// Taxonomy bridge: workoutStore.lastRating ('usoara/normala/grea') →
// COACH_VOICE.endSession keys ('usor/potrivit/greu'). Per spec task_04
// §6 next-actions footer + task_09 §2 B intent.
function mapRatingToCoachKey(rating: SessionRating): CoachVoiceEndSessionRating {
  if (rating === 'usoara') return 'usor';
  if (rating === 'grea') return 'greu';
  return 'potrivit';
}

interface ParsedMeta {
  sets: number;
  dur: number;
  volume: number;
}

function parseMeta(meta: string | undefined): ParsedMeta {
  if (!meta) return { sets: 0, dur: 0, volume: 0 };
  const setsMatch = meta.match(/(\d+) seturi/);
  const durMatch = meta.match(/(\d+) min/);
  const volMatch = meta.match(/([\d\s]+) kg$/);
  return {
    sets: setsMatch ? Number(setsMatch[1]) : 0,
    dur: durMatch ? Number(durMatch[1]) : 0,
    volume: volMatch ? Number(volMatch[1].replace(/\s/g, '')) : 0,
  };
}

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/,/g, ' ').replace(/\./g, ' ');
}

interface StatCellProps {
  label: string;
  value: string;
  testId: string;
}

function StatCell({ label, value, testId }: StatCellProps): JSX.Element {
  return (
    <div className="p-4 rounded-xl bg-paper2 border border-line" data-testid={testId}>
      <p className="text-sm text-ink2 mb-1">{label}</p>
      <p className="text-base font-semibold text-ink">{value}</p>
    </div>
  );
}

export function PostSummary(): JSX.Element {
  const navigate = useNavigate();
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const lastRating = useWorkoutStore((s) => s.lastRating);
  const streak = useWorkoutStore((s) => s.streak);
  const prHit = useWorkoutStore((s) => s.prHit);
  const prData = useWorkoutStore((s) => s.prData);
  const reset = useWorkoutStore((s) => s.reset);

  // Phase 4 task_10: prefer numeric fields cand present (avoid parseMeta
  // regex); fallback la parseMeta(meta) pentru sesiuni persisted pre-
  // migration backward compat.
  const parsed = parseMeta(lastSession?.meta);
  const sets = lastSession?.sets ?? parsed.sets;
  const dur = lastSession?.durationMin ?? parsed.dur;
  const volume = lastSession?.volumeKg ?? parsed.volume;
  // Phase 4 kcal estimate: volume * 0.03 (rough empirical formula).
  // Phase 5+ wire la BMR + duration based calculation.
  const kcal = Math.round(volume * 0.03);

  const coachKey = lastRating ? mapRatingToCoachKey(lastRating as SessionRating) : null;
  const coachLine = coachKey ? coachPick('endSession', coachKey, 0) : '';

  function handleFinish(): void {
    reset();
    navigate(gotoPath('antrenor'));
  }

  return (
    <section
      className="p-6 bg-paper min-h-screen flex flex-col"
      data-testid="post-summary"
    >
      <h1 className="text-2xl font-semibold text-ink mb-2" data-testid="summary-title">
        {lastSession?.title ?? 'Sesiune'}
      </h1>
      {coachLine && (
        <p
          className="text-base text-ink2 italic font-serif mb-6"
          data-testid="summary-coach-line"
        >
          „{coachLine}"
        </p>
      )}

      {/* F11 PR banner conditional. Phase 4 task_10: prData details expand
         banner copy cu exercise + deltaKg (cand disponibil din getPRDelta
         pipeline în Workout.handleLogSet). Fallback la lastSession.title
         scope cand prData null (legacy prHit-only flag). */}
      {prHit && (
        <div
          className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-succ/10 border border-succ"
          data-testid="summary-pr-banner"
          role="status"
          aria-label="PR nou detectat"
        >
          <Trophy className="w-6 h-6 text-succ" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-succ">PR nou!</p>
            <p className="text-sm text-ink2" data-testid="summary-pr-detail">
              {prData
                ? `${prData.exercise} - ${prData.deltaKg > 0 ? '+' : ''}${prData.deltaKg} kg (${prData.type})`
                : `Cel mai bun set la ${lastSession?.title ?? 'sesiune'}`}
            </p>
          </div>
        </div>
      )}

      {/* F8 stats grid 4-cell */}
      <div className="grid grid-cols-2 gap-3 mb-6" data-testid="summary-stats-grid">
        <StatCell label="Seturi" value={sets.toString()} testId="summary-sets" />
        <StatCell label="Durata" value={`${dur} min`} testId="summary-duration" />
        <StatCell label="Tonaj" value={`${formatKg(volume)} kg`} testId="summary-volume" />
        <StatCell label="Kcal" value={kcal.toString()} testId="summary-kcal" />
      </div>

      {/* F8 Streak counter */}
      <div
        className="p-4 mb-6 rounded-xl bg-paper2 border border-line text-center"
        data-testid="summary-streak"
      >
        <p className="text-sm text-ink2 mb-1">Streak</p>
        <p className="text-2xl font-bold text-brick">
          {streak} {streak === 1 ? 'sesiune' : 'sesiuni'}
        </p>
      </div>

      <button
        type="button"
        onClick={handleFinish}
        data-testid="summary-finish"
        className="mt-auto w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        Terminat
      </button>
    </section>
  );
}
