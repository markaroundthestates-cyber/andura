// ══ AEROBIC COACH (RN port) — class-only Coach dashboard ══════════════════
// RN twin of src/react/components/Antrenor/AerobicCoach.tsx. Rendered on the
// Antrenor tab when onboarding.trainingType === 'aerobic'. ALL store logic is
// kept 1:1 (aerobicStore selectors + actions, the kcal preview, the duration
// memory, the double-log-per-day confirm, per-entry delete confirm). Exports
// ClassLogger + TodayClassList so 'both' mode (BothModeAerobicCard) reuses them.
// Same testIDs + i18n keys throughout.
//
// Web→RN: <section>/<div>→<View>, <button>→<Pressable>, <input type=number>→
// <TextInput inputMode="numeric">. The focus-restore refs (SC 2.4.3, web DOM
// focus) are dropped — RN focus management differs and the visual flow is
// preserved (FIDELITY FLAG). TDEEStrip is the W3a stub (W4 replaces). The
// animate-card-rise entrances + btn-grad shimmer are design-polish-wave items.

import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { HeartPulse, Plus, Check, Activity, Trash2 } from 'lucide-react-native';
import { Kicker } from '../pulse/Kicker';
import { Pill } from '../pulse/Pill';
import { PulseMark } from '../pulse/PulseMark';
import { PulseCard } from '../pulse/PulseCard';
import { TDEEStrip } from '../Progres/TDEEStrip';
import {
  useAerobicStore,
  countClassesThisWeek,
  computeAerobicKcal,
  aerobicSessionsForDate,
  AEROBIC_CLASS_TYPES,
  AEROBIC_MINUTES_MIN,
  AEROBIC_MINUTES_MAX,
  type AerobicClassType,
  type SubjectiveReadiness,
} from '../../../src/react/stores/aerobicStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { getCurrentWeightKg } from '../../../src/react/lib/userTdee';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SUBJECTIVE_OPTIONS: ReadonlyArray<{ value: SubjectiveReadiness; labelKey: string }> = [
  { value: 'rested', labelKey: 'antrenor.aerobic.readiness.rested' },
  { value: 'normal', labelKey: 'antrenor.aerobic.readiness.normal' },
  { value: 'tired', labelKey: 'antrenor.aerobic.readiness.tired' },
];

