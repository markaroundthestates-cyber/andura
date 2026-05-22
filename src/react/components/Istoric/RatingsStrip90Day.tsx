// ══ RATINGS STRIP 90-DAY — F-istoric-03 signature feature ════════════════
// 13-column week buckets across now-90d → now window. Each session's
// derived rating becomes one `.rh-cell` colored span stacked column-reverse.
// Bottom row: 3 aggregate counts (usor / potrivit / greu) + footer copy.
//
// T10: 13-col bucket logic + render
// T11: aggregate counts row + footer copy
//
// Mockup ref: 04-architecture/mockups/andura-clasic.html L1203-1228 + L2906-2910.
// Spec: 📥_inbox/calendar-heatmap-spec/UI-SPEC.md §3.2 + §5.2.
//
// Color mapping per spec §1.5: rh-cell.usor = --rating-usor (#a4cfa9),
// rh-cell.potrivit = --line-strong (#9a8770), rh-cell.greu = --brick (#c8412e).
// Bucket = floor((now - ts) / (7 days)) clamp 0..12, REVERSED (oldest=col0, newest=col12).

import type { JSX } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { deriveSessionRating } from '../../lib/sessionRating';
import type { SessionRating } from '../../lib/sessionRating';

const MS_PER_DAY = 86_400_000;
const WEEKS = 13;
const WINDOW_DAYS = 90;

// MED-A-2 fix CODE-REVIEW chat3: separate `unrated` bucket from `potrivit`.
// Sessions with `deriveSessionRating === null` (legacy/empty exercises field)
// previously inflated `potrivit` silently — engines (Bayesian Nutrition,
// Adherence) read counts + Gigel sees "8 potrivit" pe care nu le-a evaluat.
// `total` reflects only RATED sessions (excludes unrated) — footer copy stays
// honest. `unrated` cell paints distinct lighter taupe via bg-line.
type Counts = { usor: number; potrivit: number; greu: number; unrated: number; total: number };

function ratingBgClass(rating: SessionRating | null): string {
  if (rating === 'usor') return 'bg-ratingUsor';
  if (rating === 'greu') return 'bg-brick';
  if (rating === 'potrivit') return 'bg-lineStrong';
  // null → unrated (legacy session no rating) — distinct lighter taupe.
  return 'bg-line';
}

interface ComputedBuckets {
  weeks: Array<Array<SessionRating | null>>;
  counts: Counts;
}

export function computeBuckets(
  sessionsHistory: ReadonlyArray<{ ts: number; exercises?: Array<{ sets: Array<{ rating: SessionRating }> }> }>,
  now: number = Date.now(),
): ComputedBuckets {
  const weeks: Array<Array<SessionRating | null>> = Array.from({ length: WEEKS }, () => []);
  const counts: Counts = { usor: 0, potrivit: 0, greu: 0, unrated: 0, total: 0 };
  const windowStart = now - WINDOW_DAYS * MS_PER_DAY;
  for (const session of sessionsHistory) {
    if (session.ts < windowStart || session.ts > now) continue;
    const weekIdx = Math.floor((now - session.ts) / (7 * MS_PER_DAY));
    if (weekIdx < 0 || weekIdx > WEEKS - 1) continue;
    // Reverse so oldest=col0, newest=col12.
    const colIdx = (WEEKS - 1) - weekIdx;
    const rating = deriveSessionRating(session as Parameters<typeof deriveSessionRating>[0]);
    weeks[colIdx]?.push(rating);
    // MED-A-2: null → counts.unrated (NOT potrivit). `total` includes only
    // explicitly rated sessions so footer + aggregate stay honest.
    if (rating === 'usor') { counts.usor++; counts.total++; }
    else if (rating === 'greu') { counts.greu++; counts.total++; }
    else if (rating === 'potrivit') { counts.potrivit++; counts.total++; }
    else counts.unrated++;
  }
  return { weeks, counts };
}

export function RatingsStrip90Day(): JSX.Element {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const { weeks, counts } = computeBuckets(sessionsHistory);

  return (
    <section
      data-testid="ratings-strip-90day"
      aria-label="Cum au fost sesiunile in ultimele 90 zile"
      className="mb-4"
    >
      <header className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-sm uppercase tracking-wide font-semibold text-ink2">
          Cum au fost sesiunile
        </h3>
        <span className="text-[11px] text-ink3 font-medium">ultimele 90 zile</span>
      </header>
      <div className="bg-white border border-line rounded-2xl p-4">
        <div className="flex items-end gap-1.5 h-16 mb-3.5" data-testid="rh-strip">
          {weeks.map((cells, idx) => (
            <div
              key={idx}
              className="flex flex-col-reverse gap-0.5 flex-1 h-full justify-end"
              data-testid={`rh-col-${idx}`}
            >
              {cells.map((rating, ci) => (
                <span
                  key={ci}
                  className={`block h-[7px] rounded-[2px] ${ratingBgClass(rating)}`}
                  data-testid={`rh-cell-${idx}-${ci}`}
                  data-rating={rating ?? 'unrated'}
                  title={rating === null ? 'Fara rating' : undefined}
                  aria-hidden="true"
                />
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div role="group" aria-label={`Usor ${counts.usor} sesiuni`}>
            <span className="block text-xs text-ink3">Usor</span>
            <span
              className="block text-lg font-bold font-mono text-heatGreu"
              data-testid="count-usor"
            >
              {counts.usor}
            </span>
          </div>
          <div role="group" aria-label={`Potrivit ${counts.potrivit} sesiuni`}>
            <span className="block text-xs text-ink3">Potrivit</span>
            <span
              className="block text-lg font-bold font-mono text-ink"
              data-testid="count-potrivit"
            >
              {counts.potrivit}
            </span>
          </div>
          <div role="group" aria-label={`Greu ${counts.greu} sesiuni`}>
            <span className="block text-xs text-ink3">Greu</span>
            <span
              className="block text-lg font-bold font-mono text-brick"
              data-testid="count-greu"
            >
              {counts.greu}
            </span>
          </div>
        </div>

        <p
          className="text-xs text-ink3 mt-3 leading-relaxed text-center"
          data-testid="ratings-footer"
        >
          Coach-ul foloseste evaluarile tale ca sa ajusteze intensitatea.{' '}
          <b>{counts.total} sesiuni</b> in ultimele 90 zile.
        </p>
      </div>
    </section>
  );
}
