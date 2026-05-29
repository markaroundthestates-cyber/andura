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
//   5. Streak inline emoji row F8 (§F-post-summary-02 mockup L1730-1735
//      "🔥 N zile consecutive — mentine ritmul!") + Terminat CTA → reset
//      store + navigate antrenor
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
// §F-post-summary-04: persona-gated "Detaliu Marius" section per mockup
// L1767-1776 (Tonaj / Densitate / 1RM est). Gated coachStore.persona ===
// 'marius'. Metrici doar din sursa onesta session data — RPE mediu OMIS
// (nu exista RPE numeric 1-10; ratings sunt calitative usor/potrivit/greu).
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
import { Trophy, Check } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { coachPick, type CoachVoiceEndSessionRating } from '../../../lib/coachVoice';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';
import { useCountUp } from '../../../hooks/useCountUp';
import { ConfettiBurst } from '../../../components/ConfettiBurst';
import { Ripple } from '../../../components/Ripple';
import { Kicker } from '../../../components/pulse/Kicker';
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
  const setsMatch = meta.match(/(\d+) (?:seturi|set)/);
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

// Muscle group derivation returns i18n keys (postSummary.muscles.*) so the
// rendered label tracks the active locale; the data-muscle attribute keeps
// the engine-friendly canonical key so tests / analytics aren't broken.
function deriveMuscleGroups(title: string | undefined): MuscleGroup[] {
  if (!title) return [];
  const lower = title.toLowerCase();
  // Mockup L1676-1679 reference set for Push session = Piept/Umeri/Triceps/Abs.
  // Keyword inference per session type (Push/Pull/Legs/Full).
  if (lower.includes('push') || lower.includes('piept')) {
    return [
      { label: 'chest', primary: true },
      { label: 'shoulders', primary: true },
      { label: 'triceps', primary: true },
      { label: 'abs', primary: false },
    ];
  }
  if (lower.includes('pull') || lower.includes('spate')) {
    return [
      { label: 'back', primary: true },
      { label: 'biceps', primary: true },
      { label: 'forearms', primary: false },
    ];
  }
  if (lower.includes('legs') || lower.includes('picioare')) {
    return [
      { label: 'quads', primary: true },
      { label: 'hamstrings', primary: true },
      { label: 'glutes', primary: true },
      { label: 'calves', primary: false },
    ];
  }
  if (lower.includes('full') || lower.includes('total')) {
    return [
      { label: 'fullBody', primary: true },
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
  // Wave A4 (Daniel 2026-05-28) — post-summary stat tiles inherit the same
  // polished look as Antrenor StatsGrid / Istoric stats: relative wrapper +
  // accent radial wash + card-rise entrance. Stagger across the 4-cell grid
  // applied by parent via delay-* utilities passed through className (deferred
  // — current parent uses Tailwind utility-only call, leave stagger off here
  // and let the screen-level animate-fade-in-up parent handle entrance).
  return (
    <div
      className="pulse-card pulse-card-tight relative overflow-hidden p-4 animate-card-rise"
      data-testid={testId}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--brick) 14%, transparent) 0%, transparent 60%)',
        }}
      />
      <p className="relative text-sm text-ink2 mb-1">{label}</p>
      <p className="relative text-base font-semibold text-ink tabular-nums">{value}</p>
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
  const persona = useCoachStore((s) => s.persona);

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

  // Tasteful count-up on the closure stat numbers (2026-05-27). Values are
  // synchronous from the store, so the hook initializes to the real number →
  // tests asserting exact values stay green (rAF is not flushed under act);
  // in a live browser the numbers roll up. Snaps under reduced motion.
  const setsDisplay = useCountUp(sets);
  const volumeDisplay = useCountUp(volume);
  const kcalDisplay = useCountUp(kcal);

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
      {/* Pulse closure header (mockup interfata-noua/screens-workout.jsx:501-506)
          — a glowing volt check badge centered above the h1 closure heading.
          summary-heading keeps its testid + level-1 + verbatim copy ("Session
          complete" already signals closure, so no redundant Kicker); the
          workout title stays the subtitle (summary-title). */}
      <div className="flex flex-col items-center text-center mb-6">
        <div
          className="w-[72px] h-[72px] rounded-full grid place-items-center mb-3 animate-scale-in"
          style={{
            background: 'var(--brick)',
            boxShadow: '0 0 44px -6px var(--brick)',
          }}
          aria-hidden="true"
        >
          <Check className="w-8 h-8" style={{ color: 'var(--on-accent)' }} strokeWidth={2.6} />
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink mt-1 mb-1"
          data-testid="summary-heading"
        >
          {t('postSummary.heading')}
        </h1>
        <p className="text-base text-ink2" data-testid="summary-title">
          {lastSession?.title ?? t('postSummary.fallbackTitle')}
        </p>
        {coachLine && (
          <p
            className="text-base text-ink2 italic font-serif mt-2"
            data-testid="summary-coach-line"
          >
            „{coachLine}"
          </p>
        )}
      </div>

      {/* F11 PR banner. Phase 4 task_22: enriched display PR type label +
         deltaPct + 1RM estimate. Phase 4 task_10 baseline (exercise +
         deltaKg) preserved backward compat cand prData minimal.
         WORDING BACKLOG: PR_TYPE_LABEL placeholders (mockup verbatim
         absent) — Daniel CEO review pre-Beta. */}
      {prHit && (
        <div
          className="relative flex flex-col gap-2 p-4 mb-4 rounded-xl bg-succ/10 border border-succ animate-card-rise animate-glow-pulse"
          data-testid="summary-pr-banner"
          role="status"
          aria-label={t('postSummary.prBannerAriaLabel')}
        >
          {/* Wave C3 (2026-05-28) — celebratory confetti burst on PR moments.
              Theme-aware (brick/succ/warn/deep tokens) so it tints mov/champagne/
              gold per palette. Sits at banner center; absolute-positioned + pointer-
              events: none so the underlying content is fully interactive. Auto-
              cleans after 1s. Mount-keyed by prHit=true so it plays once. */}
          <ConfettiBurst />
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-succ flex-shrink-0 animate-scale-in" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-succ">{t('postSummary.prNew')}</p>
              <p className="text-sm text-ink2" data-testid="summary-pr-detail">
                {prData
                  ? t('postSummary.prSummaryDetail', {
                      exercise: prData.exercise,
                      sign: prData.deltaKg > 0 ? '+' : '',
                      kg: prData.deltaKg,
                    })
                  : t('postSummary.prFallbackDetail', {
                      title: lastSession?.title ?? t('postSummary.fallbackTitle').toLowerCase(),
                    })}
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
                  ? t('postSummary.prTypeLabel.weight')
                  : prData.type === 'volume'
                  ? t('postSummary.prTypeLabel.volume')
                  : t('postSummary.prTypeLabel.reps')}
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
                  {t('postSummary.prOneRMEstimate', { kg: prData.oneRMEstimate })}
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
        <StatCell label={t('postSummary.statsLabels.duration')} value={t('postSummary.statsLabels.durationValue', { min: dur })} testId="summary-duration" />
        <StatCell label={t('postSummary.statsLabels.setsLogged')} value={setsDisplay.toString()} testId="summary-sets" />
        <StatCell label={t('postSummary.statsLabels.totalVolume')} value={`${formatKg(volumeDisplay)} kg`} testId="summary-volume" />
        <StatCell label={t('postSummary.statsLabels.kcalEstimate')} value={kcalDisplay.toString()} testId="summary-kcal" />
      </div>

      {/* §F-post-summary-03 Grupe musculare pills — mockup L1673-1680.
         Phase 3 keyword-derived; Phase 5+ wires lastSession.exercises engine. */}
      {muscleGroups.length > 0 && (
        <div className="mb-6" data-testid="summary-muscles">
          {/* Mockup renders per-muscle BARS, but the engine breakdown (per-group
              set counts) is a Phase-5 TODO — deriveMuscleGroups yields labels +
              a primary flag only. We keep the honest pills (no fabricated counts)
              under a Pulse Kicker heading. */}
          <div className="mb-3">
            <Kicker>{t('postSummary.muscleGroupsHeading')}</Kicker>
          </div>
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
                {t(`postSummary.muscles.${m.label}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* §F-post-summary-04 Detaliu Marius — persona-gated granular metrics
         per mockup L1767-1776. Doar metrici cu sursa onesta din session data:
         Tonaj (=volumeKg), Densitate (=volume/durata), 1RM est (prData PR
         engine output cand present). RPE mediu OMIS — nu exista sursa numerica
         honest (lastRating + per-set rating sunt calitative, NU RPE 1-10). */}
      {persona === 'marius' && (
        <div
          className="pulse-card p-4 mb-6"
          data-testid="summary-marius-detail"
        >
          <p className="text-sm font-semibold text-ink2 uppercase tracking-wide mb-3">
            {t('postSummary.mariusDetail.heading')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div data-testid="marius-tonaj">
              <p className="text-sm text-ink2 mb-1">{t('postSummary.mariusDetail.tonnage')}</p>
              <p className="text-base font-semibold text-ink font-mono">
                {formatKg(volume)} kg
              </p>
            </div>
            {dur > 0 && (
              <div data-testid="marius-densitate">
                <p className="text-sm text-ink2 mb-1">{t('postSummary.mariusDetail.density')}</p>
                <p className="text-base font-semibold text-ink font-mono">
                  {t('postSummary.mariusDetail.densityValue', { kg: Math.round(volume / dur) })}
                </p>
              </div>
            )}
            {prData?.oneRMEstimate !== undefined && prData.oneRMEstimate > 0 && (
              <div data-testid="marius-1rm">
                <p className="text-sm text-ink2 mb-1">{t('postSummary.mariusDetail.oneRMLabel', { exercise: prData.exercise })}</p>
                <p className="text-base font-semibold text-ink font-mono">
                  {prData.oneRMEstimate} kg
                  {prData.deltaKg !== 0 && (
                    <span className="text-xs text-succ ml-1">
                      {prData.deltaKg > 0 ? '+' : ''}{prData.deltaKg}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* §F-post-summary-02 Streak — inline emoji row per mockup L1730-1735
         (NU card). Flame + count + incurajare. pluralRo zi/zile gestioneaza
         singular (1 zi) + "de" pentru 20+ (20 de zile). */}
      <p
        className="flex items-center gap-2 mb-6 text-base text-ink"
        data-testid="summary-streak"
      >
        {/* Wave C3 (2026-05-28) — flame emoji flickers (2s loop rotation+scale)
            so the streak feels alive without ever leaving its inline footprint.
            Auto-collapses under reduced-motion. */}
        <span aria-hidden="true" className="animate-flame text-xl">🔥</span>
        <span className="font-semibold">
          {t(streak === 1 ? 'postSummary.streakLabel_one' : 'postSummary.streakLabel_other', { n: streak })}
        </span>
        <span className="text-ink2">{t('postSummary.streakLine')}</span>
      </p>

      <button
        type="button"
        onClick={handleFinish}
        data-testid="summary-finish"
        className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine relative overflow-hidden mt-auto w-full py-4 text-paper rounded-[14px] text-base font-semibold"
      >
        <Ripple color="rgba(255,255,255,0.5)" />
        <span className="relative">{t('postSummary.finishCta')}</span>
      </button>
    </section>
  );
}
