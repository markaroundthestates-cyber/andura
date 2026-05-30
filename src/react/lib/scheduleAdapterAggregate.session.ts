// ══ SCHEDULE ADAPTER AGGREGATE — session-transform concern ════════════════
// Hygiene split (barrel re-export, zero behavior change): the RO→EN experience
// vocabulary map + the LastSessionSummary → engine recentSessions[*] pure
// transform live here. Re-exported by scheduleAdapterAggregate.ts — the public
// API is unchanged. experienceToEngine is consumed cross-module by the compose
// concern (export added for the sibling import; NOT part of the barrel surface).

import type { LastSessionSummary } from '../stores/workoutStore';
import { MS_PER_DAY } from '../../constants.js';

// ── RO onboarding → EN engine vocabulary (CRIT C1) ─────────────────────────
// Onboarding stores experience/goal as RO strings (onboardingStore Experience
// 'incepator'|'intermediar'|'avansat'; Goal 'masa'|'slabire'|...). The engine
// cold-start guideline keys on EN buckets (beginner|intermediate|advanced /
// 'cut'). A naive RO pass silently falls to the x1.0 multiplier default — a
// real bug (avansat would get intermediate weights). Map explicitly at the
// adapter boundary so RO strings NEVER enter the engine.
const EXPERIENCE_RO_TO_EN: Readonly<Record<string, string>> = {
  incepator: 'beginner',
  intermediar: 'intermediate',
  avansat: 'advanced',
};

export function experienceToEngine(experience: unknown): string {
  if (typeof experience === 'string' && experience in EXPERIENCE_RO_TO_EN) {
    return EXPERIENCE_RO_TO_EN[experience] as string;
  }
  return 'beginner'; // conservative default (lowest start-weight multiplier)
}

// ── recentSessions engine-shape transform (SHAPE audit Gap HIGH #1) ────────
// LastSessionSummary (UI/persist shape) carries display + numeric session
// fields but NONE of the per-session signal fields engine consumers read off
// recentSessions[*]. Passing summaries raw made periodization/deload/
// energyAdjustment/goalAdaptation dual-signal logic permanently run zero-
// signal baseline (verified: mesocycle.js:93-122 isMariusDualSignalGreen reads
// .rir/.weekIdx; goalAdaptation/pushBackTiers.js:76 + templates.js:49 read
// .daysAgo/.injury; bayesianNutrition/profileTyping.js:129 +
// volumeLandmarks.js:156 read .daysAgo).
//
// toEngineSession derives ONLY fields that have an honest source in the
// summary itself (Bugatti truth + D027 §5 anti-fabrication — NU inventa fields
// care nu exista in store):
//   - daysAgo: floor((now - ts) / day) — exact from summary.ts.
//   - rir: mode per-set rating mapped usor→3 / potrivit→2 / greu→1 (matches
//     SHAPE audit table + suflet rir-matrix.js HEAVY/CHALLENGING/COMFORTABLE
//     rirMin bands). Real per-session effort signal from exercises[*].sets[*].
// energy / injury / weekIdx are NOT derived HERE: energy needs a per-session
// readiness-emoji not captured on the summary, injury lives in the pain CDL
// channel (separate write path), weekIdx needs a mesocycle anchor absent from
// the store. This pure transform stays injury-free. The Pain CDL injury signal
// IS now wired into the pipeline, but at the builder layer
// (buildUserStateForPipeline overlays `injury:true` from DB('pain-cdl')), NOT
// fabricated inside this summary→session transform. Engines treat absent fields
// as "insufficient data" → conservative baseline (no false-positive extension/
// deload). Deriving them from nothing would feed wrong signal — worse than absent.
export interface EngineSession extends LastSessionSummary {
  daysAgo: number;
  rir?: number;
  // Overlaid by buildUserStateForPipeline from the Pain CDL (goalAdaptation
  // push-back reads recentSessions[*].injury). NU set by toEngineSession.
  injury?: boolean;
  // Overlaid by buildUserStateForPipeline from the persisted energyEmoji
  // (deload isEnergyDownSustained reads recentSessions[*].energyDirection ==
  // 'DOWN'). NU set by toEngineSession (builder-layer only).
  energyDirection?: string;
  // Overlaid by buildUserStateForPipeline from the session timeline modulo 4
  // (mesocycle isMariusDualSignalGreen requires weeks 1-4 present). NU set by
  // toEngineSession (builder-layer only).
  weekIdx?: number;
}

const RATING_TO_RIR: Readonly<Record<string, number>> = {
  usor: 3,
  potrivit: 2,
  greu: 1,
};

/**
 * Derive the dominant (mode) per-set rating across a session's exercises,
 * mapped to a baseline RIR. Returns undefined when the summary carries no
 * per-set breakdown (pre-Phase-5 persisted sessions) — engines skip rir-less
 * entries rather than assume a value.
 */
function deriveSessionRir(summary: LastSessionSummary): number | undefined {
  const counts: Record<string, number> = {};
  for (const ex of summary.exercises ?? []) {
    for (const s of ex.sets) {
      counts[s.rating] = (counts[s.rating] ?? 0) + 1;
    }
  }
  let topRating: string | null = null;
  let topCount = 0;
  for (const [rating, n] of Object.entries(counts)) {
    if (n > topCount) {
      topCount = n;
      topRating = rating;
    }
  }
  if (topRating === null) return undefined;
  return RATING_TO_RIR[topRating];
}

/**
 * Pure transform: LastSessionSummary → engine recentSessions[*] shape.
 * Additive — preserves all original summary fields; layers derived signal
 * fields the engine pipeline consumes. `now` injectable for testability
 * (engines stay pure; Date read happens here at the adapter boundary).
 */
export function toEngineSession(
  summary: LastSessionSummary,
  now: number = Date.now(),
): EngineSession {
  const daysAgo = Math.max(0, Math.floor((now - summary.ts) / MS_PER_DAY));
  const rir = deriveSessionRir(summary);
  return rir === undefined
    ? { ...summary, daysAgo }
    : { ...summary, daysAgo, rir };
}
