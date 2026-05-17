// ══ ISTORIC DETAIL — Session Detail View Phase 5 task_21 §B ══════════════
// Phase 5 MVP scope: session header (date + title + meta) + simple breakdown
// (parseMeta extract sets/duration/volume). ZERO per-exercise breakdown
// (history NU persisted post-session per workoutStore current architecture
// — only LastSessionSummary aggregate saved; per-exercise sets cleared on
// finishSession). Phase 6+ adds per-exercise drill-down când history
// persisted la sessionsHistory aggregate (currently scope: aggregate only).

import type { JSX } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
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
          className="px-4 py-2 bg-brick text-paper rounded-xl text-sm font-semibold"
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

      <p className="text-xs text-ink2 italic text-center">
        Detaliu per exercitiu: Phase 6+ când history persisted complet.
      </p>
    </section>
  );
}
