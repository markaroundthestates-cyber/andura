// ══ SESSION PILL (RN port) — sticky resume mini-player (presentational) ════
// RN twin of src/react/components/SessionPill.tsx. The web component is a
// self-contained consumer of workoutStore + onboardingStore + engineWrappers +
// react-router — but those stores persist through src/db.js (localStorage /
// document), which is NOT yet ported to RN (that is the Wave 3 DB-adapter +
// store wiring concern). Importing them here would crash Metro at module load.
//
// API NOTE (platform-required deviation, see UI-kit FLAGS): to ship the pill
// VISUAL in the shared kit without dragging the un-ported store/engine/DB layer
// in, this RN version is PRESENTATIONAL — the screen wave (Wave 3, once stores
// run on RN) passes the live state as props and an onPress that routes to the
// workout screen. The visual, testID (session-pill), data-state semantics
// (active|paused), aria-label (t('sessionPill.ariaLabel')) and the live/paused
// label copy are 1:1 with the web. The web's zero-prop store-coupled shell will
// be re-attached on top of this once the stores are RN-ready.

import { Pressable, Text, View } from 'react-native';
import { Play, ChevronRight } from 'lucide-react-native';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

interface SessionPillProps {
  /** Live session running (active|resting) vs paused snapshot. */
  state: 'active' | 'paused';
  /** Current exercise name (active) — falls back to the generic session label. */
  exerciseName?: string;
  /** Elapsed minutes (active). */
  elapsedMin?: number;
  /** Tap → resume the workout screen (screen wave wires the route). */
  onPress: () => void;
}

export function SessionPill({ state, exerciseName, elapsedMin = 0, onPress }: SessionPillProps) {
  const active = state === 'active';
  const label = active
    ? t('sessionPill.liveLabel', {
        exercise: exerciseName ?? t('sessionPill.sessionFallback'),
        min: elapsedMin,
      })
    : t('sessionPill.ariaLabel');

  return (
    <Pressable
      testID="session-pill"
      accessibilityRole="button"
      accessibilityLabel={t('sessionPill.ariaLabel')}
      accessibilityState={{ busy: active }}
      onPress={onPress}
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
      }}
    >
      <Play size={14} color={dark.paper} />
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontSize: 14, fontWeight: '600', color: dark.paper }}
      >
        {label}
      </Text>
      <ChevronRight size={14} color={dark.paper} style={{ opacity: 0.7 }} />
    </Pressable>
  );
}
