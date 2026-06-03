// ══ REACTIVATE CARD (RN port) — Win-Back Inactive >14 Zile ════════════════
// RN twin of src/react/components/Antrenor/ReactivateCard.tsx. Rendered when
// lastSession age > 14 days + not dismissed. Same testID (reactivate-icon) +
// i18n keys. Border uses the line-strong (warm interactive boundary) token.

import { View, Text } from 'react-native';
import { Hand } from 'lucide-react-native';
import type { LastSessionSummary } from '../../../src/react/stores/workoutStore';
import { PulseCard } from '../pulse/PulseCard';
import { PressScale } from '../Press';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  lastSession: LastSessionSummary;
  onStart: () => void;
  onDismiss: () => void;
}

export function ReactivateCard({ lastSession, onStart, onDismiss }: Props): React.JSX.Element {
  const daysAgo = Math.floor((Date.now() - lastSession.ts) / 86400000);
  return (
    <PulseCard
      style={{ padding: 16, marginBottom: 16, borderColor: dark.lineStrong }}
      accessibilityLabel={t('reactivate.title')}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Hand size={20} color={dark.brick} testID="reactivate-icon" />
        <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: dark.ink }}>
          {t('reactivate.title')}
        </Text>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 21, color: dark.ink2 }}>
        {t('reactivate.body', { days: daysAgo })}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <PressScale
          onPress={onStart}
          style={{
            flex: 1,
            backgroundColor: dark.brick,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.paper }}>
            {t('reactivate.startCta')}
          </Text>
        </PressScale>
        <PressScale
          onPress={onDismiss}
          style={{
            borderWidth: 1,
            borderColor: dark.line,
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink2 }}>
            {t('reactivate.dismissCta')}
          </Text>
        </PressScale>
      </View>
    </PulseCard>
  );
}
