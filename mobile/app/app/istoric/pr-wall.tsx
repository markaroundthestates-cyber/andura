// ══ PR WALL (RN port) — Istoric sub-screen ════════════════════════════════
// RN twin of src/react/routes/screens/istoric/PrWall.tsx. Full-screen all-time
// PR list with a 3-stat header (Total PR / this month / distinct exercises) +
// chrono-descending list. Data from getPRHistoryAll() (UNCHANGED web aggregate);
// stats computed inline identically. Back nav via SubHeader → /app/istoric.
// testIDs preserved 1:1 (pr-wall / pr-wall-back / pr-wall-stats /
// pr-wall-stat-total|month|exercises / pr-wall-list / pr-wall-row-N /
// pr-wall-empty).

import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Award, ChevronRight } from 'lucide-react-native';
import { getPRHistoryAll } from '../../../../src/react/lib/prHistoryAggregate';
import { SubHeader } from '../../../components/SubHeader';
import { dark } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

// Wave E3 i18n: months via months.short. Guard NaN/Invalid → em-dash.
function formatPrDate(ts: number): string {
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  const year = d.getFullYear();
  return t('istoric.prDate.format', { day, month, year });
}

export default function PrWall() {
  const prList = getPRHistoryAll();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthCount = prList.filter((pr) => {
    const d = new Date(pr.sessionTs);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  const distinctExercises = new Set(prList.map((pr) => pr.exerciseId)).size;

  return (
    <View testID="pr-wall" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('istoric.prWallScreen.title')}
        onBack={() => router.replace('/app/istoric')}
        testIdBack="pr-wall-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 16, lineHeight: 21 }}>
          {t('istoric.prWallScreen.description')}
        </Text>

        <View testID="pr-wall-stats" style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          <StatTile testId="pr-wall-stat-total" value={prList.length} label={t('istoric.prWallScreen.statTotal')} />
          <StatTile testId="pr-wall-stat-month" value={thisMonthCount} label={t('istoric.prWallScreen.statMonth')} />
          <StatTile testId="pr-wall-stat-exercises" value={distinctExercises} label={t('istoric.prWallScreen.statExercises')} />
        </View>

        {prList.length === 0 ? (
          <View testID="pr-wall-empty" style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
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
              <Award size={28} color={dark.brick} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink, marginBottom: 4, textAlign: 'center' }}>
              {t('istoric.prWallScreen.emptyTitle')}
            </Text>
            <Text style={{ fontSize: 14, color: dark.ink2, maxWidth: 280, textAlign: 'center' }}>
              {t('istoric.prWallScreen.emptyBody')}
            </Text>
          </View>
        ) : (
          <View testID="pr-wall-list" style={{ gap: 8 }}>
            {prList.map((pr, idx) => (
              <View
                key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                testID={`pr-wall-row-${idx}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: dark.paper2,
                  borderWidth: 1,
                  borderColor: dark.line,
                  borderRadius: 22,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: dark.line,
                    backgroundColor: dark.paper,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={20} color={dark.brick} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                    {pr.exerciseName}
                  </Text>
                  <Text className="font-mono" style={{ fontSize: 12, color: dark.ink2, marginTop: 2 }}>
                    {t('istoric.prWallScreen.rowLine', { kg: pr.kg, reps: pr.reps, date: formatPrDate(pr.sessionTs) })}
                  </Text>
                </View>
                <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({ value, label, testId }: { value: number; label: string; testId: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: dark.paper2,
        borderWidth: 1,
        borderColor: dark.line,
        borderRadius: 22,
        padding: 12,
        alignItems: 'center',
      }}
    >
      <Text testID={testId} className="font-mono" style={{ fontSize: 24, fontWeight: '700', color: dark.ink }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
