// ══ ISTORIC DETAIL — Session Detail View Phase 5 task_21 §B ══════════════
// Phase 5 MVP scope: session header (date + title + meta) + simple breakdown
// (parseMeta extract sets/duration/volume). ZERO per-exercise breakdown
// (history NU persisted post-session per workoutStore current architecture
// — only LastSessionSummary aggregate saved; per-exercise sets cleared on
// finishSession). Phase 6+ adds per-exercise drill-down când history
// persisted la sessionsHistory aggregate (currently scope: aggregate only).
//
// §F-istoric-08 (LOW chat5 Wave 14) — date format Romanian weekday cross-screen
// consistency cu Istoric.tsx list (mockup andura-clasic.html#L2162-2178
// azi/marti/duminica). Manual map (NU Intl.DateTimeFormat — locale ICU emite
// diacritice marti/sambata violand D-LEGACY-064). Format "<Weekday> · <DD>
// <mon>" pentru cititor casnic; numeric DD.MM.YYYY retras (jargon-numeric).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { pluralRo } from '../../../lib/pluralRo';
import { Kicker } from '../../../components/pulse/Kicker';
import { t, getCurrentLocale } from '../../../../i18n/index.js';
import { isEnabled } from '../../../../util/featureFlags.js';

// BUILD F6b V2 #14 — per-type PR badge label (spec §1b.2). When
// dp_rep_volume_pr_v1 is ON and the set carries a `prType`, render the typed
// label via an i18n key keyed on the type (NOT prEngine.formatPRMessage's
// hardcoded RO — the i18n-leak rule). OFF or a set without prType → today's flat
// " PR" suffix → byte-identical.
function prBadgeLabel(prType?: 'weight' | 'reps' | 'volume'): string {
  if (isEnabled('dp_rep_volume_pr_v1') && prType) {
    return ` ${t(`istoric.detail.prBadge.${prType}`)}`;
  }
  return ' PR';
}

// §F-istoric-08 — weekday + month via i18n bundle (Wave E3).
// Reads weekdays.relativeShort + months.short so the format flips locale
// alongside the Istoric list. RO bundle preserves "luni/marti" lower-case
// mockup parity (D-LEGACY-064); EN bundle ships "Mon · 7 May".
function formatDate(ts: number): string {
  // Guard: ts lipsa / NaN / Invalid Date → em-dash (vezi Istoric.tsx formatDate).
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const weekday = t(`weekdays.relativeShort.${d.getDay()}`);
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  return `${weekday} · ${day} ${month}`;
}

// Locale-aware sets pluralization. RO uses pluralRo's "de" rule; EN uses
// istoric.detail.exerciseSets_{one,other} with {n} interpolation.
function formatSetsLabel(n: number): string {
  if (getCurrentLocale() === 'ro') return pluralRo(n, 'set', 'seturi');
  return n === 1
    ? t('istoric.detail.exerciseSets_one', { n })
    : t('istoric.detail.exerciseSets_other', { n });
}

// Maps internal rating key to user-facing label per active locale.
function ratingLabel(rating: string): string {
  if (rating === 'usor' || rating === 'potrivit' || rating === 'greu') {
    return t(`istoric.detail.ratingLabels.${rating}`);
  }
  return rating; // unknown / future rating — surface verbatim.
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// RO thousands separator (space) — mirror PostSummary formatKg pentru
// cross-screen numeric consistency (12 450 kg, NU 12450kg).
function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/\./g, ' ').replace(/,/g, '.');
}

