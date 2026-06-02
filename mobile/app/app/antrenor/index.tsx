// ══ ANTRENOR HOME (RN port, route '/app/antrenor') ════════════════════════
// RN twin of src/react/routes/screens/antrenor/Antrenor.tsx. The Coach home: a
// single vertical scroll stack (ResumeSession / Reactivate / Patterns / Alerts
// / ReadinessOrb hero / PR banner / CoachToday|CoachRest / Calendar7Day /
// Both-mode aerobic / PRWall). ALL store + engine logic is kept 1:1 (the §44-C1
// inline mode derivation, the schedule-reactive getCoachToday effect, the
// showReactivate / showWorkoutCard gates, the HIGH-CODE-07 error banner). Same
// testIDs (antrenor-home, antrenor-header-date, antrenor-error-banner,
// readiness-hero, readiness-empty-microcopy) + i18n keys.
//
// Web→RN: react-router useNavigate → mobile/lib/nav goto(); <section>→ScrollView
// + <View>; the persona-N CSS wrapper class is dropped (the persona scaling was
// a CSS-var transform with no RN equivalent yet — design-polish wave).

import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useWorkoutStore, getCurrentMode } from '../../../../src/react/stores/workoutStore';
import { useCoachStore } from '../../../../src/react/stores/coachStore';
import { useScheduleStore } from '../../../../src/react/stores/scheduleStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { getCoachToday } from '../../../../src/react/lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../../src/react/lib/coachDirectorAggregate';
import { t } from '../../../../src/i18n/index.js';
import { goto } from '../../../lib/nav';
import { accent, dark, status } from '../../../lib/tokens';
import { AerobicCoach } from '../../../components/Antrenor/AerobicCoach';
import { BothModeAerobicCard } from '../../../components/Antrenor/BothModeAerobicCard';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { CoachRestCard } from '../../../components/Antrenor/CoachRestCard';
import { ReadinessVerdict } from '../../../components/Antrenor/ReadinessVerdict';
import { PRNotificationBanner } from '../../../components/Antrenor/PRNotificationBanner';
import { PatternsBanner } from '../../../components/Antrenor/PatternsBanner';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import { PRWallRecent } from '../../../components/Antrenor/PRWallRecent';
import { Calendar7Day } from '../../../components/Calendar7Day';
import { ReadinessOrb } from '../../../components/pulse/ReadinessOrb';
import { PulseMark } from '../../../components/pulse/PulseMark';
import { Kicker } from '../../../components/pulse/Kicker';

const FOURTEEN_DAYS_MS = 14 * 86400000;

function formatHeaderDate(now: Date): string {
  if (Number.isNaN(now.getTime())) return '—';
  const weekday = t(`weekdays.full.${now.getDay()}`);
  const day = now.getDate();
  const month = t(`months.short.${now.getMonth()}`);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const sep = t('antrenor.header.dateSeparator');
  return `${weekday}, ${day} ${month} ${sep} ${hh}:${mm}`;
}

