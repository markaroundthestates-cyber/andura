// ══ READINESS VERDICT (RN port) — F4 Pre-Session Core Coach Value ═════════
// RN twin of src/react/components/Antrenor/ReadinessVerdict.tsx. Resolves the
// verdict label via the engine's semantic `key` (EN/RO via i18n) with the
// engine RO label fallback. Returns null when readiness is null. Same
// accessibilityLabel (readinessVerdictWidget.ariaLabel). readiness.color is an
// engine-supplied accent — mapped from its CSS-var string to a dark token.

import { View, Text } from 'react-native';
import type { ReadinessOutput } from '../../../src/react/lib/engineWrappers';
import { dark, varColor } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  readiness: ReadinessOutput | null;
}

export function ReadinessVerdict({ readiness }: Props): React.JSX.Element | null {
  if (!readiness) return null;
  const i18nLabelKey = readiness.key
    ? `coachEngine.readiness.labels.${readiness.key}`
    : null;
  const resolvedLabel = i18nLabelKey
    ? (() => {
        const v = t(i18nLabelKey);
        return v && v !== i18nLabelKey ? v : readiness.label;
      })()
    : readiness.label;
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('readinessVerdictWidget.ariaLabel')}
    >
      <Text
        className="font-display"
        style={{ fontSize: 18, fontWeight: '700', color: varColor(readiness.color) }}
      >
        {resolvedLabel}
      </Text>
      <Text style={{ fontSize: 14, color: dark.ink2 }}>
        ({readiness.score}/100
        {readiness.canPR ? t('coachEngine.readiness.canPrSuffix') : ''})
      </Text>
    </View>
  );
}
