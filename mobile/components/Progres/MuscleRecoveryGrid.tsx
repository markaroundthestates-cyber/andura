// ══ MUSCLE RECOVERY GRID (RN port) — Big-11 ring grid ═════════════════════
// RN twin of src/react/components/Progres/MuscleRecoveryGrid.tsx. The data hook
// useMuscleRecoveryGroups is the SHARED selector the Progres screen + MuscleBodyMap
// gate on — its engine wiring (flatten sessions → getRecoveryByGroup → merge
// aerobic) + DB pain-cdl read are kept verbatim from the web (pure logic, RN-safe
// via the kv-backed DB shim). Only the markup is rewritten View/Text + the shared
// pulse Ring primitive. Same testIDs + state→fill/color encoding + i18n keys.

import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { useAerobicStore } from '../../../src/react/stores/aerobicStore';
import {
  getRecoveryByGroup,
  mergeAerobicRecovery,
  GROUP_LABELS_RO_BIG11,
  type RecoveryState,
  type PainCdlEntry,
} from '../../../src/engine/muscleRecovery.js';
import { DB } from '../../../src/db.js';
import { Ring } from '../pulse/Ring';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

// Engine state → ring fill (visual encoding of the discrete state, NOT a measured
// percentage). Aligned with the mockup color thresholds (volt/aqua/ember).
const STATE_FILL: Record<RecoveryState, number> = {
  recovered: 100,
  partial: 60,
  fatigued: 30,
};

// Ring color token per state. The web used CSS vars (--volt/--aqua/--ember); RN
// resolves them statically from the Pulse token table.
const STATE_COLOR: Record<RecoveryState, string> = {
  recovered: dark.olive, //  --volt
  partial: dark.aquaInk, //  --aqua
  fatigued: dark.emberInk, // --ember
};

const PAIN_CDL_KEY = 'pain-cdl';

function readPainCdl(): PainCdlEntry[] | undefined {
  try {
    return (DB.get(PAIN_CDL_KEY) as PainCdlEntry[] | null) ?? undefined;
  } catch {
    return undefined;
  }
}

function flattenSessionsToLogs(
  sessions: ReadonlyArray<{
    exercises?: ReadonlyArray<{
      exerciseName: string;
      sets: ReadonlyArray<{ kg: number; reps: number; timestamp: number }>;
    }>;
  }>,
): Array<{ ex: string; ts: number; w: number; reps: number }> {
  const logs: Array<{ ex: string; ts: number; w: number; reps: number }> = [];
  for (const session of sessions) {
    if (!session.exercises) continue;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        logs.push({ ex: ex.exerciseName, ts: set.timestamp, w: set.kg, reps: set.reps });
      }
    }
  }
  return logs;
}

function groupLabel(group: string): string {
  const key = `coachEngine.muscleGroups.${group}`;
  const localized = t(key);
  if (localized && localized !== key) return localized;
  return GROUP_LABELS_RO_BIG11[group] ?? group;
}

interface RecoveryGroup {
  group: string;
  label: string;
  state: RecoveryState;
}

// Shared selector — derives the per-group recovery rows from the session history.
// Exported so the Progres parent + MuscleBodyMap gate on the SAME emptiness check.
export function useMuscleRecoveryGroups(): RecoveryGroup[] {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const aerobicSessions = useAerobicStore((s) => s.sessions);
  return useMemo(() => {
    try {
      const logs = flattenSessionsToLogs(sessionsHistory);
      const resistanceState = getRecoveryByGroup(logs, readPainCdl());
      const state = mergeAerobicRecovery(resistanceState, aerobicSessions);
      return Object.entries(state).map(([group, st]) => ({
        group,
        label: groupLabel(group),
        state: st,
      }));
    } catch {
      return [];
    }
  }, [sessionsHistory, aerobicSessions]);
}

export function MuscleRecoveryGrid(): React.JSX.Element | null {
  const groups = useMuscleRecoveryGroups();

  // No groups (engine threw / empty taxonomy) → render nothing.
  if (groups.length === 0) return null;

  return (
    <View
      testID="muscle-recovery-grid"
      className="bg-paper-2 border border-line p-4 mb-4"
      style={{ borderRadius: 22 }}
      accessibilityLabel={t('progres.recovery.ariaLabel')}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {groups.map(({ group, label, state }) => {
          const fill = STATE_FILL[state];
          const color = STATE_COLOR[state];
          return (
            <View
              key={group}
              // 4 columns: each cell is 25% wide.
              style={{ width: '25%', alignItems: 'center', marginBottom: 14, paddingHorizontal: 3 }}
              testID={`recovery-cell-${group}`}
            >
              {/* Ring fill is a VISUAL encoding of the discrete state; a small
                  state dot at the center carries the color cue; the readable
                  truth is the label + the localized state line. */}
              <Ring size={52} stroke={5} pct={fill} color={color} glow={false}>
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
                />
              </Ring>
              <Text
                className="text-ink font-semibold text-center"
                style={{ fontSize: 10.5, marginTop: 6, lineHeight: 13 }}
              >
                {label}
              </Text>
              <Text
                className="font-mono uppercase text-ink3"
                style={{ fontSize: 9, letterSpacing: 0.6, marginTop: 2 }}
              >
                {t(`progres.recovery.state.${state}`)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
