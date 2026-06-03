// ══ WEIGHT LOG LIST (RN port) — '/app/progres/weight-log-list' ══════════
// RN twin of src/react/routes/screens/progres/WeightLogList.tsx. The reverse-
// chrono sort + locale month formatting + empty state are kept verbatim; markup
// → SubHeader + ScrollView + View/Text rows. Same testIDs + i18n keys.

import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Scale } from 'lucide-react-native';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { goto } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { dark, accent, withAlpha } from '../../../lib/tokens';
import { t, getCurrentLocale } from '../../../../src/i18n/index.js';

const MONTH_RO_SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
const MONTH_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const parts = iso.split('-');
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return iso;
  const monthIdx = Number(m) - 1;
  if (monthIdx < 0 || monthIdx > 11) return iso;
  const months = getCurrentLocale() === 'en' ? MONTH_EN_SHORT : MONTH_RO_SHORT;
  const monthLabel = months[monthIdx];
  return `${Number(d)} ${monthLabel}`;
}

export default function WeightLogList(): React.JSX.Element {
  const weightLog = useProgresStore((s) => s.weightLog);
  const sorted = [...weightLog].sort((a, b) => b.ts - a.ts);

  return (
    <View testID="weight-log-list" className="bg-paper" style={{ flex: 1 }}>
      <SubHeader
        title={t('progres.weightLogList.title')}
        onBack={() => goto('progres')}
        testIdBack="weight-log-list-back"
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-ink2" style={{ fontSize: 12, marginBottom: 16, lineHeight: 17 }}>
          {t('progres.weightLogList.intro')}
        </Text>

        {sorted.length === 0 ? (
          <View testID="weight-log-empty" style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                backgroundColor: withAlpha(dark.brick, 0.18),
              }}
            >
              <Scale size={28} color={dark.brick} />
            </View>
            <Text className="font-semibold text-ink" style={{ fontSize: 16, marginBottom: 4 }}>
              {t('progres.weightLogList.emptyTitle')}
            </Text>
            <Text className="text-ink2" style={{ fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
              {t('progres.weightLogList.emptyBody')}
            </Text>
          </View>
        ) : (
          <>
            <View className="bg-paper-2 border border-line" style={{ borderRadius: 22, overflow: 'hidden' }}>
              {sorted.map((entry, idx) => (
                <Animated.View
                  key={`${entry.date}-${entry.ts}`}
                  entering={FadeInUp.duration(340).delay(idx < 10 ? idx * 45 : 0)}
                  testID={`weight-log-row-${idx}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    ...(idx < sorted.length - 1 ? { borderBottomWidth: 1, borderColor: dark.line } : {}),
                  }}
                >
                  <Text className="font-medium text-ink" style={{ fontSize: 14 }}>
                    {formatDate(entry.date)}
                  </Text>
                  <Text
                    className="font-mono"
                    style={{ fontSize: 14, color: idx === 0 ? accent.aqua : dark.ink2 }}
                  >
                    {entry.kg.toFixed(1)} kg
                  </Text>
                </Animated.View>
              ))}
            </View>
            <Text className="text-ink3" style={{ fontSize: 11, marginTop: 14, textAlign: 'center' }}>
              {t('progres.weightLogList.distinctNote')}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
