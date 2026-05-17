// ══ ISTORIC — Tab 3 of 4 Phase 5 task_21 Landing List ════════════════════
// Phase 5 MVP scope: list past sessions reverse chrono + empty state.
// ZERO charts/heat-maps/trends (Phase 6+ adds full mockup
// andura-clasic.html#L1155+ Istoric tab dashboard).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function Istoric(): JSX.Element {
  const navigate = useNavigate();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);

  // Reverse-chrono UI iteration (newest first).
  const sorted = [...sessionsHistory].sort((a, b) => b.ts - a.ts);

  return (
    <section
      className="p-6 bg-paper min-h-screen"
      data-testid="istoric-home"
    >
      <h1 className="text-2xl font-semibold text-ink mb-6">Istoric</h1>

      {sorted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-testid="istoric-empty"
        >
          <History className="w-12 h-12 text-ink2 mb-3" aria-hidden="true" />
          <p className="text-base text-ink2">
            Nu ai antrenamente inca. Prima sesiune apare aici dupa ce o termini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list" data-testid="istoric-list">
          {sorted.map((session, idx) => {
            // Find original index în sessionsHistory pentru detail navigate.
            const originalIdx = sessionsHistory.findIndex((s) => s.ts === session.ts);
            return (
              <li key={`${session.ts}-${idx}`}>
                <button
                  type="button"
                  onClick={() => navigate(`/app/istoric/${originalIdx}`)}
                  data-testid={`istoric-session-${idx}`}
                  data-session-idx={originalIdx}
                  className="w-full flex items-center gap-3 p-4 bg-paper2 border border-line rounded-xl text-left"
                >
                  <History className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                      {formatDate(session.ts)}
                    </p>
                    <p className="text-base font-semibold text-ink mt-0.5">
                      {session.title}
                    </p>
                    <p className="text-sm text-ink2 mt-0.5">{session.meta}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
