// ══ MUSCLE RECOVERY GRID — Pulse redesign net-new zone (Big-11 ring grid) ══
// Pulse arc GROUP D: the mockup (interfata-noua/screens-tabs.jsx:87-100) adds a
// "MUSCLE RECOVERY" zone the prior Progres tab never surfaced — a grid of small
// rings, one per muscle group, colored by recovery state. The recovery engine
// already exists (muscleRecovery.getRecoveryByGroup, Big 11 canonical V1); this
// zone finally puts it on screen.
//
// DATA HONESTY (Pulse blueprint flag — "do NOT fabricate data"): the engine
// returns a DISCRETE state per group — 'recovered' | 'partial' | 'fatigued' —
// NOT a numeric percentage. The mockup ring wants a fill level. We therefore
// map the 3 ground-truth states to 3 fixed ring fills (recovered=100, partial=
// 60, fatigued=30) purely as a VISUAL encoding of the state; the readable truth
// stays the state label beneath each ring. No fake per-muscle percentage is
// invented — the ring is a glyph for the state, not a measurement claim. Colors
// follow the mockup thresholds (>=85 volt, >=60 aqua, else ember), which line
// up 1:1 with recovered/partial/fatigued.
//
// Wiring mirrors getCoachRestReason (engineWrappers): workoutStore.sessionsHistory
// → flatten to engine logs → getRecoveryByGroup(logs, painCdl). The flattener is
// module-private in engineWrappers, so we inline the same trivial reduction here
// (read-only, no engine mutation). Labels resolve locale-aware via the existing
// coachEngine.muscleGroups bucket (EN "Chest" / RO "Pieptul") with the canonical
// GROUP_LABELS_RO_BIG11 as defensive fallback — same pattern as getCoachRestReason.
//
// Token-only styling; the ring itself is the shared Pulse `Ring` primitive.

import type { JSX } from 'react';
import { useMemo } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useAerobicStore } from '../../stores/aerobicStore';
import {
  getRecoveryByGroup,
  mergeAerobicRecovery,
  GROUP_LABELS_RO_BIG11,
  type RecoveryState,
  type PainCdlEntry,
} from '../../../engine/muscleRecovery.js';
import { DB } from '../../../db.js';
import { Ring } from '../pulse/Ring';
import { t } from '../../../i18n/index.js';

// Engine state → ring fill (visual encoding of the discrete state, NOT a
// measured percentage). Aligned with the mockup color thresholds so the
// recovered/partial/fatigued split reads as volt/aqua/ember.
const STATE_FILL: Record<RecoveryState, number> = {
  recovered: 100,
  partial: 60,
  fatigued: 30,
};

// Ring color token per state (mockup parity: >=85 volt, >=60 aqua, else ember).
const STATE_COLOR: Record<RecoveryState, string> = {
  recovered: 'var(--volt)',
  partial: 'var(--aqua)',
  fatigued: 'var(--ember)',
};

const PAIN_CDL_KEY = 'pain-cdl';

// Read pain CDL the same defensive way engineWrappers does — escalates a
// group's recovery state when a recent pain region maps to it. Missing/throw
// → undefined (conservative: no escalation).
function readPainCdl(): PainCdlEntry[] | undefined {
  try {
    return (DB.get(PAIN_CDL_KEY) as PainCdlEntry[] | null) ?? undefined;
  } catch {
    return undefined;
  }
}

