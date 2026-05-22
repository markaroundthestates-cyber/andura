// ══ SESSION RATING — pure derivation util F-istoric-01 signature ════════
// Derives a per-session aggregate rating from exercises[*].sets[*].rating.
// Used by CalendarHeatmap (cell tier) + RatingsStrip90Day (categorical bucket).
//
// Mode: most-frequent rating across all sets in session.
// Tiebreak: highest severity (greu > potrivit > usor).
//
// Edge case: legacy session without `exercises` field (pre-Phase 5 task_03) →
// returns null (rendered as l2 normal fallback by consumer per spec §2.2).

import type { LastSessionSummary } from '../stores/workoutStore';

export type SessionRating = 'usor' | 'potrivit' | 'greu';

export function deriveSessionRating(session: LastSessionSummary): SessionRating | null {
  const counts = { usor: 0, potrivit: 0, greu: 0 };
  for (const ex of session.exercises ?? []) {
    for (const s of ex.sets) counts[s.rating]++;
  }
  const total = counts.usor + counts.potrivit + counts.greu;
  if (total === 0) return null;
  const max = Math.max(counts.usor, counts.potrivit, counts.greu);
  // Tiebreak: severity-first (greu > potrivit > usor).
  if (counts.greu === max) return 'greu';
  if (counts.potrivit === max) return 'potrivit';
  return 'usor';
}
