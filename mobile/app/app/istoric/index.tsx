// ══ ISTORIC — Tab 3 of 4 (RN port) ════════════════════════════════════════
// RN twin of src/react/routes/screens/istoric/Istoric.tsx. Landing for the
// history tab: streak/sessions/records stat trio (accent-tinted, count-up),
// CalendarHeatmap, RatingsStrip90Day, a PR-wall preview ("see all" → pr-wall),
// and the session list (VirtualSessionList → FlatList) with an honest empty
// state. The store reads + aggregates (useWorkoutStore / getStreakStats /
// getPRHistoryAll) are imported UNCHANGED from the web lib. Navigation goes
// through expo-router (gotoPath for pr-wall via mobile/lib/nav; the per-session
// detail uses a direct push to /app/istoric/<originalIdx>, mirroring the web
// navigate(`/app/istoric/${originalIdx}`)). testIDs preserved 1:1.
//
// §F-istoric-08 — Romanian no-diacritics weekday/month via the i18n bundle
// (weekdays.relativeShort + months.short), format "<Weekday> · <DD> <mon>".

import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { History, Flame, Trophy, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { getPRHistoryAll, getStreakStats } from '../../../../src/react/lib/prHistoryAggregate';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../../components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../../components/Istoric/VirtualSessionList';
import { useCountUp } from '../../../lib/useCountUp';
import { Kicker } from '../../../components/pulse/Kicker';
import { gotoPath } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

// §F-istoric-08 — weekday + month labels via i18n. Guard NaN/Invalid → em-dash.
function formatDate(ts: number): string {
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const weekday = t(`weekdays.relativeShort.${d.getDay()}`);
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  return `${weekday} · ${day} ${month}`;
}

export default function Istoric() {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // Subscribe to streak via selector so the trio re-renders on change.
  useWorkoutStore((s) => s.streak);

  const sorted = [...sessionsHistory].sort((a, b) => b.ts - a.ts);
  const stats = getStreakStats();
  const prHistory = getPRHistoryAll();

  return (
    <ScrollView
      testID="istoric-home"
      style={{ flex: 1, backgroundColor: dark.paper }}
      contentContainerStyle={{ padding: 24 }}
    >
      <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink, marginBottom: 16 }}>
        {t('tabs.istoric.title')}
      </Text>

      {/* Streak stats trio */}
      <View testID="istoric-stats-grid" style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <HistStat icon={Flame} color={accent.volt} value={stats.currentStreak} label={t('istoric.landing.statDaysStreak')} testId="stats-streak" />
        <HistStat icon={History} color={accent.aqua} value={stats.totalSessions} label={t('istoric.landing.statTotalSessions')} testId="stats-total" />
        <HistStat icon={Trophy} color={accent.ember} value={stats.prCount} label={t('istoric.landing.statRecords')} testId="stats-pr" />
      </View>

      <CalendarHeatmap />

      <RatingsStrip90Day />

      {/* PR Wall preview — "see all" → pr-wall standalone screen. */}
      {prHistory.length > 0 && (
        <View testID="istoric-pr-wall" style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color={accent.ember} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
                {t('istoric.landing.recordsHeading', { n: prHistory.length })}
              </Text>
            </View>
            <Text
              testID="istoric-pr-wall-see-all"
              accessibilityRole="button"
              onPress={() => router.push(gotoPath('pr-wall') as never)}
              style={{ fontSize: 14, fontWeight: '600', color: dark.brickDark }}
            >
              {t('istoric.landing.seeAll')}
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            {prHistory.map((pr, idx) => (
              <View
                key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                testID={`pr-row-${idx}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: dark.paper2,
                  borderWidth: 1,
                  borderColor: dark.line,
                  borderRadius: 22,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink, flexShrink: 1 }}>{pr.exerciseName}</Text>
                <Text className="font-mono" style={{ fontSize: 13, color: dark.ink2 }}>
                  {t('istoric.landing.recordSummary', { kg: pr.kg, reps: pr.reps, oneRM: pr.oneRMEstimate })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginBottom: 12 }}>
        <Kicker>{t('istoric.landing.sessionsHeading')}</Kicker>
      </View>

      {sorted.length === 0 ? (
        <View testID="istoric-empty" style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backgroundColor: dark.paper2,
            }}
          >
            <History size={28} color={dark.brick} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink, marginBottom: 4, textAlign: 'center' }}>
            {t('istoric.landing.emptyTitle')}
          </Text>
          <Text style={{ fontSize: 14, color: dark.ink2, maxWidth: 280, textAlign: 'center' }}>
            {t('istoric.landing.emptyBody')}
          </Text>
        </View>
      ) : (
        <VirtualSessionList
          sorted={sorted}
          sessionsHistory={sessionsHistory}
          formatDate={formatDate}
          onSelect={(originalIdx) => router.push(`/app/istoric/${originalIdx}` as never)}
        />
      )}
    </ScrollView>
  );
}

// Pulse stat tile — accent-tinted radial wash approximated with a tinted
// surface (RN has no radial-gradient primitive without expo-linear-gradient;
// the soft tint reads on-brand) + colored icon + animated count-up + label.
function HistStat({
  icon: Icon,
  color,
  value,
  label,
  testId,
}: {
  icon: LucideIcon;
  color: string;
  value: number;
  label: string;
  testId: string;
}) {
  const display = useCountUp(value);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: dark.paper2,
        borderWidth: 1,
        borderColor: dark.line,
        borderRadius: 22,
        paddingHorizontal: 8,
        paddingVertical: 16,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Icon size={18} color={color} />
      <Text testID={testId} className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginTop: 6 }}>
        {display}
      </Text>
      <Text style={{ fontSize: 11, color: dark.ink2, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
