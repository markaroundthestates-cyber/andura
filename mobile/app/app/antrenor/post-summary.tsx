// ══ POST-SUMMARY (RN port, route '/app/antrenor/post-summary') ════════════
// RN twin of src/react/routes/screens/antrenor/PostSummary.tsx. Session closure
// summary: closure header + conditional PR banner + 4-cell stats grid + muscle
// pills + persona-gated Marius detail + streak row + Done CTA (reset + route to
// hub). ALL store reads + derivations kept 1:1 (parseMeta fallback, count-ups,
// coachPick endSession, deriveMuscleGroups, kcal estimate). testIDs verbatim.

import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Trophy, Check } from 'lucide-react-native';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { useCoachStore } from '../../../../src/react/stores/coachStore';
import { coachPick, type CoachVoiceEndSessionRating } from '../../../../src/react/lib/coachVoice';
import { gotoPath } from '../../../lib/nav';
import { t } from '../../../../src/i18n/index.js';
import { useCountUp } from '../../../lib/useCountUp';
import { ConfettiBurst } from '../../../components/ConfettiBurst';
import { Kicker } from '../../../components/pulse/Kicker';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { accent, dark, varColor, withAlpha } from '../../../lib/tokens';
import type { SessionRating } from './post-rpe';

function mapRatingToCoachKey(rating: SessionRating): CoachVoiceEndSessionRating {
  if (rating === 'usoara') return 'usor';
  if (rating === 'grea') return 'greu';
  return 'potrivit';
}

interface ParsedMeta {
  sets: number;
  dur: number;
  volume: number;
}

function parseMeta(meta: string | undefined): ParsedMeta {
  if (!meta) return { sets: 0, dur: 0, volume: 0 };
  const setsMatch = meta.match(/(\d+) (?:seturi|set)/);
  const durMatch = meta.match(/(\d+) min/);
  const volMatch = meta.match(/([\d\s]+) kg$/);
  return {
    sets: setsMatch ? Number(setsMatch[1]) : 0,
    dur: durMatch ? Number(durMatch[1]) : 0,
    volume: volMatch && volMatch[1] ? Number(volMatch[1].replace(/\s/g, '')) : 0,
  };
}

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/\./g, ' ').replace(/,/g, '.');
}

interface MuscleGroup {
  label: string;
  primary: boolean;
}

function deriveMuscleGroups(title: string | undefined): MuscleGroup[] {
  if (!title) return [];
  const lower = title.toLowerCase();
  if (lower.includes('push') || lower.includes('piept')) {
    return [
      { label: 'chest', primary: true },
      { label: 'shoulders', primary: true },
      { label: 'triceps', primary: true },
      { label: 'abs', primary: false },
    ];
  }
  if (lower.includes('pull') || lower.includes('spate')) {
    return [
      { label: 'back', primary: true },
      { label: 'biceps', primary: true },
      { label: 'forearms', primary: false },
    ];
  }
  if (lower.includes('legs') || lower.includes('picioare')) {
    return [
      { label: 'quads', primary: true },
      { label: 'hamstrings', primary: true },
      { label: 'glutes', primary: true },
      { label: 'calves', primary: false },
    ];
  }
  if (lower.includes('full') || lower.includes('total')) {
    return [{ label: 'fullBody', primary: true }];
  }
  return [];
}

interface StatCellProps {
  label: string;
  value: string;
  testID: string;
}

function StatCell({ label, value, testID }: StatCellProps): React.JSX.Element {
  return (
    <PulseCard tight testID={testID} style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>{value}</Text>
    </PulseCard>
  );
}

