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
import { pluralRo } from '../../lib/pluralRo';
import { useCountUp } from '../../hooks/useCountUp';
import { Kicker } from '../pulse/Kicker';
import { t, getCurrentLocale } from '../../../i18n/index.js';

// Wave E3 i18n: locale-aware session-count formatter. Under RO we preserve
// pluralRo's "de" rule (1 sesiune / 2 sesiuni / 20 de sesiuni). Under EN we
// pick the singular/plural form via the istoric.ratingsStrip.sessions_*
// keys with the {n} interpolation.
function formatSessionsCount(n: number): string {
  if (getCurrentLocale() === 'ro') {
    return pluralRo(n, 'sesiune', 'sesiuni');
  }
  return n === 1
    ? t('istoric.ratingsStrip.sessions_one', { n })
    : t('istoric.ratingsStrip.sessions_other', { n });
}

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

// Pulse reskin (GROUP E): one "feel" count column — big count-up number in the
// state token color (volt/aqua/ember) + a felt-bar scaled to the busiest count.
// Bar is decorative (aria-hidden); the number + label carry the meaning. The
// count-up snaps to final under reduced motion / in tests (useCountUp). The
// number keeps its `data-testid` so the existing assertions stay intact.
function FeltCount({
  label,
  value,
  max,
  color,
  testId,
  ariaLabel,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  testId: string;
  ariaLabel: string;
}): JSX.Element {
  const display = useCountUp(value);
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="text-center" role="group" aria-label={ariaLabel}>
      <span
        className="block font-display text-[26px] font-bold tabular-nums"
        style={{ color }}
        data-testid={testId}
      >
        {display}
      </span>
      <span className="block text-[12.5px] text-ink2 mt-0.5">{label}</span>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }} aria-hidden="true">
        <span
          className="block h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function RatingsStrip90Day(): JSX.Element {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const { weeks, counts } = computeBuckets(sessionsHistory);
  const maxCount = Math.max(counts.usor, counts.potrivit, counts.greu, 1);
  // §04.051 — honest empty state. With zero sessions in the 90-day window the
  // strip used to render empty bars + 0/0/0 counts, which reads as "broken"
  // (Gigel filter). Instead show a plain "nothing yet" card — no fabricated
  // data, just the heading + a one-line nudge. Empty = no rated AND no unrated
  // session landed in the window.
  const isEmpty = counts.total === 0 && counts.unrated === 0;

  if (isEmpty) {
    return (
      <section
        data-testid="ratings-strip-90day"
        aria-label={t('istoric.ratingsStrip.ariaLabel')}
        className="mb-4"
      >
        <div className="pulse-card p-[18px] animate-card-rise delay-300" data-testid="ratings-empty">
          <div className="flex items-baseline justify-between mb-3.5">
            <Kicker color="var(--aqua)">{t('istoric.ratingsStrip.heading')}</Kicker>
            <span className="font-mono text-[10px] text-ink3">{t('istoric.ratingsStrip.window')}</span>
          </div>
          <p className="text-sm font-semibold text-ink">{t('istoric.ratingsStrip.emptyTitle')}</p>
          <p className="text-[12.5px] text-ink2 mt-1 leading-relaxed">
            {t('istoric.ratingsStrip.emptyHint')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="ratings-strip-90day"
      aria-label={t('istoric.ratingsStrip.ariaLabel')}
      className="mb-4"
    >
      <div className="pulse-card p-[18px] animate-card-rise delay-300">
        <div className="flex items-baseline justify-between mb-3.5">
          <Kicker color="var(--aqua)">{t('istoric.ratingsStrip.heading')}</Kicker>
          <span className="font-mono text-[10px] text-ink3">{t('istoric.ratingsStrip.window')}</span>
        </div>

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
                  title={rating === null ? t('istoric.ratingsStrip.unrated') : undefined}
                  aria-hidden="true"
                />
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <FeltCount
            label={t('istoric.ratingsStrip.easy')}
            value={counts.usor}
            max={maxCount}
            color="var(--volt)"
            testId="count-usor"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupEasy', { count: formatSessionsCount(counts.usor) })}
          />
          <FeltCount
            label={t('istoric.ratingsStrip.right')}
            value={counts.potrivit}
            max={maxCount}
            color="var(--aqua)"
            testId="count-potrivit"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupRight', { count: formatSessionsCount(counts.potrivit) })}
          />
          <FeltCount
            label={t('istoric.ratingsStrip.hard')}
            value={counts.greu}
            max={maxCount}
            color="var(--ember)"
            testId="count-greu"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupHard', { count: formatSessionsCount(counts.greu) })}
          />
        </div>

        <p
          className="text-[11.5px] text-ink3 mt-3.5 leading-relaxed text-center"
          data-testid="ratings-footer"
        >
          {t('istoric.ratingsStrip.footerLead')}{' '}
          <b className="text-ink2">{formatSessionsCount(counts.total)}</b> {t('istoric.ratingsStrip.footerCountSuffix')}
        </p>
      </div>
    </section>
  );
}