export function AerobicCoach(): React.JSX.Element {
  const dateISO = todayIso();
  const sessions = useAerobicStore((s) => s.sessions);
  const subjectiveByDate = useAerobicStore((s) => s.subjectiveByDate);
  const setSubjectiveReadiness = useAerobicStore((s) => s.setSubjectiveReadiness);
  const frequency = useOnboardingStore((s) => s.data.frequency);

  const [loggerOpen, setLoggerOpen] = useState(false);

  const classesThisWeek = countClassesThisWeek(sessions, new Date());
  const weeklyTarget = frequency != null ? Number(frequency) : null;
  const subjective = subjectiveByDate[dateISO] ?? null;

  const weekText =
    weeklyTarget != null
      ? t('antrenor.aerobic.weekCountTarget', { count: classesThisWeek, target: weeklyTarget })
      : t('antrenor.aerobic.weekCount', { count: classesThisWeek });

  return (
    <View
      testID="aerobic-coach"
      accessibilityLabel={t('antrenor.aerobic.ariaLabel')}
      style={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 }}
    >
      {/* Header — kicker + display title + animated mark. */}
      <View style={{ marginBottom: 16 }}>
        <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.kicker')}</Kicker>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink }}>
            {t('tabs.antrenor.title')}
          </Text>
          <PulseMark size={34} />
        </View>
        <Text className="font-serif" style={{ fontStyle: 'italic', fontSize: 14, color: dark.ink2, marginTop: 2 }}>
          {t('antrenor.aerobic.subtitle')}
        </Text>
      </View>

      {/* Classes this week. */}
      <PulseCard
        testID="aerobic-week-count"
        style={{ padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: dark.paper,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Activity size={28} color={accent.aquaDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.weekKicker')}</Kicker>
          <Text testID="aerobic-week-val" style={{ fontSize: 30, fontWeight: '700', color: dark.ink, marginTop: 4 }}>
            {weekText}
          </Text>
        </View>
      </PulseCard>

      {/* Log a class CTA + inline logger. */}
      {loggerOpen ? (
        <ClassLogger dateISO={dateISO} onDone={() => setLoggerOpen(false)} />
      ) : (
        <Pressable
          testID="aerobic-log-cta"
          onPress={() => setLoggerOpen(true)}
          style={{
            marginBottom: 16,
            backgroundColor: dark.brick,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Plus size={20} color={dark.onAccent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
            {t('antrenor.aerobic.logCta')}
          </Text>
        </Pressable>
      )}

      {/* Today's logged classes — per-entry delete. */}
      <TodayClassList dateISO={dateISO} />

      {/* Simplified SUBJECTIVE readiness — pure self-report, NO engine. */}
      <PulseCard tight testID="aerobic-readiness" style={{ padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <HeartPulse size={16} color={accent.aquaDeep} />
          <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.readinessKicker')}</Kicker>
        </View>
        <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 12 }}>
          {t('antrenor.aerobic.readinessQuestion')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SUBJECTIVE_OPTIONS.map(({ value, labelKey }) => {
            const selected = subjective === value;
            return (
              <Pressable
                key={value}
                testID={`aerobic-readiness-${value}`}
                accessibilityState={{ selected }}
                onPress={() => setSubjectiveReadiness(dateISO, value)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: selected ? dark.brick : dark.lineStrong,
                  backgroundColor: selected ? dark.paper2 : dark.paper2,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>{t(labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
        {subjective === 'tired' && (
          <Text testID="aerobic-readiness-tired-note" style={{ fontSize: 12, color: dark.ink3, marginTop: 12, lineHeight: 16 }}>
            {t('antrenor.aerobic.readinessTiredNote')}
          </Text>
        )}
      </PulseCard>

      {/* Nutrition summary — shared Target-Today panel (W4 replaces the stub). */}
      <TDEEStrip />
    </View>
  );
}

/**
 * Today's logged classes with per-entry two-tap delete. Renders nothing when no
 * class is logged today. Exported so 'both' mode reuses the same list.
 */
export function TodayClassList({ dateISO }: { dateISO: string }): React.JSX.Element | null {
  const sessions = useAerobicStore((s) => s.sessions);
  const removeSession = useAerobicStore((s) => s.removeSession);
  const [confirmTs, setConfirmTs] = useState<number | null>(null);

  const today = aerobicSessionsForDate(sessions, dateISO);
  if (today.length === 0) return null;

  return (
    <PulseCard tight testID="aerobic-today-list" style={{ padding: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Activity size={16} color={accent.aquaDeep} />
        <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.todayKicker')}</Kicker>
      </View>
      <View style={{ gap: 8 }}>
        {today.map((s) => (
          <View
            key={s.ts}
            testID={`aerobic-today-item-${s.ts}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: dark.paper2,
              borderWidth: 1,
              borderColor: dark.lineStrong,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: dark.ink }}>
              {t('antrenor.aerobic.todayItem', {
                type: t(`antrenor.aerobic.types.${s.type}`),
                minutes: s.minutes,
              })}
            </Text>
            {confirmTs === s.ts ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                  testID={`aerobic-delete-cancel-${s.ts}`}
                  onPress={() => setConfirmTs(null)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: dark.paper,
                    borderWidth: 1,
                    borderColor: dark.lineStrong,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: dark.ink }}>
                    {t('antrenor.aerobic.deleteConfirmNo')}
                  </Text>
                </Pressable>
                <Pressable
                  testID={`aerobic-delete-accept-${s.ts}`}
                  onPress={() => {
                    removeSession(s.ts);
                    setConfirmTs(null);
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: dark.brick }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: dark.paper }}>
                    {t('antrenor.aerobic.deleteConfirmYes')}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                testID={`aerobic-delete-${s.ts}`}
                accessibilityLabel={t('antrenor.aerobic.deleteAria')}
                onPress={() => setConfirmTs(s.ts)}
                style={{ padding: 8, borderRadius: 8 }}
              >
                <Trash2 size={16} color={dark.ink2} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </PulseCard>
  );
}

/**
 * Inline class logger — pick a TYPE (baked-in MET) + DURATION (editable with
 * memory). kcal computed live. Double-log-per-day guard. Exported for reuse by
 * BothModeAerobicCard ('both' mode shares the same logger).
 */
export function ClassLogger({ dateISO, onDone }: { dateISO: string; onDone: () => void }): React.JSX.Element {
  const lastDuration = useAerobicStore((s) => s.lastDuration);
  const logClass = useAerobicStore((s) => s.logClass);
  const sessions = useAerobicStore((s) => s.sessions);
  const [confirmAnother, setConfirmAnother] = useState(false);

  const [type, setType] = useState<AerobicClassType>('aerobic');
  const [minutesDraft, setMinutesDraft] = useState<string>(String(lastDuration));

  const minutes = Number(minutesDraft);
  const minutesValid =
    Number.isFinite(minutes) && minutes >= AEROBIC_MINUTES_MIN && minutes <= AEROBIC_MINUTES_MAX;
  const weightKg = getCurrentWeightKg();
  const kcalPreview = minutesValid ? computeAerobicKcal(type, weightKg, minutes) : null;

  const alreadyLoggedToday = aerobicSessionsForDate(sessions, dateISO).length > 0;

  function commit(): void {
    logClass({ date: dateISO, type, minutes, weightKg });
    onDone();
  }

  function handleSave(): void {
    if (!minutesValid) return;
    if (alreadyLoggedToday && !confirmAnother) {
      setConfirmAnother(true);
      return;
    }
    commit();
  }

  return (
    <PulseCard tight testID="aerobic-logger" style={{ padding: 16, marginBottom: 16 }}>
      <Kicker color={dark.aquaInk}>{t('antrenor.aerobic.loggerKicker')}</Kicker>

      {/* Class type picker. */}
      <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 12, marginBottom: 8 }}>
        {t('antrenor.aerobic.typeLabel')}
      </Text>
      <View style={{ gap: 8 }}>
        {AEROBIC_CLASS_TYPES.map((ct) => {
          const selected = type === ct;
          return (
            <Pressable
              key={ct}
              testID={`aerobic-type-${ct}`}
              accessibilityState={{ selected }}
              onPress={() => setType(ct)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selected ? dark.brick : dark.lineStrong,
                backgroundColor: dark.paper2,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>
                {t(`antrenor.aerobic.types.${ct}`)}
              </Text>
              {selected && <Check size={14} color={dark.brick} strokeWidth={2.6} />}
            </Pressable>
          );
        })}
      </View>

      {/* Duration (min) — editable, pre-filled from memory. */}
      <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 16, marginBottom: 4 }}>
        {t('antrenor.aerobic.durationLabel')}
      </Text>
      <TextInput
        testID="aerobic-minutes-input"
        accessibilityLabel={t('antrenor.aerobic.durationAriaLabel')}
        inputMode="numeric"
        keyboardType="numeric"
        value={minutesDraft}
        onChangeText={setMinutesDraft}
        style={{
          width: 112,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: dark.lineStrong,
          borderRadius: 12,
          backgroundColor: dark.paper,
          color: dark.ink,
          fontSize: 16,
        }}
      />

      {/* Live kcal preview. */}
      <View testID="aerobic-kcal-preview" style={{ marginTop: 12, flexDirection: 'row' }}>
        {kcalPreview != null ? (
          <Pill color={dark.aquaInk}>{t('antrenor.aerobic.kcalPreview', { kcal: kcalPreview })}</Pill>
        ) : (
          <Text style={{ fontSize: 12, color: dark.ink3 }}>{t('antrenor.aerobic.kcalUnknown')}</Text>
        )}
      </View>

      {/* Double-log-per-day confirm. */}
      {confirmAnother && (
        <View
          testID="aerobic-already-logged"
          style={{ marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.lineStrong }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
            {t('antrenor.aerobic.alreadyLoggedTitle')}
          </Text>
          <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 4 }}>
            {t('antrenor.aerobic.alreadyLoggedBody')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <Pressable
              testID="aerobic-already-logged-no"
              onPress={() => setConfirmAnother(false)}
              style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: dark.paper, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                {t('antrenor.aerobic.alreadyLoggedNo')}
              </Text>
            </Pressable>
            <Pressable
              testID="aerobic-already-logged-yes"
              onPress={commit}
              style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: dark.brick, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>
                {t('antrenor.aerobic.alreadyLoggedYes')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Pressable
          testID="aerobic-logger-cancel"
          onPress={onDone}
          style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
            {t('antrenor.aerobic.cancelCta')}
          </Text>
        </Pressable>
        <Pressable
          testID="aerobic-logger-save"
          disabled={!minutesValid}
          onPress={handleSave}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: dark.brick,
            borderRadius: 12,
            opacity: minutesValid ? 1 : 0.6,
          }}
        >
          <Check size={16} color={dark.onAccent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
            {t('antrenor.aerobic.saveCta')}
          </Text>
        </Pressable>
      </View>
    </PulseCard>
  );
}
