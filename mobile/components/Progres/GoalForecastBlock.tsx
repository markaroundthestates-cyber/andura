// ══ GOAL FORECAST BLOCK (RN port) — weight ETA + strength trajectory ═════
// RN twin of src/react/components/Progres/GoalForecastBlock.tsx. readGoalForecast
// async wire + the honest eta/off-track/reached + strength branches kept verbatim;
// markup → View/Text + CalendarClock/Dumbbell icons. Same testIDs + i18n keys.

import { useEffect, useState } from 'react';
import { CalendarClock, Dumbbell } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { readGoalForecast } from '../../../src/react/lib/goalForecast';
import type { GoalForecastResult } from '../../../src/react/lib/goalForecast';
import { useNutritionStore } from '../../../src/react/stores/nutritionStore';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { dark } from '../../lib/tokens';
import { t, getCurrentLocale } from '../../../src/i18n/index.js';

function fmtKg(n: number): string {
  return n.toLocaleString('ro-RO', { maximumFractionDigits: 1 }).replace(/,/g, ' ');
}

function fmtEtaDate(ms: number): string {
  const locale = getCurrentLocale() === 'ro' ? 'ro-RO' : 'en-US';
  return new Date(ms).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function GoalForecastBlock(): React.JSX.Element | null {
  const [forecast, setForecast] = useState<GoalForecastResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const dailyLog = useNutritionStore((s) => s.dailyLog);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const targetWeight = useOnboardingStore((s) => s.data.targetWeight);

  useEffect(() => {
    let cancelled = false;
    readGoalForecast(Date.now())
      .then((f) => {
        if (!cancelled) {
          setForecast(f);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setForecast(null);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dailyLog, sessionsHistory, targetWeight]);

  if (!loaded || forecast === null) return null;

  const { weightEta, strength } = forecast;
  const hasEta = weightEta !== null;
  const hasStrength = strength.length > 0;
  if (!hasEta && !hasStrength) return null;

  return (
    <View
      testID="goal-forecast"
      className="bg-paper-2 border border-line p-4 mb-4"
      style={{ borderRadius: 22 }}
      accessibilityLabel={t('bodyComp.goalForecast.strengthHeading')}
    >
      {hasEta && (
        <View testID="goal-forecast-eta" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <CalendarClock size={24} color={dark.brick} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              className="uppercase font-semibold text-ink2"
              style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
            >
              {t('bodyComp.projectionStrip.label')}
            </Text>
            {weightEta.kind === 'eta' && (
              <Text testID="goal-forecast-eta-line" className="font-semibold text-ink" style={{ fontSize: 16 }}>
                {t('bodyComp.goalForecast.etaLine', {
                  kg: fmtKg(weightEta.goalKg),
                  date: fmtEtaDate(weightEta.etaMs),
                })}
              </Text>
            )}
            {weightEta.kind === 'off-track' && (
              <Text testID="goal-forecast-offtrack" className="text-ink2" style={{ fontSize: 14 }}>
                {t('bodyComp.goalForecast.offTrack')}
              </Text>
            )}
            {weightEta.kind === 'reached' && (
              <Text testID="goal-forecast-reached" className="text-ink2" style={{ fontSize: 14 }}>
                {t('bodyComp.goalForecast.reached')}
              </Text>
            )}
          </View>
        </View>
      )}
      {hasStrength && (
        <View
          testID="goal-forecast-strength"
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 16,
            ...(hasEta
              ? {
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: dark.line,
                }
              : {}),
          }}
        >
          <Dumbbell size={24} color={dark.brick} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              className="uppercase font-semibold text-ink2"
              style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
            >
              {t('bodyComp.goalForecast.strengthHeading')}
            </Text>
            {strength.map((s) => (
              <Text
                key={s.name}
                testID="goal-forecast-strength-line"
                className="font-semibold text-ink"
                style={{ fontSize: 14 }}
              >
                {t('bodyComp.goalForecast.strengthLine', {
                  lift: s.name,
                  kg: fmtKg(s.projectedOneRm),
                  weeks: s.weeks,
                })}
              </Text>
            ))}
          </View>
        </View>
      )}
      <Text
        testID="goal-forecast-disclaimer"
        className="text-ink3"
        style={{ fontSize: 12, marginTop: 8, fontStyle: 'italic' }}
      >
        {t('bodyComp.projectionStrip.disclaimer')}
      </Text>
    </View>
  );
}