export default function Antrenor(): React.JSX.Element {
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const prHit = useWorkoutStore((s) => s.prHit);
  const resumeSession = useWorkoutStore((s) => s.resumeSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const mode = getCurrentMode({ phase, sessionStart, pausedSnapshot, lastSession, exIdx });
  const pausedSnap = mode.kind === 'paused' ? mode.snapshot : null;
  const schedContext = useCoachStore((s) => s.schedContext);
  const reactivateDismissed = useCoachStore((s) => s.reactivateDismissed);
  const dismissReactivate = useCoachStore((s) => s.dismissReactivate);
  const scheduleDays = useScheduleStore((s) => s.days);
  const scheduleEditMode = useScheduleStore((s) => s.editMode);

  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  const [coachError, setCoachError] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    getCoachToday()
      .then((c) => {
        if (!cancelled) setCoach(c);
      })
      .catch(() => {
        if (!cancelled) setCoachError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [scheduleDays, scheduleEditMode]);

  const readiness = coach?.readiness ?? null;

  const showReactivate =
    lastSession !== null &&
    Date.now() - lastSession.ts > FOURTEEN_DAYS_MS &&
    !reactivateDismissed &&
    pausedSnap === null;

  const showWorkoutCard = coach !== null ? !coach.isRestDay : schedContext === 'workout';

  const handleStart = (): void => {
    goto('energy-check');
  };

  const handleReactivateStart = (): void => {
    goto('energy-check');
  };

  if (trainingType === 'aerobic') {
    return (
      <ScrollView className="bg-paper" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <AerobicCoach />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      testID="antrenor-home"
      accessibilityLabel={t('antrenor.ariaLabel')}
      className="bg-paper"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 }}
    >
      {/* Pulse header — mono date eyebrow, display title + PulseMark, serif subtitle. */}
      <View style={{ marginBottom: 16 }}>
        <Text
          testID="antrenor-header-date"
          className="font-mono"
          style={{ fontSize: 11, letterSpacing: 0.6, color: dark.ink3 }}
        >
          {formatHeaderDate(new Date())}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink }}>
            {t('tabs.antrenor.title')}
          </Text>
          <PulseMark size={34} />
        </View>
        <Text className="font-serif" style={{ fontStyle: 'italic', fontSize: 14, color: dark.ink2, marginTop: 2 }}>
          {t('antrenor.subtitle')}
        </Text>
      </View>

      {coachError && (
        <View
          testID="antrenor-error-banner"
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            marginBottom: 16,
            backgroundColor: status.dangerBg,
            borderColor: status.dangerBorder,
          }}
        >
          <Text style={{ fontSize: 16, color: dark.ink }}>{t('antrenor.errorBanner')}</Text>
        </View>
      )}

      {pausedSnap && (
        <ResumeSessionCard snapshot={pausedSnap} onResume={resumeSession} onDiscard={discardSession} />
      )}

      {showReactivate && lastSession && (
        <ReactivateCard
          lastSession={lastSession}
          onStart={handleReactivateStart}
          onDismiss={dismissReactivate}
        />
      )}

      <PatternsBanner banners={coach?.patternsBanner ?? []} />
      <AlertsBanner alerts={coach?.alerts ?? []} />

      {/* Pulse readiness HERO — the orb is the always-present living hero. */}
      <View
        testID="readiness-hero"
        style={{
          backgroundColor: dark.paper2,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: 22,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          overflow: 'hidden',
        }}
      >
        <ReadinessOrb
          score={readiness ? readiness.score : null}
          label={t('stats.readiness')}
          canPR={readiness?.canPR ?? false}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Kicker color={accent.aqua}>{t('readinessVerdictWidget.ariaLabel')}</Kicker>
          {readiness ? (
            <>
              <View style={{ marginTop: 6 }}>
                <ReadinessVerdict readiness={readiness} />
              </View>
              {readiness.canPR && (
                <View
                  testID="pulse-pill"
                  style={{
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 6,
                    paddingHorizontal: 11,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: accent.volt,
                  }}
                >
                  <Zap size={12} color={dark.onAccent} fill={dark.onAccent} />
                  <Text
                    className="font-mono uppercase"
                    style={{ fontSize: 10.5, letterSpacing: 0.6, color: dark.onAccent }}
                  >
                    {t('antrenor.primedForPr')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text
              testID="readiness-empty-microcopy"
              className="font-serif"
              style={{ fontStyle: 'italic', fontSize: 14, color: dark.ink2, marginTop: 6 }}
            >
              {t('antrenor.readinessEmpty')}
            </Text>
          )}
        </View>
      </View>

      <PRNotificationBanner prHit={prHit} />

      {showWorkoutCard ? (
        <CoachTodayCard onStart={handleStart} workout={coach?.plannedWorkout ?? null} />
      ) : (
        <CoachRestCard
          onLightSession={handleStart}
          onOverride={handleStart}
          restReason={coach?.restReason ?? null}
        />
      )}

      <Calendar7Day />

      {trainingType === 'both' && <BothModeAerobicCard />}

      <PRWallRecent records={coach?.prWallRecent ?? []} />
    </ScrollView>
  );
}
