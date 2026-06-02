// ══ BODY FAT STRIP (RN port) — bf% estimate (3-tier) ═════════════════════
// RN twin of src/react/components/Progres/BodyFatStrip.tsx. The 3-tier estimate
// (skinfold > US-Navy > Deurenberg, + manual override) + all engine + DB reads
// are kept verbatim (pure logic, RN-safe via the kv-backed DB shim). Only the
// markup → View/Text + Percent icon. Same testIDs + i18n keys.

import { Percent } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { useProgresStore, latestBodyMeasurements } from '../../../src/react/stores/progresStore';
import { estimateBF_USNavy } from '../../../src/engine/usNavyBF.js';
import { estimateBF_skinfold3 } from '../../../src/engine/skinfoldBF.js';
import { estimateBfDeurenbergCapped } from '../../../src/engine/bodyComposition.js';
import { getCurrentWeightKg } from '../../../src/react/lib/userTdee';
import { DB } from '../../../src/db.js';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

export function BodyFatStrip(): React.JSX.Element {
  const sex = useOnboardingStore((s) => s.data.sex);
  const age = useOnboardingStore((s) => s.data.age);
  const height = useOnboardingStore((s) => s.data.height);
  const bodyData = useProgresStore((s) => s.bodyData);
  const latest = latestBodyMeasurements(bodyData);
  // Subscribe to weightLog so the strip re-renders on log/edit.
  useProgresStore((s) => s.weightLog);
  const weight = getCurrentWeightKg();

  // Tier 1 (ACURAT) — US-Navy when waist+neck measured.
  let bfNavy: number | null = null;
  if (latest.waistCm != null && latest.neckCm != null) {
    const args: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number; hip_cm?: number } = {};
    if (sex) args.sex = sex;
    if (height) args.height_cm = height;
    args.neck_cm = latest.neckCm;
    args.waist_cm = latest.waistCm;
    if (latest.hipsCm != null) args.hip_cm = latest.hipsCm;
    bfNavy = estimateBF_USNavy(args);
  }

  // Tier 0.5 — skinfold J-P 3-site when all 3 caliper sites measured.
  const sfArgs: {
    sex?: string;
    age?: number;
    chest_mm?: number;
    abdomen_mm?: number;
    thigh_mm?: number;
    triceps_mm?: number;
    suprailiac_mm?: number;
  } = {};
  if (sex) sfArgs.sex = sex;
  if (age) sfArgs.age = age;
  if (latest.chestSkinfoldMm != null) sfArgs.chest_mm = latest.chestSkinfoldMm;
  if (latest.abdomenSkinfoldMm != null) sfArgs.abdomen_mm = latest.abdomenSkinfoldMm;
  if (latest.thighSkinfoldMm != null) sfArgs.thigh_mm = latest.thighSkinfoldMm;
  if (latest.tricepsSkinfoldMm != null) sfArgs.triceps_mm = latest.tricepsSkinfoldMm;
  if (latest.suprailiacSkinfoldMm != null) sfArgs.suprailiac_mm = latest.suprailiacSkinfoldMm;
  const bfSkinfold = estimateBF_skinfold3(sfArgs);

  // Tier 2 (ESTIMAT) — Deurenberg with high-BMI cap (always available post-onb).
  const { bfPct: bfDeurenberg, capped } = estimateBfDeurenbergCapped({
    weightKg: weight ?? NaN,
    heightCm: height ?? NaN,
    ageYears: age ?? NaN,
    ...(sex ? { sex } : {}),
  });
  // Manual BF% override (Cont > Profil) wins over auto calculation.
  const bfOverrideRaw = DB.get('bf-override');
  const bfOverride = bfOverrideRaw != null ? Number(bfOverrideRaw) : null;
  const hasOverride = bfOverride != null && Number.isFinite(bfOverride);
  const bfAuto = bfSkinfold ?? bfNavy ?? bfDeurenberg;
  const bf = hasOverride ? bfOverride : bfAuto;
  const isUsingDeurenberg =
    !hasOverride && bfSkinfold == null && bfNavy == null && bfDeurenberg != null;
  const sourceLabel = hasOverride
    ? t('progres.bodyFat.sourceManual')
    : bfSkinfold != null
      ? t('progres.bodyFat.sourceSkinfold')
      : bfNavy != null
        ? t('progres.bodyFat.sourceUsNavy')
        : t('progres.bodyFat.sourceEstimated');

  return (
    <View
      testID="bodyfat-strip"
      className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
      style={{ borderRadius: 22, gap: 16 }}
      accessibilityLabel={t('progres.bodyFat.ariaLabel')}
    >
      <Percent size={24} color={dark.brick} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="uppercase font-semibold text-ink2"
          style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
        >
          {t('progres.bodyFat.label')}
        </Text>
        {bf != null ? (
          <>
            <Text testID="bodyfat-value" className="font-bold text-ink font-mono" style={{ fontSize: 20 }}>
              {bf}%{' '}
              <Text testID="bodyfat-source" className="font-normal text-ink2" style={{ fontSize: 14 }}>
                {sourceLabel}
              </Text>
            </Text>
            {isUsingDeurenberg && (
              <Text testID="bodyfat-cta" className="text-ink3" style={{ fontSize: 12, marginTop: 4, lineHeight: 16 }}>
                {capped ? t('progres.bodyFat.captionApprox') : t('progres.bodyFat.captionFromBmi')}
                {t('progres.bodyFat.nudge')}
              </Text>
            )}
          </>
        ) : (
          <Text testID="bodyfat-empty" className="text-ink2" style={{ fontSize: 14 }}>
            {t('progres.bodyFat.emptyHint')}
          </Text>
        )}
      </View>
    </View>
  );
}