// Flatten persisted sessions → engine log rows. Mirrors the private
// flattenSessionsToEngineLogs in engineWrappers — the recovery engine
// (getMuscleState) filters out rows without a weight (`w`), so emit ex + ts +
// w + reps exactly like the real adapter does (NOT just ex+ts, or every group
// reads 'recovered').
//
// CORRECTNESS (#78, Daniel live bug 2026-06-08): recovery must count ONLY sets
// the user ACTUALLY PERFORMED, never prescribed/skipped ones. A performed set
// carries a real execution timestamp (logSet stamps Date.now(); PostRpe
// preserves it) AND a real load (kg > 0). A prescribed-but-not-done set — or any
// cloud-imported / malformed breakdown that lacks an execution stamp — has
// timestamp 0/absent and must NOT make a muscle glow "trained". The engine's
// exp-decay already nulls a ts=0 row to ~0, but we filter it out explicitly at
// the source so the mannequin can never report a skipped session as trained.
function flattenSessionsToLogs(
  sessions: ReadonlyArray<{
    exercises?: ReadonlyArray<{
      exerciseName: string;
      engineName?: string;
      sets: ReadonlyArray<{ kg: number; reps: number; timestamp: number }>;
    }>;
  }>,
): Array<{ ex: string; ts: number; w: number; reps: number }> {
  const logs: Array<{ ex: string; ts: number; w: number; reps: number }> = [];
  for (const session of sessions) {
    if (!session.exercises) continue;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        // Performed-only gate: a real performed set has a positive execution
        // timestamp and a real load. Skip anything missing either (prescribed /
        // skipped / malformed) so recovery never glows for a non-performed set.
        if (!(Number.isFinite(set.timestamp) && set.timestamp > 0)) continue;
        if (!(Number.isFinite(set.kg) && set.kg > 0)) continue;
        // Engine group-resolution keys on the ENGLISH canonical name; engineName
        // with display fallback for legacy breakdowns (Daniel P0 2026-06-05).
        logs.push({ ex: ex.engineName ?? ex.exerciseName, ts: set.timestamp, w: set.kg, reps: set.reps });
      }
    }
  }
  return logs;
}

// Locale-aware group label: prefer the i18n bundle (coachEngine.muscleGroups),
// fall back to the canonical RO label. Same resolution as getCoachRestReason.
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

// Shared selector — derives the per-group recovery rows from the session
// history. Exported so the Progres parent can gate the RECUPERARE zone
// heading on the SAME emptiness check the grid uses, instead of mounting a
// lone eyebrow over empty space (03.048) for a fresh T0 user.
export function useMuscleRecoveryGroups(): RecoveryGroup[] {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // Aerobic classes add a LIGHT, fast-recovery touch (cardio != resistance
  // fatigue): they ease a fresh group up to "Easing" (partial) but never drive
  // it deep "Loaded"/fatigued. mergeAerobicRecovery only raises 'recovered'
  // groups — a muscle the user lifted heavy keeps its weights-derived state.
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

export function MuscleRecoveryGrid(): JSX.Element | null {
  const groups = useMuscleRecoveryGroups();

  // No groups (engine threw / empty taxonomy) → render nothing so the zone
  // heading isn't left dangling above an empty card.
  if (groups.length === 0) return null;

  return (
    <section
      data-testid="muscle-recovery-grid"
      className="pulse-card p-4 mb-4"
      aria-label={t('progres.recovery.ariaLabel')}
    >
      <div className="grid grid-cols-4 gap-x-1.5 gap-y-3.5">
        {groups.map(({ group, label, state }) => {
          const fill = STATE_FILL[state];
          const color = STATE_COLOR[state];
          return (
            <div
              key={group}
              className="flex flex-col items-center"
              data-testid={`recovery-cell-${group}`}
              data-recovery-state={state}
            >
              {/* Ring fill is a VISUAL encoding of the discrete state, so we do
                  NOT print a number inside it (that would read as a measured %
                  the engine doesn't produce). A small state dot at the ring
                  center carries the color cue; the readable truth is the group
                  label below + the localized state line. */}
              <Ring size={52} stroke={5} pct={fill} color={color} glow={false}>
                <span
                  aria-hidden="true"
                  className="block w-2 h-2 rounded-full"
                  style={{ background: color }}
                />
              </Ring>
              <span className="text-[10.5px] text-ink font-semibold mt-1.5 text-center leading-tight">
                {label}
              </span>
              <span className="text-[9px] text-ink3 uppercase tracking-wide mt-0.5">
                {t(`progres.recovery.state.${state}`)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
