// ══ PROGRES (RN port) — tab root '/app/progres' ══════════════════════════
// RN twin of src/react/routes/screens/progres/Progres.tsx. The 6-zone story
// (AZI hero / RECUPERARE body map / OBIECTIV / COMPOZITIE / ACTIUNI / TENDINTA),
// the recovery-zone gate (trainingType + recoveryGroups), the getCoachToday alert
// fetch, and the Sparkline trend feed are all kept verbatim. Markup → ScrollView/
// View/Text/Pressable + lucide-react-native icons + the shared pulse Sparkline/
// Kicker/Pill. Engine wires + store-calls + i18n keys + testIDs preserved.

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Scale, LineChart } from 'lucide-react-native';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { goto } from '../../../lib/nav';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { ProjectionStrip } from '../../../components/Progres/ProjectionStrip';
import { GoalForecastBlock } from '../../../components/Progres/GoalForecastBlock';
import { BodyFatStrip } from '../../../components/Progres/BodyFatStrip';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { useMuscleRecoveryGroups } from '../../../components/Progres/MuscleRecoveryGrid';
import { MuscleBodyMap } from '../../../components/Progres/MuscleBodyMap';
import { ObiectivCard } from '../../../components/Progres/ObiectivCard';
import { ObiectivGoalCard } from '../../../components/Progres/ObiectivGoalCard';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import { Sparkline } from '../../../components/pulse/Sparkline';
import { Kicker } from '../../../components/pulse/Kicker';
import { Pill } from '../../../components/pulse/Pill';
import { getCoachToday } from '../../../../src/react/lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../../src/react/lib/coachDirectorAggregate';
import { dark, accent } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

// Zone heading — quiet mono eyebrow over each section (11px uppercase ink3).
function ZoneHeading({ children, testID }: { children: string; testID: string }): ReactNode {
  return (
    <Text
      testID={testID}
      className="font-mono font-semibold text-ink3 uppercase"
      style={{ fontSize: 11, letterSpacing: 1.5, marginBottom: 12, marginTop: 24 }}
    >
      {children}
    </Text>
  );
}

export default function Progres(): React.JSX.Element {
  const weightLog = useProgresStore((s) => s.weightLog);

  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCoachToday().then((c) => {
      if (!cancelled) setCoach(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const lastWeight = weightLog[weightLog.length - 1];
  const alerts = coach?.alerts ?? [];
  const recoveryGroups = useMuscleRecoveryGroups();

  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  const showRecoveryZone = trainingType !== 'aerobic' && recoveryGroups.length > 0;

  const sparkData = useMemo(
    () => weightLog.map((w) => ({ day: w.date, kg: w.kg })),
    [weightLog],
  );
  const firstWeight = weightLog[0];
  const trendDelta =
    lastWeight && firstWeight && weightLog.length >= 2
      ? +(lastWeight.kg - firstWeight.kg).toFixed(1)
      : null;

  return (
    <ScrollView
      testID="progres-home"
      className="bg-paper"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
    >
      {/* Pulse header — display wordmark + italic tagline. */}
      <Text className="font-display font-bold text-ink" style={{ fontSize: 30, marginBottom: 2 }}>
        {t('tabs.progres.title')}
      </Text>
      <Text className="text-ink2" style={{ fontSize: 14, fontStyle: 'italic', marginBottom: 8 }}>
        {t('tabs.progres.subtitle')}
      </Text>

      {/* ── ZONE 1: AZI — merged "Target Today" hero. ─────────────────────── */}
      <View testID="progres-zone-azi">
        <ZoneHeading testID="progres-zone-azi-heading">{t('progres.zone.azi')}</ZoneHeading>
        <TDEEStrip />
      </View>

      {/* ── ZONE 2: RECUPERARE — anatomical muscle recovery body map. ─────── */}
      {showRecoveryZone && (
        <View testID="progres-zone-recovery">
          <ZoneHeading testID="progres-zone-recovery-heading">{t('progres.zone.recuperare')}</ZoneHeading>
          <MuscleBodyMap />
        </View>
      )}

      {/* ── ZONE 3: OBIECTIV — Target Weight + goal selector. ─────────────── */}
      <View testID="progres-zone-obiectiv">
        <ZoneHeading testID="progres-zone-obiectiv-heading">{t('progres.zone.obiectiv')}</ZoneHeading>
        <ObiectivCard />
        <ObiectivGoalCard />
      </View>

      {/* ── ZONE 4: COMPOZITIE — body-composition group. ──────────────────── */}
      <View testID="progres-zone-compozitie">
        <ZoneHeading testID="progres-zone-compozitie-heading">{t('progres.zone.compozitie')}</ZoneHeading>
        <BodyFatStrip />
        <ProjectionStrip />
        <GoalForecastBlock />
        <HeatMapWeekly />
      </View>

      {/* ── ZONE 5: ACTIUNI — alerts + log/measure CTAs. ──────────────────── */}
      <View testID="progres-zone-actiuni">
        <ZoneHeading testID="progres-zone-actiuni-heading">{t('progres.zone.actiuni')}</ZoneHeading>
        {alerts.length > 0 && (
          <Text
            testID="alerte-azi-label"
            className="text-ink2 uppercase font-semibold"
            style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 8 }}
          >
            {t('progres.alertsToday')}
          </Text>
        )}
        <AlertsBanner alerts={alerts} />
        <Pressable
          onPress={() => goto('log-weight')}
          testID="cta-log-weight"
          className="bg-brick"
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            marginBottom: 12,
            borderRadius: 14,
          }}
        >
          <Scale size={20} color={dark.onAccent} />
          <Text className="font-semibold" style={{ fontSize: 16, color: dark.onAccent }}>
            {t('progres.logWeightToday')}
          </Text>
        </Pressable>
        {lastWeight && (
          <Pressable
            onPress={() => goto('weight-timeline')}
            testID="cta-weight-timeline"
            className="bg-paper-2 border border-line-strong"
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              marginBottom: 12,
              borderRadius: 14,
            }}
          >
            <LineChart size={20} color={dark.ink} />
            <Text className="font-semibold text-ink" style={{ fontSize: 16 }}>
              {t('progres.viewWeightTrend')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* ── ZONE 6: TENDINTA — weight trend Sparkline (>=2 points). ───────── */}
      {sparkData.length >= 2 && (
        <View testID="progres-zone-tendinta">
          <ZoneHeading testID="progres-zone-tendinta-heading">{t('progres.zone.tendinta')}</ZoneHeading>
          <View
            testID="progres-trend-sparkline"
            className="bg-paper-2 border border-line"
            style={{ borderRadius: 22, padding: 16, marginBottom: 16 }}
            accessibilityLabel={t('progres.weight.trendAriaLabel')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Kicker color={accent.aqua}>{t('progres.weight.trendTitle')}</Kicker>
              {trendDelta !== null && (
                <Pill color={trendDelta <= 0 ? accent.volt : accent.ember}>
                  {trendDelta > 0 ? '+' : ''}
                  {trendDelta} kg
                </Pill>
              )}
            </View>
            <Sparkline data={sparkData} color={accent.aqua} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
