// ══ POST-SUMMARY — Phase 3 task_09 §B Rewrite Stub → Real ════════════════
// Session closure summary screen — capstone Phase 3 Antrenor flow.
//
// 4 zone:
//   1. Header: h1 "Sesiune terminata" closure framing + workout title subtitle
//      + coach felicitare line (coachPick endSession by rating cu taxonomy
//      alias 'usoara/normala/grea' → 'usor/potrivit/greu')
//   2. F11 PR banner conditional (prHit flag — Phase 3 stub, Phase 4+ wires
//      engineWrappers.getPRDelta pe logSet în Workout.tsx)
//   3. F8 stats grid 4-cell (Seturi / Durata / Tonaj / Kcal estimate)
//   4. Grupe musculare pills (mockup L1674-1680 verbatim) derived din
//      lastSession.title parse keyword (Phase 5+ wire engine
//      sessionExercisesBreakdown.muscleGroups direct).
//   5. Streak counter F8 + Terminat CTA → reset store + navigate antrenor
//
// HIGH-GAMMA §F-post-summary-01: h1 swap from session title la verbatim
// mockup "Sesiune terminata" L1630 — clear closure framing vs preview-like.
// Workout title moves la subtitle position.
//
// HIGH-GAMMA §F-post-summary-03: muscle group pills section per mockup
// L1673-1680 ("Grupe musculare" + pill rows cu color dots brick=primary,
// ink-3=secondary). Phase 3 derives din session title keyword match;
// Phase 5+ wires real engine muscleGroups field.
//
// Phase 4 task_10: prefer numeric fields LastSessionSummary.sets /
// durationMin / volumeKg (populated explicit de PostRpe.finishSession).
// parseMeta retained as fallback pentru sesiuni persisted pre-migration
// (cand only display meta string present, NU numeric fields).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (coach felicitare)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html L1629-1695 screen-post-summary

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { coachPick, type CoachVoiceEndSessionRating } from '../../../lib/coachVoice';
import { pluralRo } from '../../../lib/pluralRo';
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
    volume: volMatch && volMatch[1] ? Number(volMatch[1].replace(/\s/g, '')) : 0,
  };
}

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/,/g, ' ').replace(/\./g, ' ');
}

// §F-post-summary-03 muscle group derivation. Phase 3 keyword-match din
// session title (e.g., "Push (piept si umeri)" → Piept + Umeri + Triceps).
// Phase 5+ wires direct la lastSession.exercises muscleGroups engine field.
// Returns ordered list cu primary (brick dot) first + secondary (ink-3 dot).
interface MuscleGroup {
  label: string;
  primary: boolean;
}

