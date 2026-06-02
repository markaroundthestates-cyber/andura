// ══ PR WALL RECENT (RN port) — Phase 6 task_06 Antrenor home slice top 3 ══
// RN twin of src/react/components/Antrenor/PRWallRecent.tsx. Renders the top-3
// recent PR records from coachDirectorAggregate.prWallRecent. Same testIDs
// (pr-wall-recent + pr-record-N) + i18n keys.

import { View, Text } from 'react-native';
import { Trophy } from 'lucide-react-native';
import type { PRRecord } from '../../../src/react/lib/prHistoryAggregate';
import { PulseCard } from '../pulse/PulseCard';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface PRWallRecentProps {
  records: readonly PRRecord[];
}

export function PRWallRecent({ records }: PRWallRecentProps): React.JSX.Element | null {
  if (records.length === 0) return null;
  return (
    <View testID="pr-wall-recent" style={{ marginBottom: 16 }}>
      <View
        accessibilityRole="header"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}
      >
        <Trophy size={16} color={accent.volt} />
        <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: dark.ink }}>
          {t('istoric.prWall.title')}
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        {records.map((pr, idx) => (
          <PulseCard
            key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
            tight
            testID={`pr-record-${idx}`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>
              {pr.exerciseName}
            </Text>
            <Text style={{ fontSize: 14, color: dark.ink2 }}>
              {t('istoric.landing.recordSummary', {
                kg: pr.kg,
                reps: pr.reps,
                oneRM: pr.oneRMEstimate,
              })}
            </Text>
          </PulseCard>
        ))}
      </View>
    </View>
  );
}
