// ══ BMR STRIP (RN port) — "Calorii baza" Mifflin-St Jeor strip ═══════════
// RN twin of src/react/components/Progres/BMRStrip.tsx. Pure compute (Mifflin-
// St Jeor + RO sex-avg height fallback) + count-up hero kept verbatim; only the
// markup → View/Text + Flame icon + the mobile useCountUp hook. Same testIDs +
// i18n keys.
//
// NOTE: not rendered by the current Progres screen (merged into TDEEStrip), but
// ported per the wave inventory for parity / future re-use.

import { Flame } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import type { Sex } from '../../../src/react/stores/onboardingStore';
import { getCurrentWeightKg } from '../../../src/react/lib/userTdee';
import { useCountUp } from '../../lib/useCountUp';
import { dark, accent } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

// Romanian population height averages — BMR fallback ONLY for pre-v3 users with
// height null. Heuristic surfaces a useful estimate vs no data.
const HEIGHT_CM_BY_SEX_AVG: Record<Sex, number> = { m: 178, f: 165 };

function computeMifflinStJeorBMR(
  sex: Sex | null,
  weightKg: number | null,
  ageYears: number | null,
  heightCm: number | null,
): number | null {
  if (sex === null || weightKg === null || ageYears === null) return null;
  if (weightKg <= 0 || ageYears <= 0) return null;
  const h = heightCm !== null && heightCm > 0 ? heightCm : HEIGHT_CM_BY_SEX_AVG[sex];
  const base = 10 * weightKg + 6.25 * h - 5 * ageYears;
  const bmr = sex === 'm' ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function BMRStrip(): React.JSX.Element {
  const sex = useOnboardingStore((s) => s.data.sex);
  const age = useOnboardingStore((s) => s.data.age);
  const height = useOnboardingStore((s) => s.data.height);
  // Subscribe to weightLog so the strip re-renders on log/edit; canonical
  // current weight via getCurrentWeightKg (latest-by-DATE, not by array index).
  useProgresStore((s) => s.weightLog);
  const weight = getCurrentWeightKg();
  const bmr = computeMifflinStJeorBMR(sex, weight, age, height);
  const bmrDisplay = useCountUp(bmr ?? 0);

  return (
    <View
      testID="bmr-strip"
      className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
      style={{ borderRadius: 14, gap: 16 }}
      accessibilityLabel={t('bodyComp.bmrStrip.ariaLabel')}
    >
      <Flame size={24} color={accent.volt} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="uppercase font-semibold text-ink2"
          style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
        >
          {t('bodyComp.bmrStrip.label')}
        </Text>
        {bmr !== null ? (
          <Text testID="bmr-value" className="font-bold text-ink font-mono" style={{ fontSize: 20 }}>
            {bmrDisplay.toLocaleString('ro-RO').replace(/,/g, ' ')}{' '}
            <Text className="font-normal text-ink2" style={{ fontSize: 14 }}>
              {t('bodyComp.bmrStrip.valueSuffix')}
            </Text>
          </Text>
        ) : (
          <Text testID="bmr-empty" className="text-ink2" style={{ fontSize: 14 }}>
            {t('bodyComp.bmrStrip.emptyHint')}
          </Text>
        )}
      </View>
    </View>
  );
}
