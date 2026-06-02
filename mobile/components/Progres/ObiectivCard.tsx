// ══ OBIECTIV CARD (RN port) — Target Weight + Deadline + ETA ═════════════
// RN twin of src/react/components/Progres/ObiectivCard.tsx. All compute (target
// ETA, rate-safety verdict, physiological floor clamp) + progresStore persistence
// kept verbatim; markup → View/Text + TextInput fields. Same testIDs + i18n keys.
//
// FIDELITY FLAG: the web used <input type="date"> (a native browser date picker)
// for the deadline. RN has no built-in date input, so the field is a plain
// numeric/text TextInput accepting YYYY-MM-DD (same stored format, same downstream
// consumers). A native @react-native-community/datetimepicker wheel is a
// design-polish / Daniel-gated upgrade — flagged, not blocking parity.

import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { getCurrentWeightKg } from '../../../src/react/lib/userTdee';
import { computeTargetEta, fmtKg } from '../../../src/react/lib/targetEta';
import { evaluateTargetRate, MAX_SAFE_KG_PER_WEEK } from '../../../src/react/lib/targetSafety';
import { dangerousFloorWeightKg } from '../../../src/engine/bodyComposition.js';
import { dark, accent } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function localizeEta(weeks: number): string {
  if (weeks < 8) {
    const key = weeks === 1 ? 'obiectiv.weeks_one' : 'obiectiv.weeks_other';
    return t(key, { n: weeks });
  }
  const months = Math.round(weeks / 4.345);
  const key = months === 1 ? 'obiectiv.months_one' : 'obiectiv.months_other';
  return t(key, { n: months });
}

export function ObiectivCard(): React.JSX.Element {
  const target = useProgresStore((s) => s.targetObiectiv);
  const setTarget = useProgresStore((s) => s.setTargetObiectiv);
  const height = useOnboardingStore((s) => s.data.height);
  const currentWeightKg = getCurrentWeightKg();
  const [clampedFromKg, setClampedFromKg] = useState<number | null>(null);

  const eta = computeTargetEta(target.weightKg, currentWeightKg, height ?? null);
  const rateVerdict = evaluateTargetRate(currentWeightKg, target.weightKg, target.month);

  const deadlineInputValue =
    target.month && /^\d{4}-\d{2}$/.test(target.month) ? `${target.month}-01` : target.month ?? '';

  function handleWeightChange(value: string): void {
    if (value === '') {
      setClampedFromKg(null);
      setTarget({ weightKg: null });
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setClampedFromKg(null);
      setTarget({ weightKg: null });
      return;
    }
    const floorKg = dangerousFloorWeightKg(height ?? NaN);
    if (floorKg !== null && n < floorKg) {
      setClampedFromKg(n);
      setTarget({ weightKg: floorKg });
      return;
    }
    setClampedFromKg(null);
    setTarget({ weightKg: n });
  }

  function handleDeadlineChange(value: string): void {
    setTarget({ month: value === '' ? null : value });
  }

  return (
    <View testID="obiectiv-card" style={{ marginBottom: 20 }} accessibilityLabel={t('obiectiv.heading')}>
      <View
        className="bg-paper-2 border border-line"
        style={{ borderRadius: 22, overflow: 'hidden' }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: dark.line,
          }}
        >
          <Text className="text-ink" style={{ fontSize: 14 }}>
            {t('obiectiv.targetWeightLabel')}
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            value={target.weightKg != null ? String(target.weightKg) : ''}
            onChangeText={handleWeightChange}
            testID="obiectiv-target-weight-input"
            placeholder="—"
            placeholderTextColor={dark.ink3}
            className="font-mono text-ink"
            style={{
              width: 80,
              paddingHorizontal: 10,
              paddingVertical: 6,
              textAlign: 'right',
              borderWidth: 1,
              borderColor: dark.lineStrong,
              borderRadius: 14,
              color: dark.ink,
              fontSize: 14,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text className="text-ink" style={{ fontSize: 14 }}>
            {t('obiectiv.targetMonthLabel')}
          </Text>
          <TextInput
            value={deadlineInputValue}
            onChangeText={handleDeadlineChange}
            testID="obiectiv-target-month-input"
            placeholder="YYYY-MM-DD"
            placeholderTextColor={dark.ink3}
            className="font-mono text-ink"
            style={{
              width: 144,
              paddingHorizontal: 10,
              paddingVertical: 6,
              textAlign: 'right',
              borderWidth: 1,
              borderColor: dark.lineStrong,
              borderRadius: 14,
              color: dark.ink,
              fontSize: 13,
            }}
          />
        </View>
      </View>
      {clampedFromKg !== null && (
        <Text
          testID="obiectiv-clamped-warning"
          accessibilityRole="alert"
          className="text-brick"
          style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16, fontWeight: '500' }}
        >
          {t('obiectiv.targetClampedWarning', {
            entered: fmtKg(clampedFromKg),
            floor: fmtKg(target.weightKg ?? 0),
          })}
        </Text>
      )}
      {eta?.kind === 'subhealthy' && (
        <Text
          testID="obiectiv-warning"
          accessibilityRole="alert"
          className="text-brick"
          style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16, fontWeight: '500' }}
        >
          {t('obiectiv.subhealthyWarning', { minKg: fmtKg(eta.minKg) })}
        </Text>
      )}
      {eta?.kind !== 'subhealthy' && rateVerdict?.kind === 'unsafe' && (
        <Text
          testID="obiectiv-rate-warning"
          accessibilityRole="alert"
          className="text-brick"
          style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16, fontWeight: '500' }}
        >
          {t('obiectiv.unsafeRateWarning', {
            rate: fmtKg(rateVerdict.requiredKgPerWeek),
            direction: t(
              rateVerdict.direction === 'loss'
                ? 'obiectiv.unsafeDirectionLoss'
                : 'obiectiv.unsafeDirectionGain',
            ),
            cap: String(MAX_SAFE_KG_PER_WEEK),
            safeDate: rateVerdict.safeDeadlineDate,
          })}
        </Text>
      )}
      {eta?.kind === 'at-target' && (
        <Text
          testID="obiectiv-at-target"
          style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16, fontWeight: '500', color: accent.volt }}
        >
          {t('obiectiv.atTarget')}
        </Text>
      )}
      {eta?.kind === 'eta' && (
        <Text testID="obiectiv-eta" className="text-ink3" style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16 }}>
          {t('obiectiv.etaPrefix')} {localizeEta(eta.weeks)} {t('obiectiv.etaSuffix')}
        </Text>
      )}
    </View>
  );
}
