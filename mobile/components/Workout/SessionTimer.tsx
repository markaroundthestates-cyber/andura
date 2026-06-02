// ══ SESSION TIMER (RN port) — Workout header chrome ═══════════════════════
// RN twin of src/react/components/Workout/SessionTimer.tsx. Sticky header with
// workout title + Ex N/M progress + live elapsed + X close + ⋯ menu. Below the
// chrome: the optional wv2-progress block (sets + exercise counters + fill bar,
// gated on setsTotal>0). The ⋯ opens a bottom-sheet (RN Modal) with pain / skip
// / finish-early / (optional sound) / cancel rows. Memoized so the chrome
// reconciles only on its own prop changes; the per-second tick lives in the
// <SessionElapsed> leaf. testIDs kept verbatim (workout-title / -progress /
// -elapsed / -exit-trigger / -menu-trigger / -menu-sheet / -menu-{row} /
// -progress-bar / -progress-sets / -progress-ex / -progress-fill).

import { memo, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import {
  X,
  MoreHorizontal,
  AlertCircle,
  SkipForward,
  Flag,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react-native';
import { SessionElapsed } from './SessionElapsed';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface SessionTimerProps {
  exerciseName: string;
  exIdx: number; // 0-indexed
  totalExercises: number;
  sessionStart: number | null;
  onExit: () => void;
  onPain?: () => void;
  onSkipExercise?: () => void;
  onFinishEarly?: () => void;
  onToggleSound?: () => void;
  onCancelSession?: () => void;
  soundOn?: boolean;
  workoutTitle?: string;
  setsDone?: number;
  setsTotal?: number;
  exerciseCount?: number; // 1-indexed
  exerciseTotal?: number;
}

interface MenuRowProps {
  icon: React.JSX.Element;
  title: string;
  desc: string;
  onPress: () => void;
  testID: string;
  danger?: boolean;
}

function MenuRow({ icon, title, desc, onPress, testID, danger }: MenuRowProps): React.JSX.Element {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: danger ? accent.volt : dark.ink }}>{title}</Text>
        <Text style={{ fontSize: 12, color: dark.ink2 }}>{desc}</Text>
      </View>
    </Pressable>
  );
}

function SessionTimerImpl({
  exerciseName,
  exIdx,
  totalExercises,
  sessionStart,
  onExit,
  onPain,
  onSkipExercise,
  onFinishEarly,
  onToggleSound,
  onCancelSession,
  soundOn = true,
  workoutTitle,
  setsDone,
  setsTotal,
  exerciseCount,
  exerciseTotal,
}: SessionTimerProps): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  function handleAction(action?: () => void): void {
    closeMenu();
    if (action) action();
  }

  const centerLabel = workoutTitle ?? exerciseName;

  const showProgress = typeof setsTotal === 'number' && setsTotal > 0;
  const fillPct = showProgress
    ? Math.min(100, Math.max(0, Math.round(((setsDone ?? 0) / (setsTotal as number)) * 100)))
    : 0;

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: dark.paper,
          borderBottomWidth: 1,
          borderBottomColor: dark.line,
          padding: 16,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text testID="workout-title" numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
            {centerLabel}
          </Text>
          <Text testID="workout-progress" style={{ fontSize: 14, color: dark.ink2 }}>
            {t('workoutHeader.exerciseProgress', { n: exIdx + 1, total: totalExercises })}
            <SessionElapsed startedAt={sessionStart} />
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable
            testID="workout-exit-trigger"
            accessibilityRole="button"
            accessibilityLabel={t('workout.timer.exitAriaLabel')}
            onPress={onExit}
            style={{ padding: 10, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} color={dark.ink2} />
          </Pressable>
          <Pressable
            testID="workout-menu-trigger"
            accessibilityRole="button"
            accessibilityLabel={t('workout.timer.menuAriaLabel')}
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen(true)}
            style={{ padding: 10, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <MoreHorizontal size={20} color={dark.ink2} />
          </Pressable>
        </View>
      </View>

      {showProgress && (
        <View
          testID="workout-progress-bar"
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: dark.paper, borderBottomWidth: 1, borderBottomColor: dark.line }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text testID="workout-progress-sets" className="uppercase" style={{ fontSize: 11, color: dark.ink2, fontWeight: '500' }}>
              {(setsDone ?? 0) === 1 && (setsTotal as number) === 1
                ? t('workout.progress.setsLabel_one', { done: setsDone ?? 0, total: setsTotal as number })
                : t('workout.progress.setsLabel_other', { done: setsDone ?? 0, total: setsTotal as number })}
            </Text>
            <Text testID="workout-progress-ex" className="uppercase" style={{ fontSize: 11, color: dark.ink2, fontWeight: '500' }}>
              {(() => {
                const done = exerciseCount ?? exIdx + 1;
                const total = exerciseTotal ?? totalExercises;
                return done === 1 && total === 1
                  ? t('workout.progress.exercisesLabel_one', { done, total })
                  : t('workout.progress.exercisesLabel_other', { done, total });
              })()}
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: dark.paper2, borderRadius: 2, overflow: 'hidden' }}>
            <View testID="workout-progress-fill" style={{ height: '100%', backgroundColor: accent.volt, width: `${fillPct}%` }} />
          </View>
        </View>
      )}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable
          testID="workout-menu-backdrop"
          onPress={closeMenu}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        >
          <Pressable
            testID="workout-menu-sheet"
            accessibilityViewIsModal
            accessibilityLabel={t('workout.timer.menuAriaLabel')}
            onPress={() => {}}
            style={{ backgroundColor: dark.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}
          >
            <Text className="uppercase" style={{ fontSize: 12, fontWeight: '600', color: dark.ink2, marginBottom: 12, paddingHorizontal: 8 }}>
              {t('workout.timer.menuHeading')}
            </Text>

            <MenuRow
              testID="workout-menu-pain"
              icon={<AlertCircle size={20} color={dark.ink} />}
              title={t('workout.timer.actions.pain')}
              desc={t('workout.timer.actions.painDesc')}
              onPress={() => handleAction(onPain)}
            />
            <MenuRow
              testID="workout-menu-skip"
              icon={<SkipForward size={20} color={dark.ink} />}
              title={t('workout.timer.actions.skip')}
              desc={t('workout.timer.actions.skipDesc')}
              onPress={() => handleAction(onSkipExercise)}
            />
            <MenuRow
              testID="workout-menu-finish-early"
              icon={<Flag size={20} color={dark.ink} />}
              title={t('workout.timer.actions.finishEarly')}
              desc={t('workout.timer.actions.finishEarlyDesc')}
              onPress={() => handleAction(onFinishEarly)}
            />
            {onToggleSound && (
              <MenuRow
                testID="workout-menu-sound"
                icon={soundOn ? <Volume2 size={20} color={dark.ink} /> : <VolumeX size={20} color={dark.ink} />}
                title={soundOn ? t('workout.timer.actions.soundOn') : t('workout.timer.actions.soundOff')}
                desc={t('workout.timer.actions.soundDesc')}
                onPress={() => handleAction(onToggleSound)}
              />
            )}
            <MenuRow
              testID="workout-menu-cancel"
              icon={<XCircle size={20} color={accent.volt} />}
              title={t('workout.timer.actions.cancel')}
              desc={t('workout.timer.actions.cancelDesc')}
              onPress={() => handleAction(onCancelSession)}
              danger
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Perf isolation: memoized so chrome reconciles only when its own props change.
// The per-second tick is owned by <SessionElapsed>, not a SessionTimer prop.
export const SessionTimer = memo(SessionTimerImpl);
