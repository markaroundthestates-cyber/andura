// ══ VIRTUAL SESSION LIST (RN port) — Istoric perf windowing ══════════════
// RN twin of src/react/components/Istoric/VirtualSessionList.tsx. The web hand-
// rolled window-scroll virtualization (spacer-based) because the page scrolled
// on `window`; RN gets native row recycling for free via FlatList, so the
// manual spacer/range math is dropped in favor of FlatList's own
// virtualization. Visible behavior is identical: reverse-chrono order, drill-
// down nav to the ORIGINAL index (sessionsHistory.indexOf — identity, collision-
// safe on duplicate ts), and per-row content (Pulse card: display title +
// PR trophy when any set isPR + rating chip derived via deriveSessionRating +
// date eyebrow + numeric meta row). Rating + PR are DERIVED from the breakdown
// (never fabricated) — legacy sessions with no breakdown show no chip/trophy.
//
// testIDs preserved: istoric-list (the FlatList), istoric-session-N (row),
// istoric-session-N-pr (trophy). The web pad-top/pad-bottom spacers are gone
// (FlatList handles offscreen virtualization), so those two testIDs no longer
// exist — they were implementation detail of the spacer approach, not content.

import { FlatList, Pressable, View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { Pill } from '../pulse/Pill';
import { deriveSessionRating } from '../../../src/react/lib/sessionRating';
import type { SessionRating } from '../../../src/react/lib/sessionRating';
import { dark, accent } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

export interface SessionRow {
  title: string;
  meta: string;
  ts: number;
  sets?: number;
  durationMin?: number;
  volumeKg?: number;
  exercises?: Array<{ sets: Array<{ rating: SessionRating; isPR?: boolean }> }>;
}

interface VirtualSessionListProps {
  sorted: SessionRow[];
  sessionsHistory: SessionRow[];
  formatDate: (ts: number) => string;
  onSelect: (originalIdx: number) => void;
}

// Rating → i18n label + Pulse color (reuses istoric.ratingsStrip.{easy,right,hard}).
function ratingChip(rating: SessionRating): { label: string; color: string } {
  if (rating === 'usor') return { label: t('istoric.ratingsStrip.easy'), color: accent.volt };
  if (rating === 'greu') return { label: t('istoric.ratingsStrip.hard'), color: accent.ember };
  return { label: t('istoric.ratingsStrip.right'), color: accent.aqua };
}

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
}) {
  const rating = deriveSessionRating(session as Parameters<typeof deriveSessionRating>[0]);
  const chip = rating ? ratingChip(rating) : null;
  const hasPR = sessionHasPR(session);
  const hasNumeric =
    session.durationMin !== undefined ||
    session.sets !== undefined ||
    session.volumeKg !== undefined;

  // Stagger only the first window of rows so deep lists don't ripple forever
  // (and offscreen FlatList rows still animate cleanly as they mount).
  const enterDelay = idx < 8 ? idx * 55 : 0;

  return (
    <Animated.View entering={FadeInUp.duration(380).delay(enterDelay)}>
      <Pressable
        testID={`istoric-session-${idx}`}
        accessibilityRole="button"
        onPress={() => onSelect(originalIdx)}
        style={({ pressed }) => ({
          backgroundColor: dark.paper2,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: 22,
          padding: 16,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              numberOfLines={1}
              className="font-display"
              style={{ fontSize: 15.5, fontWeight: '600', color: dark.ink, flexShrink: 1 }}
            >
              {session.title}
            </Text>
            {hasPR && (
              <View
                testID={`istoric-session-${idx}-pr`}
                accessibilityLabel={t('istoric.landing.prBadgeAria')}
              >
                <Trophy size={15} color={accent.ember} />
              </View>
            )}
          </View>
          <Text className="font-mono" style={{ fontSize: 11, color: dark.ink3, marginTop: 2 }}>
            {formatDate(session.ts)}
          </Text>
        </View>
        {chip ? (
          <Pill color={chip.color}>{chip.label}</Pill>
        ) : (
          <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
        )}
      </View>
      {hasNumeric ? (
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          {session.durationMin !== undefined && (
            <Text style={{ fontSize: 12, color: dark.ink2 }}>
              <Text className="font-mono" style={{ color: dark.ink, fontWeight: '700' }}>{session.durationMin}</Text>
              {' '}{t('istoric.landing.cardMinutes')}
            </Text>
          )}
          {session.sets !== undefined && (
            <Text style={{ fontSize: 12, color: dark.ink2 }}>
              <Text className="font-mono" style={{ color: dark.ink, fontWeight: '700' }}>{session.sets}</Text>
              {' '}{t('istoric.landing.cardSets')}
            </Text>
          )}
          {session.volumeKg !== undefined && (
            <Text style={{ fontSize: 12, color: dark.ink2 }}>
              <Text className="font-mono" style={{ color: dark.ink, fontWeight: '700' }}>{session.volumeKg.toLocaleString('en-US')}</Text>
              {' '}{t('istoric.landing.cardKg')}
            </Text>
          )}
        </View>
      ) : (
        <Text style={{ fontSize: 14, color: dark.ink2, marginTop: 8 }}>{session.meta}</Text>
      )}
      </Pressable>
    </Animated.View>
  );
}

export function VirtualSessionList({
  sorted,
  sessionsHistory,
  formatDate,
  onSelect,
}: VirtualSessionListProps) {
  return (
    <FlatList
      testID="istoric-list"
      data={sorted}
      scrollEnabled={false}
      keyExtractor={(session, idx) => `${session.ts}-${idx}`}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      accessibilityLabel={t('istoric.virtualList.ariaLabel')}
      renderItem={({ item, index }) => {
        // Original index in sessionsHistory for detail navigate. `sorted` holds
        // the SAME object references as sessionsHistory, so indexOf (identity)
        // resolves correctly even on duplicate ts.
        const originalIdx = sessionsHistory.indexOf(item);
        return (
          <SessionCard
            session={item}
            idx={index}
            originalIdx={originalIdx}
            formatDate={formatDate}
            onSelect={onSelect}
          />
        );
      }}
    />
  );
}
