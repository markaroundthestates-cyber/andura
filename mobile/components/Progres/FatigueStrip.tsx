// ══ FATIGUE STRIP (RN port) — Progres fatigue tile ═══════════════════════
// RN twin of src/react/components/Progres/FatigueStrip.tsx. getFatigue engine
// wire + 0-100 → 0-10 display conversion + localizedFatigue label resolution
// kept verbatim; markup → View/Text + Activity icon. Same testIDs + i18n keys.
//
// NOTE: not rendered by the current Progres screen (merged into TDEEStrip /
// MuscleBodyMap), but ported per the wave inventory for parity.

import { Activity } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { getFatigue, type FatigueOutput } from '../../../src/react/lib/engineWrappers';
import { dark, accent } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function localizedFatigue(f: FatigueOutput): { label: string } {
  const k = f.key && f.key.length > 0 ? f.key : null;
  if (!k) return { label: f.label };
  const labelKey =
    k === 'INSUFFICIENT_DATA'
      ? 'coachEngine.fatigue.insufficient.label'
      : `coachEngine.fatigue.${k}.label`;
  const label = t(labelKey);
  return { label: label && label !== labelKey ? label : f.label };
}

export function FatigueStrip(): React.JSX.Element {
  const fatigue = getFatigue();
  const scoreOutOfTen = fatigue ? Math.round(fatigue.score / 10) : null;
  const localized = fatigue ? localizedFatigue(fatigue) : null;

  return (
    <View
      testID="fatigue-strip"
      className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
      style={{ borderRadius: 14, gap: 16 }}
      accessibilityLabel={t('progres.fatigue.ariaLabel')}
    >
      <Activity size={24} color={accent.aqua} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="uppercase font-semibold text-ink2"
          style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
        >
          {t('progres.fatigue.todayLabel')}
        </Text>
        {fatigue && localized ? (
          <>
            <Text className="font-bold text-ink font-mono" style={{ fontSize: 20 }}>
              {scoreOutOfTen}
              <Text className="font-normal text-ink2" style={{ fontSize: 14 }}>
                /10
              </Text>
            </Text>
            <Text testID="fatigue-sub-label" className="text-ink2" style={{ fontSize: 12, marginTop: 2 }}>
              {localized.label}
            </Text>
          </>
        ) : (
          <Text testID="fatigue-empty" className="text-ink2" style={{ fontSize: 14 }}>
            {t('progres.fatigue.emptyHint')}
          </Text>
        )}
      </View>
    </View>
  );
}
