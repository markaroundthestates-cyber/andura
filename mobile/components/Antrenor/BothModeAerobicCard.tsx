// ══ BOTH-MODE AEROBIC CARD (RN port) — aerobic logging inside the gym Coach ═
// RN twin of src/react/components/Antrenor/BothModeAerobicCard.tsx. Rendered on
// the Antrenor tab when trainingType === 'both': the gym Coach stays intact and
// this card adds aerobic-class logging, reusing the SAME ClassLogger +
// TodayClassList exported by AerobicCoach (no duplication). Same testIDs
// (both-aerobic-card / -week-val / -log-cta) + i18n. The web focus-restore ref
// is dropped (RN focus model differs).

import { useState } from 'react';
import { View, Text } from 'react-native';
import { Plus, HeartPulse } from 'lucide-react-native';
import { Kicker } from '../pulse/Kicker';
import { PressScale } from '../Press';
import { PulseCard } from '../pulse/PulseCard';
import { ClassLogger, TodayClassList } from './AerobicCoach';
import { useAerobicStore, countClassesThisWeek } from '../../../src/react/stores/aerobicStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BothModeAerobicCard(): React.JSX.Element {
  const sessions = useAerobicStore((s) => s.sessions);
  const frequency = useOnboardingStore((s) => s.data.frequency);
  const [loggerOpen, setLoggerOpen] = useState(false);

  const classesThisWeek = countClassesThisWeek(sessions, new Date());
  const weeklyTarget = frequency != null ? Number(frequency) : null;
  const weekText =
    weeklyTarget != null
      ? t('antrenor.aerobic.weekCountTarget', { count: classesThisWeek, target: weeklyTarget })
      : t('antrenor.aerobic.weekCount', { count: classesThisWeek });

  return (
    <PulseCard tight testID="both-aerobic-card" style={{ padding: 16, marginVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <HeartPulse size={16} color={accent.aquaDeep} />
          <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.weekKicker')}</Kicker>
        </View>
        <Text testID="both-aerobic-week-val" style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
          {weekText}
        </Text>
      </View>

      {loggerOpen ? (
        <ClassLogger dateISO={todayIso()} onDone={() => setLoggerOpen(false)} />
      ) : (
        <PressScale
          testID="both-aerobic-log-cta"
          onPress={() => setLoggerOpen(true)}
          style={{
            marginTop: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: dark.paper2,
            borderWidth: 1,
            borderColor: dark.lineStrong,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Plus size={16} color={dark.ink} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
            {t('antrenor.aerobic.logCta')}
          </Text>
        </PressScale>
      )}

      <View style={{ marginTop: 12 }}>
        <TodayClassList dateISO={todayIso()} />
      </View>
    </PulseCard>
  );
}
