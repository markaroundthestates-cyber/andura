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
//
// Pulse reskin (2026-05-29 GROUP E): cardurile devin carduri Pulse — titlu +
// trofeu PR (cand sesiunea are un PR set) + chip rating (Easy/Right/Hard derivat
// din exercises[*].sets[*].rating) + data eyebrow + rand meta cu min/seturi/kg.
// Rating + PR sunt DERIVATE din breakdown (deriveSessionRating + sets[].isPR) —
// NU fabricate; sesiunile legacy fara breakdown nu arata chip/trofeu (honest).
// Drill-down `onSelect(originalIdx)` + windowing + testid-uri raman neschimbate.

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { Pill } from '../pulse/Pill';
import { deriveSessionRating } from '../../lib/sessionRating';
import type { SessionRating } from '../../lib/sessionRating';
import { t } from '../../../i18n/index.js';

export interface SessionRow {
  title: string;
  meta: string;
  ts: number;
  // Numeric fields persisted post Phase 4 task_10 — alimenteaza randul meta
  // (min / seturi / kg). Optional: sesiuni legacy nu le au → randul cade pe
  // string-ul `meta` mostenit. Aici sunt tipate optional pentru backward compat.
  sets?: number;
  durationMin?: number;
  volumeKg?: number;
  // Per-exercise breakdown (Phase 5 task_03) — sursa pentru rating derivat +
  // detectie PR pe card. Absent pe sesiuni legacy → fara chip/trofeu.
  exercises?: Array<{ sets: Array<{ rating: SessionRating; isPR?: boolean }> }>;
}

interface VirtualSessionListProps {
  sorted: SessionRow[];
  sessionsHistory: SessionRow[];
  formatDate: (ts: number) => string;
  onSelect: (originalIdx: number) => void;
}

// Inaltime estimata rand (card p-4, titlu + meta + chips ~3-4 linii) + gap-2.5.
const ROW_HEIGHT = 116;
// Sub acest prag randam tot (liste scurte nu beneficiaza de windowing +
// pastreaza testele jsdom verzi fara layout real).
const VIRTUALIZE_THRESHOLD = 30;
// Randuri extra peste/sub viewport pentru scroll fluid (zero flash la edges).
const OVERSCAN = 6;

// Mapeaza ratingul derivat la eticheta i18n + token de culoare Pulse (volt/
// aqua/ember) pentru chip. Reuseaza cheile istoric.ratingsStrip.{easy,right,hard}.
function ratingChip(rating: SessionRating): { label: string; color: string } {
  if (rating === 'usor') return { label: t('istoric.ratingsStrip.easy'), color: 'var(--volt)' };
  if (rating === 'greu') return { label: t('istoric.ratingsStrip.hard'), color: 'var(--ember)' };
  return { label: t('istoric.ratingsStrip.right'), color: 'var(--aqua)' };
}

// PR detectat daca orice set din orice exercitiu e marcat isPR (sursa reala
// din breakdown — NU mockup-ul `ex.id==='bench'`).
function sessionHasPR(session: SessionRow): boolean {
  return (session.exercises ?? []).some((ex) => ex.sets.some((s) => s.isPR === true));
}

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
  const rating = deriveSessionRating(session as Parameters<typeof deriveSessionRating>[0]);
  const chip = rating ? ratingChip(rating) : null;
  const hasPR = sessionHasPR(session);
  // Rand meta numeric (min · seturi · kg) cand campurile sunt prezente; altfel
  // cade pe string-ul `meta` mostenit (sesiuni legacy fara numerice).
  const hasNumeric =
    session.durationMin !== undefined ||
    session.sets !== undefined ||
    session.volumeKg !== undefined;

  return (
    <li key={`${session.ts}-${idx}`}>
      <button
        type="button"
        onClick={() => onSelect(originalIdx)}
        data-testid={`istoric-session-${idx}`}
        data-session-idx={originalIdx}
        className="pulse-card pulse-card-tight w-full text-left p-4 press-feedback transition-transform hover:scale-[1.01]"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-[15.5px] font-semibold text-ink truncate">
                {session.title}
              </span>
              {hasPR && (
                <Trophy
                  className="w-[15px] h-[15px] flex-shrink-0"
                  style={{ color: 'var(--ember)' }}
                  data-testid={`istoric-session-${idx}-pr`}
                  aria-label={t('istoric.landing.prBadgeAria')}
                />
              )}
            </div>
            <p className="font-mono text-[11px] text-ink3 mt-0.5">{formatDate(session.ts)}</p>
          </div>
          {chip ? (
            <Pill color={chip.color}>{chip.label}</Pill>
          ) : (
            <ChevronRight
              className="w-5 h-5 text-ink2 flex-shrink-0"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          )}
        </div>
        {hasNumeric ? (
          <div className="flex gap-4 mt-3 text-xs text-ink2">
            {session.durationMin !== undefined && (
              <span>
                <b className="font-mono text-ink">{session.durationMin}</b>{' '}
                {t('istoric.landing.cardMinutes')}
              </span>
            )}
            {session.sets !== undefined && (
              <span>
                <b className="font-mono text-ink">{session.sets}</b>{' '}
                {t('istoric.landing.cardSets')}
              </span>
            )}
            {session.volumeKg !== undefined && (
              <span>
                <b className="font-mono text-ink">{session.volumeKg.toLocaleString('en-US')}</b>{' '}
                {t('istoric.landing.cardKg')}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink2 mt-2">{session.meta}</p>
        )}
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
      className="flex flex-col gap-2.5"
      role="list"
      aria-label={t('istoric.virtualList.ariaLabel')}
      data-testid="istoric-list"
    >
      {padTop > 0 && (
        <li aria-hidden="true" style={{ height: padTop }} data-testid="istoric-list-pad-top" />
      )}
      {sorted.slice(start, end).map((session, sliceIdx) => {
        const idx = start + sliceIdx;
        // Index original in sessionsHistory pentru detail navigate. `sorted` e
        // [...sessionsHistory].sort(), deci fiecare element e ACEEASI referinta
        // de obiect ca in sessionsHistory → indexOf (identitate) rezolva corect
        // chiar daca doua sesiuni au acelasi `ts` (findIndex pe ts deschidea
        // sesiunea gresita la coliziune de timestamp).
        const originalIdx = sessionsHistory.indexOf(session);
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
