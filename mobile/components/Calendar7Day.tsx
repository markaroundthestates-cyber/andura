// ══ CALENDAR 7-DAY (RN port) — Weekly Schedule Strip Antrenor Tab ═════════
// RN twin of src/react/components/Calendar7Day.tsx. The Mon-first 7-day strip
// with locked default + edit toggle + silent save. ALL scheduleStore logic is
// kept 1:1 (toggleDay / saveWeekly / resetWeekly + the Monday auto-reset
// effect + the edit/preview tap routing). Same testIDs (calendar-7day,
// calendar-title, calendar-edit-toggle, calendar-day-N, calendar-edit-hint,
// calendar-save) + i18n keys. Training days get the brick fill; today gets the
// aqua outline. The volt glow / hover-scale micro-interactions are dropped
// (FIDELITY FLAG — design-polish wave).
//
// NOTE (wave-boundary): per the master-plan Antrenor split, Calendar7Day +
// ScheduleDayPreviewSheet belong to W3c. They are ported here in W3a because the
// Antrenor hub (this wave's index screen) renders Calendar7Day directly. The
// preview sheet is a thin W3a stub (Calendar/ScheduleDayPreviewSheet) that W3c
// replaces with the full engine-backed sheet.

import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pencil, Check } from 'lucide-react-native';
import { useScheduleStore, weekStartIso } from '../../src/react/stores/scheduleStore';
import { ScheduleDayPreviewSheet } from './Calendar/ScheduleDayPreviewSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseCard } from './pulse/PulseCard';
import { accent, dark, surface, withAlpha } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

function dayLabel(idx: number): string {
  return t(`calendar.day7.dayLabels.${idx}`);
}

export function Calendar7Day(): React.JSX.Element {
  const days = useScheduleStore((s) => s.days);
  const editMode = useScheduleStore((s) => s.editMode);
  const weekStartISO = useScheduleStore((s) => s.weekStartISO);
  const setEditMode = useScheduleStore((s) => s.setEditMode);
  const toggleDay = useScheduleStore((s) => s.toggleDay);
  const saveWeekly = useScheduleStore((s) => s.saveWeekly);
  const resetWeekly = useScheduleStore((s) => s.resetWeekly);

  const [previewDay, setPreviewDay] = useState<number | null>(null);

  useEffect(() => {
    const currentMonday = weekStartIso();
    if (currentMonday !== weekStartISO) {
      resetWeekly(currentMonday);
    }
  }, [weekStartISO, resetWeekly]);

  function handleSave(): void {
    saveWeekly();
  }

  function handleToggleEdit(): void {
    if (editMode) {
      handleSave();
    } else {
      setEditMode(true);
    }
  }

  function handleDayTap(idx: number): void {
    if (editMode) {
      toggleDay(idx);
    } else {
      setPreviewDay(idx);
    }
  }

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <>
      <PulseCard testID="calendar-7day" style={{ padding: 16, marginBottom: 16 }}>
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text
            testID="calendar-title"
            className="font-display"
            style={{ fontSize: 16, fontWeight: '700', color: dark.ink, textAlign: 'center' }}
          >
            {t('calendar.day7.title')}
          </Text>
          <Pressable
            testID="calendar-edit-toggle"
            accessibilityLabel={editMode ? t('calendar.day7.editAriaSave') : t('calendar.day7.editAriaEdit')}
            onPress={handleToggleEdit}
            style={{
              position: 'absolute',
              right: 0,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: surface.s2,
              borderWidth: 1,
              borderColor: dark.line,
            }}
          >
            {editMode ? (
              <Check size={16} color={dark.brick} />
            ) : (
              <Pencil size={16} color={dark.ink3} />
            )}
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {days.map((kind, idx) => {
            const trainingDay = kind === 'training';
            const label = dayLabel(idx);
            const isToday = idx === todayIdx;
            return (
              <Pressable
                key={idx}
                testID={`calendar-day-${idx}`}
                accessibilityLabel={`${label} - ${trainingDay ? t('calendar.day7.kindTraining') : t('calendar.day7.kindRest')}`}
                onPress={() => handleDayTap(idx)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: trainingDay ? dark.brick : surface.s2,
                  borderWidth: isToday ? 2 : 1,
                  borderColor: isToday
                    ? withAlpha(accent.aqua, 0.75)
                    : trainingDay
                      ? dark.brick
                      : dark.line,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: trainingDay ? dark.onAccent : dark.ink3,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {editMode && (
          <>
            <Text
              testID="calendar-edit-hint"
              style={{ marginTop: 12, fontSize: 12, color: dark.ink2, textAlign: 'center' }}
            >
              {t('calendar.day7.editHint')}
            </Text>
            <Pressable testID="calendar-save" onPress={handleSave} style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
              <LinearGradient
                colors={[accent.volt, accent.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>
                  {t('calendar.day7.saveCta')}
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </PulseCard>
      <ScheduleDayPreviewSheet
        open={previewDay !== null}
        dayIdx={previewDay}
        dayKind={previewDay !== null ? days[previewDay] ?? 'rest' : 'rest'}
        dayLabel={previewDay !== null ? dayLabel(previewDay) : ''}
        onClose={() => setPreviewDay(null)}
      />
    </>
  );
}
