// ══ PR NOTIFICATION BANNER (RN port) — F11 PR Notification ════════════════
// RN twin of src/react/components/Antrenor/PRNotificationBanner.tsx. Shows the
// celebratory PR banner when workoutStore.prHit is true. Same testID semantics
// (role=status, ariaLabel = prNotification.ariaLabel). The web's volt→aqua
// gradient fill is reproduced with expo-linear-gradient. The animate-pop-in
// entrance is dropped here (FIDELITY FLAG — reanimated entrance is a motion-
// wave concern; the banner still lands on mount, just without the spring pop).

import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  prHit: boolean;
}

export function PRNotificationBanner({ prHit }: Props): React.JSX.Element | null {
  if (!prHit) return null;
  return (
    <LinearGradient
      colors={[accent.volt, accent.aqua]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('prNotification.ariaLabel')}
      style={{ borderRadius: 8, padding: 12, marginBottom: 16, alignItems: 'center' }}
    >
      <Text
        className="font-display uppercase"
        style={{ fontSize: 14, fontWeight: '700', letterSpacing: 1.2, color: dark.onAccent }}
      >
        {t('prNotification.title')}
      </Text>
      <Text style={{ fontSize: 12, marginTop: 4, opacity: 0.9, color: dark.onAccent }}>
        {t('prNotification.body')}
      </Text>
    </LinearGradient>
  );
}