function deriveMuscleGroups(title: string | undefined): MuscleGroup[] {
  if (!title) return [];
  const lower = title.toLowerCase();
  // Mockup L1676-1679 reference set for Push session = Piept/Umeri/Triceps/Abs.
  // Keyword inference per session type (Push/Pull/Legs/Full).
  if (lower.includes('push') || lower.includes('piept')) {
    return [
      { label: 'Piept', primary: true },
      { label: 'Umeri', primary: true },
      { label: 'Triceps', primary: true },
      { label: 'Abs', primary: false },
    ];
  }
  if (lower.includes('pull') || lower.includes('spate')) {
    return [
      { label: 'Spate', primary: true },
      { label: 'Biceps', primary: true },
      { label: 'Antebrate', primary: false },
    ];
  }
  if (lower.includes('legs') || lower.includes('picioare')) {
    return [
      { label: 'Cvadriceps', primary: true },
      { label: 'Femurali', primary: true },
      { label: 'Fesieri', primary: true },
      { label: 'Gambe', primary: false },
    ];
  }
  if (lower.includes('full') || lower.includes('total')) {
    return [
      { label: 'Compound full body', primary: true },
    ];
  }
  return [];
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

  const muscleGroups = deriveMuscleGroups(lastSession?.title);

  return (
    <section
      className="p-6 bg-paper min-h-screen flex flex-col"
      data-testid="post-summary"
    >
      {/* §F-post-summary-01 closure framing — h1 mockup verbatim L1630. */}
      <h1
        className="text-2xl font-semibold text-ink mb-1"
        data-testid="summary-heading"
      >
        Sesiune terminata
      </h1>
      <p className="text-base text-ink2 mb-4" data-testid="summary-title">
        {lastSession?.title ?? 'Sesiune'}
      </p>
      {coachLine && (
        <p
          className="text-base text-ink2 italic font-serif mb-6"
          data-testid="summary-coach-line"
        >
          „{coachLine}"
        </p>
      )}

      {/* F11 PR banner. Phase 4 task_22: enriched display PR type label +
         deltaPct + 1RM estimate. Phase 4 task_10 baseline (exercise +
         deltaKg) preserved backward compat cand prData minimal.
         WORDING BACKLOG: PR_TYPE_LABEL placeholders (mockup verbatim
         absent) — Daniel CEO review pre-Beta. */}
      {prHit && (
        <div
          className="flex flex-col gap-2 p-4 mb-4 rounded-xl bg-succ/10 border border-succ"
          data-testid="summary-pr-banner"
          role="status"
          aria-label="PR nou detectat"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-succ flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-succ">PR nou!</p>
              <p className="text-sm text-ink2" data-testid="summary-pr-detail">
                {prData
                  ? `${prData.exercise} - ${prData.deltaKg > 0 ? '+' : ''}${prData.deltaKg} kg`
                  : `Cel mai bun set la ${lastSession?.title ?? 'sesiune'}`}
              </p>
            </div>
          </div>
          {prData && (
            <div className="flex flex-wrap gap-2 mt-1" data-testid="summary-pr-enrichment">
              <span
                className="text-xs px-2 py-1 bg-succ/20 text-succ rounded-md font-semibold"
                data-testid="summary-pr-type-label"
                data-pr-type={prData.type}
              >
                {prData.type === 'weight'
                  ? 'PR greutate'
                  : prData.type === 'volume'
                  ? 'PR volum'
                  : 'PR repetari'}
              </span>
              {prData.deltaPct !== undefined && prData.deltaPct !== 0 && (
                <span
                  className="text-xs px-2 py-1 bg-paper2 text-ink rounded-md font-semibold"
                  data-testid="summary-pr-delta-pct"
                >
                  {prData.deltaPct > 0 ? '+' : ''}{prData.deltaPct}%
                </span>
              )}
              {prData.oneRMEstimate !== undefined && prData.oneRMEstimate > 0 && (
                <span
                  className="text-xs px-2 py-1 bg-paper2 text-ink rounded-md font-semibold"
                  data-testid="summary-pr-1rm"
                >
                  1RM estimat: {prData.oneRMEstimate}kg
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* F8 stats grid 4-cell — §F-post-summary-06 (LOW chat5 Wave 10) ordine
         + labels mockup verbatim L1654-1671: Durata / Seturi logate / Volum
         total / Kcal estimate (mockup ordine reflects Gigel scan-flow timp →
         volum efort → estimate calorii). */}
      <div className="grid grid-cols-2 gap-3 mb-6" data-testid="summary-stats-grid">
        <StatCell label="Durata" value={`${dur} min`} testId="summary-duration" />
        <StatCell label="Seturi logate" value={sets.toString()} testId="summary-sets" />
        <StatCell label="Volum total" value={`${formatKg(volume)} kg`} testId="summary-volume" />
        <StatCell label="Kcal estimate" value={kcal.toString()} testId="summary-kcal" />
      </div>

      {/* §F-post-summary-03 Grupe musculare pills — mockup L1673-1680.
         Phase 3 keyword-derived; Phase 5+ wires lastSession.exercises engine. */}
      {muscleGroups.length > 0 && (
        <div className="mb-6" data-testid="summary-muscles">
          <p className="text-sm font-semibold text-ink2 uppercase tracking-wide mb-3">
            Grupe musculare
          </p>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((m) => (
              <span
                key={m.label}
                data-muscle={m.label}
                data-muscle-primary={m.primary ? 'true' : 'false'}
                className="inline-flex items-center gap-2 px-3 py-2 bg-paper2 border border-line rounded-full text-sm font-medium text-ink"
              >
                <span
                  aria-hidden="true"
                  className={
                    m.primary
                      ? 'w-2 h-2 rounded-full bg-brick'
                      : 'w-2 h-2 rounded-full bg-ink3'
                  }
                />
                {m.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* F8 Streak counter */}
      <div
        className="p-4 mb-6 rounded-xl bg-paper2 border border-line text-center"
        data-testid="summary-streak"
      >
        <p className="text-sm text-ink2 mb-1">Streak</p>
        <p className="text-2xl font-bold text-brick">
          {pluralRo(streak, 'sesiune', 'sesiuni')}
        </p>
      </div>

      <button
        type="button"
        onClick={handleFinish}
        data-testid="summary-finish"
        className="mt-auto w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
      >
        Terminat
      </button>
    </section>
  );
}
