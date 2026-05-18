// ══ FORMAT HELPERS — Shared Pure-Function Display Formatters ════════════
// Phase 4 task_12 §A — extract formatMMSS din Workout.tsx pentru reuse
// SessionTimer + RestOverlay components. Pure-function paradigm per ADR 026
// §9, zero side effects.

/**
 * Format seconds count la "M:SS" string display (used pentru session elapsed
 * timer + rest countdown). Seconds expected non-negative integer; negative
 * inputs return "0:00" guarded fallback.
 *
 * Examples:
 *   formatMMSS(0)   → "0:00"
 *   formatMMSS(5)   → "0:05"
 *   formatMMSS(65)  → "1:05"
 *   formatMMSS(120) → "2:00"
 */
export function formatMMSS(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
