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
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { pluralRo } from '../../../lib/pluralRo';

// §F-istoric-08 — Romanian weekday + month labels no-diacritics manual map.
// Sunday-first index (Date.getDay() returns 0=Sunday). Mirror Istoric.tsx
// list pentru cross-screen consistency.
const WEEKDAYS_RO = [
  'duminica',
  'luni',
  'marti',
  'miercuri',
  'joi',
  'vineri',
  'sambata',
] as const;

const MONTHS_RO = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'noi',
  'dec',
] as const;

function formatDate(ts: number): string {
  const d = new Date(ts);
  const weekday = WEEKDAYS_RO[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_RO[d.getMonth()];
  return `${weekday} · ${day} ${month}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function IstoricDetail(): JSX.Element {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);

  const idx = sessionId !== undefined ? Number(sessionId) : -1;
  const session =
    Number.isFinite(idx) && idx >= 0 && idx < sessionsHistory.length
      ? sessionsHistory[idx]
      : null;

  function handleBack(): void {
    navigate('/app/istoric');
  }

  if (!session) {
    return (
      <section
        className="p-6 bg-paper min-h-screen flex flex-col items-center justify-center text-center"
        data-testid="istoric-detail-missing"
      >
        <p className="text-base text-ink2 mb-4">Sesiunea nu a fost gasita.</p>
        <button
          type="button"
          onClick={handleBack}
          data-testid="istoric-detail-back-missing"
          className="px-4 py-2 bg-brick text-paper rounded-[14px] text-sm font-semibold"
        >
          Inapoi la Istoric
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
          aria-label="Inapoi"
          data-testid="istoric-detail-back"
          className="p-2 rounded-full text-ink2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-semibold text-ink">{session.title}</h1>
      </header>

      <div className="bg-paper2 border border-line rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <History className="w-5 h-5 text-ink2" aria-hidden="true" />
          <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
            Sesiune
          </p>
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
          className="grid grid-cols-3 gap-2 mb-4"
          data-testid="istoric-detail-stats-grid"
        >
          {session.sets !== undefined && (
            <div className="p-3 bg-paper2 border border-line rounded-xl text-center" data-testid="detail-sets">
              <p className="text-xs text-ink2 uppercase">Seturi</p>
              <p className="text-xl font-bold text-ink font-mono">{session.sets}</p>
            </div>
          )}
          {session.durationMin !== undefined && (
            <div className="p-3 bg-paper2 border border-line rounded-xl text-center" data-testid="detail-duration">
              <p className="text-xs text-ink2 uppercase">Min</p>
              <p className="text-xl font-bold text-ink font-mono">{session.durationMin}</p>
            </div>
          )}
          {session.volumeKg !== undefined && (
            <div className="p-3 bg-paper2 border border-line rounded-xl text-center" data-testid="detail-volume">
              <p className="text-xs text-ink2 uppercase">Tonaj kg</p>
              <p className="text-xl font-bold text-ink font-mono">{session.volumeKg}</p>
            </div>
          )}
        </div>
      )}

      {/* Phase 5 task_03: per-exercise breakdown table cand exercises field
         persisted (sesiuni post-task_03). Backward compat — sesiuni legacy
         fără exercises field render fallback message. */}
      {session.exercises && session.exercises.length > 0 ? (
        <div data-testid="istoric-detail-breakdown">
          <p className="text-xs text-ink2 uppercase tracking-wide font-semibold mb-2">
            Exercitii
          </p>
          {session.exercises.map((ex) => (
            <div
              key={ex.exerciseId}
              data-testid={`detail-ex-${ex.exerciseId}`}
              className="bg-paper2 border border-line rounded-xl p-4 mb-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-ink text-sm">{ex.exerciseName}</h3>
                <span className="text-xs text-ink2 font-mono" data-testid="detail-ex-1rm">
                  1RM est: {ex.peakOneRM}kg
                </span>
              </div>
              <div className="text-xs text-ink2 mb-2" data-testid="detail-ex-volume">
                Volum: {ex.totalVolume}kg - {pluralRo(ex.sets.length, 'set', 'seturi')}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-ink2 border-b border-line">
                    <th className="text-left py-1">Set</th>
                    <th className="text-left py-1">Kg</th>
                    <th className="text-left py-1">Reps</th>
                    <th className="text-left py-1">Cum a fost</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, idx) => (
                    <tr
                      key={idx}
                      data-testid={`detail-set-${ex.exerciseId}-${idx}`}
                      className={s.isPR ? 'text-succ font-semibold' : 'text-ink'}
                    >
                      <td className="py-1">{idx + 1}{s.isPR ? ' PR' : ''}</td>
                      <td className="py-1">{s.kg}</td>
                      <td className="py-1">{s.reps}</td>
                      <td className="py-1 capitalize">{s.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="text-xs text-ink2 italic text-center"
          data-testid="istoric-detail-legacy"
        >
          Detaliu per exercitiu indisponibil pentru sesiuni inregistrate inainte de actualizare.
        </p>
      )}
    </section>
  );
}