export default function PostSummary(): React.JSX.Element {
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const lastRating = useWorkoutStore((s) => s.lastRating);
  const streak = useWorkoutStore((s) => s.streak);
  const prHit = useWorkoutStore((s) => s.prHit);
  const prData = useWorkoutStore((s) => s.prData);
  const reset = useWorkoutStore((s) => s.reset);
  const persona = useCoachStore((s) => s.persona);

  const parsed = parseMeta(lastSession?.meta);
  const sets = lastSession?.sets ?? parsed.sets;
  const dur = lastSession?.durationMin ?? parsed.dur;
  const volume = lastSession?.volumeKg ?? parsed.volume;
  const kcal = Math.round(volume * 0.03);

  const setsDisplay = useCountUp(sets);
  const volumeDisplay = useCountUp(volume);
  const kcalDisplay = useCountUp(kcal);

  const coachKey = lastRating ? mapRatingToCoachKey(lastRating as SessionRating) : null;
  const coachLine = coachKey ? coachPick('endSession', coachKey, 0) : '';

  function handleFinish(): void {
    reset();
    router.push(gotoPath('antrenor') as never);
  }

  const muscleGroups = deriveMuscleGroups(lastSession?.title);

  return (
    <View testID="post-summary" style={{ flex: 1, backgroundColor: dark.paper }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        {/* Closure header. */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              backgroundColor: accent.volt,
              shadowColor: accent.volt,
              shadowOpacity: 0.6,
              shadowRadius: 44,
              elevation: 12,
            }}
          >
            <Check size={32} color={varColor('--on-accent')} strokeWidth={2.6} />
          </View>
          <Text testID="summary-heading" className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink, marginTop: 4, marginBottom: 4 }}>
            {t('postSummary.heading')}
          </Text>
          <Text testID="summary-title" style={{ fontSize: 16, color: dark.ink2 }}>
            {lastSession?.title ?? t('postSummary.fallbackTitle')}
          </Text>
          {coachLine ? (
            <Text testID="summary-coach-line" className="font-serif" style={{ fontSize: 16, color: dark.ink2, fontStyle: 'italic', marginTop: 8, textAlign: 'center' }}>
              {`“${coachLine}”`}
            </Text>
          ) : null}
        </View>

        {/* PR banner. */}
        {prHit && (
          <View
            testID="summary-pr-banner"
            accessibilityRole="alert"
            accessibilityLabel={t('postSummary.prBannerAriaLabel')}
            style={{
              gap: 8,
              padding: 16,
              marginBottom: 16,
              borderRadius: 12,
              backgroundColor: withAlpha(accent.ember, 0.1),
              borderWidth: 1,
              borderColor: withAlpha(accent.ember, 0.45),
            }}
          >
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: '50%', top: 0 }}>
              <ConfettiBurst />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Trophy size={24} color={accent.ember} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: accent.ember }}>{t('postSummary.prNew')}</Text>
                <Text testID="summary-pr-detail" style={{ fontSize: 14, color: dark.ink2 }}>
                  {prData
                    ? t('postSummary.prSummaryDetail', {
                        exercise: prData.exercise,
                        sign: prData.deltaKg > 0 ? '+' : '',
                        kg: prData.deltaKg,
                      })
                    : t('postSummary.prFallbackDetail', {
                        title: lastSession?.title ?? t('postSummary.fallbackTitle').toLowerCase(),
                      })}
                </Text>
              </View>
            </View>
            {prData && (
              <View testID="summary-pr-enrichment" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <Text
                  testID="summary-pr-type-label"
                  style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '600', backgroundColor: withAlpha(accent.ember, 0.18), color: accent.ember }}
                >
                  {prData.type === 'weight'
                    ? t('postSummary.prTypeLabel.weight')
                    : prData.type === 'volume'
                    ? t('postSummary.prTypeLabel.volume')
                    : t('postSummary.prTypeLabel.reps')}
                </Text>
                {prData.deltaPct !== undefined && prData.deltaPct !== 0 && (
                  <Text testID="summary-pr-delta-pct" style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '600', backgroundColor: dark.paper2, color: dark.ink }}>
                    {prData.deltaPct > 0 ? '+' : ''}{prData.deltaPct}%
                  </Text>
                )}
                {prData.oneRMEstimate !== undefined && prData.oneRMEstimate > 0 && (
                  <Text testID="summary-pr-1rm" style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '600', backgroundColor: dark.paper2, color: dark.ink }}>
                    {t('postSummary.prOneRMEstimate', { kg: prData.oneRMEstimate })}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Stats grid 4-cell (2x2). */}
        <View testID="summary-stats-grid" style={{ gap: 12, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCell label={t('postSummary.statsLabels.duration')} value={t('postSummary.statsLabels.durationValue', { min: dur })} testID="summary-duration" />
            <StatCell label={t('postSummary.statsLabels.setsLogged')} value={setsDisplay.toString()} testID="summary-sets" />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCell label={t('postSummary.statsLabels.totalVolume')} value={`${formatKg(volumeDisplay)} kg`} testID="summary-volume" />
            <StatCell label={t('postSummary.statsLabels.kcalEstimate')} value={kcalDisplay.toString()} testID="summary-kcal" />
          </View>
        </View>

        {/* Muscle group pills. */}
        {muscleGroups.length > 0 && (
          <View testID="summary-muscles" style={{ marginBottom: 24 }}>
            <View style={{ marginBottom: 12 }}>
              <Kicker>{t('postSummary.muscleGroupsHeading')}</Kicker>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {muscleGroups.map((m) => (
                <View
                  key={m.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 999 }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.primary ? accent.volt : dark.ink3 }} />
                  <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t(`postSummary.muscles.${m.label}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Marius detail (persona-gated). */}
        {persona === 'marius' && (
          <PulseCard testID="summary-marius-detail" style={{ padding: 16, marginBottom: 24 }}>
            <Text className="uppercase" style={{ fontSize: 14, fontWeight: '600', color: dark.ink2, marginBottom: 12 }}>
              {t('postSummary.mariusDetail.heading')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <View testID="marius-tonaj" style={{ minWidth: '45%' }}>
                <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 4 }}>{t('postSummary.mariusDetail.tonnage')}</Text>
                <Text className="font-mono" style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>{formatKg(volume)} kg</Text>
              </View>
              {dur > 0 && (
                <View testID="marius-densitate" style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 4 }}>{t('postSummary.mariusDetail.density')}</Text>
                  <Text className="font-mono" style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
                    {t('postSummary.mariusDetail.densityValue', { kg: Math.round(volume / dur) })}
                  </Text>
                </View>
              )}
              {prData?.oneRMEstimate !== undefined && prData.oneRMEstimate > 0 && (
                <View testID="marius-1rm" style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 4 }}>{t('postSummary.mariusDetail.oneRMLabel', { exercise: prData.exercise })}</Text>
                  <Text className="font-mono" style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
                    {prData.oneRMEstimate} kg
                    {prData.deltaKg !== 0 && (
                      <Text style={{ fontSize: 12, color: accent.volt }}> {prData.deltaKg > 0 ? '+' : ''}{prData.deltaKg}</Text>
                    )}
                  </Text>
                </View>
              )}
            </View>
          </PulseCard>
        )}

        {/* Streak row. */}
        <View testID="summary-streak" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
            {t(streak === 1 ? 'postSummary.streakLabel_one' : 'postSummary.streakLabel_other', { n: streak })}
          </Text>
          <Text style={{ fontSize: 16, color: dark.ink2 }}>{t('postSummary.streakLine')}</Text>
        </View>
      </ScrollView>

      {/* Footer CTA (pinned). */}
      <View testID="summary-finish-footer" style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, backgroundColor: dark.paper }}>
        <Pressable
          testID="summary-finish"
          accessibilityRole="button"
          onPress={handleFinish}
          style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 14 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('postSummary.finishCta')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
