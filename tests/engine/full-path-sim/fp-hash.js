// ══ FULL-PATH-SIM — determinism hash ═══════════════════════════════════════
// Stable SHA-256 over the cohort's composed-plan stream (per session: type +
// exercise list with prescribed kg/reps/sets). Any RNG/clock leak in the FULL
// path (a Date.now creeping into compose / pipeline / dp) shifts the stream → the
// committed hash trips. Volatile fields (timestamps, hidden cap) are ignored — only
// the seam's PRESCRIPTIVE output is hashed, which is what determinism must guarantee.

import { createHash } from 'node:crypto';

/** Canonical prescription stream string from a full-path cohort. */
export function fullPathStream(data) {
  const lines = [];
  for (const c of data.cohort) {
    for (const s of c.sessions) {
      if (s.missed || !s.plan) {
        lines.push(`${c.profile.id}|${s.sessionNo}|MISS`);
        continue;
      }
      const head = `${c.profile.id}|${s.sessionNo}|${s.plan.sessionType}|${s.plan.intensityMod}|${s.plan.exerciseCount}`;
      lines.push(head);
      for (const e of s.plan.exercises) {
        lines.push(`  ${e.engineName}|${e.sets}|${e.targetReps}|${e.targetKg}`);
      }
    }
  }
  return lines.join('\n');
}

export function fullPathStreamHash(data) {
  return createHash('sha256').update(fullPathStream(data)).digest('hex');
}
