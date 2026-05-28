// ══ VIRTUAL SESSION LIST — Istoric perf windowing §35-M2 ════════════════
// Window-scroll virtualization pentru lista Sesiuni din Istoric. Lista poate
// creste nelimitat (1 sesiune / antrenament) → randarea tuturor randurilor
// degradeaza perf pe liste lungi. Randam doar randurile vizibile + overscan,
// cu spacer-e sus/jos care pastreaza inaltimea totala de scroll.
//
// Scroll model: Layout.tsx are pagina pe window scroll (main = flex-1, fara
// container overflow intern), deci urmarim window.scrollY relativ la offset-ul
// listei (getBoundingClientRect).
//
// Test-safe: sub VIRTUALIZE_THRESHOLD randam tot (jsdom NU are layout real →
// getBoundingClientRect = 0 → fara windowing ascuns). Comportament vizibil
// identic cu lista neschimbata: ordering, drill-down nav la originalIdx,
// testid-uri pe rand neschimbate.

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { History, ChevronRight } from 'lucide-react';
import { t } from '../../../i18n/index.js';

export interface SessionRow {
  title: string;
  meta: string;
  ts: number;
}

interface VirtualSessionListProps {
  sorted: SessionRow[];
  sessionsHistory: SessionRow[];
  formatDate: (ts: number) => string;
  onSelect: (originalIdx: number) => void;
}

// Inaltime estimata rand (card p-4 ~3 linii text) + gap-2 (8px) intre carduri.
const ROW_HEIGHT = 96;
// Sub acest prag randam tot (liste scurte nu beneficiaza de windowing +
// pastreaza testele jsdom verzi fara layout real).
const VIRTUALIZE_THRESHOLD = 30;
// Randuri extra peste/sub viewport pentru scroll fluid (zero flash la edges).
const OVERSCAN = 6;

function SessionCard({
  session,
  idx,
  originalIdx,
  formatDate,
  onSelect,
}: {
  session: SessionRow;
  idx: number;
  originalIdx: number;
  formatDate: (ts: number) => string;
  onSelect: (originalIdx: number) => void;
}): JSX.Element {
  return (
    <li key={`${session.ts}-${idx}`}>
      <button
        type="button"
        onClick={() => onSelect(originalIdx)}
        data-testid={`istoric-session-${idx}`}
        data-session-idx={originalIdx}
        className="w-full flex items-center gap-3 p-4 bg-paper2 border border-line rounded-xl text-left press-feedback transition-transform hover:scale-[1.01] hover:border-lineStrong"
      >
        <History className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
            {formatDate(session.ts)}
          </p>
          <p className="text-base font-semibold text-ink mt-0.5">{session.title}</p>
          <p className="text-sm text-ink2 mt-0.5">{session.meta}</p>
        </div>
        <ChevronRight
          className="w-5 h-5 text-ink2 flex-shrink-0"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </button>
    </li>
  );
}

export function VirtualSessionList({
  sorted,
  sessionsHistory,
  formatDate,
  onSelect,
}: VirtualSessionListProps): JSX.Element {
  const listRef = useRef<HTMLUListElement>(null);
  const [range, setRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: sorted.length,
  });

  const virtualize = sorted.length > VIRTUALIZE_THRESHOLD;

  useEffect(() => {
    if (!virtualize) {
      setRange({ start: 0, end: sorted.length });
      return;
    }

    const el = listRef.current;
    if (!el) return;

    function recompute(): void {
      const node = listRef.current;
      if (!node) return;
      // Offset-ul listei in coordonate document (top relativ la viewport +
      // scroll curent) → de la ce scrollY incepe lista.
      const listTop = node.getBoundingClientRect().top + window.scrollY;
      const viewportTop = window.scrollY - listTop;
      const viewportH = window.innerHeight;

      const start = Math.max(0, Math.floor(viewportTop / ROW_HEIGHT) - OVERSCAN);
      const visibleCount = Math.ceil(viewportH / ROW_HEIGHT);
      const end = Math.min(sorted.length, start + visibleCount + OVERSCAN * 2);

      setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    }

    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [virtualize, sorted.length]);

  const start = virtualize ? range.start : 0;
  const end = virtualize ? range.end : sorted.length;
  const padTop = start * ROW_HEIGHT;
  const padBottom = Math.max(0, (sorted.length - end) * ROW_HEIGHT);

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-2"
      role="list"
      aria-label={t('istoric.virtualList.ariaLabel')}
      data-testid="istoric-list"
    >
      {padTop > 0 && (
        <li aria-hidden="true" style={{ height: padTop }} data-testid="istoric-list-pad-top" />
      )}
      {sorted.slice(start, end).map((session, sliceIdx) => {
        const idx = start + sliceIdx;
        // Index original in sessionsHistory pentru detail navigate (neschimbat).
        const originalIdx = sessionsHistory.findIndex((s) => s.ts === session.ts);
        return (
          <SessionCard
            key={`${session.ts}-${idx}`}
            session={session}
            idx={idx}
            originalIdx={originalIdx}
            formatDate={formatDate}
            onSelect={onSelect}
          />
        );
      })}
      {padBottom > 0 && (
        <li
          aria-hidden="true"
          style={{ height: padBottom }}
          data-testid="istoric-list-pad-bottom"
        />
      )}
    </ul>
  );
}
