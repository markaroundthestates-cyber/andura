// ══ RATINGS STRIP 90-DAY (RN port) — F-istoric-03 signature feature ══════
// RN twin of src/react/components/Istoric/RatingsStrip90Day.tsx. 13 week-bucket
// columns across the now-90d → now window, each session's derived rating a
// stacked colored bar, plus a 3-up "feel count" row (easy=volt / right=aqua /
// hard=ember) with an animated count-up + a felt-bar scaled to the busiest
// count, and an honest empty state. The pure `computeBuckets` helper is exported
// (and unit-tested) UNCHANGED in logic from the web — store read + ratings derive
// identical. testIDs preserved 1:1 (ratings-strip-90day / ratings-empty /
// rh-strip / rh-col-N / rh-cell-N-M / count-usor|potrivit|greu / ratings-footer).
//
// FIDELITY: the bar columns use flexDirection column-reverse → RN renders them
// bottom-anchored exactly like the web flex-col-reverse. The felt-bar width
// animates via a width transition on the web; RN settles to the final width
// (no layout-animating width here — Bugatti-acceptable, the number carries it).

import { View, Text } from 'react-native';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { deriveSessionRating } from '../../../src/react/lib/sessionRating';
import type { SessionRating } from '../../../src/react/lib/sessionRating';
import { pluralRo } from '../../../src/react/lib/pluralRo';
import { useCountUp } from '../../lib/useCountUp';
import { Kicker } from '../pulse/Kicker';
import { dark, accent } from '../../lib/tokens';
import { t, getCurrentLocale } from '../../../src/i18n/index.js';

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

type Counts = { usor: number; potrivit: number; greu: number; unrated: number; total: number };

// Bar color per rating (mirrors the web ratingBgClass tokens).
function ratingBarColor(rating: SessionRating | null): string {
  if (rating === 'usor') return accent.volt;
  if (rating === 'greu') return accent.ember;
  if (rating === 'potrivit') return dark.lineStrong;
  return dark.line; // null → unrated (distinct lighter)
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
    const colIdx = (WEEKS - 1) - weekIdx;
    const rating = deriveSessionRating(session as Parameters<typeof deriveSessionRating>[0]);
    weeks[colIdx]?.push(rating);
    if (rating === 'usor') { counts.usor++; counts.total++; }
    else if (rating === 'greu') { counts.greu++; counts.total++; }
    else if (rating === 'potrivit') { counts.potrivit++; counts.total++; }
    else counts.unrated++;
  }
  return { weeks, counts };
}

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
}) {
  const display = useCountUp(value);
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={ariaLabel}>
      <Text
        testID={testId}
        className="font-display"
        style={{ color, fontSize: 26, fontWeight: '700', textAlign: 'center' }}
      >
        {display}
      </Text>
      <Text style={{ color: dark.ink2, fontSize: 12.5, marginTop: 2, textAlign: 'center' }}>
        {label}
      </Text>
      <View
        accessibilityElementsHidden
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 999,
          width: '100%',
          backgroundColor: dark.paper,
          overflow: 'hidden',
        }}
      >
        <View style={{ height: '100%', borderRadius: 999, width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function RatingsStrip90Day() {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const { weeks, counts } = computeBuckets(sessionsHistory);
  const maxCount = Math.max(counts.usor, counts.potrivit, counts.greu, 1);
  const isEmpty = counts.total === 0 && counts.unrated === 0;

  if (isEmpty) {
    return (
      <View
        testID="ratings-strip-90day"
        accessibilityLabel={t('istoric.ratingsStrip.ariaLabel')}
        style={{ marginBottom: 16 }}
      >
        <View testID="ratings-empty" style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <Kicker color={accent.aqua}>{t('istoric.ratingsStrip.heading')}</Kicker>
            <Text className="font-mono" style={{ fontSize: 10, color: dark.ink3 }}>
              {t('istoric.ratingsStrip.window')}
            </Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
            {t('istoric.ratingsStrip.emptyTitle')}
          </Text>
          <Text style={{ fontSize: 12.5, color: dark.ink2, marginTop: 4, lineHeight: 18 }}>
            {t('istoric.ratingsStrip.emptyHint')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      testID="ratings-strip-90day"
      accessibilityLabel={t('istoric.ratingsStrip.ariaLabel')}
      style={{ marginBottom: 16 }}
    >
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <Kicker color={accent.aqua}>{t('istoric.ratingsStrip.heading')}</Kicker>
          <Text className="font-mono" style={{ fontSize: 10, color: dark.ink3 }}>
            {t('istoric.ratingsStrip.window')}
          </Text>
        </View>

        <View
          testID="rh-strip"
          style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64, marginBottom: 14 }}
        >
          {weeks.map((cells, idx) => (
            <View
              key={idx}
              testID={`rh-col-${idx}`}
              style={{ flexDirection: 'column-reverse', flex: 1, height: '100%', justifyContent: 'flex-end', gap: 2 }}
            >
              {cells.map((rating, ci) => (
                <View
                  key={ci}
                  testID={`rh-cell-${idx}-${ci}`}
                  accessibilityElementsHidden
                  style={{ height: 7, borderRadius: 2, backgroundColor: ratingBarColor(rating) }}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <FeltCount
            label={t('istoric.ratingsStrip.easy')}
            value={counts.usor}
            max={maxCount}
            color={accent.volt}
            testId="count-usor"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupEasy', { count: formatSessionsCount(counts.usor) })}
          />
          <FeltCount
            label={t('istoric.ratingsStrip.right')}
            value={counts.potrivit}
            max={maxCount}
            color={accent.aqua}
            testId="count-potrivit"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupRight', { count: formatSessionsCount(counts.potrivit) })}
          />
          <FeltCount
            label={t('istoric.ratingsStrip.hard')}
            value={counts.greu}
            max={maxCount}
            color={accent.ember}
            testId="count-greu"
            ariaLabel={t('istoric.ratingsStrip.ariaGroupHard', { count: formatSessionsCount(counts.greu) })}
          />
        </View>

        <Text
          testID="ratings-footer"
          style={{ fontSize: 11.5, color: dark.ink3, marginTop: 14, lineHeight: 17, textAlign: 'center' }}
        >
          {t('istoric.ratingsStrip.footerLead')}{' '}
          <Text style={{ color: dark.ink2, fontWeight: '700' }}>{formatSessionsCount(counts.total)}</Text>{' '}
          {t('istoric.ratingsStrip.footerCountSuffix')}
        </Text>
      </View>
    </View>
  );
}

const cardStyle = {
  backgroundColor: dark.paper2,
  borderWidth: 1,
  borderColor: dark.line,
  borderRadius: 22,
  padding: 18,
} as const;
