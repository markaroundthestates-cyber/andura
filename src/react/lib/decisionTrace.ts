// ══ A2.1 — CONSOLIDATED HONEST DECISION TRACE (audit-grade, additive) ════════
// A structured, multi-factor record of the REAL reasons the engine produced THIS
// session's plan. It is the honest INTERNAL audit record — the foundation for a
// later "verdict + why" UX surface (A2.2 owns rendering) and the self-improvement
// / judge loop. It is NOT a post-hoc plausible story: every factor entry is DERIVED
// from a signal the compose seam ACTUALLY computed/consumed this session. If a
// factor did not fire, it is OMITTED (never fabricated) — a trace that rationalizes
// is worse than none.
//
// CONSOLIDATES the pieces that already exist (no new collection mechanism):
//   - the compose context (readiness, phase token, energy magnitude, persona time
//     cap, focus preset) — the SAME values composePlannedWorkoutToday threads into
//     the prescription;
//   - the plan's CoachAdaptation log (recovery-cut / weakness-amp / imbalance-fix /
//     deload) — the engine's own structured adaptation tokens;
//   - the per-exercise DP recReason.status (EASE BACK / HOLD / INCREASE / …) the
//     prescription already carries (F5-W0), folded into a load-decision tally;
//   - the final composed shape (sessionType + exercise count + duration).
//
// PURE + side-effect-free + cheap: a single deterministic derivation over values
// already in hand at the seam. It is INERT (no UI consumer yet) and is attached as
// an additive `decisionTrace` field on the composed output — it NEVER changes the
// exercises/sets/loads (proven byte-identical by the full-path-sim hash, which reads
// only sessionType/intensityMod/exerciseCount + per-exercise engineName|sets|reps|kg).

import type {
  PlannedExercise,
  CoachAdaptation,
  DecisionTraceEntry,
} from './engineWrappers.types';

export type { DecisionTraceEntry };

/** The compose-seam context the trace consumes — every field is a value the
 * prescription path ALREADY computed. All optional: a field that was not resolved
 * this session is simply absent, and its factor is then omitted (honesty guard). */
export interface DecisionTraceContext {
  /** live readiness score (energy-check), or null when none was logged today. */
  readinessScore?: number | null;
  /** the resolved active phase token (CUT / BULK / MAINTAIN), or null. */
  phase?: string | null;
  /** energy → volume magnitude {phase,severity}, or null when not modulating. */
  energyMagnitude?: { phase?: string; severity?: number } | null;
  /** the engine's structured adaptation log for today (tokens, never copy). */
  coachAdaptations?: ReadonlyArray<CoachAdaptation> | null;
  /** deload state — true when an ACTIVE deload modified intensity. */
  deloadActive?: boolean | null;
  /** persona-aware (fatigue-scaled, user-budget-clamped) session time cap (min). */
  timeCapMin?: number | null;
  /** the user's focus look preset id (v-taper / arms / …) — selection intent. */
  focusPreset?: string | null;
  /** the FINAL composed exercises (post readiness/energy scale + time trim). */
  exercises?: ReadonlyArray<PlannedExercise> | null;
  /** the engine day-of-week session type (PUSH / PULL / LEGS / …). */
  sessionType?: string | null;
  /** the final rest-inclusive estimated session duration (minutes). */
  estimatedDuration?: number | null;
}

// A phase worth recording is a real directional decision; MAINTAIN (×1.0) is the
// no-op default, so recording it would be noise, not a load-bearing reason. We emit
// the phase factor only for a CUT / BULK direction the session actually ran under.
const DIRECTIONAL_PHASES = new Set(['CUT', 'BULK']);

/** Human-stable summary of the DP per-exercise load decisions this session: a tally
 * of the recReason.status enums the prescription already carries (F5-W0). Returns ''
 * when no exercise carried a status (cold-start / pre-W0 fixture) → factor omitted. */
function summarizeDpDecisions(exercises: ReadonlyArray<PlannedExercise>): string {
  const counts = new Map<string, number>();
  for (const ex of exercises) {
    const status = ex?.recReason?.status;
    if (typeof status !== 'string' || status.trim() === '') continue;
    const key = status.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return '';
  // Deterministic order: highest count first, then alphabetical — stable for audit.
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([status, n]) => `${status}×${n}`);
  return parts.join(', ');
}

/** Summarize the recovery-cut adaptations (the groups the engine trained lighter
 * today because they were recently fatigued). Returns '' when none fired. */
function summarizeRecoveryCuts(adaptations: ReadonlyArray<CoachAdaptation>): string {
  const groups = adaptations
    .filter((a) => a && a.kind === 'recovery-cut' && typeof a.group === 'string')
    .map((a) => a.group as string);
  if (groups.length === 0) return '';
  const unique = [...new Set(groups)].sort();
  return `cut ${unique.join(', ')}`;
}

