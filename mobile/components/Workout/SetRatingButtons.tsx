// ══ SET RATING BUTTONS (RN port) — "how did it feel?" card ════════════════
// RN twin of src/react/components/Workout/SetRatingButtons.tsx. A "HOW DID IT
// FEEL?" Kicker over three big token-tinted buttons (Easy=volt, Right=aqua,
// Hard=ember). Single tap → onRate(rating). Rating ids stay the canonical
// engine keys (usor/potrivit/greu). The web exposed `data-rating`; RN keeps it
// reachable via testID `setrating-<rating>` + the accessible label (button text).

import { View, Text, Pressable } from 'react-native';
import { Kicker } from '../pulse/Kicker';
import { accent, dark, varColor } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

type SetRating = 'usor' | 'potrivit' | 'greu';

interface SetRatingButtonsProps {
  onRate: (rating: SetRating) => void;
}

interface RatingMeta {
  rating: SetRating;
  accent: string;
  labelKey: string;
}

const RATING_META: readonly RatingMeta[] = [
  { rating: 'usor', accent: accent.volt, labelKey: 'setRating.options.usor' },
  { rating: 'potrivit', accent: accent.aqua, labelKey: 'setRating.options.potrivit' },
  { rating: 'greu', accent: accent.ember, labelKey: 'setRating.options.greu' },
];

export function SetRatingButtons({ onRate }: SetRatingButtonsProps): React.JSX.Element {
  return (
    <View
      testID="setrating-feel-card"
      style={{ borderRadius: 22, padding: 16, marginBottom: 8, backgroundColor: varColor('--surface'), borderWidth: 1, borderColor: dark.line }}
    >
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Kicker>{t('setRating.prompt')}</Kicker>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {RATING_META.map((opt) => (
          <Pressable
            key={opt.rating}
            testID={`setrating-${opt.rating}`}
            accessibilityRole="button"
            accessibilityLabel={t(opt.labelKey)}
            onPress={() => onRate(opt.rating)}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 6,
              paddingVertical: 16,
              minHeight: 44,
              borderRadius: 16,
              backgroundColor: dark.paper,
              borderWidth: 1,
              borderColor: dark.line,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: opt.accent }} />
            <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: opt.accent }}>
              {t(opt.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
