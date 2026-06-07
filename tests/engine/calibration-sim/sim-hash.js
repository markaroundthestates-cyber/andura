// ══ CALIBRATION-SIM — determinism hash (T1.6) ═════════════════════════════
// A stable SHA-256 over the cohort's set-1 recommendation stream (kg/reps/status
// per exercise). Any RNG/clock leak (a Date.now() creeping into the engine, or a
// non-injected clockNow) shifts the stream → the committed hash trips. The hash
// ignores volatile fields (timestamps, true-capacity noise) — only the engine's
// PRESCRIPTIVE output is hashed, which is what determinism must guarantee.

import { createHash } from 'node:crypto';

/** Build the canonical prescription stream string from a cohort. */
export function cohortStream(data) {
  const lines = [];
  for (const c of data.cohort) {
    for (const s of c.sessions) {
      if (s.missed) {
        lines.push(`${c.profile.id}|${s.sessionIdx}|MISS`);
        continue;
      }
      for (const e of s.recLog) {
        if (e.skipped) continue;
        // recKg + recReps + status — the engine's prescriptive decision per set.
        lines.push(`${c.profile.id}|${s.sessionIdx}|${e.set}|${e.ex}|${e.recKg}|${e.recReps}|${e.status}`);
      }
    }
  }
  return lines.join('\n');
}

/** SHA-256 of the prescription stream. */
export function cohortStreamHash(data) {
  return createHash('sha256').update(cohortStream(data)).digest('hex');
}