export function IstoricDetail(): JSX.Element {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const deleteSession = useWorkoutStore((s) => s.deleteSession);

  // Two-tap inline delete confirm (mislogged workout removal). First tap reveals
  // a "Delete / Keep" confirm row; this guards against an accidental delete
  // without spinning up a separate route (surgical, matches inline aerobic UX).
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Resolve by stable `ts`, NOT array index (Daniel audit 2026-06-05). The
  // list links carry the session's ts; an array index pointed at the WRONG
  // session after a delete/reorder (silent wrong data) and a deep-link by ts
  // 404'd. Sessions carry `ts` (no id), so ts is the stable identifier.
  const tsParam = sessionId !== undefined ? Number(sessionId) : NaN;
  const session =
    Number.isFinite(tsParam)
      ? sessionsHistory.find((s) => s.ts === tsParam) ?? null
      : null;

  function handleBack(): void {
    navigate('/app/istoric');
  }

  function handleDelete(): void {
    if (session) deleteSession(session.ts);
    navigate('/app/istoric');
  }

  if (!session) {
    return (
      <section
        className="p-6 bg-paper min-h-screen flex flex-col items-center justify-center text-center"
        data-testid="istoric-detail-missing"
      >
        <p className="text-base text-ink2 mb-4">{t('istoric.detail.missing')}</p>
        <button
          type="button"
          onClick={handleBack}
          data-testid="istoric-detail-back-missing"
          className="px-4 py-2 bg-brick text-paper rounded-[14px] text-sm font-semibold"
        >
          {t('istoric.detail.backToHistory')}
        </button>
      </section>
    );
  }

  return (
    <section
      className="p-6 bg-paper min-h-screen"
      data-testid="istoric-detail"
    >
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('istoric.detail.backAria')}
          data-testid="istoric-detail-back"
          className="p-2 rounded-full text-ink2 press-feedback"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl font-bold text-ink">{session.title}</h1>
      </header>

      <div className="pulse-card p-4 mb-4">
        <div className="flex items-center gap-2.5 mb-2">
          <History className="w-4 h-4" style={{ color: 'var(--aqua)' }} aria-hidden="true" />
          <Kicker color="var(--aqua)">{t('istoric.detail.sessionKicker')}</Kicker>
        </div>
        <p className="text-base text-ink" data-testid="istoric-detail-date">
          {formatDate(session.ts)} · {formatTime(session.ts)}
        </p>
        <p className="text-sm text-ink2 mt-2" data-testid="istoric-detail-meta">
          {session.meta}
        </p>
      </div>

      {(session.sets !== undefined || session.durationMin !== undefined || session.volumeKg !== undefined) && (
        <div
          className="grid grid-cols-3 gap-2.5 mb-4"
          data-testid="istoric-detail-stats-grid"
        >
          {session.sets !== undefined && (
            <div className="pulse-card pulse-card-tight p-3 text-center" data-testid="detail-sets">
              <p className="font-mono text-[10px] tracking-wider text-ink3 uppercase">{t('istoric.detail.stats.sets')}</p>
              <p className="font-display text-xl font-bold text-ink tabular-nums mt-1">{session.sets}</p>
            </div>
          )}
          {session.durationMin !== undefined && (
            <div className="pulse-card pulse-card-tight p-3 text-center" data-testid="detail-duration">
              <p className="font-mono text-[10px] tracking-wider text-ink3 uppercase">{t('istoric.detail.stats.minutes')}</p>
              <p className="font-display text-xl font-bold text-ink tabular-nums mt-1">{session.durationMin}</p>
            </div>
          )}
          {session.volumeKg !== undefined && (
            <div className="pulse-card pulse-card-tight p-3 text-center" data-testid="detail-volume">
              <p className="font-mono text-[10px] tracking-wider text-ink3 uppercase">{t('istoric.detail.stats.tonnage')}</p>
              <p className="font-display text-xl font-bold text-ink tabular-nums mt-1">{formatKg(session.volumeKg)}</p>
            </div>
          )}
        </div>
      )}

      {/* Phase 5 task_03: per-exercise breakdown table cand exercises field
         persisted (sesiuni post-task_03). Backward compat — sesiuni legacy
         fără exercises field render fallback message. */}
      {session.exercises && session.exercises.length > 0 ? (
        <div data-testid="istoric-detail-breakdown">
          <div className="mb-2.5">
            <Kicker>{t('istoric.detail.exercisesHeading')}</Kicker>
          </div>
          {session.exercises.map((ex) => {
            // C18-ISTORIC-METRIC-HEADER — a time/carry set persists reps:0 + durationSec,
            // so its breakdown totalVolume=0 (kg*reps) and peakOneRM=kg. Rendering the
            // reps-based header for it fabricated a "1RM est: 40 kg" + a "Volum: 0 kg"
            // for a real loaded carry. Detect a metric exercise from the persisted data
            // (every set carries durationSec — the cycle-17 fix made this authoritative)
            // and show a duration/load summary instead. A carry (any set with a load)
            // shows "Max {kg} kg · {seconds} s"; a pure time hold (no load) omits the kg.
            const isMetric = ex.sets.length > 0 && ex.sets.every((s) => s.durationSec != null);
            const maxSeconds = isMetric
              ? Math.max(...ex.sets.map((s) => Number(s.durationSec) || 0))
              : 0;
            const maxLoad = isMetric
              ? Math.max(...ex.sets.map((s) => Number(s.kg) || 0))
              : 0;
            return (
            <div
              key={ex.exerciseId}
              data-testid={`detail-ex-${ex.exerciseId}`}
              className="pulse-card p-4 mb-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-ink text-sm">{ex.exerciseName}</h3>
                {!isMetric && (
                  <span className="text-xs text-ink2 font-mono" data-testid="detail-ex-1rm">
                    {t('istoric.detail.exerciseOneRm', { kg: formatKg(ex.peakOneRM) })}
                  </span>
                )}
              </div>
              <div className="text-xs text-ink2 mb-2" data-testid="detail-ex-volume">
                {isMetric
                  ? (maxLoad > 0
                    ? t('istoric.detail.exerciseMetricSummary', {
                        kg: formatKg(maxLoad),
                        seconds: maxSeconds,
                        setsLabel: formatSetsLabel(ex.sets.length),
                      })
                    : t('istoric.detail.exerciseMetricSummaryNoLoad', {
                        seconds: maxSeconds,
                        setsLabel: formatSetsLabel(ex.sets.length),
                      }))
                  : t('istoric.detail.exerciseVolumeSets', {
                      kg: formatKg(ex.totalVolume),
                      setsLabel: formatSetsLabel(ex.sets.length),
                    })}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-ink2 border-b border-line">
                    <th className="text-left py-1">{t('istoric.detail.table.set')}</th>
                    <th className="text-left py-1">{t('istoric.detail.table.kg')}</th>
                    <th className="text-left py-1">{t('istoric.detail.table.reps')}</th>
                    <th className="text-left py-1">{t('istoric.detail.table.rating')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, idx) => (
                    <tr
                      key={idx}
                      data-testid={`detail-set-${ex.exerciseId}-${idx}`}
                      className={s.isPR ? 'text-succ font-semibold' : 'text-ink'}
                    >
                      <td className="py-1">{idx + 1}{s.isPR ? prBadgeLabel(s.prType) : ''}</td>
                      <td className="py-1">{s.kg}</td>
                      {/* C17-METRIC-DURATION-LOST — a time/carry set persisted its
                          performed seconds (durationSec); show "60 s" instead of the
                          phantom 0-reps. Reps sets (no durationSec) render reps. */}
                      <td className="py-1">
                        {s.durationSec
                          ? t('istoric.detail.table.secondsCell', { seconds: s.durationSec })
                          : s.reps}
                      </td>
                      <td className="py-1">{ratingLabel(s.rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            );
          })}
        </div>
      ) : (
        <p
          className="text-xs text-ink2 italic text-center"
          data-testid="istoric-detail-legacy"
        >
          {t('istoric.detail.legacyFallback')}
        </p>
      )}

      {/* Delete this session (mislogged workout) — two-tap inline confirm. */}
      <div className="mt-8" data-testid="istoric-detail-delete">
        {confirmDelete ? (
          <div className="pulse-card pulse-card-tight p-4 flex flex-col gap-3">
            <p className="text-sm text-ink text-center" data-testid="istoric-detail-delete-question">
              {t('istoric.detail.deleteConfirmQuestion')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                data-testid="istoric-detail-delete-cancel"
                className="btn-secondary-lift flex-1 px-4 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
              >
                {t('istoric.detail.deleteConfirmNo')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                data-testid="istoric-detail-delete-accept"
                className="press-feedback flex-1 px-4 py-3 bg-brick text-paper rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                {t('istoric.detail.deleteConfirmYes')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            data-testid="istoric-detail-delete-cta"
            className="press-feedback w-full px-4 py-3 text-sm font-semibold text-brickdark flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            {t('istoric.detail.deleteCta')}
          </button>
        )}
      </div>
    </section>
  );
}
