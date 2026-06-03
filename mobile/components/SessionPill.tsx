// ══ SESSION PILL (RN port) — sticky resume mini-player (store-connected) ════
// RN twin of src/react/components/SessionPill.tsx — store-coupled shell. Now
// that the Zustand stores persist through src/storage/kv (kv.native.js → MMKV
// on device, kv.web.js → localStorage on Expo web), this RN version reads the
// SAME stores + engineWrappers as the web original, with NO API surface required
// from the caller. Behavior, testID (session-pill), data-state semantics
// (active|paused via accessibilityState.busy), aria-label
// (t('sessionPill.ariaLabel')) and the live/paused label copy are 1:1 with web.
//
// Platform deltas vs web (only the framework edges differ — logic is identical):
//   - Routing: expo-router `usePathname()` + `router.push` instead of
//     react-router `useLocation`/`useNavigate`. Path strings come from the SAME
//     shared `gotoPath` (mobile/lib/nav re-exports it), so the route guards
//     (workout / post-rpe / post-summary) match the web byte-for-byte.
//   - Visual: RN primitives (Pressable/Text/View + lucide-react-native), the
//     W2b ported pill chrome. NativeWind `bg-brick` + token colors mirror the
//     web `.session-pill` brick background.
//
// An optional `onPress` override is accepted for tests/embeds; default taps
// route to the workout screen (the web's self-contained behavior).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics
//   - DECISIONS.md §D103 RN + Expo port

import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Play, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { gotoPath } from '../lib/nav';
import { useWorkoutStore, getCurrentMode } from '../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../src/react/stores/onboardingStore';
import { getTodayWorkout } from '../../src/react/lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../../src/react/lib/engineWrappers';
import { t } from '../../src/i18n/index.js';

const WORKOUT_PATH = gotoPath('workout');
// The pill is a "resume your session" affordance for the TABS — it must not show
// on the workout-completion flow screens (PostRpe / PostSummary), which carry
// their own sticky Continue/Save CTA the pill would overlap. Mirrors web guard.
const POST_RPE_PATH = gotoPath('post-rpe');
const POST_SUMMARY_PATH = gotoPath('post-summary');

interface SessionPillProps {
  /** Optional tap override (tests / embeds). Default routes to the workout screen. */
  onPress?: () => void;
}

export function SessionPill({ onPress }: SessionPillProps = {}): React.JSX.Element | null {
  const { colors } = useTheme();
  const pathname = usePathname();
  // §44-C1 — subscribe to primitive fields (stable refs) then derive the tagged
  // mode in render body; calling getCurrentMode at selector level returns a new
  // object identity each render → infinite re-render loop (same as web).
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  // Aerobic mode-gate — a PURE aerobic user must never see the gym resume pill.
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  const mode = getCurrentMode({
    phase,
    sessionStart,
    pausedSnapshot,
    lastSession,
    exIdx,
  });

  const [elapsedMin, setElapsedMin] = useState(0);
  const [planned, setPlanned] = useState<PlannedWorkoutOutput | null>(null);

  // Live elapsed update 1Hz when mode=active|resting (live session).
  const liveSessionStart =
    mode.kind === 'active' || mode.kind === 'resting' ? mode.sessionStart : null;
  useEffect(() => {
    if (liveSessionStart === null) {
      setElapsedMin(0);
      return;
    }
    const update = (): void => {
      setElapsedMin(Math.floor((Date.now() - liveSessionStart) / 60000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [liveSessionStart]);

  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((p) => {
      if (!cancelled) setPlanned(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Aerobic mode-gate — never surface the gym resume pill for a pure aerobic user.
  if (trainingType === 'aerobic') return null;

  // Anti-duplicate + completion-flow route guard (no pill on workout, post-rpe,
  // post-summary — the latter two own a sticky CTA the pill would overlap).
  if (
    pathname === WORKOUT_PATH ||
    pathname === POST_RPE_PATH ||
    pathname === POST_SUMMARY_PATH
  ) {
    return null;
  }

  // §44-C1 exhaustive switch on tagged mode — render only for active/resting
  // (live session pill) or paused (resume hatch). idle + finished → null.
  let active = false;
  let paused = false;
  switch (mode.kind) {
    case 'active':
    case 'resting':
      active = true;
      break;
    case 'paused':
      paused = true;
      break;
    case 'idle':
    case 'finished':
      break;
    default: {
      const _exhaustive: never = mode;
      void _exhaustive;
    }
  }

  if (!active && !paused) return null;

  // Derive current exercise name from the planned aggregate; fall back to the
  // generic "Session" label when the engine returns null or is still loading.
  const currentExerciseName =
    planned?.exercises[Math.min(exIdx, (planned?.exercises.length ?? 1) - 1)]?.name ??
    t('sessionPill.sessionFallback');

  const label = paused
    ? t('sessionPill.ariaLabel')
    : t('sessionPill.liveLabel', { exercise: currentExerciseName, min: elapsedMin });

  function handleTap(): void {
    if (onPress) {
      onPress();
      return;
    }
    router.push(WORKOUT_PATH as never);
  }

  return (
    <Pressable
      testID="session-pill"
      accessibilityRole="button"
      accessibilityLabel={t('sessionPill.ariaLabel')}
      accessibilityState={{ busy: active }}
      onPress={handleTap}
      className="bg-brick"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 80,
        zIndex: 55,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.brick,
      }}
    >
      <Play size={14} color={colors.onAccent} />
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.onAccent }}
      >
        {label}
      </Text>
      <ChevronRight size={14} color={colors.onAccent} style={{ opacity: 0.7 }} />
    </Pressable>
  );
}