/** Summarize the weakness-amplification + imbalance-fix adaptations (the groups the
 * adaptive brain pushed UP today). Returns '' when none fired. */
function summarizeEmphasisShifts(adaptations: ReadonlyArray<CoachAdaptation>): string {
  const groups = adaptations
    .filter(
      (a) => a && (a.kind === 'weakness-amp' || a.kind === 'imbalance-fix') && typeof a.group === 'string',
    )
    .map((a) => a.group as string);
  if (groups.length === 0) return '';
  const unique = [...new Set(groups)].sort();
  return `boosted ${unique.join(', ')}`;
}

/**
 * Build the consolidated honest decision trace for ONE composed session.
 *
 * Pure + deterministic: same context → identical trace (no Date.now / Math.random;
 * all tallies use stable, deterministic ordering). Each factor is emitted ONLY when
 * its underlying signal actually fired — an unfired factor is ABSENT (the honesty
 * constraint), never a fabricated plausible-sounding entry. A clean session (no
 * energy-check, MAINTAIN phase, no cut/cap/deload, cold-start DP) yields a minimal
 * honest trace (just the final decision).
 *
 * @param ctx the compose-seam context (all values already computed by the path)
 * @returns the ordered factor array (load-bearing inputs first, finalDecision last)
 */
export function buildDecisionTrace(ctx: DecisionTraceContext | null | undefined): DecisionTraceEntry[] {
  const trace: DecisionTraceEntry[] = [];
  if (!ctx || typeof ctx !== 'object') return trace;

  // ── phase (directional only — CUT / BULK; MAINTAIN is the no-op default) ──
  const phaseToken =
    (typeof ctx.phase === 'string' && ctx.phase) ||
    (typeof ctx.energyMagnitude?.phase === 'string' && ctx.energyMagnitude.phase) ||
    '';
  if (phaseToken && DIRECTIONAL_PHASES.has(phaseToken)) {
    trace.push({ factor: 'phase', value: phaseToken });
  }

  // ── readiness (only when an energy-check was actually logged today) ──
  if (typeof ctx.readinessScore === 'number' && Number.isFinite(ctx.readinessScore)) {
    trace.push({ factor: 'readiness', value: ctx.readinessScore });
  }

  // ── recovery cuts (the engine trained these groups lighter — real adaptations) ──
  const adaptations = Array.isArray(ctx.coachAdaptations) ? ctx.coachAdaptations : [];
  const recoveryCut = summarizeRecoveryCuts(adaptations);
  if (recoveryCut) {
    trace.push({ factor: 'recovery', value: recoveryCut });
  }

  // ── emphasis shifts (weakness-amp / imbalance-fix — groups pushed up) ──
  const emphasis = summarizeEmphasisShifts(adaptations);
  if (emphasis) {
    trace.push({ factor: 'emphasis', value: emphasis });
  }

  // ── deload (only when an ACTIVE deload modified the session intensity) ──
  if (ctx.deloadActive === true) {
    trace.push({ factor: 'deload', value: 'active' });
  }

  // ── focus (the user's look preset — selection intent that shaped the picks) ──
  // 'balanced' carries no pattern policy (FOCUS_RULES balanced = empty), so it is
  // the no-op default → omitted. Any other preset is a real selection-shaping input.
  if (typeof ctx.focusPreset === 'string' && ctx.focusPreset && ctx.focusPreset !== 'balanced') {
    trace.push({ factor: 'focusPolicy', value: ctx.focusPreset });
  }

  // ── time budget (only when a real cap was resolved) ──
  if (typeof ctx.timeCapMin === 'number' && Number.isFinite(ctx.timeCapMin) && ctx.timeCapMin > 0) {
    trace.push({ factor: 'timeBudget', value: `capped to ${ctx.timeCapMin} min` });
  }

  // ── dp load decisions (the per-exercise hold/add/ease tally the plan carries) ──
  const exercises = Array.isArray(ctx.exercises) ? ctx.exercises : [];
  const dp = summarizeDpDecisions(exercises);
  if (dp) {
    trace.push({ factor: 'dp', value: dp });
  }

  // ── finalDecision (always present — the resulting plan shape) ──
  const count = exercises.length;
  const typePart = typeof ctx.sessionType === 'string' && ctx.sessionType ? `${ctx.sessionType} ` : '';
  const durPart =
    typeof ctx.estimatedDuration === 'number' && Number.isFinite(ctx.estimatedDuration)
      ? `, ${ctx.estimatedDuration} min`
      : '';
  trace.push({
    factor: 'finalDecision',
    value: `${typePart}session, ${count} exercise${count === 1 ? '' : 's'}${durPart}`,
  });

  return trace;
}
